import { ImageResponse } from "next/og";

export const alt = "Thvgger, designer and developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "white", color: "black", padding: "64px" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}><span>Independent designer & developer</span><span>Design. Code. Curiosity.</span></div><div style={{ display: "flex", fontSize: 160, fontWeight: 600, letterSpacing: -6 }}>Thvgger.</div><div style={{ display: "flex", fontSize: 28 }}>Brand identities & thoughtful digital experiences.</div></div>, size);
}
