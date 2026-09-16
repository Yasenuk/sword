'use client';

import * as React from 'react';
import * as THREE from 'three';

import { useFrame, useThree } from '@react-three/fiber';
import { scroll } from './scroll-damper';

const CENTER = new THREE.Vector2(0, 0);
const hudRef = { el: null as HTMLPreElement | null };

function CameraHUD() {
	const { camera, controls, scene } = useThree();
	const acc = React.useRef(0);

	const dir = React.useMemo(() => new THREE.Vector3(), []);
	const hit = React.useMemo(() => new THREE.Vector3(), []);
	const ray = React.useMemo(() => {
		const r = new THREE.Raycaster();
		r.far = 3000;
		return r;
	}, []);

	useFrame((_, delta) => {
		acc.current += delta;
		if (acc.current < 0.1 || !hudRef.el) return;
		acc.current = 0;

		const p = camera.position;
		const t = (controls as any)?.target as THREE.Vector3 | undefined;
		const f = (n: number) => n.toFixed(1).padStart(7);

		camera.getWorldDirection(dir);

		const yaw = THREE.MathUtils.radToDeg(Math.atan2(dir.x, dir.z));
		const pitch = THREE.MathUtils.radToDeg(Math.asin(-dir.y));

		ray.setFromCamera(CENTER, camera);
		const first = ray.intersectObjects(scene.children, true)
			.find((i) => i.object.visible && (i.object as any).isMesh);

		let aim = 'aim    — (нічого)';
		if (first) {
			hit.copy(first.point);
			aim =
				`aim    ${f(hit.x)} ${f(hit.y)} ${f(hit.z)}\n` +
				`hit    ${first.object.name || '<безіменний>'}  ${first.distance.toFixed(1)}u`;
		}

		hudRef.el.textContent =
			`pos    ${f(p.x)} ${f(p.y)} ${f(p.z)}\n` +
			(t ? `target ${f(t.x)} ${f(t.y)} ${f(t.z)}\n` : '') +
			`dir    ${f(dir.x)} ${f(dir.y)} ${f(dir.z)}\n` +
			`yaw ${yaw.toFixed(0)}°  pitch ${pitch.toFixed(0)}°\n` +
			aim + '\n' +
			`scroll ${scroll.current.toFixed(3)}  v ${scroll.velocity.toFixed(2)}`;
	});

	return null;
}

function HUDOverlay() {
	return (
		<pre
			ref={(el) => { hudRef.el = el; }}
			style={{
				position: 'fixed', top: 12, left: 12, zIndex: 10,
				margin: 0, padding: '8px 10px',
				font: '12px/1.4 ui-monospace, monospace',
				color: '#8fe', background: 'rgba(0,0,0,.6)',
				borderRadius: 6, pointerEvents: 'none', whiteSpace: 'pre',
			}}
		/>
	);
}

function Crosshair() {
	return (
		<div style={{
			position: 'fixed', left: '50%', top: '50%', zIndex: 10,
			width: 14, height: 14, marginLeft: -7, marginTop: -7,
			pointerEvents: 'none',
			borderLeft: '1px solid #8fe', borderTop: '1px solid #8fe',
			transform: 'rotate(45deg)', opacity: .8,
		}} />
	);
}

export { CameraHUD, HUDOverlay, Crosshair };