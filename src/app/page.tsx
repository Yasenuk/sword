'use client';

import * as React from 'react';

import * as THREE from 'three';
import type { Group, PerspectiveCamera as PC } from 'three';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
	useGLTF,
	Environment,
	OrbitControls,
	Line,
	useTexture,
	useHelper,
	PerspectiveCamera
} from '@react-three/drei';

import { useControls } from 'leva';

type TexCfg = {
	map: string;
	repeat?: [number, number];
	roughness?: number;
	transparent?: boolean;
	emissive?: boolean;
};

const TEXTURE_MAP: Record<string, TexCfg> = {
	'Material.002': { map: '/church/textures/grass.jpg', repeat: [80, 80], roughness: 1 },
	'Material.007': { map: '/church/textures/stone-wall.jpg', repeat: [12, 6] },
	'Material.005': { map: '/church/textures/stone-wall.jpg', repeat: [8, 8] },
	'Material.004': { map: '/church/textures/roof-tiles.jpg', repeat: [10, 10] },
	'Material.008': { map: '/church/textures/stained-glass.jpg', emissive: true },
	'Material.011': { map: '/church/textures/bark.jpg', repeat: [2, 6] },
	'Material.006': { map: '/church/textures/leaf.png', transparent: true },
	Material: { map: '/church/textures/rock.jpg', repeat: [2, 2] },
};

const scroll = { target: 0, current: 0, velocity: 0 };
const hudRef = { el: null as HTMLPreElement | null };

const range = (p: number, a: number, b: number) =>
	THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

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

function Church() {
	const group = React.useRef<Group>(null);
	const { nodes, scene } = useGLTF('/church/DarkTemple.gltf');

	const paths = React.useMemo(
		() => [...new Set(Object.values(TEXTURE_MAP).map((c) => c.map))],
		[],
	);
	const loaded = useTexture(paths);

	React.useEffect(() => {
		const created: THREE.Texture[] = [];
		const byPath = new Map(paths.map((p, i) => [p, loaded[i]]));

		scene.traverse((obj) => {
			if (!(obj instanceof THREE.Mesh)) return;

			const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

			materials.forEach((mat) => {
				if (!(mat instanceof THREE.MeshStandardMaterial)) return;

				const cfg = TEXTURE_MAP[mat.name];
				if (!cfg) return;

				const tex = byPath.get(cfg.map)!.clone();
				created.push(tex);

				tex.needsUpdate = true;
				tex.colorSpace = THREE.SRGBColorSpace;
				tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
				tex.anisotropy = 8;
				if (cfg.repeat) tex.repeat.set(...cfg.repeat);

				mat.map = tex;
				mat.color.set('#ffffff');
				if (cfg.roughness !== undefined) mat.roughness = cfg.roughness;

				if (cfg.transparent) {
					mat.transparent = true;
					mat.alphaTest = 0.5;
					mat.side = THREE.DoubleSide;
				}

				if (cfg.emissive) {
					mat.emissiveMap = tex;
					mat.emissive.set('#ffffff');
					mat.emissiveIntensity = 1.6;
				}

				mat.needsUpdate = true;
			});
		});
		return () => created.forEach(t => t.dispose());
	}, [scene, loaded, paths]);

	return (
		<primitive object={scene} rotation-y={1.7} position={[0, 0, 0]} />
	);
}

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

function Rig({ cam }: { cam: React.RefObject<PC> }) {
	const pos = React.useMemo(() => new THREE.Vector3(), []);
	const look = React.useMemo(() => new THREE.Vector3(), []);

	useFrame(() => {
		const c = cam.current;
		if (!c) return;
		const p = scroll.current;
		c.position.copy(path.getPointAt(p, pos));
		c.lookAt(lookPath.getPointAt(p, look));
	});
	return null;
}

function CameraRig({ debug }: { debug: boolean }) {
	const real = React.useRef<PC>(null!);
	const curvePoints = React.useMemo(() => path.getPoints(100), []);

	useHelper(debug ? real : null, THREE.CameraHelper);

	return (
		<>
			<PerspectiveCamera ref={real} makeDefault={!debug} fov={45} near={0.1} far={1500} />
			<Rig cam={real} />

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

const CENTER = new THREE.Vector2(0, 0);

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

export default function Scene() {
	useScrollSource();
	const { debug } = useControls({ debug: false });

	return (
		<>
			<div style={{ position: 'fixed', inset: 0 }}>
				<Canvas dpr={[1, 1.75]} gl={{ antialias: true }}>
					<ScrollDamper />
					<CameraRig debug={debug} />
					{/* <CameraHUD /> */}
					<fogExp2 attach="fog" args={['#0d1b2e', 0.0082]} />
					<Environment files={'/church/enviroment/PHONAI.hdr'} background />
					<Church />
				</Canvas>
			</div>

			{/* <HUDOverlay /> */}
			{debug && <Crosshair />}
			<div style={{ height: '900vh', pointerEvents: 'none' }} />
		</>
	);
}