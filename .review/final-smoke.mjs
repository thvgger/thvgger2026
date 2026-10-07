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
await send('Emulation.setScriptExecutionDisabled',{value:false});
await viewport(390,844);
await navigate('/',100);
await evaluate(`document.querySelector('.home-hero').getAnimations({subtree:true}).forEach(animation=>{animation.pause();animation.currentTime=200});true`);
const initial=await evaluate(`(()=>{const r=document.querySelector('.hero-mark-stage').getBoundingClientRect();return {center:r.left+r.width/2,width:r.width,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth}})()`);
assert(Math.abs(initial.center-initial.viewport/2)<1,JSON.stringify(initial));
assert.equal(initial.scrollWidth,390);
await capture('intro-mobile-large');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await navigate('/');
assert.equal(await evaluate('document.querySelector(".home-hero").dataset.intro'),'complete');
assert.equal(await evaluate('document.querySelector(".home-hero").getAnimations({subtree:true}).length'),0);
await send('Emulation.setEmulatedMedia',{features:[]});
await send('Page.navigate',{url:origin+'/#selected-work'});
await pause(900);
assert.equal(await evaluate('document.querySelector(".home-hero").dataset.intro'),'complete');
assert.deepEqual(errors,[]);
console.log(JSON.stringify({mobileInitial:initial,reducedMotion:true,fragmentEntry:true,runtimeErrors:errors}));
await send('Browser.close');
socket.close();