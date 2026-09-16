import * as THREE from 'three';

export const range = (p: number, a: number, b: number) =>
	THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);

export const smoothstep = (t: number) => t * t * (3 - 2 * t);