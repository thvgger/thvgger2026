"use client";

import React from "react";
import { Logo, LogoStatic, type LogoProps } from "./Logo";

export interface InteractiveCubeLogoProps extends LogoProps {}

export { Logo, LogoStatic };

export default function InteractiveCubeLogo(props: InteractiveCubeLogoProps) {
  return <Logo {...props} />;
}
