import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const targets=await(await fetch('http://127.0.0.1:9337/json/list')).json();
const socket=new WebSocket((targets.find(t=>t.type==='page'&&t.url==='about:blank')??targets.find(t=>t.type==='page')).webSocketDebuggerUrl);
await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(!m.id)return;const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(expression){for(let i=0;i<160;i++){if(await evaluate(expression))return;await pause(150)}throw Error('Timed out: '+expression)}
async function navigate(path){await send('Page.navigate',{url:'http://localhost:3001'+path});await waitFor(`location.pathname === '${path}' && document.querySelector('.site-header')?.dataset.navigation==='visible'`)}
async function capture(name){const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('.review/'+name+'.png',Buffer.from(r.data,'base64'))}
try{
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/work');await waitFor(`document.querySelector('.work-image img')?.complete`);
 const row=await evaluate(`(()=>{const a=document.querySelector('.work-image').getBoundingClientRect(),b=document.querySelector('.work-caption').getBoundingClientRect();return {imageWidth:a.width,imageRight:a.right,captionLeft:b.left,summary:document.querySelector('.project-list-summary').textContent}})()`);
 assert(row.imageWidth>500&&row.imageWidth<700);assert(row.imageRight<row.captionLeft);assert(row.summary.length>50);
 await capture('beside-work-desktop');
 await evaluate(`document.querySelector('.work-entry').click()`);
 await waitFor(`location.pathname==='/work/foolycooly' && !document.querySelector('.project-transition').dataset.active`);
 await waitFor(`document.querySelector('.case-word') && document.querySelector('.case-study-clips')`);
 await pause(1100);await capture('case-foolycooly-desktop');
 for(const slug of ['foolycooly','studio-space','thvgger']){
  if(slug!=='foolycooly')await navigate('/work/'+slug);
  await waitFor(`document.querySelector('.case-word') && document.querySelector('.case-study-clips')`);
  assert.equal(await evaluate(`document.querySelector('h1').getAttribute('aria-label')===document.querySelector('h1').textContent`),true);
  await pause(1000);
  await evaluate(`window.scrollBy({top:130,behavior:'instant'})`);await pause(70);
  assert.equal(await evaluate(`!![...document.querySelectorAll('.project-page *')].find(e=>e.style.clipPath?.includes('case-curve'))`),true,slug);
  await pause(1200);
  assert.equal(await evaluate(`[...document.querySelectorAll('.project-page *')].some(e=>e.style.clipPath?.includes('case-curve'))`),false,slug);
  const chapter=slug==='thvgger'?'.project-story section':'.identity-chapter';
  await evaluate(`document.querySelector('${chapter}').scrollIntoView({block:'center',behavior:'instant'})`);await pause(100);
  assert.equal(await evaluate(`document.getAnimations().some(a=>a.effect?.target?.classList?.contains('case-word'))`),true,slug);
  await pause(1000);await capture('case-'+slug+'-chapter');
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate('/');await evaluate(`document.querySelector('.home-projects').scrollIntoView({block:'start',behavior:'instant'})`);await pause(500);await capture('beside-home-mobile');
 assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
 for(const slug of ['foolycooly','studio-space','thvgger']){
  await navigate('/work/'+slug);await waitFor(`!!document.querySelector('.case-word')`);await pause(1000);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,slug);
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await navigate('/work/studio-space');await waitFor(`!!document.querySelector('.case-word')`);
 await evaluate(`window.scrollBy({top:160,behavior:'instant'})`);await pause(100);
 assert.equal(await evaluate(`document.getAnimations().some(a=>a.effect?.target?.classList?.contains('case-word'))`),false);
 assert.equal(await evaluate(`[...document.querySelectorAll('.project-page *')].some(e=>e.style.clipPath?.includes('case-curve'))`),false);
 await send('Emulation.setScriptExecutionDisabled',{value:true});await send('Page.navigate',{url:'http://localhost:3001/work/foolycooly'});await pause(1800);
 assert.equal(await evaluate(`!!document.querySelector('h1')?.textContent && getComputedStyle(document.querySelector('h1')).visibility==='visible'`),true);
 await send('Emulation.setScriptExecutionDisabled',{value:false});
 assert.deepEqual(errors,[]);console.log('Beside layout, project transition, heading/artwork entrances, scroll curve and settling, all three case studies, mobile, reduced motion, and no-JavaScript visibility passed.');
}finally{await send('Browser.close');socket.close()}
