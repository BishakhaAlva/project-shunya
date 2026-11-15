import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ColonyBuilding } from '@/game/colonyData';

interface BuildingProps {
  building: ColonyBuilding;
  isBuilt: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function BuildingWrapper({ building, isBuilt, isSelected, onSelect }: BuildingProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (ref.current && isSelected) {
      // Gentle hover bounce for selected
      ref.current.position.y = building.position[1] + Math.sin(performance.now() * 0.003) * 0.1;
    }
  });

  return (
    <group
      position={building.position}
      rotation={[0, building.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={ref}>
        <BuildingModel shape={building.shape} isBuilt={isBuilt} />
        {/* Selection ring */}
        {(isSelected || hovered) && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[building.radius - 0.3, building.radius, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#94b28c' : '#b8ccb3'}
              transparent
              opacity={isSelected ? 0.6 : 0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

function BuildingModel({ shape, isBuilt }: { shape: ColonyBuilding['shape']; isBuilt: boolean }) {
  const dim = isBuilt ? 1 : 0.6;
  const opacity = isBuilt ? 1 : 0.5;
  const color = isBuilt ? '#c4c0b8' : '#6a665e';
  const accentColor = '#7a9e70';

  switch (shape) {
    case 'habitat':
      return <HabitatModel dim={dim} opacity={opacity} color={color} />;
    case 'lab':
      return <LabModel dim={dim} opacity={opacity} color={color} />;
    case 'greenhouse':
      return <GreenhouseModel dim={dim} opacity={opacity} />;
    case 'power':
      return <PowerModel dim={dim} opacity={opacity} color={color} />;
    case 'airlock':
      return <AirlockModel dim={dim} opacity={opacity} color={color} />;
    case 'solar':
      return <SolarArrayModel dim={dim} opacity={opacity} isBuilt={isBuilt} />;
    case 'antenna':
      return <AntennaModel dim={dim} opacity={opacity} color={color} />;
    case 'rover':
      return <RoverModel dim={dim} opacity={opacity} color={color} />;
    case 'landing':
      return <LandingPadModel dim={dim} opacity={opacity} />;
    case 'instrument':
      return <InstrumentModel dim={dim} opacity={opacity} color={color} accentColor={accentColor} />;
    default:
      return null;
  }
}

// ---- Individual building models ----

function HabitatModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  return (
    <group scale={dim}>
      {/* Main cylinder body */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 3, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Domed roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.6} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Windows */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.02, 1.8, Math.sin(angle) * 2.02]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial
              color="#5d8552"
              emissive="#5d8552"
              emissiveIntensity={0.3}
              transparent
              opacity={opacity * 0.9}
            />
          </mesh>
        );
      })}
      {/* Door */}
      <mesh position={[0, 0.8, 2.02]}>
        <boxGeometry args={[0.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#564461" roughness={0.5} transparent opacity={opacity} />
      </mesh>
      {/* Antenna stub on top */}
      <mesh position={[0.8, 3.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1, 4]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function LabModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  return (
    <group scale={dim}>
      {/* Rectangular body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[3, 2.4, 3]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Sloped roof */}
      <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.3, 0.8, 4]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.6} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Large observation window */}
      <mesh position={[0, 1.5, 1.51]}>
        <boxGeometry args={[1.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#7a9e70" emissive="#7a9e70" emissiveIntensity={0.25} transparent opacity={opacity * 0.8} />
      </mesh>
      {/* Side equipment box */}
      <mesh position={[1.7, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1, 1.5]} />
        <meshStandardMaterial color="#564461" roughness={0.6} transparent opacity={opacity} flatShading />
      </mesh>
    </group>
  );
}

function GreenhouseModel({ dim, opacity }: { dim: number; opacity: number }) {
  return (
    <group scale={dim}>
      {/* Transparent dome */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[2.2, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color="#94b28c"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={opacity * 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Base ring */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.6, 16]} />
        <meshStandardMaterial color="#c4c0b8" roughness={0.7} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Plants inside (small green mounds) */}
      {[[-0.8, 0.8, 0.5], [0.8, 0.8, -0.5], [0, 0.8, 0.8]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1] * 0.6 + 0.5, p[2]]}>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshStandardMaterial color="#5d8552" roughness={0.9} transparent opacity={opacity} />
        </mesh>
      ))}
      {/* Interior glow */}
      <pointLight position={[0, 1.5, 0]} color="#7a9e70" intensity={0.5 * opacity} distance={5} />
    </group>
  );
}

function PowerModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  return (
    <group scale={dim}>
      {/* Main body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2.5, 2.4, 2.5]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Roof equipment - vents and pipes */}
      <mesh position={[-0.6, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
        <meshStandardMaterial color="#564461" roughness={0.6} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.6, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 8]} />
        <meshStandardMaterial color="#564461" roughness={0.6} transparent opacity={opacity} />
      </mesh>
      {/* Control panel window */}
      <mesh position={[0, 1.5, 1.26]}>
        <boxGeometry args={[1.2, 0.6, 0.05]} />
        <meshStandardMaterial color="#d45e42" emissive="#d45e42" emissiveIntensity={0.3} transparent opacity={opacity * 0.8} />
      </mesh>
      {/* Pipe connecting to habitat */}
      <mesh position={[0, 1.2, 3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function AirlockModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  return (
    <group scale={dim}>
      {/* Cylinder body */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 2, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Hatch door */}
      <mesh position={[0, 1, 1.31]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 12]} />
        <meshStandardMaterial color="#564461" roughness={0.5} metalness={0.4} transparent opacity={opacity} />
      </mesh>
      {/* Hatch handle */}
      <mesh position={[0.4, 1, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 4, 8]} />
        <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
      </mesh>
      {/* Connecting tunnel */}
      <mesh position={[0, 1, -1.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.5, 8]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.6} transparent opacity={opacity} />
      </mesh>
      {/* Warning light */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#d45e42" emissive="#d45e42" emissiveIntensity={0.8} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function SolarArrayModel({ dim, opacity, isBuilt }: { dim: number; opacity: number; isBuilt: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && isBuilt) {
      // Slow tracking rotation
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
    }
  });

  return (
    <group scale={dim}>
      <group ref={ref}>
        {/* Support poles */}
        {[-2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 3, 6]} />
            <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} transparent opacity={opacity} />
          </mesh>
        ))}
        {/* Solar panels - vertical tilted */}
        {[-2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 2.8, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[1.5, 2, 0.05]} />
            <meshStandardMaterial
              color="#1a3a5a"
              emissive="#1a4a7a"
              emissiveIntensity={0.15}
              metalness={0.6}
              roughness={0.3}
              transparent
              opacity={opacity}
            />
          </mesh>
        ))}
        {/* Panel grid lines */}
        {[-2, 0, 2].map((x) => (
          <mesh key={`grid-${x}`} position={[x, 2.8, 0.03]} rotation={[0, 0, 0.2]}>
            <planeGeometry args={[1.5, 2]} />
            <meshBasicMaterial color="#3a6b8a" wireframe transparent opacity={opacity * 0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function AntennaModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  const dishRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (dishRef.current) {
      dishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.5;
    }
  });

  return (
    <group scale={dim}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 1, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Tall mast */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4, 6]} />
        <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
      </mesh>
      {/* Dish */}
      <mesh ref={dishRef} position={[0, 4.5, 0]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#d1c6ad" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} transparent opacity={opacity} />
      </mesh>
      {/* Receiver tip */}
      <mesh position={[0, 5, 0.3]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#d45e42" emissive="#d45e42" emissiveIntensity={0.5} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function RoverModel({ dim, opacity, color }: { dim: number; opacity: number; color: string }) {
  return (
    <group scale={dim}>
      {/* Body chassis */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[2.5, 0.8, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.5, 0.7, 1.4]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.5} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Cabin windows */}
      <mesh position={[0, 1.7, 0.71]}>
        <boxGeometry args={[1.2, 0.4, 0.05]} />
        <meshStandardMaterial color="#5d8552" emissive="#5d8552" emissiveIntensity={0.2} transparent opacity={opacity * 0.8} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 0.4, 0.8], [0.9, 0.4, 0.8], [-0.9, 0.4, -0.8], [0.9, 0.4, -0.8]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 12]} />
          <meshStandardMaterial color="#444" roughness={0.9} transparent opacity={opacity} />
        </mesh>
      ))}
      {/* Antenna */}
      <mesh position={[1, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 4]} />
        <meshStandardMaterial color="#999" metalness={0.8} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function LandingPadModel({ dim, opacity }: { dim: number; opacity: number }) {
  return (
    <group scale={dim}>
      {/* Flat pad */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.5, 32]} />
        <meshStandardMaterial color="#6a665e" roughness={0.9} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Inner circle marker */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.8, 32]} />
        <meshStandardMaterial color="#d45e42" emissive="#d45e42" emissiveIntensity={0.2} transparent opacity={opacity * 0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer circle marker */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.2, 32]} />
        <meshStandardMaterial color="#c4c0b8" transparent opacity={opacity * 0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Center cross marker */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1, 0.02, 0.15]} />
        <meshStandardMaterial color="#d45e42" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.15, 0.02, 1]} />
        <meshStandardMaterial color="#d45e42" transparent opacity={opacity} />
      </mesh>
      {/* Corner lights */}
      {[[-4, 0.15, 4], [4, 0.15, 4], [-4, 0.15, -4], [4, 0.15, -4]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#ccb882" emissive="#ccb882" emissiveIntensity={0.6} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function InstrumentModel({ dim, opacity, color, accentColor }: { dim: number; opacity: number; color: string; accentColor: string }) {
  return (
    <group scale={dim}>
      {/* Base plate */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Sensor body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} transparent opacity={opacity} flatShading />
      </mesh>
      {/* Sensor top */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} transparent opacity={opacity} />
      </mesh>
      {/* Solar panel on side */}
      <mesh position={[0.5, 0.7, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#1a3a5a" metalness={0.6} roughness={0.3} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// ---- Connecting tunnels between buildings ----

function ConnectingTunnels() {
  const tunnels: { from: [number, number, number]; to: [number, number, number] }[] = [
    { from: [0, 1.2, -2.5], to: [-4, 1, -2.5] }, // habitat to airlock
    { from: [0, 1.2, -2.5], to: [0, 1.2, -4.5] }, // habitat to power
    { from: [-2.5, 1.2, 0], to: [-5, 1.2, 1.5] }, // habitat to lab
    { from: [2.5, 1.2, 0], to: [5, 1.2, 1.5] }, // habitat to greenhouse
  ];

  return (
    <group>
      {tunnels.map((t, i) => {
        const dx = t.to[0] - t.from[0];
        const dz = t.to[2] - t.from[2];
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const midX = (t.from[0] + t.to[0]) / 2;
        const midZ = (t.from[2] + t.to[2]) / 2;
        return (
          <mesh
            key={i}
            position={[midX, t.from[1], midZ]}
            rotation={[Math.PI / 2, 0, angle]}
            castShadow
          >
            <cylinderGeometry args={[0.5, 0.5, len, 8]} />
            <meshStandardMaterial color="#a8a49c" roughness={0.6} metalness={0.2} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

// ---- Main colony export ----

interface ColonyBuildingsProps {
  buildings: ColonyBuilding[];
  builtKeys: Set<string | null>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ColonyBuildings({ buildings, builtKeys, selectedId, onSelect }: ColonyBuildingsProps) {
  return (
    <group>
      <ConnectingTunnels />
      {buildings.map((b) => (
        <BuildingWrapper
          key={b.id}
          building={b}
          isBuilt={b.buildingKey === null || builtKeys.has(b.buildingKey)}
          isSelected={selectedId === b.id}
          onSelect={() => onSelect(b.id)}
        />
      ))}
    </group>
  );
}
