'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function GroundFog({
  y = -35,
  size = 500,
  color = '#497a80',
}: { y?: number; size?: number; color?: string }) {
  const mat = React.useRef<THREE.ShaderMaterial>(null);

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt * 0.06;
  });

  const uniforms = React.useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }),
    [color],
  );

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;

          // дешевий value noise
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p){
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
                       mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
          }
          float fbm(vec2 p){
            float v = 0.0, a = 0.5;
            for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
            return v;
          }

          void main() {
            float n = fbm(vUv * 6.0 + vec2(uTime, uTime * 0.6));
            // радіальне згасання до країв, щоб не було видно меж площини
            float edge = 1.0 - smoothstep(0.25, 0.5, distance(vUv, vec2(0.5)));
            gl_FragColor = vec4(uColor, n * edge * 0.55);
          }
        `}
      />
    </mesh>
  );
}