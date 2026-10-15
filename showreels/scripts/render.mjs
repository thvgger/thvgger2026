import { bundle } from '@remotion/bundler';
import { getCompositions, openBrowser, renderMedia, renderStill } from '@remotion/renderer';
import { mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import './sync-assets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, '../public/videos/showreels');
const preview = process.argv.includes('--stills');
const only = process.argv.find(argument => argument.startsWith('--only='))?.slice(7);
const port = 3101;
let browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (!browserExecutable && process.platform === 'win32') {
  for (const candidate of ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']) {
    try { await access(candidate); browserExecutable = candidate; break; } catch { /* Try another installed browser. */ }
  }
}
await mkdir(preview ? path.join(root, 'out') : output, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public'), outDir: path.join(root, 'build'), enableCaching: false });
const browser = await openBrowser('chrome', { browserExecutable });
try {
  const compositions = await getCompositions(serveUrl, { puppeteerInstance: browser, port });
  for (const [id, name] of [['FoolyCooly', 'foolycooly'], ['StudioSpace', 'studio-space'], ['Thvgger', 'thvgger']]) {
    if (only && only !== name) continue;
    const composition = compositions.find(item => item.id === id);
    if (!composition) throw new Error(`Missing composition: ${id}`);
    if (preview) {
      for (const frame of [0, 30, 80, 145, 200, 239]) {
        await renderStill({ composition, serveUrl, puppeteerInstance: browser, port, frame, output: path.join(root, `out/${name}-${frame}.png`) });
      }
      console.log(`Preview frames ready: ${id}`);
    } else {
      let last = -1;
      await renderMedia({
        composition, serveUrl, puppeteerInstance: browser, port,
        outputLocation: path.join(output, `${name}.mp4`),
        codec: 'h264', pixelFormat: 'yuv420p', crf: 22,
        imageFormat: 'jpeg', jpegQuality: 95,
        muted: true, enforceAudioTrack: false,
        concurrency: 2, overwrite: true,
        onProgress: ({ progress }) => {
          const step = Math.floor(progress * 4);
          if (step !== last) { console.log(`${id}: ${Math.round(progress * 100)}%`); last = step; }
        },
      });
      console.log(`Exported ${name}.mp4`);
    }
  }
} finally {
  await browser.close({ silent: true });
}
