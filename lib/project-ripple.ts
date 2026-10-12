export type RipplePoint = { x: number; y: number };

/** A short radial refraction of the actual card artwork, rendered only on click. */
export async function projectRipple(frame: HTMLElement, source: HTMLElement, point?: RipplePoint) {
  const image = source.querySelector<HTMLImageElement>("img");
  const clone = frame.querySelector<HTMLImageElement>("img");
  if (!image?.complete || !image.naturalWidth || !clone) return;
  const rect = source.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1024 / Math.max(rect.width, rect.height));
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  canvas.className = "project-transition-ripple";
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false });
  if (!gl) return;

  const vertex = gl.createShader(gl.VERTEX_SHADER)!;
  const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
  const program = gl.createProgram()!;
  const buffer = gl.createBuffer()!;
  const texture = gl.createTexture()!;
  const dispose = () => {
    canvas.remove();
    clone.style.visibility = "";
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  try {
    gl.shaderSource(vertex, `
      attribute vec2 position;
      varying vec2 uv;
      void main() { uv = (position + 1.0) * 0.5; gl_Position = vec4(position, 0.0, 1.0); }
    `);
    gl.shaderSource(fragment, `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D artwork;
      uniform vec2 size;
      uniform vec2 origin;
      uniform float progress;
      void main() {
        vec2 delta = (uv - origin) * size;
        float distance = length(delta);
        float reach = length(size) * 0.8;
        float radius = reach * (1.0 - pow(1.0 - progress, 3.0));
        float band = max(size.x, size.y) * 0.12;
        float ring = (distance - radius) / band;
        float wave = sin(ring * 3.14159) * exp(-ring * ring * 2.0);
        float strength = min(size.x, size.y) * 0.045 * sin(progress * 3.14159) * (1.0 - progress);
        vec2 direction = delta / max(distance, 0.001);
        vec2 sampleUv = clamp(uv + direction * wave * strength / size, 0.0, 1.0);
        gl_FragColor = texture2D(artwork, sampleUv);
      }
    `);
    gl.compileShader(vertex);
    gl.compileShader(fragment);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    // Match the image's contain/cover treatment, padding, background and hover scale.
    const raster = document.createElement("canvas");
    raster.width = canvas.width;
    raster.height = canvas.height;
    const context = raster.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.fillStyle = getComputedStyle(source).backgroundColor;
    context.fillRect(0, 0, rect.width, rect.height);
    const style = getComputedStyle(image);
    const innerWidth = rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const innerHeight = rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const fit = style.objectFit === "contain" ? Math.min : Math.max;
    const scale = fit(innerWidth / image.naturalWidth, innerHeight / image.naturalHeight)
      * (style.transform === "none" ? 1 : new DOMMatrix(style.transform).a);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, (rect.width - width) / 2, (rect.height - height) / 2, width, height);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
    gl.uniform2f(gl.getUniformLocation(program, "size"), rect.width, rect.height);
    gl.uniform2f(gl.getUniformLocation(program, "origin"),
      point ? Math.max(0, Math.min(1, (point.x - rect.left) / rect.width)) : .5,
      point ? 1 - Math.max(0, Math.min(1, (point.y - rect.top) / rect.height)) : .5);
    const progress = gl.getUniformLocation(program, "progress");
    const draw = (value: number) => { gl.uniform1f(progress, value); gl.drawArrays(gl.TRIANGLES, 0, 6); };
    draw(0);
    frame.append(canvas);
    clone.style.visibility = "hidden";
    const start = performance.now();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    await new Promise<void>(resolve => {
      let animationFrame = 0;
      const stop = () => {
        cancelAnimationFrame(animationFrame);
        document.removeEventListener("visibilitychange", stop);
        preference.removeEventListener("change", stop);
        resolve();
      };
      const update = (now: number) => {
        const elapsed = Math.min(1, (now - start) / 320);
        if (!frame.isConnected || document.hidden || preference.matches || elapsed === 1) return stop();
        draw(elapsed);
        animationFrame = requestAnimationFrame(update);
      };
      document.addEventListener("visibilitychange", stop);
      preference.addEventListener("change", stop);
      animationFrame = requestAnimationFrame(update);
    });
  } catch {
    // The moving thumbnail and curtain still work without a GPU or readable texture.
  } finally {
    dispose();
  }
}
