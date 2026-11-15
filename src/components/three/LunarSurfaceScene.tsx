import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import LunarTerrain from './LunarTerrain';
import ColonyBuildings from './ColonyBuildings';
import AstronautFigure from './AstronautFigure';
import PlayerAstronaut from './PlayerAstronaut';
import { COLONY_BUILDINGS, SCENE_ASTRONAUTS } from '@/game/colonyData';
import type { GameState } from '@/game/types';

interface LunarSurfaceSceneProps {
  state: GameState;
  selectedBuildingId: string | null;
  selectedAstronautId: number | null;
  onSelectBuilding: (id: string) => void;
  onSelectAstronaut: (id: number) => void;
  joystickInput: { x: number; y: number } | null;
  onDeselect: () => void;
}

function SceneLights() {
  return (
    <>
      {/* Strong directional sunlight from low angle (long shadows) */}
      <directionalLight
        position={[30, 25, 15]}
        intensity={2.5}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      {/* Fill light (soft ambient) */}
      <ambientLight intensity={0.15} color="#6080a0" />
      {/* Subtle hemisphere light for sky/ground color blend */}
      <hemisphereLight args={['#1a2a3a', '#3a3530', 0.3]} />
    </>
  );
}

function SceneContent({
  state,
  selectedBuildingId,
  selectedAstronautId,
  onSelectBuilding,
  onSelectAstronaut,
  joystickInput,
  onDeselect,
}: LunarSurfaceSceneProps) {
  const builtKeys = new Set<string | null>();
  // Mark which buildings are built (those with null buildingKey are always present)
  for (const b of COLONY_BUILDINGS) {
    if (b.buildingKey === null) {
      builtKeys.add(null);
    } else if (state.buildings[b.buildingKey]) {
      builtKeys.add(b.buildingKey);
    }
  }

  return (
    <>
      <SceneLights />
      <LunarTerrain quality="high" />
      <ColonyBuildings
        buildings={COLONY_BUILDINGS}
        builtKeys={builtKeys}
        selectedId={selectedBuildingId}
        onSelect={onSelectBuilding}
      />
      {SCENE_ASTRONAUTS.map((astro) => (
        <AstronautFigure
          key={astro.id}
          astronaut={astro}
          isSelected={selectedAstronautId === astro.id}
          onSelect={() => onSelectAstronaut(astro.id)}
        />
      ))}
      <PlayerAstronaut joystickInput={joystickInput} moveSpeed={6} />
      {/* Click on empty space deselects */}
      <mesh
        position={[0, -10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          // Only deselect if clicking the invisible plane (not stopped by a building)
          if (e.delta < 5) onDeselect();
        }}
        visible={false}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

export default function LunarSurfaceScene(props: LunarSurfaceSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 16], fov: 55, near: 0.1, far: 300 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#01040d');
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
