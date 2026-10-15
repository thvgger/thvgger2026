import { Composition } from 'remotion';
import { FoolyCooly } from './FoolyCooly';
import { StudioSpace } from './StudioSpace';
import { Thvgger } from './Thvgger';

export const RemotionRoot = () => (
  <>
    <Composition id="FoolyCooly" component={FoolyCooly} width={1280} height={800} fps={30} durationInFrames={240} />
    <Composition id="StudioSpace" component={StudioSpace} width={1280} height={800} fps={30} durationInFrames={240} />
    <Composition id="Thvgger" component={Thvgger} width={1280} height={800} fps={30} durationInFrames={240} />
  </>
);
