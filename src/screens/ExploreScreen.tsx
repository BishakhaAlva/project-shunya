import { useState, useEffect, useRef, Suspense } from 'react';
import {
  ArrowLeft, Wind, Droplets, Apple, Zap, Heart,
  X, Info, DoorOpen, Home, Calendar, Skull,
  Wrench, FlaskConical, Sprout, Radio, Truck, Telescope,
  ChevronRight, Compass, TouchpadOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GameState } from '@/game/types';
import type { ColonyBuilding, SceneAstronaut } from '@/game/colonyData';
import { COLONY_BUILDINGS, SCENE_ASTRONAUTS } from '@/game/colonyData';
import LunarSurfaceScene from '@/components/three/LunarSurfaceScene';
import Joystick from '@/components/Joystick';

interface ExploreScreenProps {
  state: GameState;
  onBack: () => void;
}

// Detect WebGL support
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

// Detect mobile
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

const buildingIcons: Record<string, LucideIcon> = {
  habitat: Home,
  lab: FlaskConical,
  greenhouse: Sprout,
  power: Zap,
  airlock: DoorOpen,
  solar: Zap,
  antenna: Radio,
  rover: Truck,
  landing: Compass,
  instrument: Telescope,
};

const activityIcons: Record<string, LucideIcon> = {
  repair: Wrench,
  inspect: Telescope,
  sample: FlaskConical,
  walk: Compass,
  rover: Truck,
};

export default function ExploreScreen({ state, onBack }: ExploreScreenProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedAstronautId, setSelectedAstronautId] = useState<number | null>(null);
  const [joystickInput, setJoystickInput] = useState<{ x: number; y: number } | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInterior, setShowInterior] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [mobile] = useState(isMobile);
  const loadingTimer = useRef<number | null>(null);

  useEffect(() => {
    const supported = hasWebGL();
    setWebglAvailable(supported);

    if (supported) {
      loadingTimer.current = window.setTimeout(() => setLoading(false), 1500);
    }

    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  const selectedBuilding = COLONY_BUILDINGS.find((b) => b.id === selectedBuildingId) || null;
  const selectedAstronaut = SCENE_ASTRONAUTS.find((a) => a.id === selectedAstronautId) || null;

  const handleSelectBuilding = (id: string) => {
    setSelectedAstronautId(null);
    setSelectedBuildingId(id);
  };

  const handleSelectAstronaut = (id: number) => {
    setSelectedBuildingId(null);
    setSelectedAstronautId(id);
  };

  const handleDeselect = () => {
    setSelectedBuildingId(null);
    setSelectedAstronautId(null);
  };

  const aliveCrew = state.crew.filter((c) => c.alive);

  // Compact resource HUD values
  const resourceItems = [
    { icon: Wind, label: 'O₂', value: state.resources.oxygen, color: 'text-sage-300' },
    { icon: Droplets, label: 'H₂O', value: state.resources.water, color: 'text-moonstone-200' },
    { icon: Apple, label: 'Food', value: state.resources.food, color: 'text-sage-400' },
    { icon: Zap, label: 'Pwr', value: state.resources.electricity, color: 'text-peach-300' },
  ];

  // ---- Loading screen ----
  if (loading && webglAvailable) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-charcoal-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-sage-700 border-t-sage-300 animate-spin" />
          </div>
          <h2 className="text-xl font-display font-bold text-sage-200 tracking-wide mb-2">
            INITIALIZING SURFACE SCAN
          </h2>
          <p className="text-sm text-charcoal-100 font-body">
            Preparing lunar terrain visualization...
          </p>
          <div className="mt-6 w-48 h-1 bg-charcoal-600 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-sage-500 to-sage-300 rounded-full"
              style={{ animation: 'scan 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- WebGL fallback ----
  if (!webglAvailable) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-charcoal-900 px-6">
        <div className="text-center max-w-md">
          <TouchpadOff className="w-16 h-16 text-peach-300 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-sage-200 mb-3">
            3D View Unavailable
          </h2>
          <p className="text-sm text-charcoal-100 mb-6 leading-relaxed">
            Your device does not support WebGL, which is needed for the 3D lunar surface view.
            You can continue playing the mission from the Mission Control dashboard.
          </p>
          <button
            onClick={onBack}
            className="btn-pastel px-6 py-3 rounded-xl font-display font-medium tracking-wide"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Mission Control
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal-900 overflow-hidden">
      {/* 3D Scene */}
      <Suspense fallback={null}>
        <LunarSurfaceScene
          state={state}
          selectedBuildingId={selectedBuildingId}
          selectedAstronautId={selectedAstronautId}
          onSelectBuilding={handleSelectBuilding}
          onSelectAstronaut={handleSelectAstronaut}
          joystickInput={joystickInput}
          onDeselect={handleDeselect}
        />
      </Suspense>

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-10 hud-pastel">
        <div className="flex items-center justify-between px-3 py-2.5 safe-top">
          {/* Back button + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-600/60 hover:bg-charcoal-500/60 text-sage-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-display tracking-wide hidden sm:inline">Mission Control</span>
            </button>
            <div>
              <div className="text-[10px] text-charcoal-100 font-display tracking-widest uppercase">PROJECT SHUNYA</div>
              <div className="text-sm font-display font-bold text-sage-200">Surface Exploration</div>
            </div>
          </div>

          {/* Mission info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-display text-ivory-300">
              <Calendar className="w-3.5 h-3.5 text-sage-400" />
              <span>Day {state.day}/{state.maxDays}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-display text-ivory-300">
              <Heart className="w-3.5 h-3.5 text-peach-300" />
              <span>{aliveCrew.length}/{state.crew.length}</span>
            </div>
          </div>
        </div>

        {/* Compact resource HUD */}
        <div className="flex items-center justify-center gap-2 px-3 pb-2">
          {resourceItems.map((r) => (
            <div key={r.label} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-charcoal-700/50">
              <r.icon className={`w-3 h-3 ${r.color}`} />
              <span className={`text-xs font-mono font-bold ${r.color}`}>{Math.round(r.value)}</span>
              <span className="text-[10px] text-charcoal-100">{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint (desktop) */}
      {!mobile && !selectedBuilding && !selectedAstronaut && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hud-pastel rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-4 text-xs text-charcoal-100">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-charcoal-600 text-sage-200 font-mono text-[10px]">WASD</kbd>
              Move
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-charcoal-600 text-sage-200 font-mono text-[10px]">Mouse</kbd>
              Rotate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-charcoal-600 text-sage-200 font-mono text-[10px]">Scroll</kbd>
              Zoom
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-charcoal-600 text-sage-200 font-mono text-[10px]">Click</kbd>
              Inspect
            </span>
          </div>
        </div>
      )}

      {/* Mobile joystick */}
      {mobile && (
        <div className="absolute bottom-6 left-6 z-10">
          <Joystick onInput={setJoystickInput} />
        </div>
      )}

      {/* Mobile controls toggle hint */}
      {mobile && !selectedBuilding && !selectedAstronaut && (
        <div className="absolute bottom-8 right-6 z-10 hud-pastel rounded-xl px-3 py-2">
          <div className="text-xs text-charcoal-100 text-center">
            <div className="text-sage-300 font-display text-[10px] tracking-wide mb-0.5">CONTROLS</div>
            <div>Joystick to move</div>
            <div>Drag to rotate</div>
            <div>Tap to inspect</div>
          </div>
        </div>
      )}

      {/* Building info panel */}
      {selectedBuilding && (
        <BuildingInfoPanel
          building={selectedBuilding}
          isBuilt={selectedBuilding.buildingKey === null || (selectedBuilding.buildingKey ? state.buildings[selectedBuilding.buildingKey] : false)}
          onClose={() => setSelectedBuildingId(null)}
          onEnter={() => setShowInterior(true)}
        />
      )}

      {/* Astronaut info panel */}
      {selectedAstronaut && (
        <AstronautInfoPanel
          astronaut={selectedAstronaut}
          crewMember={state.crew.find((c) => c.id === selectedAstronaut.id)}
          onClose={() => setSelectedAstronautId(null)}
        />
      )}

      {/* Interior placeholder */}
      {showInterior && selectedBuilding && (
        <InteriorPlaceholder
          building={selectedBuilding}
          onExit={() => setShowInterior(false)}
        />
      )}
    </div>
  );
}

// ---- Building info panel ----

function BuildingInfoPanel({
  building,
  isBuilt,
  onClose,
  onEnter,
}: {
  building: ColonyBuilding;
  isBuilt: boolean;
  onClose: () => void;
  onEnter: () => void;
}) {
  const Icon = buildingIcons[building.shape] || Info;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 panel-pastel-strong rounded-t-2xl animate-slide-up max-h-[60vh] overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sage-700/40 border border-sage-600/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-sage-300" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-sage-100">{building.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-display tracking-wide ${
                  isBuilt
                    ? 'bg-sage-600/30 text-sage-300'
                    : 'bg-peach-600/20 text-peach-300'
                }`}>
                  {isBuilt ? 'OPERATIONAL' : 'NOT BUILT'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-charcoal-600/50 hover:bg-charcoal-500/50 text-charcoal-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-ivory-200 leading-relaxed mb-3">
          {building.description}
        </p>

        {/* Purpose */}
        <div className="rounded-xl bg-charcoal-700/40 p-3 mb-3">
          <div className="text-[10px] font-display tracking-widest text-sage-400 uppercase mb-1">Purpose</div>
          <p className="text-xs text-ivory-200">{building.purpose}</p>
        </div>

        {/* Status */}
        <div className="rounded-xl bg-charcoal-700/40 p-3 mb-3">
          <div className="text-[10px] font-display tracking-widest text-sage-400 uppercase mb-1">Status</div>
          <p className="text-xs text-ivory-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
            {building.status}
          </p>
        </div>

        {/* NASA Fact */}
        <div className="rounded-xl bg-lavender-700/20 border border-lavender-600/20 p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-lavender-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ivory-200 leading-relaxed">
              <span className="text-lavender-300 font-semibold">NASA Fact: </span>
              {building.nasaFact}
            </p>
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="btn-pastel w-full py-3.5 rounded-xl font-display font-medium tracking-wide flex items-center justify-center gap-2"
        >
          <DoorOpen className="w-5 h-5" />
          Enter Building
        </button>
      </div>
    </div>
  );
}

// ---- Astronaut info panel ----

function AstronautInfoPanel({
  astronaut,
  crewMember,
  onClose,
}: {
  astronaut: SceneAstronaut;
  crewMember?: GameState['crew'][number];
  onClose: () => void;
}) {
  const ActivityIcon = activityIcons[astronaut.activityType] || Compass;
  const isAlive = crewMember?.alive ?? true;
  const health = crewMember?.health ?? 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 panel-pastel-strong rounded-t-2xl animate-slide-up">
      <div className="max-w-2xl mx-auto p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center text-ivory-50 font-display font-bold">
              {astronaut.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-sage-100">{astronaut.name}</h2>
              <p className="text-xs text-ivory-300">{astronaut.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-charcoal-600/50 hover:bg-charcoal-500/50 text-charcoal-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity */}
        <div className="rounded-xl bg-charcoal-700/40 p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <ActivityIcon className="w-4 h-4 text-sage-300" />
            <div className="text-[10px] font-display tracking-widest text-sage-400 uppercase">Current Activity</div>
          </div>
          <p className="text-sm text-ivory-200">{astronaut.activity}</p>
        </div>

        {/* Status */}
        <div className="rounded-xl bg-charcoal-700/40 p-3 mb-3">
          <div className="text-[10px] font-display tracking-widest text-sage-400 uppercase mb-1">Status</div>
          <p className="text-xs text-ivory-200 flex items-center gap-2">
            {isAlive ? (
              <>
                <span className={`w-2 h-2 rounded-full ${health > 60 ? 'bg-sage-400' : health > 30 ? 'bg-peach-400' : 'bg-danger-500'} animate-pulse`} />
                {astronaut.status}
              </>
            ) : (
              <>
                <Skull className="w-3 h-3 text-danger-400" />
                <span className="text-danger-400">Deceased</span>
              </>
            )}
          </p>
        </div>

        {/* Health bar */}
        {isAlive && (
          <div className="rounded-xl bg-charcoal-700/40 p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-display tracking-widest text-sage-400 uppercase">Health</div>
              <span className={`text-sm font-mono font-bold ${
                health > 60 ? 'text-sage-300' : health > 30 ? 'text-peach-300' : 'text-danger-400'
              }`}>
                {health}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-charcoal-600 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  health > 60 ? 'bg-sage-500' : health > 30 ? 'bg-peach-400' : 'bg-danger-500'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
        )}

        {/* NASA-style fact about astronauts */}
        <div className="rounded-xl bg-lavender-700/20 border border-lavender-600/20 p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-lavender-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ivory-200 leading-relaxed">
              <span className="text-lavender-300 font-semibold">Did you know? </span>
              Astronauts on spacewalks (EVAs) wear pressurized spacesuits that take about 4 hours to put on!
              The suit protects them from extreme temperatures, radiation, and the vacuum of space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Interior placeholder ----

function InteriorPlaceholder({
  building,
  onExit,
}: {
  building: ColonyBuilding;
  onExit: () => void;
}) {
  const Icon = buildingIcons[building.shape] || Info;

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-charcoal-900/95 backdrop-blur-md animate-fade-in px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-sage-700/30 border border-sage-600/30 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <Icon className="w-10 h-10 text-sage-300" />
        </div>
        <h2 className="text-2xl font-display font-bold text-sage-100 mb-3">
          {building.name}
        </h2>
        <p className="text-sm text-ivory-300 leading-relaxed mb-2">
          You step inside the {building.name.toLowerCase()}.
        </p>
        <p className="text-xs text-charcoal-100 leading-relaxed mb-8">
          Interior exploration will be available in Stage 2 of PROJECT SHUNYA.
          For now, you can view the building's status and information from outside.
        </p>
        <button
          onClick={onExit}
          className="btn-pastel px-6 py-3 rounded-xl font-display font-medium tracking-wide inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit to Surface
        </button>
      </div>
    </div>
  );
}
