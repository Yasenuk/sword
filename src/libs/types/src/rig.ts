import * as THREE from 'three';

export type T_RIG = {
	cam: React.RefObject<THREE.PerspectiveCamera>;
};

export type T_RIG_Path = {
	path: THREE.CatmullRomCurve3;
	lookPath?: THREE.CatmullRomCurve3;
}