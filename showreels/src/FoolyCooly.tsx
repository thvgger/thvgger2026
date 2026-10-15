import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { logoPaths } from './assets/logo-paths';
import { Artwork, Frame, Label, Wipe, enter, ink, move } from './design';

const O = 'M117 9C40 9 0 58 0 137V220C0 301 40 349 117 349C194 349 234 301 234 220V137C234 58 194 9 117 9ZM117 91C142 91 152 108 152 140V217C152 250 142 267 117 267C92 267 82 250 82 217V140C82 108 92 91 117 91Z';
const Y = 'M0 9H89L117 105L145 9H234L158 211V348H76V211Z';
const letters = [
  { path: logoPaths.F, offset: 0, expanded: 0, final: 0, remove: false },
  { path: O, offset: 0, expanded: 260, final: 190, remove: true },
  { path: O, offset: 0, expanded: 520, final: 240, remove: true },
  { path: logoPaths.L, offset: 262.266, expanded: 780, final: 262.266, remove: false },
  { path: Y, offset: 0, expanded: 1040, final: 430, remove: true },
  { path: logoPaths.C, offset: 446.125, expanded: 1340, final: 446.125, remove: false },
  { path: O, offset: 0, expanded: 1600, final: 590, remove: true },
  { path: O, offset: 0, expanded: 1860, final: 640, remove: true },
  { path: logoPaths.lastL, offset: 690.534, expanded: 2120, final: 690.534, remove: false },
  { path: Y, offset: 0, expanded: 2380, final: 900, remove: true },
];

export const FoolyCooly = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const compress = move(t, 0.45, 1.25);
  const desktop = move(t, 1.65, 2.3);
  const split = move(t, 3.7, 4.3);
  const returnToGrid = move(t, 5.7, 6.3);
  const close = move(t, 7.1, 7.75);
  return (
    <Frame>
      <AbsoluteFill style={{ justifyContent: 'center', padding: 90 }}>
        <svg viewBox="0 0 2900 700" style={{ width: '100%', height: 380 }} fill={ink}>
          {letters.map((letter, index) => {
            const x = (143 + letter.expanded) * (1 - compress) + (988 + letter.final) * compress;
            return <g key={index} transform={`translate(${x} 180) scale(${letter.remove ? 1 - compress * 0.999 : 1} 1)`} opacity={letter.remove ? 1 - compress : 1}><path d={letter.path} transform={`translate(${-letter.offset} 0)`} /></g>;
          })}
        </svg>
        <Label style={{ position: 'absolute', bottom: 65, left: 64 }}>FOOLY COOLY</Label>
        <Label style={{ position: 'absolute', bottom: 65, right: 64 }}>Identity / Storefront</Label>
      </AbsoluteFill>

      <Wipe progress={desktop} background="#fff">
        <AbsoluteFill style={{ padding: '54px 64px' }}>
          <Label style={{ marginBottom: 28 }}>FOOLY COOLY — Collection</Label>
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#f8f8f7' }}>
            <Artwork file="foolycooly/collection-desktop.webp" style={{ position: 'absolute', height: 'auto', transformOrigin: 'top center', transform: `translateY(${-move(t, 2.3, 3.7, 0, 70)}px) scale(1.02)` }} />
          </div>
        </AbsoluteFill>
      </Wipe>

      <Wipe progress={split} background="#eeeeec" direction="left">
        <Label style={{ position: 'absolute', top: 55, left: 64 }}>A closer look.</Label>
        <div style={{ position: 'absolute', left: 64, top: 130, width: 790, height: 570, overflow: 'hidden', background: '#fff', transform: `translateY(${(1 - enter(t, 3.85, 4.6)) * 90}px)` }}>
          <Artwork file="foolycooly/product-detail.webp" style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', right: 80, top: 80, width: 280, height: 640, border: `9px solid ${ink}`, borderRadius: 34, overflow: 'hidden', background: '#fff', transform: `translateY(${(1 - enter(t, 4.05, 4.8)) * 150}px) rotate(-3deg)` }}>
          <Artwork file="foolycooly/collection-mobile.webp" style={{ objectFit: 'cover', objectPosition: 'top' }} />
        </div>
        <Label style={{ position: 'absolute', bottom: 45, left: 64 }}>Desktop to mobile.</Label>
      </Wipe>

      <Wipe progress={returnToGrid} background="#fff">
        <Artwork file="foolycooly/collection-desktop.webp" style={{ objectFit: 'cover', objectPosition: 'top', transform: `scale(${1.08 - move(t, 6.1, 7.1, 0, 0.08)})`, transformOrigin: 'top' }} />
      </Wipe>

      {/* The last 0.25s exactly matches frame zero, without a black loop seam. */}
      <Wipe progress={close} background="#fff">
        <AbsoluteFill style={{ justifyContent: 'center', padding: 90 }}>
          <svg viewBox="0 0 2900 700" style={{ width: '100%', height: 380 }} fill={ink}>
            {letters.map((letter, index) => <g key={index} transform={`translate(${143 + letter.expanded} 180)`}><path d={letter.path} transform={`translate(${-letter.offset} 0)`} /></g>)}
          </svg>
          <Label style={{ position: 'absolute', bottom: 65, left: 64 }}>FOOLY COOLY</Label>
          <Label style={{ position: 'absolute', bottom: 65, right: 64 }}>Identity / Storefront</Label>
        </AbsoluteFill>
      </Wipe>
    </Frame>
  );
};
