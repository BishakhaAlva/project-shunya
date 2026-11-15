import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { InteriorDef, InteriorStation } from '@/game/interiorData';

// ---- Room shell (floor, walls, ceiling) ----

function RoomShell({ def, accentColor }: { def: InteriorDef; accentColor: string }) {
  const [w, d] = def.roomSize;
  const h = def.wallHeight;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={def.floorColor} roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Floor grid pattern (subtle accent lines) */}
      <gridHelper args={[w, Math.floor(w / 2), accentColor, def.floorColor]} position={[0, 0.01, 0]} />

      {/* Back wall */}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={def.wallColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, h / 2, d / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={def.wallColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={def.wallColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={def.wallColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={def.wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Wall accent strips (baseboards) */}
      <mesh position={[0, 0.1, -d / 2 + 0.02]}>
        <boxGeometry args={[w, 0.2, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, d / 2 - 0.02]}>
        <boxGeometry args={[w, 0.2, 0.02]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[-w / 2 + 0.02, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.2, d]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[w / 2 - 0.02, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.2, d]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ---- Station models ----

function StationModel({ station, accentColor, isHighlighted }: {
  station: InteriorStation;
  accentColor: string;
  isHighlighted: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current && isHighlighted) {
      ref.current.position.y = station.position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.03;
    }
  });

  const highlightColor = isHighlighted ? accentColor : '#6a665e';
  const emissiveIntensity = isHighlighted ? 0.4 : 0.1;

  return (
    <group ref={ref} position={station.position}>
      <StationShape type={station.stationType} color={highlightColor} emissive={highlightColor} emissiveIntensity={emissiveIntensity} />

      {/* Interaction ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[station.radius - 0.1, station.radius, 24]} />
        <meshBasicMaterial
          color={isHighlighted ? accentColor : '#5d8552'}
          transparent
          opacity={isHighlighted ? 0.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function StationShape({ type, color, emissive, emissiveIntensity }: {
  type: InteriorStation['stationType'];
  color: string;
  emissive: string;
  emissiveIntensity: number;
}) {
  switch (type) {
    case 'bed':
      return (
        <group>
          {/* Bed frame */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[1.8, 0.4, 0.9]} />
            <meshStandardMaterial color={color} roughness={0.7} flatShading />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.7, 0.2, 0.8]} />
            <meshStandardMaterial color="#e8e2d5" roughness={0.8} />
          </mesh>
          {/* Pillow */}
          <mesh position={[-0.6, 0.75, 0]} castShadow>
            <boxGeometry args={[0.4, 0.12, 0.6]} />
            <meshStandardMaterial color="#f5f3ee" roughness={0.9} />
          </mesh>
          {/* Privacy curtain rail */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[1.9, 0.05, 0.95]} />
            <meshStandardMaterial color="#564e44" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Curtain */}
          <mesh position={[0, 1.1, 0.45]}>
            <boxGeometry args={[1.8, 0.6, 0.02]} />
            <meshStandardMaterial color={emissive} roughness={0.8} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );

    case 'console':
      return (
        <group>
          {/* Console desk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[1.2, 0.05, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} flatShading />
          </mesh>
          {/* Console legs */}
          {[[-0.5, 0.4, 0.25], [0.5, 0.4, 0.25], [-0.5, 0.4, -0.25], [0.5, 0.4, -0.25]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
              <boxGeometry args={[0.06, 0.8, 0.06]} />
              <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          {/* Screen */}
          <mesh position={[0, 1.1, -0.2]} castShadow>
            <boxGeometry args={[1.0, 0.5, 0.04]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.2} />
          </mesh>
          {/* Screen glow */}
          <mesh position={[0, 1.1, -0.18]}>
            <planeGeometry args={[0.9, 0.4]} />
            <meshBasicMaterial color={emissive} transparent opacity={emissiveIntensity * 0.8} />
          </mesh>
          {/* Control buttons */}
          {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.83, 0.2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#7a9e70' : '#d45e42'} emissive={i % 2 === 0 ? '#7a9e70' : '#d45e42'} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      );

    case 'table':
      return (
        <group>
          {/* Table top */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[2, 0.08, 1]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} flatShading />
          </mesh>
          {/* Table legs */}
          {[[-0.9, 0.375, 0.4], [0.9, 0.375, 0.4], [-0.9, 0.375, -0.4], [0.9, 0.375, -0.4]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
              <boxGeometry args={[0.08, 0.75, 0.08]} />
              <meshStandardMaterial color="#444" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          {/* Food pouches on table */}
          {[-0.5, 0, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0.82, 0]} castShadow>
              <boxGeometry args={[0.2, 0.1, 0.15]} />
              <meshStandardMaterial color={i === 1 ? '#7a9e70' : '#d45e42'} roughness={0.6} />
            </mesh>
          ))}
          {/* Overhead lamp */}
          <mesh position={[0, 1.8, 0]}>
            <coneGeometry args={[0.2, 0.15, 8]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity * 0.5} />
          </mesh>
          <pointLight position={[0, 1.7, 0]} color={emissive} intensity={0.3} distance={3} />
        </group>
      );

    case 'tank':
      return (
        <group>
          {/* Tank body (glass cylinder) */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 1.6, 16]} />
            <meshStandardMaterial
              color="#94b28c"
              transparent
              opacity={0.3}
              roughness={0.1}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Tank frame top */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <torusGeometry args={[0.5, 0.04, 4, 16]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Tank frame bottom */}
          <mesh position={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.5, 0.04, 4, 16]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Plants inside */}
          {[-0.15, 0.15].map((x, i) => (
            <mesh key={i} position={[x, 0.6, 0]}>
              <sphereGeometry args={[0.2, 8, 6]} />
              <meshStandardMaterial color="#5d8552" roughness={0.9} />
            </mesh>
          ))}
          {/* Grow light on top */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.06, 12]} />
            <meshStandardMaterial color="#f0f4ef" emissive="#94b28c" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 1.7, 0]} color="#94b28c" intensity={0.4} distance={2.5} />
        </group>
      );

    case 'panel':
      return (
        <group>
          {/* Panel body */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.0, 1.8, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} flatShading />
          </mesh>
          {/* Panel displays */}
          {[-0.3, 0, 0.3].map((y, i) => (
            <mesh key={i} position={[0, 0.6 + y, 0.16]}>
              <boxGeometry args={[0.8, 0.2, 0.02]} />
              <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.2} />
            </mesh>
          ))}
          {/* Status lights */}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 1.7, 0.16]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial
                color={i < 3 ? '#7a9e70' : '#d45e42'}
                emissive={i < 3 ? '#7a9e70' : '#d45e42'}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>
      );

    case 'display':
      return (
        <group>
          {/* Stand */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.0, 8]} />
            <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 1.3, 0]} castShadow>
            <boxGeometry args={[1.0, 0.6, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Screen face */}
          <mesh position={[0, 1.3, 0.05]}>
            <planeGeometry args={[0.9, 0.5]} />
            <meshBasicMaterial color={emissive} transparent opacity={emissiveIntensity * 0.9} />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.3, 0.35, 0.08, 12]} />
            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      );

    case 'shelf':
      return (
        <group>
          {/* Shelf frame */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[1.2, 2.0, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} flatShading />
          </mesh>
          {/* Shelves */}
          {[0.5, 1.0, 1.5].map((y, i) => (
            <mesh key={i} position={[0, y, 0.05]}>
              <boxGeometry args={[1.1, 0.04, 0.4]} />
              <meshStandardMaterial color="#3a332c" roughness={0.7} />
            </mesh>
          ))}
          {/* Items on shelves */}
          {[
            { y: 0.5, x: -0.3 }, { y: 0.5, x: 0.3 },
            { y: 1.0, x: -0.2 }, { y: 1.0, x: 0.3 },
            { y: 1.5, x: 0 },
          ].map((p, i) => (
            <mesh key={i} position={[p.x, p.y + 0.1, 0.1]} castShadow>
              <boxGeometry args={[0.25, 0.2, 0.2]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#564461' : '#7a9e70'}
                roughness={0.5}
                emissive={i % 3 === 0 ? emissive : '#000'}
                emissiveIntensity={i % 3 === 0 ? 0.2 : 0}
              />
            </mesh>
          ))}
        </group>
      );

    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.85, -0.22]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.06]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Legs */}
          {[[-0.2, 0.25, 0.2], [0.2, 0.25, 0.2], [-0.2, 0.25, -0.2], [0.2, 0.25, -0.2]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
              <meshStandardMaterial color="#444" metalness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case 'monitor':
      return (
        <group>
          {/* Desk */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.0, 0.05, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Legs */}
          {[[-0.4, 0.375, 0.25], [0.4, 0.375, 0.25], [-0.4, 0.375, -0.25], [0.4, 0.375, -0.25]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]}>
              <boxGeometry args={[0.05, 0.75, 0.05]} />
              <meshStandardMaterial color="#333" metalness={0.5} />
            </mesh>
          ))}
          {/* Monitor */}
          <mesh position={[0, 1.1, -0.15]} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.04]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 1.1, -0.13]}>
            <planeGeometry args={[0.55, 0.35]} />
            <meshBasicMaterial color={emissive} transparent opacity={emissiveIntensity} />
          </mesh>
          {/* Vital signs display blip */}
          <mesh position={[0, 1.1, -0.12]}>
            <planeGeometry args={[0.4, 0.1]} />
            <meshBasicMaterial color="#7a9e70" transparent opacity={0.4} />
          </mesh>
        </group>
      );

    case 'airlock':
      return (
        <group>
          {/* Door frame */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.6, 2.4, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} flatShading />
          </mesh>
          {/* Door (circular hatch) */}
          <mesh position={[0, 1.2, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
            <meshStandardMaterial color="#564461" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Hatch handle */}
          <mesh position={[0.5, 1.2, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 4, 8]} />
            <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Warning light */}
          <mesh position={[0, 2.4, 0.1]}>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshStandardMaterial color="#d45e42" emissive="#d45e42" emissiveIntensity={0.8} />
          </mesh>
          {/* Small window */}
          <mesh position={[-0.3, 1.5, 0.16]}>
            <circleGeometry args={[0.1, 12]} />
            <meshBasicMaterial color="#1a2a3a" />
          </mesh>
        </group>
      );

    case 'workbench':
      return (
        <group>
          {/* Bench top */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.5, 0.06, 0.7]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} flatShading />
          </mesh>
          {/* Bench legs */}
          {[[-0.65, 0.425, 0.3], [0.65, 0.425, 0.3], [-0.65, 0.425, -0.3], [0.65, 0.425, -0.3]].map((p, i) => (
            <mesh key={i} position={[p[0], p[1], p[2]]} castShadow>
              <boxGeometry args={[0.06, 0.85, 0.06]} />
              <meshStandardMaterial color="#444" metalness={0.5} />
            </mesh>
          ))}
          {/* Tools on bench */}
          <mesh position={[-0.4, 0.9, 0]} castShadow>
            <boxGeometry args={[0.15, 0.05, 0.3]} />
            <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, 0.9, 0.1]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#d45e42" roughness={0.5} />
          </mesh>
          {/* Overhead light */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[1.2, 0.08, 0.3]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity * 0.5} />
          </mesh>
          <pointLight position={[0, 1.7, 0]} color={emissive} intensity={0.3} distance={3} />
        </group>
      );

    case 'equipment':
      return (
        <group>
          {/* Equipment rack */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[0.8, 2.0, 0.6]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} flatShading />
          </mesh>
          {/* Indicator lights */}
          {[-0.6, -0.3, 0, 0.3, 0.6].map((y, i) => (
            <mesh key={i} position={[0.3, 1.0 + y, 0.31]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#7a9e70' : '#d45e42'}
                emissive={i % 2 === 0 ? '#7a9e70' : '#d45e42'}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
          {/* Digital display */}
          <mesh position={[0, 1.5, 0.31]}>
            <boxGeometry args={[0.5, 0.2, 0.02]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={emissiveIntensity} />
          </mesh>
          {/* Pipes */}
          <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
            <meshStandardMaterial color="#999" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      );
  }
}

// ---- Ceiling lights ----

function CeilingLights({ def, accentColor }: { def: InteriorDef; accentColor: string }) {
  const [w, d] = def.roomSize;
  const lights = useMemo(() => {
    const items: [number, number][] = [];
    const xCount = Math.floor(w / 4);
    const zCount = Math.floor(d / 4);
    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < zCount; j++) {
        const x = -w / 2 + (w / (xCount + 1)) * (i + 1);
        const z = -d / 2 + (d / (zCount + 1)) * (j + 1);
        items.push([x, z]);
      }
    }
    return items;
  }, [w, d]);

  return (
    <group>
      {lights.map((pos, i) => (
        <group key={i} position={[pos[0], def.wallHeight - 0.05, pos[1]]}>
          {/* Light fixture */}
          <mesh>
            <boxGeometry args={[1.2, 0.08, 0.3]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} />
          </mesh>
          <pointLight
            position={[0, -0.3, 0]}
            intensity={0.5}
            distance={6}
            color={accentColor}
          />
        </group>
      ))}
    </group>
  );
}

// ---- Decorative wall details (windows, panels) ----

function WallDetails({ def }: { def: InteriorDef }) {
  const [w, d] = def.roomSize;
  const h = def.wallHeight;

  return (
    <group>
      {/* Window on back wall */}
      <mesh position={[-w / 4, h * 0.55, -d / 2 + 0.03]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshBasicMaterial color="#0a1520" />
      </mesh>
      <mesh position={[-w / 4, h * 0.55, -d / 2 + 0.04]}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshBasicMaterial color="#1a3a5a" transparent opacity={0.3} />
      </mesh>
      {/* Window frame */}
      <mesh position={[-w / 4, h * 0.55, -d / 2 + 0.02]}>
        <boxGeometry args={[1.7, 0.05, 0.05]} />
        <meshStandardMaterial color={def.accentColor} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[-w / 4, h * 0.55 + 0.45, -d / 2 + 0.02]}>
        <boxGeometry args={[1.7, 0.05, 0.05]} />
        <meshStandardMaterial color={def.accentColor} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Wall panel decorations on side walls */}
      {[1.5, 3.5].map((x, i) => (
        <mesh key={i} position={[-w / 2 + 0.03, h * 0.5, x]}>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial color={def.accentColor} emissive={def.accentColor} emissiveIntensity={0.08} roughness={0.5} />
        </mesh>
      ))}
      {[1.5, 3.5].map((x, i) => (
        <mesh key={i} position={[w / 2 - 0.03, h * 0.5, x]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial color={def.accentColor} emissive={def.accentColor} emissiveIntensity={0.08} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ---- Main interior scene ----

interface InteriorSceneProps {
  def: InteriorDef;
  highlightedStationId: string | null;
  onStationClick: (stationId: string) => void;
  playerPosition: { x: number; z: number };
  onPlayerMove: (pos: { x: number; z: number }) => void;
  joystickInput: { x: number; y: number } | null;
  lookInput: { x: number; y: number } | null;
}

export default function InteriorScene({
  def,
  highlightedStationId,
  onStationClick,
  playerPosition,
  onPlayerMove,
  joystickInput,
  lookInput,
}: InteriorSceneProps) {
  return (
    <group>
      <RoomShell def={def} accentColor={def.accentColor} />
      <CeilingLights def={def} accentColor={def.accentColor} />
      <WallDetails def={def} />

      {/* Stations */}
      {def.stations.map((station) => (
        <group
          key={station.id}
          position={station.position}
          onClick={(e) => {
            e.stopPropagation();
            onStationClick(station.id);
          }}
        >
          <StationModel
            station={station}
            accentColor={def.accentColor}
            isHighlighted={highlightedStationId === station.id}
          />
        </group>
      ))}

      {/* Player capsule (first-person proxy - invisible but casts shadow) */}
      <mesh position={[playerPosition.x, 0.9, playerPosition.z]} castShadow visible={false}>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color="#f0f4ef" />
      </mesh>
    </group>
  );
}

// Export helper for collision detection
export function checkStationCollision(
  pos: { x: number; z: number },
  stations: InteriorStation[],
  extraRadius = 0.6
): boolean {
  for (const s of stations) {
    const dx = pos.x - s.position[0];
    const dz = pos.z - s.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < s.radius + extraRadius) return true;
  }
  return false;
}

export function checkWallCollision(
  pos: { x: number; z: number },
  roomSize: [number, number],
  margin = 0.5
): boolean {
  const [w, d] = roomSize;
  if (pos.x < -w / 2 + margin || pos.x > w / 2 - margin) return true;
  if (pos.z < -d / 2 + margin || pos.z > d / 2 - margin) return true;
  return false;
}

export function getNearestStation(
  pos: { x: number; z: number },
  stations: InteriorStation[]
): InteriorStation | null {
  let nearest: InteriorStation | null = null;
  let minDist = Infinity;
  for (const s of stations) {
    const dx = pos.x - s.position[0];
    const dz = pos.z - s.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < s.radius && dist < minDist) {
      minDist = dist;
      nearest = s;
    }
  }
  return nearest;
}
