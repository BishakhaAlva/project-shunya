import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeightAt } from './LunarTerrain';
import { COLONY_BUILDINGS } from '@/game/colonyData';

interface PlayerAstronautProps {
  joystickInput: { x: number; y: number } | null;
  moveSpeed: number;
  onPositionChange?: (pos: THREE.Vector3) => void;
}

// Player astronaut — third person controlled character
export default function PlayerAstronaut({ joystickInput, moveSpeed, onPositionChange }: PlayerAstronautProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const cameraAngleRef = useRef<number>(0);
  const cameraDistRef = useRef<number>(12);
  const [pointerDown, setPointerDown] = useState(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse wheel zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistRef.current = Math.max(6, Math.min(25, cameraDistRef.current + e.deltaY * 0.01));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  // Mouse drag for camera rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Don't interfere with clicking buildings
      setPointerDown(true);
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return;
      const dx = e.clientX - lastPointerRef.current.x;
      cameraAngleRef.current -= dx * 0.005;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => setPointerDown(false);

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, pointerDown]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Determine movement direction
    let moveX = 0;
    let moveZ = 0;

    // Keyboard (WASD / arrows)
    if (keysRef.current['w'] || keysRef.current['arrowup']) moveZ -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) moveZ += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

    // Joystick input (mobile)
    if (joystickInput) {
      moveX += joystickInput.x;
      moveZ += joystickInput.y;
    }

    // Apply camera angle to movement so "forward" is relative to camera
    const cos = Math.cos(cameraAngleRef.current);
    const sin = Math.sin(cameraAngleRef.current);
    const worldMoveX = moveX * cos - moveZ * sin;
    const worldMoveZ = moveX * sin + moveZ * cos;

    // Normalize and scale
    const moveLen = Math.sqrt(worldMoveX * worldMoveX + worldMoveZ * worldMoveZ);
    if (moveLen > 0.01) {
      const nx = worldMoveX / Math.max(moveLen, 1);
      const nz = worldMoveZ / Math.max(moveLen, 1);
      const speed = moveSpeed * delta;
      const newX = groupRef.current.position.x + nx * speed * (moveLen > 1 ? 1 : moveLen);
      const newZ = groupRef.current.position.z + nz * speed * (moveLen > 1 ? 1 : moveLen);

      // Collision check with buildings
      let blocked = false;
      for (const b of COLONY_BUILDINGS) {
        const dx = newX - b.position[0];
        const dz = newZ - b.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < b.radius + 0.8) {
          blocked = true;
          break;
        }
      }

      // World boundary
      const worldDist = Math.sqrt(newX * newX + newZ * newZ);
      if (worldDist > 75) blocked = true;

      if (!blocked) {
        groupRef.current.position.x = newX;
        groupRef.current.position.z = newZ;

        // Face movement direction
        const targetAngle = Math.atan2(nx, nz);
        // Smooth rotation
        let currentAngle = groupRef.current.rotation.y;
        let diff = targetAngle - currentAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        groupRef.current.rotation.y += diff * Math.min(1, delta * 8);
      }
    }

    // Follow terrain height
    const terrainY = getTerrainHeightAt(groupRef.current.position.x, groupRef.current.position.z);
    groupRef.current.position.y = terrainY;

    // Walking bob animation
    if (bodyRef.current && moveLen > 0.01) {
      const t = performance.now() * 0.01;
      bodyRef.current.position.y = Math.abs(Math.sin(t)) * 0.05;
    } else if (bodyRef.current) {
      bodyRef.current.position.y = 0;
    }

    // Camera follow (third person)
    const playerPos = groupRef.current.position;
    const camAngle = cameraAngleRef.current;
    const camDist = cameraDistRef.current;
    const camHeight = camDist * 0.5 + 3;

    const targetCamX = playerPos.x - Math.sin(camAngle) * camDist;
    const targetCamZ = playerPos.z - Math.cos(camAngle) * camDist;
    const targetCamY = terrainY + camHeight;

    // Smooth camera
    camera.position.x += (targetCamX - camera.position.x) * Math.min(1, delta * 4);
    camera.position.y += (targetCamY - camera.position.y) * Math.min(1, delta * 4);
    camera.position.z += (targetCamZ - camera.position.z) * Math.min(1, delta * 4);
    camera.lookAt(playerPos.x, terrainY + 1.5, playerPos.z);

    if (onPositionChange) {
      onPositionChange(playerPos);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 4]}>
      <group ref={bodyRef}>
        {/* Player astronaut - viewed from behind */}
        {/* Helmet */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[0.28, 12, 10]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Visor (facing forward, but visible from behind as dark) */}
        <mesh position={[0, 1.8, 0.22]}>
          <sphereGeometry args={[0.2, 12, 8, 0, Math.PI, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#1a2a3a"
            roughness={0.1}
            metalness={0.8}
            emissive="#0a1520"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.35]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.5} metalness={0.1} flatShading />
        </mesh>
        {/* Backpack (PLSS) - most visible from behind */}
        <mesh position={[0, 1.35, -0.22]} castShadow>
          <boxGeometry args={[0.42, 0.6, 0.2]} />
          <meshStandardMaterial color="#6b557a" roughness={0.6} metalness={0.2} flatShading />
        </mesh>
        {/* Backpack antenna */}
        <mesh position={[0.15, 1.65, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
          <meshStandardMaterial color="#999" metalness={0.8} />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.32, 1.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.5} flatShading />
        </mesh>
        <mesh position={[0.32, 1.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.5} flatShading />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.13, 0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.5} flatShading />
        </mesh>
        <mesh position={[0.13, 0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color="#f0f4ef" roughness={0.5} flatShading />
        </mesh>
        {/* Boots */}
        <mesh position={[-0.13, 0.32, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#3a332c" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0.13, 0.32, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#3a332c" roughness={0.7} flatShading />
        </mesh>
        {/* Chest control panel with sage light */}
        <mesh position={[0, 1.4, 0.18]}>
          <boxGeometry args={[0.2, 0.15, 0.02]} />
          <meshStandardMaterial color="#7a9e70" emissive="#7a9e70" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}
