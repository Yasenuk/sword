'use client';

import * as THREE from 'three';

import { Environment } from '@react-three/drei';
import { useControls } from 'leva';
import { Canvas } from '@react-three/fiber';
import {
	CameraHUD,
	CameraRig,
	Crosshair,
	HUDOverlay,
	ScrollDamper,
	useScrollSource
} from '@/libs/features';
import { Church } from '@/libs/components';

const path = new THREE.CatmullRomCurve3([
	new THREE.Vector3(-18.4, 50.3, -188.4),
	new THREE.Vector3(-42, 50.3, -141),
	new THREE.Vector3(-80, 53.3, -81),
	new THREE.Vector3(-60, 60.3, 0),
	new THREE.Vector3(-40, 70.3, 70),

	new THREE.Vector3(-35, 70.3, 140),
	new THREE.Vector3(-95, 78.3, 280),

	new THREE.Vector3(-135, 88.3, 250),
	new THREE.Vector3(-165, 92.3, 200),
	new THREE.Vector3(-160, 92.3, 100),

	new THREE.Vector3(-140, 82.3, 55),
	new THREE.Vector3(-110, 59.3, 77),

	new THREE.Vector3(-113, 51.3, 110),
	new THREE.Vector3(-117, 51.3, 150),
]);
const lookPath = new THREE.CatmullRomCurve3([
	new THREE.Vector3(-37.4, 45.9, -80),
	new THREE.Vector3(-80, 0, 81),
	new THREE.Vector3(-35, 15.3, 140),
	new THREE.Vector3(-90, 78.3, 150),
	new THREE.Vector3(-135, 88.3, 130),

	new THREE.Vector3(-165, 92.3, 240),
	new THREE.Vector3(-160, 92.3, 210),

	new THREE.Vector3(-140, 88.3, 55),
	new THREE.Vector3(110, 85.3, 77),
	new THREE.Vector3(113, 80.3, 110),

	new THREE.Vector3(-118, 69.3, 150),
	new THREE.Vector3(-130, 58.3, 150),

	new THREE.Vector3(-118, 54.3, 190),
	new THREE.Vector3(-123.5, 51.3, 190),
]);

export default function Scene() {
	useScrollSource();
	const { debug } = useControls({ debug: false });

	return (
		<>
			<div style={{ position: 'fixed', inset: 0 }}>
				<Canvas dpr={[1, 1.75]} gl={{ antialias: true }}>
					<ScrollDamper />
					<CameraRig debug={debug} path={path} lookPath={lookPath} />
					<CameraHUD />
					<fogExp2 attach="fog" args={['#0d1b2e', 0.0082]} />
					<Environment files={'/church/enviroment/PHONAI.hdr'} background />
					<Church />
				</Canvas>
			</div>

			<HUDOverlay />
			{debug && <Crosshair />}
			<div style={{ height: '900vh', pointerEvents: 'none' }} />
		</>
	);
}