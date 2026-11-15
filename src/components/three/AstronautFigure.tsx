import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneAstronaut } from '@/game/colonyData';
import { getTerrainHeightAt } from './LunarTerrain';

interface AstronautFigureProps {
  astronaut: SceneAstronaut;
  isSelected: boolean;
  onSelect: () => void;
}

// Single astronaut model built from primitives
function AstronautBody({ color = '#e8e2d5' }: { color?: string }) {
  return (
    <group>
      {/* Helmet */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Visor */}
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
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} flatShading />
      </mesh>
      {/* Backpack (PLSS) */}
      <mesh position={[0, 1.35, -0.22]} castShadow>
        <boxGeometry args={[0.42, 0.6, 0.2]} />
        <meshStandardMaterial color="#564461" roughness={0.6} metalness={0.2} flatShading />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.32, 1.4, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0.32, 1.4, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.13, 0.65, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
      <mesh position={[0.13, 0.65, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
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
      {/* Chest control panel */}
      <mesh position={[0, 1.4, 0.18]}>
        <boxGeometry args={[0.2, 0.15, 0.02]} />
        <meshStandardMaterial color="#7a9e70" emissive="#7a9e70" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export default function AstronautFigure({ astronaut, isSelected, onSelect }: AstronautFigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (bodyRef.current) {
      // Different animations per activity
      switch (astronaut.activityType) {
        case 'repair':
          // Bending motion
          bodyRef.current.rotation.x = Math.sin(t * 2) * 0.15;
          if (armRef.current) armRef.current.rotation.x = -0.8 + Math.sin(t * 4) * 0.2;
          break;
        case 'inspect':
          // Looking around
          bodyRef.current.rotation.y = Math.sin(t * 0.5) * 0.5;
          break;
        case 'sample':
          // Bending down periodically
          bodyRef.current.rotation.x = Math.max(0, Math.sin(t * 1.5)) * 0.5;
          break;
        case 'walk': {
          // Walking motion - leg swing
          const legs = bodyRef.current.children.filter((c) => c instanceof THREE.Mesh);
          legs.forEach((leg, i) => {
            if (i >= 5 && i <= 6) {
              leg.rotation.x = Math.sin(t * 4 + (i - 5) * Math.PI) * 0.4;
            }
          });
          break;
        }
        case 'rover':
          // Standing still, slight idle
          bodyRef.current.position.y = Math.sin(t * 1.5) * 0.02;
          break;
      }
    }

    // Hover effect for selected
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = astronaut.position[1] + Math.sin(t * 3) * 0.08;
    }
  });

  const y = getTerrainHeightAt(astronaut.position[0], astronaut.position[2]);

  return (
    <group
      ref={groupRef}
      position={[astronaut.position[0], y, astronaut.position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <group ref={bodyRef}>
        <AstronautBody />
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 24]} />
          <meshBasicMaterial color="#94b28c" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Name tag float above */}
      {(isSelected) && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#7a9e70" />
        </mesh>
      )}
    </group>
  );
}
