import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { createCube } from './assets/cube/createCube';
import { facePath } from './assets/cube/Face';
import { Matrix } from './assets/cube/math';
import { Artwork, Frame, Label, Wipe, enter, ink, move } from './design';

const Cube = ({ turn = 0 }: { turn?: number }) => {
  const matrix = Matrix.scale(60).dot(Matrix.rotationY(Math.PI / 4 + turn)).dot(Matrix.rotationX(Math.asin(Math.tan(Math.PI / 6))));
  return <svg viewBox="-50 -50 100 100" width="360" height="360" fill={ink}><path d={createCube(matrix).map(facePath).join(' ')} /></svg>;
};

const Opening = ({ turn = 0 }: { turn?: number }) => <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
  <Cube turn={turn} />
  <Label style={{ position: 'absolute', left: 64, bottom: 60 }}>Thvgger</Label>
  <Label style={{ position: 'absolute', right: 64, bottom: 60 }}>Identity / Print / Web</Label>
</AbsoluteFill>;

export const Thvgger = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const laptop = move(t, 1.65, 2.25);
  const print = move(t, 3.65, 4.25);
  const web = move(t, 5.65, 6.2);
  const close = move(t, 7.1, 7.75);
  return (
    <Frame background="#f3f3f3">
      <Opening turn={move(t, 0.15, 1.5, 0, Math.PI * 2)} />
      <Wipe progress={laptop} background={ink} direction="left">
        <Artwork file="thvgger/identity-laptop.webp" style={{ objectFit: 'cover', transform: `scale(${1.1 - move(t, 2.1, 3.6, 0, 0.1)})` }} />
      </Wipe>
      <Wipe progress={print} background="#f3f3f3">
        <div style={{ position: 'absolute', left: 40, top: 80, width: 720, height: 540, overflow: 'hidden', transform: `translateY(${(1 - enter(t, 3.8, 4.5)) * 120}px) rotate(-5deg)` }}><Artwork file="thvgger/print-1.webp" style={{ objectFit: 'cover' }} /></div>
        <div style={{ position: 'absolute', right: 50, top: 160, width: 640, height: 480, overflow: 'hidden', transform: `translateY(${(1 - enter(t, 4.0, 4.7)) * 220}px) rotate(6deg)` }}><Artwork file="thvgger/print-2.webp" style={{ objectFit: 'cover' }} /></div>
        <div style={{ position: 'absolute', right: 250, top: 280, width: 460, height: 345, overflow: 'hidden', transform: `translateY(${(1 - enter(t, 4.2, 4.9)) * 250}px) rotate(-2deg)` }}><Artwork file="thvgger/print-3.webp" style={{ objectFit: 'cover' }} /></div>
        <Label style={{ position: 'absolute', left: 64, bottom: 48 }}>The same signature, off screen.</Label>
      </Wipe>
      <Wipe progress={web} background="#fff" direction="left">
        <Artwork file="thvgger/digital-home.webp" style={{ padding: '100px 0', transform: `translateY(${(1 - enter(t, 5.8, 6.5)) * 60}px)` }} />
        <Label style={{ position: 'absolute', left: 64, bottom: 60 }}>An identity for print and the web.</Label>
      </Wipe>
      <Wipe progress={close} background="#f3f3f3"><Opening /></Wipe>
    </Frame>
  );
};
