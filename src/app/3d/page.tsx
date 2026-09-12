'use client';

import * as THREE from 'three';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, Center } from '@react-three/drei';
import type { Object3D, Group } from 'three';

import { useControls } from 'leva';

const q = (x: number, y: number, z: number) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'XYZ')).toArray();

function makeSlashClip(): THREE.AnimationClip {
  // корпус веде, стартує раніше
  const torso = new THREE.QuaternionKeyframeTrack(
    'upper_torso_01.quaternion',
    [0, 0.12, 0.18, 0.32, 0.6],
    [...q(0, 0, 0), ...q(0, 0.35, 0), ...q(0, -0.30, 0), ...q(0, -0.38, 0), ...q(0, 0, 0)]
  );

  // плече: підставиш свої числа з повзунків
  const shoulder = new THREE.QuaternionKeyframeTrack(
    'upper_armL_04.quaternion',
    [0, 0.14, 0.20, 0.30, 0.6],
    [...q(0, 0, 0), ...q(-1.30, 0, 0.45), ...q(0.95, 0, -0.25), ...q(1.10, 0, -0.30), ...q(0, 0, 0)]
  );

  const elbow = new THREE.QuaternionKeyframeTrack(
    'lower_armL_05.quaternion',
    [0, 0.14, 0.20, 0.30, 0.6],
    [...q(0, 0, 0), ...q(-1.10, 0, 0), ...q(-0.15, 0, 0), ...q(0.10, 0, 0), ...q(0, 0, 0)]
  );

  // кисть відстає — голка «доганяє» руку, дає хльост
  const wrist = new THREE.QuaternionKeyframeTrack(
    'handL_06.quaternion',
    [0, 0.16, 0.23, 0.34, 0.6],
    [...q(0, 0, 0), ...q(-0.5, 0, 0), ...q(0.6, 0, 0), ...q(0.3, 0, 0), ...q(0, 0, 0)]
  );

  return new THREE.AnimationClip('slash', 0.6, [torso, shoulder, elbow, wrist]);
}

function Lace() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF('/lace.glb');

  const {
    uaX, uaY, uaZ,
    laX, laY, laZ,
    hX, hY, hZ,
    fX, fY, fZ,
  } = useControls('LeftHand', {
    uaX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    uaY: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    uaZ: { value: 0, min: -0.5, max: 0.5, step: 0.01 },

    laX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    laY: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    laZ: { value: 0, min: -0.5, max: 0.5, step: 0.01 },

    hX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    hY: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    hZ: { value: 0, min: -0.5, max: 0.5, step: 0.01 },

    fX: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    fY: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
    fZ: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
  });

  const bones = useMemo(() => {
    const map: Record<string, Object3D> = {};
    scene.traverse((o) => { if ((o as any).isBone) map[o.name] = o; });
    return map;
  }, [scene]);

  const rest = useMemo(() => {
    const r: Record<string, [number, number, number]> = {};
    for (const [k, b] of Object.entries(bones)) {
      r[k] = [b.rotation.x, b.rotation.y, b.rotation.z];
    }
    return r;
  }, [bones]);

  useEffect(() => {
    scene.traverse((o) => { if ((o as any).isSkinnedMesh) o.frustumCulled = false; });
  }, [scene]);

  useFrame(() => {
    const b = bones, r = rest;

    b.upper_armL_04.rotation.set(
      r.upper_armL_04[0] + uaX,
      r.upper_armL_04[1] + uaY,
      r.upper_armL_04[2] + uaZ
    );
    b.lower_armL_05.rotation.set(
      r.lower_armL_05[0] + laX,
      r.lower_armL_05[1] + laY,
      r.lower_armL_05[2] + laZ
    );
    b.handL_06.rotation.set(
      r.handL_06[0] + hX,
      r.handL_06[1] + hY,
      r.handL_06[2] + hZ
    );
    b.fingerL_07.rotation.set(
      r.fingerL_07[0] + fX,
      r.fingerL_07[1] + fY,
      r.fingerL_07[2] + fZ
    );
  });

  // const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  // useEffect(() => {
  //   const clip = makeSlashClip();
  //   const action = mixer.clipAction(clip);

  //   action.blendMode = THREE.AdditiveAnimationBlendMode;
  //   action.play();

  //   return () => {
  //     action.stop();
  //     mixer.uncacheAction(clip);
  //   };
  // }, [mixer]);

  // useFrame((_, delta) => mixer.update(delta/100));

  return (
    <Center>
      <group ref={group} scale={1.2}>
        <primitive object={scene} />
      </group>
    </Center>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <Environment preset="warehouse" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={2} />
      <OrbitControls target={[0, 1, 0]} />
      <Lace />
    </Canvas>
  );
}