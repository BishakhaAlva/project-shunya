// PROJECT SHUNYA — Game Data & Configuration

import type { BuildingDef, CrewMember, GameEvent, Resources } from './types';

export const MAX_DAYS = 15;
export const INITIAL_CREW_SIZE = 4;

export const INITIAL_RESOURCES: Resources = {
  oxygen: 100,
  water: 100,
  food: 100,
  electricity: 100,
};

export const MAX_RESOURCES: Resources = {
  oxygen: 200,
  water: 200,
  food: 200,
  electricity: 200,
};

// Daily consumption per crew member
export const DAILY_CONSUMPTION_PER_CREW = {
  oxygen: 4,
  water: 5,
  food: 4,
  electricity: 3,
};

export const CREW_NAMES: CrewMember[] = [
  { id: 1, name: 'Commander Rex', role: 'Mission Commander', health: 100, alive: true },
  { id: 2, name: 'Dr. Luna', role: 'Chief Scientist', health: 100, alive: true },
  { id: 3, name: 'Engineer Kai', role: 'Systems Engineer', health: 100, alive: true },
  { id: 4, name: 'Pilot Vega', role: 'Lander Pilot', health: 100, alive: true },
];

export const BUILDINGS: BuildingDef[] = [
  {
    key: 'habitat',
    name: 'Lunar Habitat',
    icon: 'Home',
    description: 'Pressurized living quarters that keep your crew safe and warm on the Moon.',
    nasaFact:
      'NASA fact: A real lunar habitat will need thick walls to block space radiation. NASA is testing inflatable habitats that can pack small for the trip and expand on the Moon!',
    cost: { electricity: 20, oxygen: 10, water: 10 },
    benefits: {
      crewHealthBonus: 3,
      radiationProtection: false,
    },
  },
  {
    key: 'solarPanels',
    name: 'Solar Panel Array',
    icon: 'Sun',
    description: 'Captures sunlight to generate electricity. The Moon has 14 days of sunlight per cycle!',
    nasaFact:
      'NASA fact: Solar panels work great on the Moon because there is no atmosphere to block the sunlight. NASA is designing vertical solar panels that can rotate to face the Sun.',
    cost: { electricity: 10 },
    benefits: {
      electricityProd: 18,
    },
  },
  {
    key: 'hydroponicFarm',
    name: 'Hydroponic Farm',
    icon: 'Sprout',
    description: 'Grows plants without soil, using nutrient-rich water. Produces fresh food and oxygen!',
    nasaFact:
      'NASA fact: NASA has already grown lettuce and radishes on the International Space Station! Hydroponics uses 90% less water than farming in soil.',
    cost: { electricity: 15, water: 15, oxygen: 5 },
    benefits: {
      foodProd: 12,
      oxygenProd: 6,
    },
  },
  {
    key: 'waterRecycler',
    name: 'Water Recycling System',
    icon: 'Droplets',
    description: 'Cleans and reuses water from sweat, breath, and waste. Every drop counts in space!',
    nasaFact:
      'NASA fact: On the International Space Station, about 93% of water is recycled. That is cleaner than most water on Earth! NASA calls this "environmental control and life support."',
    cost: { electricity: 12, water: 8 },
    benefits: {
      waterProd: 14,
    },
  },
  {
    key: 'radiationShelter',
    name: 'Radiation Shelter',
    icon: 'Shield',
    description: 'A thick-walled safe room that protects your crew from dangerous solar radiation storms.',
    nasaFact:
      'NASA fact: The Moon has no atmosphere to block radiation, so astronauts need shielding. NASA studies suggest burying habitats under lunar soil (regolith) for protection.',
    cost: { electricity: 18, oxygen: 8, water: 5 },
    benefits: {
      radiationProtection: true,
      crewHealthBonus: 1,
    },
  },
];

// Random events pool — each can fire once per game
export const EVENT_POOL: GameEvent[] = [
  {
    id: 'solar-storm-1',
    day: 0,
    title: 'Solar Radiation Storm!',
    description:
      'A powerful burst of radiation from the Sun is heading toward the Moon! Your crew must take shelter immediately.',
    nasaFact:
      'NASA fact: Solar storms are real! The Sun sometimes releases huge bursts of energy and radiation. NASA monitors space weather to protect astronauts.',
    severity: 'danger',
    icon: 'Sun',
    choices: [
      {
        label: 'Shelter in place',
        description: 'Everyone hides in the safest room and powers down non-essential systems.',
        effects: { electricity: -10, crewHealth: -8 },
        outcomeText: 'The crew rides out the storm safely inside. Equipment takes a minor hit.',
        isRecommended: true,
      },
      {
        label: 'Continue operations',
        description: 'Keep working through the storm to save power.',
        effects: { electricity: -5, crewHealth: -20 },
        outcomeText: 'The crew is exposed to dangerous radiation. Several members feel very sick.',
      },
    ],
  },
  {
    id: 'meteoroid-strike',
    day: 0,
    title: 'Meteoroid Impact!',
    description:
      'A small meteoroid has struck the outpost! There is a crack in one of the storage modules.',
    nasaFact:
      'NASA fact: The Moon is covered in craters from meteoroid impacts. With no atmosphere to burn up rocks, even small meteoroids can hit the surface.',
    severity: 'danger',
    icon: 'Zap',
    choices: [
      {
        label: 'Emergency repair',
        description: 'Use stored resources to patch the crack quickly.',
        effects: { oxygen: -12, water: -8, electricity: -5 },
        outcomeText: 'The repair team seals the crack. You lose some stored resources but the crew is safe.',
        isRecommended: true,
      },
      {
        label: 'Triage — save oxygen only',
        description: 'Focus on patching the oxygen leak, let water vent.',
        effects: { oxygen: -5, water: -15, electricity: -3 },
        outcomeText: 'You stop the oxygen leak but lose a lot of water from the damaged tank.',
      },
    ],
  },
  {
    id: 'equipment-failure',
    day: 0,
    title: 'Oxygen Generator Failure',
    description:
      'The main oxygen recycler has stopped working! The repair will require power and parts.',
    nasaFact:
      'NASA fact: On the ISS, oxygen is generated by splitting water into hydrogen and oxygen using electricity. If the system breaks, astronauts rely on backup oxygen tanks.',
    severity: 'warning',
    icon: 'Wrench',
    choices: [
      {
        label: 'Full system restart',
        description: 'Divert power to reboot the generator completely.',
        effects: { electricity: -15, oxygen: -3 },
        outcomeText: 'The generator hums back to life! It cost extra power but oxygen is flowing again.',
        isRecommended: true,
      },
      {
        label: 'Use backup tanks',
        description: 'Rely on emergency oxygen reserves while running minimal repairs.',
        effects: { oxygen: -18, electricity: -5 },
        outcomeText: 'You tap into emergency oxygen. The reserves are draining faster than expected.',
      },
    ],
  },
  {
    id: 'water-ice-discovery',
    day: 0,
    title: 'Ice Deposit Discovered!',
    description:
      'Your rover has found a rich ice deposit in a nearby shadowed crater! This could be a major resource boost.',
    nasaFact:
      'NASA fact: Water ice really exists on the Moon! NASA found ice in permanently shadowed craters near the lunar poles. This could be a key resource for future missions.',
    severity: 'info',
    icon: 'Gem',
    choices: [
      {
        label: 'Mine the ice',
        description: 'Send the crew to extract water from the ice deposit.',
        effects: { water: 25, electricity: -8 },
        outcomeText: 'The mining operation is a success! You extract a large amount of water ice.',
        isRecommended: true,
      },
      {
        label: 'Scan and catalog only',
        description: 'Study the deposit scientifically without mining yet.',
        effects: { water: 5, electricity: -2 },
        outcomeText: 'You collect valuable data and a small sample. The full deposit remains for later.',
      },
    ],
  },
  {
    id: 'crop-blight',
    day: 0,
    title: 'Farm Blight!',
    description:
      'A mysterious plant disease has appeared in the hydroponic farm! Some crops are dying.',
    nasaFact:
      'NASA fact: Growing plants in space is hard! Microbes behave differently in microgravity. NASA studies plant health to prepare for long missions to Mars.',
    severity: 'warning',
    icon: 'Bug',
    choices: [
      {
        label: 'Treat with nutrients',
        description: 'Use extra water and nutrients to fight the blight.',
        effects: { water: -10, food: -5 },
        outcomeText: 'The treatment works! Most crops recover, though you lost some supplies.',
        isRecommended: true,
      },
      {
        label: 'Remove infected plants',
        description: 'Destroy the sick plants to stop the spread.',
        effects: { food: -12 },
        outcomeText: 'You remove the infected crops. The blight is stopped but you lost a lot of food.',
      },
    ],
  },
  {
    id: 'dust-storm',
    day: 0,
    title: 'Lunar Dust Storm',
    description:
      'Charged lunar dust is coating the solar panels and reducing their output. The dust is also irritating the crew.',
    nasaFact:
      'NASA fact: Lunar dust (regolith) is a real problem! It is sharp and clingy because the Moon has no wind or water to wear it smooth. Apollo astronauts said it got everywhere.',
    severity: 'warning',
    icon: 'Wind',
    choices: [
      {
        label: 'Clean the panels',
        description: 'Send a crew member out to brush off the solar panels.',
        effects: { electricity: -5, crewHealth: -5 },
        outcomeText: 'The panels are cleaned and power output returns to normal. One crew member got dusty.',
        isRecommended: true,
      },
      {
        label: 'Ration electricity',
        description: 'Reduce power usage and wait for the dust to settle.',
        effects: { electricity: -12 },
        outcomeText: 'You reduce power consumption. Life support runs on minimal power until the storm passes.',
      },
    ],
  },
  {
    id: 'crew-medical',
    day: 0,
    title: 'Medical Emergency',
    description:
      'One of your crew members has developed a high fever! You need to decide how to handle it.',
    nasaFact:
      'NASA fact: NASA doctors monitor astronaut health from Earth using video calls and sensors. For long missions, crews train in basic medical procedures.',
    severity: 'warning',
    icon: 'HeartPulse',
    choices: [
      {
        label: 'Full medical response',
        description: 'Use all available medical supplies and rest the crew member.',
        effects: { electricity: -5, water: -5, crewHealth: 5 },
        outcomeText: 'The crew member recovers quickly with proper treatment. Everyone feels relieved.',
        isRecommended: true,
      },
      {
        label: 'Light treatment — keep working',
        description: 'Give basic medicine but keep the mission going at full pace.',
        effects: { crewHealth: -10, food: -3 },
        outcomeText: 'The sick crew member pushes through, but their health is getting worse.',
      },
    ],
  },
  {
    id: 'power-surge',
    day: 0,
    title: 'Power Surge!',
    description:
      'A sudden electrical surge has overloaded the power grid! Systems are flickering.',
    nasaFact:
      'NASA fact: Electrical systems in space need careful management. On the ISS, power is distributed across multiple buses so one failure does not knock out everything.',
    severity: 'warning',
    icon: 'Zap',
    choices: [
      {
        label: 'Reset the grid',
        description: 'Shut down and restart all power systems safely.',
        effects: { electricity: -10 },
        outcomeText: 'The grid comes back online after a full reset. Power is stable again.',
        isRecommended: true,
      },
      {
        label: 'Reroute power manually',
        description: 'Try to fix the problem without a full shutdown.',
        effects: { electricity: -6, crewHealth: -3 },
        outcomeText: 'The manual fix works but it is risky. A small spark startles the crew.',
      },
    ],
  },
];
