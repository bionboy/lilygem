"use client";

import { useEffect, useRef } from "react";

type ShaderBackgroundProps = {
  className?: string;
  speed?: number;
};

// Lightweight WebGL fragment-shader background with time-based animation.
export default function ShaderBackground({ className, speed = 0.3 }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(0);
  const uTimeRef = useRef<WebGLUniformLocation | null>(null);
  const uResolutionRef = useRef<WebGLUniformLocation | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;
    glRef.current = gl;

    // Vertex shader (fullscreen triangle)
    const vertexSrc = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader: bold colorful noise-y gradient stripes with subtle flow
    const fragmentSrc = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // Hash and noise helpers
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }

      vec3 palette(float t) {
        // Bold gradient palette
        vec3 a = vec3(0.25, 0.35, 0.95);
        vec3 b = vec3(0.95, 0.25, 0.85);
        vec3 c = vec3(0.95, 0.85, 0.25);
        vec3 d = vec3(0.15, 0.25, 0.55);
        return a + b * cos(6.28318*(c*t + d));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        // Centered coordinates and aspect correction
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

        float t = u_time * 0.1;

        // Flow field stripes
        float angle = noise(p * 2.0 + t * 0.6) * 6.28318;
        vec2 flow = vec2(cos(angle), sin(angle));
        float bands = sin((p.x * 3.5 + dot(flow, p * 2.0)) * 3.0 + t * 4.0);

        // Layered noise for depth
        float n = 0.0;
        n += 0.5 * noise(uv * 3.0 + t * 0.7);
        n += 0.25 * noise(uv * 6.0 - t * 0.5);
        n += 0.125 * noise(uv * 12.0 + t * 0.9);

        float mask = smoothstep(-0.2, 0.8, bands + n);
        vec3 col = palette(uv.x + uv.y * 0.3 + n * 0.2 + t * 0.2);
        col *= mix(0.6, 1.2, mask);

        // Vignette for focus
        float v = smoothstep(1.2, 0.1, length(p));
        col *= v;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vertexSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
    programRef.current = program;

    // Fullscreen triangle
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    uTimeRef.current = gl.getUniformLocation(program, "u_time");
    uResolutionRef.current = gl.getUniformLocation(program, "u_resolution");

    const setSize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(canvas.clientWidth * ratio);
      const height = Math.floor(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolutionRef.current, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);
    setSize();

    startTimeRef.current = performance.now();

    let isPaused = false;

    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReduced = () => {
      isPaused = prefersReduced.matches;
    };
    prefersReduced.addEventListener?.("change", handleReduced);
    handleReduced();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const time = elapsed * speed;
      if (!isPaused) {
        gl.uniform1f(uTimeRef.current, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      prefersReduced.removeEventListener?.("change", handleReduced as EventListener);
      if (programRef.current) gl.deleteProgram(programRef.current);
    };
  }, [speed]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={
          "absolute inset-0 w-full h-full -z-10 opacity-90 " + (className ? className : "")
        }
        aria-hidden="true"
      />
    </>
  );
}
