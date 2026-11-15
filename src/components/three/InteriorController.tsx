import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { InteriorDef } from '@/game/interiorData';
import { checkStationCollision, checkWallCollision, getNearestStation } from './InteriorScene';

interface InteriorControllerProps {
  def: InteriorDef;
  joystickInput: { x: number; y: number } | null;
  lookInput: { x: number; y: number } | null;
  onNearStationChange: (stationId: string | null) => void;
  onPositionChange: (pos: { x: number; z: number }) => void;
}

// First-person movement controller for interior exploration
export default function InteriorController({
  def,
  joystickInput,
  lookInput,
  onNearStationChange,
  onPositionChange,
}: InteriorControllerProps) {
  const { camera } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(0);
  const posRef = useRef<{ x: number; z: number }>({ x: 0, z: def.roomSize[1] / 2 - 1 });
  const lastNearStationRef = useRef<string | null>(null);
  const lookDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Initialize camera position
  useEffect(() => {
    const startPos = posRef.current;
    camera.position.set(startPos.x, 1.6, startPos.z);
    yawRef.current = Math.PI; // Face into the room
  }, [camera]);

  // Handle look input from touch/mouse
  useEffect(() => {
    if (lookInput) {
      lookDeltaRef.current.x = lookInput.x;
      lookDeltaRef.current.y = lookInput.y;
    }
  }, [lookInput]);

  // Mouse drag for look (desktop)
  useEffect(() => {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yawRef.current -= dx * 0.004;
      pitchRef.current -= dy * 0.003;
      pitchRef.current = Math.max(-0.8, Math.min(0.8, pitchRef.current));
    };
    const onMouseUp = () => { isDragging = false; };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useFrame((_, delta) => {
    // Apply look input from touch
    if (lookDeltaRef.current.x !== 0 || lookDeltaRef.current.y !== 0) {
      yawRef.current -= lookDeltaRef.current.x * 0.005;
      pitchRef.current -= lookDeltaRef.current.y * 0.003;
      pitchRef.current = Math.max(-0.8, Math.min(0.8, pitchRef.current));
      // Decay
      lookDeltaRef.current.x *= 0.85;
      lookDeltaRef.current.y *= 0.85;
      if (Math.abs(lookDeltaRef.current.x) < 0.01) lookDeltaRef.current.x = 0;
      if (Math.abs(lookDeltaRef.current.y) < 0.01) lookDeltaRef.current.y = 0;
    }

    // Movement input
    let moveX = 0;
    let moveZ = 0;

    if (keysRef.current['w'] || keysRef.current['arrowup']) moveZ -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) moveZ += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

    if (joystickInput) {
      moveX += joystickInput.x;
      moveZ += joystickInput.y;
    }

    // Convert to world space using yaw
    const cos = Math.cos(yawRef.current);
    const sin = Math.sin(yawRef.current);
    const worldX = moveX * cos - moveZ * sin;
    const worldZ = moveX * sin + moveZ * cos;

    const moveLen = Math.sqrt(worldX * worldX + worldZ * worldZ);
    if (moveLen > 0.01) {
      const speed = 4 * delta; // slower than surface
      const nx = worldX / Math.max(moveLen, 1);
      const nz = worldZ / Math.max(moveLen, 1);
      const factor = moveLen > 1 ? 1 : moveLen;

      const newX = posRef.current.x + nx * speed * factor;
      const newZ = posRef.current.z + nz * speed * factor;

      const testPos = { x: newX, z: newZ };

      // Check collisions with walls and stations
      if (!checkWallCollision(testPos, def.roomSize) && !checkStationCollision(testPos, def.stations)) {
        posRef.current.x = newX;
        posRef.current.z = newZ;
      } else {
        // Try sliding along X only
        const testX = { x: newX, z: posRef.current.z };
        if (!checkWallCollision(testX, def.roomSize) && !checkStationCollision(testX, def.stations)) {
          posRef.current.x = newX;
        } else {
          // Try sliding along Z only
          const testZ = { x: posRef.current.x, z: newZ };
          if (!checkWallCollision(testZ, def.roomSize) && !checkStationCollision(testZ, def.stations)) {
            posRef.current.z = newZ;
          }
        }
      }

      onPositionChange({ ...posRef.current });
    }

    // Update camera position
    camera.position.x = posRef.current.x;
    camera.position.y = 1.6;
    camera.position.z = posRef.current.z;

    // Apply yaw and pitch to camera
    const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    // Check nearest station
    const nearest = getNearestStation(posRef.current, def.stations);
    const nearId = nearest?.id ?? null;
    if (nearId !== lastNearStationRef.current) {
      lastNearStationRef.current = nearId;
      onNearStationChange(nearId);
    }
  });

  return null;
}
