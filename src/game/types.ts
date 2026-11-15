// PROJECT SHUNYA — Game Types

export type Screen = 'landing' | 'briefing' | 'game' | 'explore' | 'report';

export type ResourceKey = 'oxygen' | 'water' | 'food' | 'electricity';

export type Resources = {
  oxygen: number;
  water: number;
  food: number;
  electricity: number;
};

export type BuildingKey =
  | 'habitat'
  | 'solarPanels'
  | 'hydroponicFarm'
  | 'waterRecycler'
  | 'radiationShelter';

export type Buildings = Record<BuildingKey, boolean>;

export interface CrewMember {
  id: number;
  name: string;
  role: string;
  health: number; // 0–100
  alive: boolean;
}

export type EventSeverity = 'info' | 'warning' | 'danger';

export interface GameEvent {
  id: string;
  day: number;
  title: string;
  description: string;
  nasaFact?: string;
  severity: EventSeverity;
  icon: string; // lucide icon name
  choices: EventChoice[];
}

export interface EventChoice {
  label: string;
  description: string;
  effects: Partial<Resources> & { crewHealth?: number; specificCrewHealth?: number[] };
  outcomeText: string;
  isRecommended?: boolean;
}

export interface BuildingDef {
  key: BuildingKey;
  name: string;
  icon: string;
  description: string;
  nasaFact: string;
  cost: Partial<Resources>;
  benefits: {
    oxygenProd?: number;
    waterProd?: number;
    foodProd?: number;
    electricityProd?: number;
    oxygenConsume?: number; // negative = saves
    radiationProtection?: boolean;
    crewHealthBonus?: number;
  };
}

export interface DayLog {
  day: number;
  summary: string;
  resourceChanges: Resources;
  events: string[];
}

export interface GameState {
  screen: Screen;
  day: number;
  maxDays: number;
  resources: Resources;
  maxResources: Resources;
  buildings: Buildings;
  crew: CrewMember[];
  pendingEvent: GameEvent | null;
  dayLog: DayLog[];
  gameOver: boolean;
  victory: boolean;
  score: number;
  eventHistory: { day: number; title: string; choice: string; outcome: string }[];
  decisionsMade: number;
  buildingsBuilt: number;
}
