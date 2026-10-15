import type { ReactNode } from "react";

export default function PhoneMockup({ children }: { children: ReactNode }) {
  return (
    <div className="phone-mockup">
      <span className="phone-mockup-speaker" aria-hidden="true" />
      <span className="phone-mockup-camera" aria-hidden="true" />
      <div className="phone-mockup-screen">{children}</div>
      <span className="phone-mockup-home" aria-hidden="true" />
    </div>
  );
}
