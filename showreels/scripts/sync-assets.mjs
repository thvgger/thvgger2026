import { copyFile, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const portfolio = path.resolve(root, '..');
const storefront = path.resolve(portfolio, '../foolycooly');
const manifest = [];
async function copy(sourceRoot, source, target, allowSnapshot = false) {
  const destination = path.join(root, target);
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await copyFile(path.join(sourceRoot, source), destination);
  } catch (error) {
    if (!allowSnapshot || error.code !== 'ENOENT') throw error;
    await access(destination);
  }
  const bytes = await readFile(destination);
  manifest.push({ source: path.relative(portfolio, path.join(sourceRoot, source)).replaceAll('\\', '/'), target, sha256: createHash('sha256').update(bytes).digest('hex') });
}

for (const file of ['horizontal-white.svg', 'horizontal-ink.svg', 'stacked-white.svg', 'stacked-ink.svg', 'symbol-pink.svg', 'symbol-white.svg', 'symbol-ink.svg']) {
  await copy(portfolio, `public/images/portfolio/studio-space/${file}`, `public/assets/studio-space/${file}`);
}
for (const file of ['collection-desktop.webp', 'collection-mobile.webp', 'product-detail.webp', 'flcl.svg']) {
  await copy(portfolio, `public/images/portfolio/foolycooly/${file}`, `public/assets/foolycooly/${file}`);
}
for (const file of ['identity-laptop.webp', 'digital-home.webp', 'print-1.webp', 'print-2.webp', 'print-3.webp', 'print-4.webp']) {
  await copy(portfolio, `public/images/portfolio/${file}`, `public/assets/thvgger/${file}`);
}
await copy(portfolio, 'public/images/logo-hero.svg', 'public/assets/thvgger/cube.svg');
for (const file of ['math.ts', 'Face.ts', 'createStripes.ts', 'createCube.ts']) {
  await copy(portfolio, `components/Logo/${file}`, `src/assets/cube/${file}`);
}
// Keep the original outlines in source control so this project can also be
// rendered when the sibling storefront checkout is unavailable.
await copy(storefront, 'app/logo-paths.ts', 'src/assets/logo-paths.ts', true);

// Freeze the portfolio's already downloaded Inter font; no network at render time.
const font = path.join(root, 'public/fonts/Inter.woff2');
try { await access(font); } catch {
  const fontManifest = JSON.parse(await readFile(path.join(portfolio, '.next/server/next-font-manifest.json'), 'utf8'));
  const relative = Object.values(fontManifest.app).flat().find(name => name.endsWith('.woff2'));
  if (!relative) throw new Error('Build the portfolio once to cache its Inter font before syncing assets.');
  await copy(portfolio, `.next/${relative}`, 'public/fonts/Inter.woff2');
}
await writeFile(path.join(root, 'assets.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Synced ${manifest.length} source assets. Studio Space and Thvgger sources are exclusively from the portfolio.`);
