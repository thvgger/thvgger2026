import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Artwork, Frame, Label, Wipe, enter, ink, move, paper, pink } from './design';

const Opening = ({ progress = 0 }: { progress?: number }) => <AbsoluteFill style={{ justifyContent: 'center', padding: 100 }}>
  <Artwork file="studio-space/horizontal-white.svg" style={{ height: 210, transform: `translateX(${(1 - progress) * -50}px) scale(${0.92 + progress * 0.08})` }} />
  <Label style={{ position: 'absolute', left: 64, bottom: 60 }}>Studio Space</Label>
  <Label style={{ position: 'absolute', right: 64, bottom: 60 }}>Visual identity / In progress</Label>
</AbsoluteFill>;

export const StudioSpace = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const family = move(t, 1.65, 2.25);
  const palette = move(t, 3.7, 4.25);
  const close = move(t, 6.7, 7.75);
  return (
    <Frame background={ink} color="#fff">
      <Opening progress={enter(t, 0, 0.75)} />

      <Wipe progress={family} background={paper} direction="left">
        <Label style={{ position: 'absolute', top: 55, left: 64, color: ink }}>One identity. Different forms.</Label>
        <div style={{ position: 'absolute', left: 64, top: 140, width: 700, height: 500, background: ink, overflow: 'hidden' }}>
          <Artwork file="studio-space/stacked-white.svg" style={{ padding: 70, transform: `translateY(${(1 - enter(t, 1.9, 2.7)) * 120}px)` }} />
        </div>
        <div style={{ position: 'absolute', right: 64, top: 140, width: 424, height: 500, background: pink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Artwork file="studio-space/symbol-white.svg" style={{ width: 250, height: 250, transform: `rotate(${move(t, 2.25, 3.4, -18, 0)}deg) scale(${enter(t, 2.15, 2.85)})` }} />
        </div>
        <Artwork file="studio-space/horizontal-ink.svg" style={{ position: 'absolute', left: 64, bottom: 55, width: 520, height: 80 }} />
      </Wipe>

      <Wipe progress={palette} background={ink}>
        <AbsoluteFill style={{ flexDirection: 'row' }}>
          {[{ bg: ink, file: 'symbol-pink.svg' }, { bg: pink, file: 'symbol-white.svg' }, { bg: paper, file: 'symbol-ink.svg' }].map(({ bg, file }, index) => <div key={file} style={{ width: '33.3334%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - enter(t, 3.85 + index * 0.12, 4.6 + index * 0.12)) * (index % 2 ? -800 : 800)}px)` }}>
            <Artwork file={`studio-space/${file}`} style={{ width: 250, height: 250, transform: `scale(${1 + move(t, 5.1, 6.4, 0, 0.12)})` }} />
          </div>)}
        </AbsoluteFill>
        <Label style={{ position: 'absolute', bottom: 58, left: 64 }}>Ink</Label>
        <Label style={{ position: 'absolute', bottom: 58, left: 490 }}>Pink</Label>
        <Label style={{ position: 'absolute', bottom: 58, left: 920, color: ink }}>Light</Label>
      </Wipe>

      <Wipe progress={close} background={ink} direction="left"><Opening /></Wipe>
    </Frame>
  );
};
