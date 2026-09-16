'use client';

import * as React from 'react';
import * as THREE from 'three';

import { useFrame } from '@react-three/fiber';

const scroll = { target: 0, current: 0, velocity: 0 };

function useScrollSource() {
	React.useEffect(() => {
		const el = document.documentElement;
		const read = () => {
			const max = el.scrollHeight - window.innerHeight;
			scroll.target = max > 0 ? el.scrollTop / max : 0;
		};
		read();
		window.addEventListener('scroll', read, { passive: true });
		window.addEventListener('resize', read);
		return () => {
			window.removeEventListener('scroll', read);
			window.removeEventListener('resize', read);
		};
	}, []);
}

function ScrollDamper() {
	useFrame((_, delta) => {
		const dt = Math.min(delta, 0.1);
		const next = THREE.MathUtils.damp(scroll.current, scroll.target, 4, dt);
		scroll.velocity = (next - scroll.current) / Math.max(dt, 1e-4);
		scroll.current = next;
	});
	return null;
}

export { useScrollSource, ScrollDamper, scroll };
