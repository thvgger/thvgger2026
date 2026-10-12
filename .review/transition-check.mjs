import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const targets = await (await fetch('http://127.0.0.1:9335/json/list')).json();
const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, {once: true}));
let id = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message', e => {
  const message = JSON.parse(e.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  if (message.method === 'Network.loadingFailed' && !message.params.canceled) errors.push(message.params);
  if (!message.id) return;
  const callback = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) callback.reject(Error(message.error.message));
  else callback.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, {resolve, reject});
  socket.send(JSON.stringify({id: requestId, method, params}));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(expression) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await pause(150); }
  console.log('Browser errors', JSON.stringify(errors).slice(0,6000));
  console.log(await evaluate('JSON.stringify({url:location.href,ready:document.readyState,header:document.querySelector(".site-header")?.dataset,react:window.next,style:getComputedStyle(document.body).fontFamily})'));
  throw Error('Timed out: ' + expression);
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setScriptExecutionDisabled', {value: false});
  await send('Emulation.setEmulatedMedia', {features: [{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Emulation.setDeviceMetricsOverride', {width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate', {url:'http://localhost:3001/about'});
  await waitFor('document.querySelector(".site-header")?.dataset.navigation === "visible"');
  const start = await evaluate(`(() => {document.querySelector('.desktop-nav a[href="/work"]').click(); return {active:document.querySelector('.page-transition').dataset.active,path:location.pathname,inert:document.getElementById('main').inert};})()`);
  assert.deepEqual(start,{active:'true',path:'/about',inert:true});
  await evaluate(`(() => {for(const element of document.querySelectorAll('.page-transition-bar,.page-transition-letter,.page-transition-identity,.page-transition-rule')) for(const animation of element.getAnimations()) {animation.pause();animation.currentTime=350;} return true;})()`);
  const frame = await send('Page.captureScreenshot',{format:'png'});
  await fs.writeFile('.review/transition-desktop.png',Buffer.from(frame.data,'base64'));
  await evaluate(`document.querySelectorAll('.page-transition *').forEach(element => element.getAnimations().forEach(animation=>animation.play()))`);
  await waitFor('location.pathname === "/work" && !document.querySelector(".page-transition").dataset.active');
  assert.equal(await evaluate('document.getElementById("main").inert'), false);
  assert.equal(await evaluate('document.documentElement.style.overflow'), '');
  await evaluate(`document.querySelector('.desktop-nav a[href="/work"]').click()`);
  assert.equal(await evaluate('document.querySelector(".page-transition").dataset.active'), undefined);
  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('document.querySelector(".menu-trigger").click()');
  await evaluate(`document.querySelector('#mobile-menu nav a[href="/contact"]').click()`);
  assert.equal(await evaluate('document.querySelector("#mobile-menu").open'), false);
  await waitFor('location.pathname === "/contact" && !document.querySelector(".page-transition").dataset.active');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate('document.querySelector(".menu-trigger").click()');
  await evaluate(`document.querySelector('#mobile-menu nav a[href="/about"]').click()`);
  assert.equal(await evaluate('document.querySelector(".page-transition").dataset.active'), undefined);
  await waitFor('location.pathname === "/about"');
  assert.equal(errors.filter(e=>e.exception).length,0);
  console.log('Passed: covered route change, desktop reveal, cleanup, same-page click, mobile navigation, no overflow, reduced motion.');
} finally { await send('Browser.close'); socket.close(); }
