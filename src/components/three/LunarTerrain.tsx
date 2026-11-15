import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---- Procedural lunar terrain ----

const TERRAIN_SIZE = 200;
const TERRAIN_SEGMENTS = 128;

function noise(x: number, z: number): number {
  // Simple multi-octave noise using sine combinations
  let n = 0;
  n += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.5;
  n += Math.sin(x * 0.3 + 2) * Math.cos(z * 0.25 + 1) * 0.6;
  n += Math.sin(x * 0.7 + 5) * Math.cos(z * 0.6 + 3) * 0.25;
  n += Math.sin(x * 1.5) * Math.cos(z * 1.3) * 0.1;
  return n;
}

interface CraterDef {
  x: number;
  z: number;
  radius: number;
  depth: number;
}

const CRATERS: CraterDef[] = [
  { x: 25, z: 20, radius: 12, depth: 1.5 },
  { x: -30, z: 15, radius: 8, depth: 1.0 },
  { x: 15, z: -25, radius: 10, depth: 1.2 },
  { x: -20, z: -30, radius: 14, depth: 2.0 },
  { x: 40, z: -10, radius: 7, depth: 0.8 },
  { x: -40, z: 30, radius: 9, depth: 1.0 },
  { x: 35, z: 35, radius: 6, depth: 0.7 },
  { x: -10, z: 40, radius: 11, depth: 1.3 },
  { x: 50, z: 25, radius: 5, depth: 0.6 },
  { x: -50, z: -15, radius: 8, depth: 0.9 },
];

function getTerrainHeight(x: number, z: number): number {
  let h = noise(x, z);

  // Apply crater depressions
  for (const c of CRATERS) {
    const dx = x - c.x;
    const dz = z - c.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < c.radius) {
      const t = dist / c.radius;
      // Bowl shape: deepest at center, raised rim
      const bowl = c.depth * (1 - t * t);
      const rim = c.depth * 0.3 * Math.exp(-((t - 0.85) * (t - 0.85)) * 50);
      h -= bowl;
      h += rim;
    }
  }

  // Flatten the central colony area
  const centerDist = Math.sqrt(x * x + z * z);
  if (centerDist < 18) {
    const flatten = 1 - centerDist / 18;
    h = h * (1 - flatten * 0.8);
  }

  return h;
}

function buildTerrainGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getTerrainHeight(x, z);
    pos.setY(i, y);
  }
  geo.computeVertexNormals();
  return geo;
}

// ---- Rocks (instanced) ----

interface RockInstance {
  position: [number, number, number];
  scale: number;
  rotation: number;
}

function generateRocks(count: number): RockInstance[] {
  const rocks: RockInstance[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 65;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = getTerrainHeight(x, z);
    rocks.push({
      position: [x, y, z],
      scale: 0.3 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
    });
  }
  return rocks;
}

// ---- Earth ----

function Earth() {
  const ref = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.03;
    }
  });

  // Procedural earth-like texture using canvas
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Ocean base
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1a4a7a');
    grad.addColorStop(0.5, '#1e5a8a');
    grad.addColorStop(1, '#1a4a7a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Continents (simplified blobs)
    ctx.fillStyle = '#3a6b3a';
    // Eurasia/Africa
    ctx.beginPath();
    ctx.ellipse(180, 100, 60, 35, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(170, 150, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    // Americas
    ctx.beginPath();
    ctx.ellipse(320, 110, 30, 50, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(340, 170, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    // Australia
    ctx.beginPath();
    ctx.ellipse(100, 170, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Polar ice caps
    ctx.fillStyle = '#e0e8f0';
    ctx.fillRect(0, 0, 512, 15);
    ctx.fillRect(0, 241, 512, 15);

    // Some cloud wisps
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        30 + Math.random() * 190,
        20 + Math.random() * 30,
        8 + Math.random() * 10,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group ref={ref} position={[0, 45, -80]} scale={12}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
          emissive="#0a1520"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={cloudRef} scale={1.05}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#4a90d9"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ---- Distant mountains ----

function Mountains() {
  const mountains = useMemo(() => {
    const items: { position: [number, number, number]; scale: [number, number, number]; rotation: number }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 85 + Math.random() * 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const h = 8 + Math.random() * 12;
      const w = 10 + Math.random() * 8;
      items.push({
        position: [x, 0, z],
        scale: [w, h, w],
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {mountains.map((m, i) => (
        <mesh key={i} position={m.position} rotation={[0, m.rotation, 0]} scale={m.scale}>
          <coneGeometry args={[1, 1.5, 6, 1]} />
          <meshStandardMaterial color="#6a665e" roughness={1} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ---- Stars ----

function Stars() {
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random points on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 150;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.8 + 10;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.4} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// ---- Main terrain export ----

export function getTerrainHeightAt(x: number, z: number): number {
  return getTerrainHeight(x, z);
}

interface LunarTerrainProps {
  quality?: 'low' | 'high';
}

export default function LunarTerrain({ quality = 'high' }: LunarTerrainProps) {
  const geometry = useMemo(() => buildTerrainGeometry(), []);
  const rocks = useMemo(() => generateRocks(quality === 'high' ? 60 : 30), [quality]);

  const rockGeometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.5, 0);
    // Distort vertices for irregular rock shapes
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.15);
      pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.15);
      pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.15);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Terrain surface */}
      <mesh geometry={geometry} receiveShadow castShadow={quality === 'high'}>
        <meshStandardMaterial
          color="#8a8276"
          roughness={1}
          metalness={0}
          flatShading
        />
      </mesh>

      {/* Instanced rocks */}
      <instancedMesh
        args={[rockGeometry, undefined, rocks.length]}
        castShadow={quality === 'high'}
      >
        <meshStandardMaterial color="#7a7268" roughness={1} metalness={0} flatShading />
      </instancedMesh>
      <RockInstances rocks={rocks} />

      {/* Distant mountains */}
      <Mountains />

      {/* Stars */}
      <Stars />

      {/* Earth */}
      <Earth />
    </group>
  );
}

// Separate component to set instance matrices
function RockInstances({ rocks }: { rocks: RockInstance[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    rocks.forEach((rock, i) => {
      dummy.position.set(...rock.position);
      dummy.scale.setScalar(rock.scale);
      dummy.rotation.y = rock.rotation;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);

  return <instancedMesh ref={meshRef} args={[undefined, undefined, rocks.length]} />;
}
