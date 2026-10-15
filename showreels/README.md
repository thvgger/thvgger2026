# Thvgger hover reels

Three silent, eight-second Remotion compositions. Each is 1280 × 800 (16:10),
30 fps, and returns to its opening pose at the end of the loop.

| Composition | Export | Content |
| --- | --- | --- |
| `FoolyCooly` | `foolycooly.mp4` | Original logo compression, collection, product detail, mobile |
| `StudioSpace` | `studio-space.mp4` | Wordmark family, symbol, ink / pink / light palette |
| `Thvgger` | `thvgger.mp4` | Original rotating cube geometry, identity, print, website |

From this directory:

```sh
npm install
npm run assets
npm run studio
npm run check
npm run render
```

Remotion packages are pinned to 4.0.535. On Windows, use `npm.cmd` when
PowerShell blocks the npm script shim. The current workspace already has the
Remotion toolchain installed in its parent directory, which can run these
scripts without another installation.

Studio runs separately from Next.js. Rendering uses port 3101 and writes the
three H.264 MP4s to `../public/videos/showreels/`; no audio track is generated.
The renderer automatically uses installed Chrome or Edge on Windows. Override
the browser with `REMOTION_BROWSER_EXECUTABLE` if needed.

```sh
npm run render -- --stills
npm run render -- --only=studio-space
```

`--stills` writes six sample frames per reel to `out/`. First and last frames
share the same opening composition. All motion derives from the current frame;
there are no CSS animations, clocks, or runtime randomness in the renders.

`scripts/sync-assets.mjs` copies a small source set into the ignored
`public/assets/` directory and records source paths and SHA-256 hashes in
`assets.json`. Studio Space and Thvgger assets come exclusively from this
portfolio. FOOLY COOLY uses portfolio screenshots and original letter paths
from the sibling `foolycooly` project; a checked-in snapshot of those paths
keeps the render reproducible without that checkout. Inter is frozen locally
from the portfolio's cached font, so rendering requires no external media.
Sample product photography remains part of the storefront prototype; the reel
does not claim it as original photography or client work.

The site uses exported MP4s, without a Remotion player or Remotion dependencies.
`ProjectThumbnail` retains the existing server-rendered image and creates a
decorative video only on hover or keyboard focus with a fine pointer. Leaving
restores the cover and resets playback. Offscreen / hidden-tab playback pauses;
touch, reduced motion, and failed video loads retain the cover. Project-click
transitions use only the static artwork.
