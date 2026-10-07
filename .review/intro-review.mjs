import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:3001';
const targets = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const callback = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) callback.reject(new Error(message.error.message));
  else callback.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if(result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const navigate = async (path, delay = 400) => {
  await send('Page.navigate', { url: origin + path });
  for(let attempt=0;attempt<50;attempt++) {
    await pause(100);
    if(await evaluate(`location.pathname===${JSON.stringify(path)} && document.readyState!=='loading'`)) break;
  }
  await pause(delay);
};
const viewport = async (width, height=900) => {
  await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<761});
};
const capture = async name => {
  const result = await send('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
  await fs.writeFile(`.review/${name}.png`,Buffer.from(result.data,'base64'));
};
const click = async selector => {
  const point=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
  await pause(200);
};
await send('Page.enable');
await send('Runtime.enable');
const observerScript=await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.reviewSpinFrames=[];const spinObserver=new MutationObserver(records=>{for(const record of records){if(record.target.closest('.hero-mark')&&window.reviewSpinFrames.length<180){window.reviewSpinFrames.push({time:performance.now(),path:record.target.getAttribute('d')});}}});spinObserver.observe(document,{subtree:true,attributes:true,attributeFilter:['d']});`});
await viewport(1440);
await navigate('/',100);
await evaluate(`window.reviewAnimations=document.querySelector('.home-hero').getAnimations({subtree:true});window.reviewAnimations.forEach(animation=>animation.pause());true`);
await pause(170);
const frames=[];
for(const [time,name] of [[200,'intro-large'],[900,'intro-shrink'],[1250,'intro-compose'],[1900,'intro-settled']]) {
  const frame=await evaluate(`(()=>{window.reviewAnimations.forEach(animation=>animation.currentTime=${time});const mark=document.querySelector('.hero-mark-stage').getBoundingClientRect();const group=document.querySelector('.home-wordmark').getBoundingClientRect();return {time:${time},markWidth:mark.width,markCenter:mark.left+mark.width/2,groupCenter:group.left+group.width/2,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}})()`);
  assert(frame.scrollWidth<=frame.viewport,JSON.stringify(frame));
  if(time===200) assert(Math.abs(frame.markCenter-frame.viewport/2)<1,JSON.stringify(frame));
  if(time===1900) assert(Math.abs(frame.groupCenter-frame.viewport/2)<1,JSON.stringify(frame));
  frames.push(frame);
  await capture(name);
}
await pause(900);
const spin=await evaluate(`({frames:window.reviewSpinFrames.length,uniquePaths:new Set(window.reviewSpinFrames.map(frame=>frame.path)).size,first:window.reviewSpinFrames[0]?.time,last:window.reviewSpinFrames.at(-1)?.time})`);
assert(spin.uniquePaths>4,JSON.stringify(spin));
const layouts=[];
for(const width of [320,390,768,1440]) {
  await viewport(width,width<761?844:900);
  await navigate('/');
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:width/2,y:400,deltaX:0,deltaY:450});
  await pause(350);
  const result=await evaluate(`({width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,scrollY,bar:getComputedStyle(document.documentElement).scrollbarWidth,bodyOverflow:getComputedStyle(document.body).overflowY,intro:document.querySelector('.home-hero').dataset.intro})`);
  assert.equal(result.bar,'none');
  assert.equal(result.clientWidth,width);
  assert(result.scrollWidth<=width,JSON.stringify(result));
  assert(result.scrollY>0,JSON.stringify(result));
  assert.equal(result.intro,'complete');
  layouts.push(result);
  await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
  if(width===390) {
    await capture('intro-mobile-settled');
    await click('.menu-trigger');
    assert.equal(await evaluate('document.querySelector("dialog").open'),true);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    assert.equal(await evaluate('document.querySelector("dialog").open'),false);
    assert.equal(await evaluate('document.activeElement.className'),'menu-trigger');
    await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:650}]});
    for(let step=1;step<=6;step++) {await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:650-step*55}]});await pause(30);}
    await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await pause(400);
    assert((await evaluate('scrollY'))>0,'Touch scrolling failed');
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  }
}
await navigate('/');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});
await send('Input.dispatchKeyEvent',{type:'keyUp',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});
await pause(350);
assert((await evaluate('scrollY'))>0,'Keyboard scrolling failed');
await navigate('/');
await pause(1900);
assert.equal(await evaluate('document.querySelector(".home-hero").dataset.intro'),'complete');
await evaluate('document.querySelector(".home-scroll-link").focus()');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
await pause(1100);
assert.equal(await evaluate('location.hash'),'#selected-work');
assert((await evaluate('document.querySelector("#selected-work").getBoundingClientRect().top'))>=76);
for(const path of ['/work','/work/studio-space','/about','/contact','/playground']) {
  await navigate(path);
  const result=await evaluate('({bar:getComputedStyle(document.documentElement).scrollbarWidth,width:innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth})');
  assert.equal(result.bar,'none');
  assert.equal(result.width,result.clientWidth);
  assert(result.scrollWidth<=result.width,JSON.stringify(result));
}
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await navigate('/');
const reduced=await evaluate(`({intro:document.querySelector('.home-hero').dataset.intro,animations:document.querySelector('.home-hero').getAnimations({subtree:true}).length,copyOpacity:getComputedStyle(document.querySelector('.hero-introduction')).opacity,scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior})`);
assert.equal(reduced.intro,'complete');
assert.equal(reduced.animations,0);
assert.equal(reduced.copyOpacity,'1');
assert.equal(reduced.scrollBehavior,'auto');
const staticBefore=await evaluate(`document.querySelector('.hero-mark path').getAttribute('d')`);
await pause(250);
assert.equal(staticBefore,await evaluate(`document.querySelector('.hero-mark path').getAttribute('d')`));
await send('Emulation.setEmulatedMedia',{features:[]});
await send('Emulation.setScriptExecutionDisabled',{value:true});
await navigate('/');
await pause(2000);
const noScript=await evaluate(`({copy:getComputedStyle(document.querySelector('.hero-introduction')).opacity,nameTransform:getComputedStyle(document.querySelector('#home-title')).transform,heading:document.querySelector('#home-title').textContent})`);
assert.equal(noScript.copy,'1');
assert.equal(noScript.nameTransform,'matrix(1, 0, 0, 1, 0, 0)');
assert.equal(noScript.heading,'Thvgger');
await send('Emulation.setScriptExecutionDisabled',{value:false});
assert.deepEqual(errors,[]);
console.log(JSON.stringify({frames,spin,layouts,reduced,noScript,nativeWheelTouchKeyboard:true,menuEscapeAndFocus:true,runtimeErrors:errors},null,2));
await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:observerScript.identifier});
socket.close();
