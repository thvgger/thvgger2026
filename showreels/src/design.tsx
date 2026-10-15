import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from 'remotion';

export const ink = '#080808';
export const paper = '#F6F4EE';
export const pink = '#F20D5E';
export const ease = Easing.bezier(0.76, 0, 0.24, 1);
export const settle = Easing.bezier(0.16, 1, 0.3, 1);
export const move = (t: number, start: number, end: number, from = 0, to = 1) => interpolate(t, [start, end], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const enter = (t: number, start = 0, end = 0.6) => interpolate(t, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: settle });
export const media = (file: string) => staticFile(`assets/${file}`);

export const Frame = ({ children, background = '#fff', color = ink }: { children: ReactNode; background?: string; color?: string }) => (
  <AbsoluteFill style={{ background, color, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
    <style>{`@font-face {font-family: Inter; src: url("${staticFile('fonts/Inter.woff2')}") format('woff2'); font-weight:100 900;}`}</style>
    {children}
  </AbsoluteFill>
);

export const Artwork = ({ file, style }: { file: string; style?: CSSProperties }) => (
  <Img src={media(file)} style={{ width: '100%', height: '100%', objectFit: 'contain', ...style }} />
);

export const Label = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontSize: 25, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.1, ...style }}>{children}</div>
);

export const Wipe = ({ progress, children, background, direction = 'up' }: { progress: number; children: ReactNode; background?: string; direction?: 'up' | 'left' }) => (
  <AbsoluteFill style={{ background, clipPath: direction === 'up' ? `inset(${(1 - progress) * 100}% 0 0)` : `inset(0 ${(1 - progress) * 100}% 0 0)` }}>
    {children}
  </AbsoluteFill>
);
