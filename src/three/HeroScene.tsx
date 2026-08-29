import { AdaptiveDpr, Float, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { MutableRefObject, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

interface HeroSceneProps {
  /** Scroll progress of the hero section (0 at top, 1 fully scrolled past). */
  scrollRef: MutableRefObject<number>;
  /** Called once the WebGL scene has rendered its first frame. */
  onReady?: () => void;
}

/** Ashima 3D simplex noise (public domain), used by the orb displacement. */
const SIMPLEX_NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const ORB_VERTEX = /* glsl */ `
${SIMPLEX_NOISE}
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;

void main() {
  float n = snoise(position * 1.6 + vec3(0.0, uTime * 0.28, uTime * 0.12));
  float n2 = snoise(position * 4.2 - vec3(uTime * 0.35)) * 0.3;
  vec3 displaced = position + normal * ((n + n2) * uAmp);
  vNoise = n;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPos = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const ORB_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vViewPos);
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.6);

  vec3 deepViolet = vec3(0.13, 0.05, 0.28);
  vec3 violet = vec3(0.46, 0.13, 0.69);
  vec3 magenta = vec3(0.71, 0.0, 0.66);
  vec3 base = mix(violet, magenta, smoothstep(-0.6, 0.8, vNoise));
  base = mix(deepViolet, base, 0.82);

  vec3 keyDir = normalize(vec3(0.7, 0.65, 0.8));
  vec3 fillDir = normalize(vec3(-0.7, -0.35, 0.5));
  vec3 mouseDir = normalize(vec3(uMouse * 0.9, 1.0));
  float keyDiff = max(dot(normal, keyDir), 0.0);
  float fillDiff = max(dot(normal, fillDir), 0.0);
  float mouseDiff = max(dot(normal, mouseDir), 0.0);

  vec3 col = base * (0.35 + keyDiff * 0.95);
  col += vec3(0.75, 0.3, 0.05) * fillDiff * 0.22;
  col += vec3(0.9, 0.4, 0.85) * pow(mouseDiff, 3.0) * 0.3;

  vec3 halfDir = normalize(keyDir + viewDir);
  col += vec3(1.0, 0.85, 1.0) * pow(max(dot(normal, halfDir), 0.0), 42.0) * 0.55;

  float pulse = 0.5 + 0.5 * sin(uTime * 1.35);
  col += magenta * (0.1 + 0.07 * pulse) * (1.0 - fresnel);

  vec3 rim = mix(vec3(0.84, 0.89, 0.92), vec3(0.88, 0.37, 0.82), 0.5 + 0.5 * sin(uTime * 0.5));
  col += rim * fresnel * 0.85;

  gl_FragColor = vec4(col, 1.0);
}
`;

const HALO_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const HALO_FRAGMENT = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewPos;

void main() {
  vec3 viewDir = normalize(-vViewPos);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);
  float pulse = 0.75 + 0.25 * sin(uTime * 1.1);
  vec3 col = mix(vec3(0.45, 0.13, 0.66), vec3(0.88, 0.37, 0.82), fresnel);
  gl_FragColor = vec4(col, fresnel * 0.4 * pulse);
}
`;

const PARTICLE_VERTEX = /* glsl */ `
attribute float aScale;
attribute float aSeed;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uPixelRatio;
varying float vAlpha;
varying float vSeed;

void main() {
  vec3 p = position;
  p.x += sin(uTime * (0.12 + aSeed * 0.25) + aSeed * 6.2831) * 0.5;
  p.y += cos(uTime * (0.1 + aSeed * 0.2) + aSeed * 4.0) * 0.5;

  float depthFactor = clamp((p.z + 7.0) / 9.5, 0.0, 1.0);
  p.x += uMouse.x * (0.2 + depthFactor * 0.7);
  p.y += uMouse.y * (0.15 + depthFactor * 0.5) + uScroll * (0.8 + depthFactor * 1.6);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  float dist = max(-mvPosition.z, 0.1);
  gl_PointSize = aScale * uPixelRatio * (30.0 / dist);
  vAlpha = smoothstep(17.0, 5.0, dist) * (0.35 + 0.65 * depthFactor);
  vSeed = aSeed;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `
varying float vAlpha;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float mask = smoothstep(0.5, 0.08, d);
  vec3 col = mix(vec3(0.72, 0.8, 0.86), vec3(0.88, 0.37, 0.82), vSeed);
  gl_FragColor = vec4(col, mask * vAlpha * 0.85);
}
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** fbm octave count is baked in per quality tier to keep weak GPUs happy. */
const atmosphereFragment = (octaves: number) => /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    value += amplitude * vnoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(1.77, 1.0);
  float t = uTime;

  float haze = fbm(p * 2.1 + vec2(t * 0.5, -t * 0.3));
  float haze2 = fbm(p * 3.8 - vec2(t * 0.35, t * 0.2) + haze);

  vec3 col = mix(vec3(0.03, 0.028, 0.045), vec3(0.055, 0.04, 0.085), vUv.y + p.x * 0.08);
  col += vec3(0.29, 0.08, 0.43) * smoothstep(0.42, 0.95, haze) * 0.32;
  col += vec3(0.45, 0.0, 0.41) * smoothstep(0.55, 1.0, haze2) * 0.2;
  col += vec3(0.36, 0.15, 0.02) * smoothstep(0.62, 1.0, fbm(p * 2.6 + vec2(-t * 0.4, t * 0.25))) * 0.1;

  float glow = exp(-length(p - uMouse * 0.35) * 2.1);
  col += vec3(0.3, 0.09, 0.28) * glow * 0.4;

  float beams = sin(p.x * 2.4 + t * 1.6 + haze * 5.0);
  col += vec3(0.29, 0.08, 0.43) * smoothstep(0.97, 1.0, beams) * 0.12;

  float vignette = smoothstep(1.35, 0.3, length(p));
  col *= mix(0.55, 1.0, vignette);
  col *= 1.0 - uScroll * 0.35;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface MotionProps {
  /** 1 = full motion, 0 = prefers-reduced-motion. */
  motionFactor: number;
}

/**
 * Living energy core: noise-displaced shader orb with Fresnel rim lighting,
 * an additive energy halo, and the original wireframe shell. The whole group
 * tilts toward the mouse and sinks slightly as the user scrolls.
 */
function CoreOrb({ scrollRef, motionFactor, detail }: MotionProps & { scrollRef: MutableRefObject<number>; detail: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const orbMatRef = useRef<THREE.ShaderMaterial>(null);
  const haloMatRef = useRef<THREE.ShaderMaterial>(null);

  const orbUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.26 },
      uMouse: { value: new THREE.Vector2() },
    }),
    [],
  );
  const haloUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state, delta) => {
    const timeScale = 0.25 + 0.75 * motionFactor;

    const group = groupRef.current;
    if (group) {
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, state.pointer.x * 0.35 * motionFactor, 2, delta);
      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -state.pointer.y * 0.25 * motionFactor, 2, delta);
      group.position.y = THREE.MathUtils.damp(group.position.y, -scrollRef.current * 0.7, 2.5, delta);
    }

    const shell = shellRef.current;
    if (shell) {
      shell.rotation.y += delta * 0.15 * timeScale;
      shell.rotation.x += delta * 0.05 * timeScale;
    }

    const orbMat = orbMatRef.current;
    if (orbMat) {
      orbMat.uniforms.uTime.value += delta * timeScale;
      orbMat.uniforms.uAmp.value = 0.14 + 0.12 * motionFactor;
      const mouse = orbMat.uniforms.uMouse.value as THREE.Vector2;
      mouse.x = THREE.MathUtils.damp(mouse.x, state.pointer.x * motionFactor, 3, delta);
      mouse.y = THREE.MathUtils.damp(mouse.y, state.pointer.y * motionFactor, 3, delta);
    }

    const haloMat = haloMatRef.current;
    if (haloMat) haloMat.uniforms.uTime.value += delta * timeScale;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.15, detail]} />
        <shaderMaterial ref={orbMatRef} uniforms={orbUniforms} vertexShader={ORB_VERTEX} fragmentShader={ORB_FRAGMENT} />
      </mesh>
      <mesh scale={1.32}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <shaderMaterial
          ref={haloMatRef}
          uniforms={haloUniforms}
          vertexShader={HALO_VERTEX}
          fragmentShader={HALO_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={shellRef} scale={1.55}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#D7E2EA" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/** Thin orbital rings that drift around the core and tilt toward the mouse. */
function Rings({ motionFactor }: MotionProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const timeScale = 0.3 + 0.7 * motionFactor;
    group.rotation.z += delta * 0.05 * timeScale;
    group.rotation.y += delta * 0.02 * timeScale;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, state.pointer.y * 0.15 * motionFactor, 2, delta);
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.2, 0.006, 8, 128]} />
        <meshBasicMaterial color="#D7E2EA" transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, 0.4, 0]}>
        <torusGeometry args={[2.7, 0.004, 8, 128]} />
        <meshBasicMaterial color="#B600A8" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2.1, -0.5, 0.2]}>
        <torusGeometry args={[3.3, 0.003, 8, 128]} />
        <meshBasicMaterial color="#BE4C00" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

/**
 * Mid-depth GPU particle layer: depth-aware opacity, mouse parallax scaled by
 * depth, and a gentle upward drift on scroll. Sized in the vertex shader so
 * the whole layer costs a single draw call.
 */
function Particles({ count, scrollRef, motionFactor }: MotionProps & { count: number; scrollRef: MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const sds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = -7 + Math.random() * 9.5;
      scl[i] = 0.6 + Math.random() * 1.8;
      sds[i] = Math.random();
    }
    return { positions: pos, scales: scl, seeds: sds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta * (0.15 + 0.85 * motionFactor);
    mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    mat.uniforms.uScroll.value = THREE.MathUtils.damp(mat.uniforms.uScroll.value as number, scrollRef.current, 3, delta);
    const mouse = mat.uniforms.uMouse.value as THREE.Vector2;
    mouse.x = THREE.MathUtils.damp(mouse.x, state.pointer.x * motionFactor, 2.5, delta);
    mouse.y = THREE.MathUtils.damp(mouse.y, state.pointer.y * motionFactor, 2.5, delta);
  });

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Shader-driven atmosphere backdrop: evolving fbm haze in the brand palette,
 * light diffusion that follows the mouse, faint energy beams, and a baked-in
 * cinematic vignette. One fullscreen-ish quad, one draw call.
 */
function Atmosphere({ octaves, scrollRef, motionFactor }: MotionProps & { octaves: number; scrollRef: MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const fragmentShader = useMemo(() => atmosphereFragment(octaves), [octaves]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta * (0.05 + 0.25 * motionFactor);
    mat.uniforms.uScroll.value = THREE.MathUtils.damp(mat.uniforms.uScroll.value as number, scrollRef.current, 3, delta);
    const mouse = mat.uniforms.uMouse.value as THREE.Vector2;
    mouse.x = THREE.MathUtils.damp(mouse.x, state.pointer.x * motionFactor, 2, delta);
    mouse.y = THREE.MathUtils.damp(mouse.y, state.pointer.y * motionFactor, 2, delta);
  });

  return (
    <mesh position={[0, 0, -10]} frustumCulled={false}>
      <planeGeometry args={[46, 26]} />
      <shaderMaterial
        key={octaves}
        ref={matRef}
        uniforms={uniforms}
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={fragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Accent light that chases the cursor so the scene's lighting feels alive. */
function MouseLight({ motionFactor }: MotionProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;
    light.position.x = THREE.MathUtils.damp(light.position.x, state.pointer.x * 2.6 * motionFactor, 2.2, delta);
    light.position.y = THREE.MathUtils.damp(light.position.y, state.pointer.y * 1.8 * motionFactor, 2.2, delta);
  });

  return <pointLight ref={lightRef} position={[0, 0, 2.6]} intensity={14} distance={9} color="#e05fd0" />;
}

/**
 * Cinematic camera rig: eases toward the mouse position and pulls back and
 * down as the user scrolls. Parallax is disabled for reduced motion.
 */
function CameraRig({ scrollRef, motionFactor }: MotionProps & { scrollRef: MutableRefObject<number> }) {
  useFrame((state, delta) => {
    const scroll = scrollRef.current;
    const camera = state.camera;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.6 * motionFactor, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      state.pointer.y * 0.4 * motionFactor - scroll * 1.2,
      2.5,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 4.2 + scroll * 2.2, 2.5, delta);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Fires `onReady` right after the first frame renders, for the preloader. */
function ReadyNotifier({ onReady }: { onReady?: () => void }) {
  const announced = useRef(false);

  useFrame(() => {
    if (announced.current) return;
    announced.current = true;
    if (onReady) onReady();
  });

  return null;
}

/**
 * The hero's real-time 3D environment. Quality tiers (particle counts,
 * geometry detail, shader octaves, DPR) react to viewport changes via
 * matchMedia, and every animation collapses gracefully for reduced motion.
 */
export default function HeroScene({ scrollRef, onReady }: HeroSceneProps) {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const motionFactor = reducedMotion ? 0 : 1;

  const quality = useMemo(
    () => ({
      particles: isMobile ? 420 : 1300,
      stars: isMobile ? 700 : 1800,
      orbDetail: isMobile ? 12 : 24,
      octaves: isMobile ? 3 : 4,
    }),
    [isMobile],
  );

  return (
    <Canvas
      dpr={isMobile ? [1, 1.4] : [1, 1.8]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
    >
      <AdaptiveDpr />
      <fog attach="fog" args={['#0c0c0c', 6, 15]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={30} color="#B600A8" />
      <pointLight position={[-4, -2, 2]} intensity={18} color="#BE4C00" />
      <MouseLight motionFactor={motionFactor} />

      <Atmosphere octaves={quality.octaves} scrollRef={scrollRef} motionFactor={motionFactor} />

      <Stars
        radius={60}
        depth={40}
        count={quality.stars}
        factor={3}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : 0.6}
      />
      <Particles count={quality.particles} scrollRef={scrollRef} motionFactor={motionFactor} />

      <Float speed={1.4} rotationIntensity={0.4 * motionFactor} floatIntensity={0.9 * motionFactor}>
        <CoreOrb scrollRef={scrollRef} motionFactor={motionFactor} detail={quality.orbDetail} />
      </Float>

      <Rings motionFactor={motionFactor} />
      <CameraRig scrollRef={scrollRef} motionFactor={motionFactor} />
      <ReadyNotifier onReady={onReady} />
    </Canvas>
  );
}
