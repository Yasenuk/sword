'use client';

import * as React from 'react';
import * as THREE from 'three';

import type { Group} from 'three';

import {
	useGLTF,
	useTexture,
} from '@react-three/drei';

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

export { Church };