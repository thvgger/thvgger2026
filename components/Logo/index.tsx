"use client";

import React, { useEffect, useId } from "react";
import {
  animate,
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

const motionQuery = "(prefers-reduced-motion: reduce)";
const readMotionPreference = () => window.matchMedia(motionQuery).matches;
function subscribeMotionPreference(onChange: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}
function useMotionPreference() {
  return React.useSyncExternalStore(subscribeMotionPreference, readMotionPreference, () => true);
}

export type LogoProps = {
  ref?: React.Ref<SVGSVGElement>;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  fill?: string;
  title?: string;
  spinTrigger?: number | boolean;
  idleSpin?: boolean;
  "aria-describedby"?: string;
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
  spinTrigger,
}) => {
  const shadowId = useId();
  const reducedMotion = useMotionPreference();
  const rotation = useMotionValue(0);
  const previousSpin = React.useRef(spinTrigger);
  const spinPath = useTransform(rotation, angle => createCube(
    Matrix.scale(BASE_SCALE)
      .dot(Matrix.rotationY(BASE_ROTATION_Y))
      .dot(Matrix.rotationY(angle))
      .dot(Matrix.rotationX(BASE_ROTATION_X)),
  ).map(facePath).join(" "));

  useEffect(() => {
    if (reducedMotion) {
      previousSpin.current = spinTrigger;
      rotation.set(0);
      return;
    }
    if (previousSpin.current === spinTrigger) return;
    previousSpin.current = spinTrigger;
    if (spinTrigger === undefined) return;

    const fullTurn = Math.PI * 2;
    const target = (Math.floor(rotation.get() / fullTurn) + 1) * fullTurn;
    const spin = animate(rotation, target, {
      duration: 0.65,
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => rotation.set(0),
    });
    return () => spin.stop();
  }, [spinTrigger, reducedMotion, rotation]);

  return (
    <motion.svg
      ref={ref}
      style={style}
      className={className}
      viewBox={VIEWBOX}
    >
      {title && <title>{title}</title>}
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
        d={spinTrigger === undefined ? cubeStaticPath : spinPath}
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
  spinTrigger,
  ref,
  idleSpin = false,
  "aria-describedby": describedBy,
}) => {
  const reducedMotion = useMotionPreference();
  const revolutions = useMotionValue(0);
  const introRotation = useMotionValue(0);
  const idleRotation = useMotionValue(0);
  const element = React.useRef<SVGSVGElement | null>(null);

  const isDraggingRef = React.useRef(false);
  const previousSpinTrigger = React.useRef(spinTrigger);

  useEffect(() => {
    if (reducedMotion || document.hidden) return;
    const spin = animate(introRotation, [0, 2 * Math.PI], {
      duration: 0.82,
      delay: 0.08,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => spin.stop();
  }, [introRotation, reducedMotion]);

  useEffect(() => {
    if (previousSpinTrigger.current === spinTrigger) return;
    previousSpinTrigger.current = spinTrigger;
    if (spinTrigger !== undefined) {
      revolutions.set(revolutions.get() + (reducedMotion ? 0.25 : 1));
    }
  }, [spinTrigger, revolutions, reducedMotion]);

  useEffect(() => {
    const svg = element.current;
    if (!idleSpin || !svg || reducedMotion) {
      idleRotation.set(0);
      return;
    }
    let visible = false;
    let pointerDown = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let spin: ReturnType<typeof animate> | undefined;

    function pause() {
      clearTimeout(timer);
      spin?.stop();
      spin = undefined;
    }
    function available() {
      return visible && !document.hidden && !pointerDown && !svg?.matches(":hover, :focus");
    }
    function schedule() {
      clearTimeout(timer);
      if (!available()) return;
      timer = setTimeout(() => {
        if (!available()) return;
        const turn = Math.PI * 2;
        spin = animate(idleRotation, (Math.floor(idleRotation.get() / turn) + 1) * turn, {
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
          onComplete: () => { idleRotation.set(0); spin = undefined; schedule(); },
        });
      }, 8000);
    }
    const onPointerDown = () => { pointerDown = true; pause(); };
    const onPointerUp = () => { pointerDown = false; schedule(); };
    const onVisibility = () => { if (document.hidden) pause(); else schedule(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      if (visible) schedule(); else pause();
    }, { threshold: [0, 0.5] });
    observer.observe(svg);
    svg.addEventListener("pointerenter", pause);
    svg.addEventListener("pointerleave", schedule);
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("focus", pause);
    svg.addEventListener("blur", schedule);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      pause();
      observer.disconnect();
      svg.removeEventListener("pointerenter", pause);
      svg.removeEventListener("pointerleave", schedule);
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("focus", pause);
      svg.removeEventListener("blur", schedule);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [idleSpin, idleRotation, reducedMotion]);

  function rotate() {
    revolutions.set(revolutions.get() + (reducedMotion ? 0.25 : 1));
  }

  const springRotationY = useSpring(
    useTransform(revolutions, (r) => r * 2 * Math.PI),
    SPRING_PARAMS,
  );

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const springDragX = useSpring(dragX, SPRING_PARAMS);
  const springDragY = useSpring(dragY, SPRING_PARAMS);

  const pathD = useTransform(() => {
    const rev = reducedMotion ? revolutions.get() * 2 * Math.PI : springRotationY.get() + introRotation.get() + idleRotation.get();
    const sx = reducedMotion ? dragX.get() : springDragX.get();
    const sy = reducedMotion ? dragY.get() : springDragY.get();

    const revTransform = Matrix.rotationY(rev);
    const dv = new Vector([sx, sy, 0, 1]);
    const rotationAxis = dv.rotateZ(Math.PI / 2).normalize();
    const angle = dv.norm() / 30;
    const dTransform = Matrix.rotation(rotationAxis, angle);

    const transform = Matrix.scale(BASE_SCALE)
      .dot(Matrix.rotationY(BASE_ROTATION_Y))
      .dot(revTransform)
      .dot(Matrix.rotationX(BASE_ROTATION_X))
      .dot(dTransform);

    return createCube(transform).map(facePath).join(" ");
  });

  return (
    <motion.svg
      ref={node => {
        element.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      style={{ touchAction: "none", ...style }}
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.92 }}
      className={`cursor-grab active:cursor-grabbing select-none ${className}`.trim()}
      viewBox={VIEWBOX}
      role="button"
      tabIndex={0}
      aria-label={title}
      aria-describedby={describedBy}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          rotate();
          onClick?.();
        }
      }}
      onClick={(e) => {
        if (isDraggingRef.current) return;
        rotate();
        onClick?.(e);
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        event.preventDefault();
      }}
      onPan={(_, { offset }) => {
        const norm = Math.sqrt(offset.x ** 2 + offset.y ** 2);
        if (norm > 3) {
          isDraggingRef.current = true;
        }
        if (norm === 0) return;
        // Square root falloff for natural elasticity
        const ratio = (Math.sqrt(norm) / norm) * 10;
        dragX.set(offset.x * ratio);
        dragY.set(offset.y * ratio);
      }}
      onPanEnd={() => {
        dragX.set(0);
        dragY.set(0);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      }}
    >
      {title && <title>{title}</title>}
      <motion.path style={{ fill }} d={pathD} />
    </motion.svg>
  );
};

export default Logo;
