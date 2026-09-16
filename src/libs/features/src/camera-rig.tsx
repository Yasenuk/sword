'use client';

import * as React from 'react';
import * as THREE from 'three';

import type { PerspectiveCamera as PC } from 'three';

import { useFrame } from '@react-three/fiber';
import {
	OrbitControls,
	Line,
	useHelper,
	PerspectiveCamera
} from '@react-three/drei';
import { T_RIG, T_RIG_Path } from '@/libs/types';
import { scroll } from './scroll-damper';


function Rig({ cam, path, lookPath }: T_RIG & T_RIG_Path) {
	const pos = React.useMemo(() => new THREE.Vector3(), []);
	const look = React.useMemo(() => new THREE.Vector3(), []);

	useFrame(() => {
		const c = cam.current;
		if (!c) return;
		const p = scroll.current;

		if (!path || !lookPath) return;
		c.position.copy(path?.getPointAt(p, pos));
		c.lookAt(lookPath.getPointAt(p, look));
	});
	return null;
}

function CameraRig({ debug, path, lookPath }: { debug: boolean } & T_RIG_Path) {
	const real = React.useRef<PC>(null!);
	const curvePoints = path && React.useMemo(() => path.getPoints(100), []);

	useHelper(debug ? real : null, THREE.CameraHelper);

	return (
		<>
			<PerspectiveCamera ref={real} makeDefault={!debug} fov={45} near={0.1} far={1500} />
			<Rig cam={real} path={path} lookPath={lookPath} />

			{debug && (
				<>
					<PerspectiveCamera makeDefault position={[120, 80, 120]} fov={55} far={3000} />
					<OrbitControls makeDefault enableZoom />
					<Line points={curvePoints} color="hotpink" lineWidth={2} />
				</>
			)}
		</>
	);
}

export { Rig, CameraRig };