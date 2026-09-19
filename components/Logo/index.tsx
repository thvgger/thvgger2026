"use client";

import React, { useEffect, useId } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from "motion/react";
import { Matrix, Vector } from "./math";
import { facePath } from "./Face";
import { createCube } from "./createCube";

const VIEWBOX = [-50, -50, 100, 100].toString();

// True isometric viewing angles matching thvgger's static logo:
// 45° yaw (around Y) followed by 35.264° pitch (arctan(1/√2) around X)
const BASE_ROTATION_Y = Math.PI / 4; // 45°
const BASE_ROTATION_X = Math.asin(Math.tan(Math.PI / 6)); // ~35.264°
const BASE_SCALE = 60;

const BASE_CUBE_TRANSFORMS = Matrix.scale(BASE_SCALE)
  .dot(Matrix.rotationY(BASE_ROTATION_Y))
  .dot(Matrix.rotationX(BASE_ROTATION_X));

const SPRING_PARAMS: SpringOptions = { stiffness: 38, damping: 9 };

export type LogoProps = {
  ref?: React.Ref<SVGSVGElement>;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fill?: string;
  title?: string;
  onClick?: (event?: React.MouseEvent<SVGSVGElement>) => void;
  onMouseDown?: (event?: React.MouseEvent<SVGSVGElement>) => void;
  gradientId?: string;
  gradientFrom?: string;
  gradientTo?: string;
};

const cube = createCube(BASE_CUBE_TRANSFORMS);
export const cubeStaticPath = cube.map(facePath).join(" ");

export const LogoStatic: React.FC<LogoProps> = ({
  className,
  style,
  ref,
  fill = "currentColor",
  title,
  gradientId,
  gradientFrom = "currentColor",
  gradientTo = "currentColor",
}) => {
  const shadowId = useId();
  return (
    <motion.svg
      ref={ref}
      style={style}
      className={className}
      viewBox={VIEWBOX}
      title={title}
    >
      <defs>
        <filter
          id={shadowId}
          x="-200%"
          y="-200%"
          width="400%"
          height="400%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="5"
            floodColor="black"
            floodOpacity="0.13"
          />
        </filter>
        {gradientId && (
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        )}
      </defs>
      <motion.path
        filter={`url(#${shadowId})`}
        d={cubeStaticPath}
        fill={gradientId ? `url(#${gradientId})` : fill}
      />
    </motion.svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  style,
  onClick,
  onMouseDown,
  title = "Click or drag to spin the 3D logo",
  fill = "currentColor",
  ref,
}) => {
  const revolutions = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      revolutions.set(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [revolutions]);

  function rotate() {
    revolutions.set(1 - revolutions.get());
  }

  const springRotationY = useSpring(
    useTransform(revolutions, (r) => r * 2 * Math.PI),
    SPRING_PARAMS,
  );

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const springDragX = useSpring(dragX, SPRING_PARAMS);
  const springDragY = useSpring(dragY, SPRING_PARAMS);

  const revolutionTransform = useTransform(springRotationY, (r) =>
    Matrix.rotationY(r),
  );

  const dragVector = useTransform(
    [springDragX, springDragY],
    ([x, y]) => new Vector([x as number, y as number, 0, 1]),
  );

  const dragTransform = useTransform(dragVector, (dv) => {
    const rotationAxis = dv.rotateZ(Math.PI / 2).normalize();
    const angle = dv.norm() / 30;
    return Matrix.rotation(rotationAxis, angle);
  });

  const projectedCubeStripes = useTransform(
    [revolutionTransform, dragTransform],
    ([revTransform, dTransform]) => {
      const transform = Matrix.scale(BASE_SCALE)
        .dot(Matrix.rotationY(BASE_ROTATION_Y))
        .dot(revTransform as Matrix)
        .dot(Matrix.rotationX(BASE_ROTATION_X))
        .dot(dTransform as Matrix);
      return createCube(transform);
    },
  );

  const pathD = useTransform(projectedCubeStripes, (stripes) =>
    stripes.map(facePath).join(" "),
  );

  return (
    <motion.svg
      ref={ref}
      style={{ touchAction: "none", ...style }}
      className={`hover:scale-105 active:scale-90 transition-transform cursor-grab active:cursor-grabbing select-none ${className}`.trim()}
      viewBox={VIEWBOX}
      title={title}
      onClick={(e) => {
        rotate();
        onClick?.(e);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        event.preventDefault();
      }}
      onPan={(_, { offset }) => {
        const norm = Math.sqrt(offset.x ** 2 + offset.y ** 2);
        if (norm === 0) return;
        // Square root falloff for natural elasticity
        const ratio = (Math.sqrt(norm) / norm) * 10;
        dragX.set(offset.x * ratio);
        dragY.set(offset.y * ratio);
      }}
      onPanEnd={() => {
        dragX.set(0);
        dragY.set(0);
      }}
    >
      <motion.path style={{ fill }} d={pathD} />
    </motion.svg>
  );
};

export default Logo;
