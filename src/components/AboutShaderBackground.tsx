import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';

const VERTEX_SHADER = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  float random(float x) { return fract(sin(x) * 1e4); }

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec2 mosaic = vec2(4.0, 2.0);
    vec2 screen = vec2(256.0, 256.0);
    uv.x = floor(uv.x * screen.x / mosaic.x) / (screen.x / mosaic.x);
    uv.y = floor(uv.y * screen.y / mosaic.y) / (screen.y / mosaic.y);

    float t = time * 0.045 + random(uv.x) * 0.4;
    float lineWidth = 0.0009;
    float tone = 0.0;
    for (int i = 0; i < 5; i++) {
      tone += lineWidth * float(i * i) / abs(fract(t + float(i) * 0.01) - length(uv));
    }

    float vignette = smoothstep(1.25, 0.18, length(uv));
    vec3 charcoal = vec3(0.18, 0.18, 0.17);
    vec3 silver = vec3(0.52, 0.51, 0.48);
    vec3 color = mix(charcoal, silver, clamp(tone * 0.26, 0.0, 0.6));
    color *= mix(0.35, 1.0, vignette);
    gl_FragColor = vec4(color, 0.72);
  }
`;

export default function AboutShaderBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const camera = new THREE.Camera();
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = { time: { value: 1.0 }, resolution: { value: new THREE.Vector2() } };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    } catch {
      geometry.dispose();
      material.dispose();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    let animationFrameId = 0;
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      if (!reducedMotion) uniforms.time.value += 0.05;
      renderer.render(scene, camera);
      if (!reducedMotion) animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
}
