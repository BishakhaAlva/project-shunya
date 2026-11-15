// PROJECT SHUNYA — 3D Colony Data

import type { BuildingKey } from './types';

export interface ColonyBuilding {
  id: string;
  name: string;
  buildingKey: BuildingKey | null;
  position: [number, number, number];
  rotation: number;
  description: string;
  purpose: string;
  nasaFact: string;
  status: string;
  shape: 'habitat' | 'lab' | 'greenhouse' | 'power' | 'airlock' | 'solar' | 'antenna' | 'rover' | 'landing' | 'instrument';
  radius: number; // collision radius
}

export const COLONY_BUILDINGS: ColonyBuilding[] = [
  {
    id: 'habitat',
    name: 'Crew Habitat',
    buildingKey: 'habitat',
    position: [0, 0, 0],
    rotation: 0,
    description: 'Pressurized living quarters for all four astronauts. Contains sleeping bunks, a galley, and life support systems.',
    purpose: 'Primary living space and life support hub for the crew.',
    nasaFact: 'NASA is testing inflatable habitats that pack small for launch and expand on the Moon. The key challenge is blocking space radiation with thick walls.',
    status: 'Operational — all systems nominal',
    shape: 'habitat',
    radius: 4,
  },
  {
    id: 'lab',
    name: 'Science Laboratory',
    buildingKey: null,
    position: [-7, 0, 2],
    rotation: 0.3,
    description: 'A dedicated research module where crew analyze lunar soil samples, grow experiments, and monitor space weather.',
    purpose: 'Scientific research and sample analysis.',
    nasaFact: 'Apollo astronauts brought back 382 kg of Moon rocks! Scientists still study them today to learn about the Moon\'s formation.',
    status: 'Operational — experiments running',
    shape: 'lab',
    radius: 3.5,
  },
  {
    id: 'greenhouse',
    name: 'Hydroponic Greenhouse',
    buildingKey: 'hydroponicFarm',
    position: [7, 0, 2],
    rotation: -0.3,
    description: 'A transparent domed module where plants grow without soil, using nutrient-rich water. Produces food and oxygen.',
    purpose: 'Food production and oxygen generation through hydroponics.',
    nasaFact: 'NASA has grown lettuce, radishes, and chili peppers on the International Space Station! Hydroponics uses 90% less water than soil farming.',
    status: 'Operational — crops growing',
    shape: 'greenhouse',
    radius: 3.5,
  },
  {
    id: 'power',
    name: 'Power & Engineering Module',
    buildingKey: null,
    position: [0, 0, -7],
    rotation: 0,
    description: 'Houses the main power distribution, water recycling systems, and engineering workbench for repairs.',
    purpose: 'Power distribution, water recycling, and equipment maintenance.',
    nasaFact: 'On the ISS, about 93% of water is recycled through a system called ECLSS — Environmental Control and Life Support System.',
    status: 'Operational — power stable',
    shape: 'power',
    radius: 3.5,
  },
  {
    id: 'airlock',
    name: 'Airlock Module',
    buildingKey: null,
    position: [-4, 0, -4],
    rotation: 0.5,
    description: 'The transition chamber where astronauts put on suits and depressurize before stepping onto the lunar surface.',
    purpose: 'Safe entry and exit between the habitat and the lunar surface.',
    nasaFact: 'Airlocks prevent precious oxygen from escaping when astronauts go outside. The ISS airlock can be depressurized in about 30 minutes.',
    status: 'Operational — ready for EVA',
    shape: 'airlock',
    radius: 2.5,
  },
  {
    id: 'solar',
    name: 'Solar Panel Array',
    buildingKey: 'solarPanels',
    position: [9, 0, -4],
    rotation: -0.2,
    description: 'Tall vertical solar panels that track the Sun to generate electricity. The Moon gets 14 days of sunlight per cycle!',
    purpose: 'Primary electricity generation from solar energy.',
    nasaFact: 'NASA is designing vertical solar panels for the Moon that can rotate to face the Sun and survive the extreme temperature swings.',
    status: 'Operational — generating power',
    shape: 'solar',
    radius: 4,
  },
  {
    id: 'antenna',
    name: 'Communication Antenna',
    buildingKey: null,
    position: [-9, 0, -4],
    rotation: 0.2,
    description: 'A tall dish antenna that maintains communication with Mission Control on Earth.',
    purpose: 'Communication relay with Earth and data transmission.',
    nasaFact: 'Communicating from the Moon to Earth takes about 1.28 seconds each way due to the speed of light. That delay is real and unavoidable!',
    status: 'Operational — signal strong',
    shape: 'antenna',
    radius: 2.5,
  },
  {
    id: 'rover',
    name: 'Lunar Rover',
    buildingKey: null,
    position: [5, 0, 7],
    rotation: 1.2,
    description: 'A pressurized rover for exploring the lunar surface beyond walking distance. Equipped with sample collection tools.',
    purpose: 'Surface exploration and sample collection.',
    nasaFact: 'The Apollo Lunar Roving Vehicle could travel up to 18 km/h! NASA is developing new pressurized rovers for multi-week expeditions.',
    status: 'Parked — ready for deployment',
    shape: 'rover',
    radius: 3,
  },
  {
    id: 'landing',
    name: 'Landing Pad',
    buildingKey: null,
    position: [0, 0, 10],
    rotation: 0,
    description: 'A flat, reinforced zone where the lunar lander touched down. Used for cargo delivery and emergency evacuation.',
    purpose: 'Spacecraft landing and cargo offloading zone.',
    nasaFact: 'Lunar dust kicked up by rocket exhaust is a major concern. NASA studies how to build landing pads that contain the dust blast.',
    status: 'Clear — ready for landing',
    shape: 'landing',
    radius: 5,
  },
  {
    id: 'instrument-1',
    name: 'Seismometer Station',
    buildingKey: null,
    position: [-6, 0, 7],
    rotation: 0,
    description: 'A ground-based instrument that measures moonquakes and meteoroid impacts, sending data back to the lab.',
    purpose: 'Geological monitoring and seismic data collection.',
    nasaFact: 'Apollo astronauts left seismometers on the Moon that detected over 12,000 moonquakes! The Moon is geologically mostly inactive.',
    status: 'Recording — data streaming',
    shape: 'instrument',
    radius: 1.5,
  },
  {
    id: 'instrument-2',
    name: 'Solar Radiation Monitor',
    buildingKey: null,
    position: [6, 0, -8],
    rotation: 0,
    description: 'An external sensor that measures incoming solar radiation and alerts the crew to dangerous solar storms.',
    purpose: 'Space weather monitoring and crew safety alerts.',
    nasaFact: 'Solar particle events can deliver dangerous radiation doses. NASA monitors space weather constantly to keep astronauts safe.',
    status: 'Monitoring — levels normal',
    shape: 'instrument',
    radius: 1.5,
  },
];

export interface SceneAstronaut {
  id: number;
  name: string;
  role: string;
  activity: string;
  status: string;
  position: [number, number, number];
  activityType: 'repair' | 'inspect' | 'sample' | 'walk' | 'rover';
}

export const SCENE_ASTRONAUTS: SceneAstronaut[] = [
  {
    id: 1,
    name: 'Commander Rex',
    role: 'Mission Commander',
    activity: 'Inspecting the crew habitat exterior',
    status: 'Healthy — performing routine check',
    position: [3, 0, -2],
    activityType: 'inspect',
  },
  {
    id: 2,
    name: 'Dr. Luna',
    role: 'Chief Scientist',
    activity: 'Collecting lunar soil samples near the seismometer',
    status: 'Healthy — sample collection in progress',
    position: [-5, 0, 6],
    activityType: 'sample',
  },
  {
    id: 3,
    name: 'Engineer Kai',
    role: 'Systems Engineer',
    activity: 'Repairing a solar panel connection',
    status: 'Healthy — maintenance task',
    position: [8, 0, -3],
    activityType: 'repair',
  },
  {
    id: 4,
    name: 'Pilot Vega',
    role: 'Lander Pilot',
    activity: 'Walking from the airlock to the rover',
    status: 'Healthy — en route to rover',
    position: [-3, 0, -3],
    activityType: 'walk',
  },
];

// Collision boxes derived from buildings (simple circle collision)
export function getCollisionCircle(target: { x: number; z: number }, buildings: ColonyBuilding[]): boolean {
  for (const b of buildings) {
    const dx = target.x - b.position[0];
    const dz = target.z - b.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < b.radius + 1) return true;
  }
  return false;
}
