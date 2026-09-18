"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface InteractiveCubeLogoProps {
  className?: string;
  bgColor?: string;
  stripeColor?: string;
  onClick?: () => void;
  title?: string;
}

export default function InteractiveCubeLogo({
  className = "w-[84px] h-[95.34px]",
  bgColor = "#ffffff",
  stripeColor = "#000000",
  onClick,
  title = "Drag to spin the 3D cube logo",
}: InteractiveCubeLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // -------------------------------------------------------------
    // 1. SCENE & ISOMETRIC ORTHOGRAPHIC CAMERA
    // -------------------------------------------------------------
    const scene = new THREE.Scene();

    // In isometric projection with camera looking from (D, D, D) at (0, 0, 0)
    // with up = (0, 1, 0), the cube width is sqrt(2) ~ 1.4142 and height is sqrt(8/3) ~ 1.6330.
    // Ratio width/height is sqrt(3)/2 ~ 0.8660.
    // Max 3D bounding diameter at any rotation is sqrt(3) ~ 1.732.
    // viewHeight = 1.78 ensures zero clipping at any 3D angle while filling the container.
    const viewHeight = 1.78;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
    const cameraDist = 8.0;
    camera.position.set(cameraDist, cameraDist, cameraDist);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    // -------------------------------------------------------------
    // 2. FLAT CUSTOM SHADER (ZERO SHADOWS, ZERO LIGHTING)
    // -------------------------------------------------------------
    // Pure flat shading: white part matches the background color exactly,
    // stripes are pure black with anti-aliasing via smoothstep/fwidth.
    // Preserves the 100% flat icon illusion at rest!
    const vertexShader = `
      varying vec3 vLocalPosition;
      varying vec3 vLocalNormal;

      void main() {
        vLocalPosition = position;
        vLocalNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uColorBg;
      uniform vec3 uColorStripe;

      varying vec3 vLocalPosition;
      varying vec3 vLocalNormal;

      void main() {
        vec3 absNorm = abs(vLocalNormal);
        float coord = 0.0;

        // Each face family uses a UNIQUE local axis for its stripe coordinate.
        // This ensures no two adjacent faces share the same stripe direction —
        // stripes are always discontinuous at cube edges, each face truly independent:
        //
        //   ±Y (top / bottom)  → stripe varies along Z  (runs parallel to X)
        //   ±X (right / left)  → stripe varies along Y  (runs parallel to Z)
        //   ±Z (front / back)  → stripe varies along X  (runs parallel to Y)
        //
        // Shared-edge analysis:
        //   Top(Z) meets Right(Y): at the shared edge, Z=const on Right → Right coord is constant
        //                          while Top coord varies → stripes always offset, never connected.
        //   Top(Z) meets Front(X): at the shared edge, Z=const on Front → Front coord is constant
        //                          while Top coord varies → same, always offset.
        //   Right(Y) meets Front(X): both vary independently → always disconnected.
        if (absNorm.y > 0.5) {
          // Top / Bottom face: stripes along Z
          coord = vLocalPosition.z + 0.5;
        } else if (absNorm.x > 0.5) {
          // Right / Left face: stripes along Y
          coord = vLocalPosition.y + 0.5;
        } else {
          // Front / Back face: stripes along X
          coord = vLocalPosition.x + 0.5;
        }

        // 6 equal intervals across [0..1]:
        // [0..1), [2..3), [4..5) are Stripe (Black)
        // [1..2), [3..4), [5..6] are Background (White)
        float t = clamp(coord, 0.0, 1.0) * 6.0;
        float fw = max(fwidth(t) * 0.75, 0.001);
        float m = mod(t, 2.0);
        float isWhite = smoothstep(1.0 - fw, 1.0 + fw, m) - smoothstep(2.0 - fw, 2.0, m);

        // Pure flat color — zero shadows, zero lighting differences
        vec3 finalColor = mix(uColorStripe, uColorBg, isWhite);

        // ── Seam cover ───────────────────────────────────────────────────────
        // At cube face boundaries WebGL sub-pixel rasterisation lets background
        // bleed through as a thin visible seam.  Fix: measure how close this
        // fragment is to the perimeter of *its own face* (using the two local
        // axes that are NOT the face normal) and force any boundary pixel to the
        // stripe colour (black).  ~2px coverage is enough on any DPR.
        float e1, e2;
        if (absNorm.y > 0.5) {
          e1 = abs(vLocalPosition.x);   // top/bottom face: perimeter is ±X and ±Z
          e2 = abs(vLocalPosition.z);
        } else if (absNorm.x > 0.5) {
          e1 = abs(vLocalPosition.y);   // right/left face: perimeter is ±Y and ±Z
          e2 = abs(vLocalPosition.z);
        } else {
          e1 = abs(vLocalPosition.x);   // front/back face: perimeter is ±X and ±Y
          e2 = abs(vLocalPosition.y);
        }
        float borderWidth = 0.035;      // ~2 px at typical render size
        float seamFactor = smoothstep(0.5 - borderWidth - fw, 0.5 - borderWidth, max(e1, e2));
        finalColor = mix(finalColor, uColorStripe, seamFactor);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const uniforms = {
      uColorBg: { value: new THREE.Color(bgColor) },
      uColorStripe: { value: new THREE.Color(stripeColor) },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    // -------------------------------------------------------------
    // 3. CUBE MESH
    // -------------------------------------------------------------
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(cube);

    // Canonical identity orientation:
    const canonicalQuaternion = new THREE.Quaternion(0, 0, 0, 1);
    cube.quaternion.copy(canonicalQuaternion);

    // -------------------------------------------------------------
    // 4. SCREEN-SPACE ROTATION VECTORS
    // -------------------------------------------------------------
    const cameraForward = new THREE.Vector3(1, 1, 1).normalize();
    const cameraUpWorld = new THREE.Vector3(0, 1, 0);
    // Screen Right: cross(up, forward) normalized
    const screenRight = new THREE.Vector3().crossVectors(cameraUpWorld, cameraForward).normalize();
    // Screen Up: cross(forward, screenRight) normalized
    const screenUp = new THREE.Vector3().crossVectors(cameraForward, screenRight).normalize();

    // Dragging state (DRAG ONLY, NO HOVER)
    let dragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;

    // Angular velocity for inertial spin on drag release
    let angularVelX = 0;
    let angularVelY = 0;
    let idleTimer = 0;

    // -------------------------------------------------------------
    // 5. RESIZE OBSERVER
    // -------------------------------------------------------------
    const updateSize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth || 84;
      const height = container.clientHeight || 96;

      renderer.setSize(width, height, false);

      const aspect = width / height;
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // -------------------------------------------------------------
    // 6. POINTER DRAG HANDLERS (NO HOVER TILT)
    // -------------------------------------------------------------
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      setIsDragging(true);
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      pointerStartTime = performance.now();
      angularVelX = 0;
      angularVelY = 0;
      idleTimer = 0;

      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return; // Strict: drag only, do not move on hover!

      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      const sensitivity = 0.009;
      const rotYaw = dx * sensitivity;
      const rotPitch = dy * sensitivity;

      // Apply screen-space rotation
      const qYaw = new THREE.Quaternion().setFromAxisAngle(screenUp, rotYaw);
      const qPitch = new THREE.Quaternion().setFromAxisAngle(screenRight, -rotPitch);

      const deltaQ = new THREE.Quaternion().multiplyQuaternions(qPitch, qYaw);
      cube.quaternion.premultiply(deltaQ);

      // Record angular velocity for inertia
      angularVelX = rotPitch * 0.85;
      angularVelY = rotYaw * 0.85;
      idleTimer = 0;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      setIsDragging(false);

      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }

      const totalDist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      const totalDuration = performance.now() - pointerStartTime;

      // Click detection: quick tap with minimal movement triggers brisk 360 spin
      if (totalDist < 5 && totalDuration < 300) {
        angularVelX = 0.14;
        angularVelY = 0.20;
        idleTimer = 0;
        if (onClick) onClick();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // -------------------------------------------------------------
    // 7. ANIMATION LOOP: INERTIAL SPIN & SMOOTH AUTO-RETURN
    // -------------------------------------------------------------
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Inertial momentum spin after drag release
      if (!dragging && (Math.abs(angularVelX) > 0.0001 || Math.abs(angularVelY) > 0.0001)) {
        const qYaw = new THREE.Quaternion().setFromAxisAngle(screenUp, angularVelY);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(screenRight, -angularVelX);
        const deltaQ = new THREE.Quaternion().multiplyQuaternions(qPitch, qYaw);
        cube.quaternion.premultiply(deltaQ);

        angularVelX *= 0.93;
        angularVelY *= 0.93;
      }

      // When released and inertia has subsided, smoothly slerp back to the canonical flat logo
      if (!dragging) {
        idleTimer += 0.016;

        if (Math.abs(angularVelX) < 0.001 && Math.abs(angularVelY) < 0.001) {
          const angle = cube.quaternion.angleTo(canonicalQuaternion);
          if (angle > 0.001) {
            cube.quaternion.slerp(canonicalQuaternion, 0.07);
          } else {
            cube.quaternion.copy(canonicalQuaternion);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 8. CLEANUP
    // -------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);

      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [isMounted, bgColor, stripeColor, onClick]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      title={title}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full block touch-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
