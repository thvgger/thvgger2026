import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const targets = await (await fetch('http://127.0.0.1:9336/json/list')).json();
const target = targets.find(target => target.type === 'page' && target.url === 'about:blank') ?? targets.find(target => target.type === 'page');
const socket = new WebSocket(target.webSocketDebuggerUrl);
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
  message.error ? callback.reject(message.error) : callback.resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, { resolve, reject });
  socket.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(expression) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate(expression)) return;
    await pause(150);
  }
  throw Error('Timed out: ' + expression);
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  for (const width of [1440, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 760 });
    for (const path of ['/work', '/']) {
      await send('Page.navigate', { url: 'http://localhost:3001' + path });
      const selector = path === '/work' ? '.work-list' : '.home-projects';
      await waitFor(`!!document.querySelector('${selector}') && document.querySelector('.site-header')?.dataset.navigation === 'visible'`);
      await evaluate(`document.querySelector('${selector}').scrollIntoView({block:'start',behavior:'instant'})`);
      await waitFor(`document.querySelector('${selector} img')?.complete && document.querySelector('${selector} img')?.naturalWidth > 0`);
      const layout = await evaluate(`(() => {
        const list = document.querySelector('${selector}');
        const rows = Array.from(list.children).map(row => {
          const link = row.querySelector('a'), image = link.firstElementChild, caption = link.lastElementChild;
          const a = link.getBoundingClientRect(), b = image.getBoundingClientRect(), c = caption.getBoundingClientRect();
          return {x:a.x,y:a.y,width:a.width,imageWidth:b.width,imageRight:b.right,captionLeft:c.left,imageBottom:b.bottom,captionTop:c.top,imageCenter:b.x+b.width/2,rowCenter:a.x+a.width/2,overflow:link.scrollWidth>link.clientWidth};
        });
        return {rows, overflow:document.documentElement.scrollWidth>innerWidth, tag:list.tagName};
      })()`);
      assert.equal(layout.tag, 'UL');
      assert.equal(layout.overflow, false, JSON.stringify({width,path,layout}));
      for (const [index, row] of layout.rows.entries()) {
        assert(!row.overflow, JSON.stringify({width,path,row}));
        if (width > 760) {
          assert(row.imageRight < row.captionLeft);
          assert(row.imageWidth > row.width * .5);
        } else {
          assert(row.imageBottom < row.captionTop);
          assert(row.imageWidth >= row.width * .99);
          assert(Math.abs(row.imageCenter - row.rowCenter) < 1);
        }
        assert.equal(row.x, layout.rows[0].x);
        if (index) assert(row.y > layout.rows[index - 1].y);
      }
      if (width !== 320) {
        const screenshot = await send('Page.captureScreenshot', { format:'png' });
        await fs.writeFile(`.review/list-${path === '/work' ? 'work' : 'home'}-${width}.png`, Buffer.from(screenshot.data,'base64'));
      }
      if (width === 390 && path === '/work') {
        await evaluate(`document.querySelector('.work-entry').click()`);
        await waitFor(`document.querySelector('.project-transition').dataset.active === 'true'`);
        await waitFor(`location.pathname === '/work/foolycooly' && !document.querySelector('.project-transition').dataset.active`);
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log('Home and Work lists passed at 1440, 390, and 320px. Project transition passed. No runtime errors.');
} finally {
  await send('Browser.close');
  socket.close();
}
