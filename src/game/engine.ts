// PROJECT SHUNYA — Game Engine

import type {
  BuildingKey,
  CrewMember,
  DayLog,
  GameEvent,
  GameState,
  Resources,
} from './types';
import {
  BUILDINGS,
  CREW_NAMES,
  DAILY_CONSUMPTION_PER_CREW,
  EVENT_POOL,
  INITIAL_RESOURCES,
  INITIAL_CREW_SIZE,
  MAX_DAYS,
  MAX_RESOURCES,
} from './data';

export function createInitialState(): GameState {
  return {
    screen: 'landing',
    day: 1,
    maxDays: MAX_DAYS,
    resources: { ...INITIAL_RESOURCES },
    maxResources: { ...MAX_RESOURCES },
    buildings: {
      habitat: false,
      solarPanels: false,
      hydroponicFarm: false,
      waterRecycler: false,
      radiationShelter: false,
    },
    crew: CREW_NAMES.map((c) => ({ ...c })),
    pendingEvent: null,
    dayLog: [],
    gameOver: false,
    victory: false,
    score: 0,
    eventHistory: [],
    decisionsMade: 0,
    buildingsBuilt: 0,
  };
}

function clampResources(r: Resources, max: Resources): Resources {
  return {
    oxygen: Math.max(0, Math.min(max.oxygen, Math.round(r.oxygen))),
    water: Math.max(0, Math.min(max.water, Math.round(r.water))),
    food: Math.max(0, Math.min(max.food, Math.round(r.food))),
    electricity: Math.max(0, Math.min(max.electricity, Math.round(r.electricity))),
  };
}

export function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  for (const key of Object.keys(cost) as (keyof Resources)[]) {
    if (resources[key] < (cost[key] ?? 0)) return false;
  }
  return true;
}

function getAliveCrew(crew: CrewMember[]): CrewMember[] {
  return crew.filter((c) => c.alive);
}

/** Calculate daily production from buildings */
function getDailyProduction(buildings: GameState['buildings']): Resources {
  const prod: Resources = { oxygen: 0, water: 0, food: 0, electricity: 0 };
  for (const def of BUILDINGS) {
    if (!buildings[def.key]) continue;
    const b = def.benefits;
    if (b.oxygenProd) prod.oxygen += b.oxygenProd;
    if (b.waterProd) prod.water += b.waterProd;
    if (b.foodProd) prod.food += b.foodProd;
    if (b.electricityProd) prod.electricity += b.electricityProd;
  }
  return prod;
}

/** Calculate daily consumption based on alive crew */
function getDailyConsumption(crew: CrewMember[]): Resources {
  const alive = getAliveCrew(crew).length;
  return {
    oxygen: DAILY_CONSUMPTION_PER_CREW.oxygen * alive,
    water: DAILY_CONSUMPTION_PER_CREW.water * alive,
    food: DAILY_CONSUMPTION_PER_CREW.food * alive,
    electricity: DAILY_CONSUMPTION_PER_CREW.electricity * alive,
  };
}

/** Get crew health bonus from buildings */
function getHealthBonus(buildings: GameState['buildings']): number {
  let bonus = 0;
  for (const def of BUILDINGS) {
    if (!buildings[def.key]) continue;
    if (def.benefits.crewHealthBonus) bonus += def.benefits.crewHealthBonus;
  }
  return bonus;
}

/** Pick a random event from the pool that hasn't been used yet */
export function pickRandomEvent(
  day: number,
  usedEventIds: Set<string>
): GameEvent | null {
  const available = EVENT_POOL.filter((e) => !usedEventIds.has(e.id));
  if (available.length === 0) return null;
  const event = available[Math.floor(Math.random() * available.length)];
  return { ...event, day };
}

/** Check if any resource has hit zero → crew damage */
function checkResourceStarvation(state: GameState): { damage: number; reasons: string[] } {
  let damage = 0;
  const reasons: string[] = [];
  const r = state.resources;

  if (r.oxygen <= 0) {
    damage += 25;
    reasons.push('Oxygen depleted — crew is suffocating!');
  }
  if (r.water <= 0) {
    damage += 15;
    reasons.push('Water ran out — crew is dehydrated!');
  }
  if (r.food <= 0) {
    damage += 12;
    reasons.push('Food ran out — crew is starving!');
  }
  if (r.electricity <= 0) {
    damage += 10;
    reasons.push('No electricity — life support is failing!');
  }

  return { damage, reasons };
}

/** Apply crew damage, handle deaths */
function applyCrewDamage(crew: CrewMember[], damage: number): { crew: CrewMember[]; deaths: CrewMember[] } {
  if (damage <= 0) return { crew, deaths: [] };
  const newCrew = crew.map((c) => ({ ...c }));
  const alive = newCrew.filter((c) => c.alive);
  const deaths: CrewMember[] = [];

  // Distribute damage evenly
  const perCrew = Math.ceil(damage / alive.length);
  for (const c of alive) {
    c.health = Math.max(0, c.health - perCrew);
    if (c.health <= 0) {
      c.alive = false;
      deaths.push(c);
    }
  }
  return { crew: newCrew, deaths };
}

/** Calculate final score */
export function calculateScore(state: GameState): number {
  let score = 0;

  // Base survival score
  score += state.day * 50;

  // Crew health bonus
  const aliveCrew = getAliveCrew(state.crew);
  score += aliveCrew.reduce((sum, c) => sum + c.health, 0) * 2;

  // Buildings built
  score += state.buildingsBuilt * 100;

  // Decisions made
  score += state.decisionsMade * 25;

  // Resource efficiency
  const r = state.resources;
  score += Math.floor((r.oxygen + r.water + r.food + r.electricity) / 4);

  // Victory bonus
  if (state.victory) {
    score += 500;
    const aliveCount = aliveCrew.length;
    score += aliveCount * 200;
  }

  return Math.max(0, score);
}

/** Get the rank title based on score */
export function getScoreRank(score: number): { title: string; color: string } {
  if (score >= 3000) return { title: 'Legendary Commander', color: 'text-cyber-cyan-bright' };
  if (score >= 2000) return { title: 'Elite Commander', color: 'text-cyber-cyan' };
  if (score >= 1200) return { title: 'Skilled Commander', color: 'text-cyber-blue-bright' };
  if (score >= 600) return { title: 'Rookie Commander', color: 'text-lunar-300' };
  return { title: 'Trainee Commander', color: 'text-lunar-400' };
}

export type GameAction =
  | { type: 'SET_SCREEN'; screen: GameState['screen'] }
  | { type: 'START_GAME' }
  | { type: 'BUILD'; building: BuildingKey }
  | { type: 'ADVANCE_DAY' }
  | { type: 'RESOLVE_EVENT'; choiceIndex: number }
  | { type: 'RESET_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'START_GAME':
      return {
        ...createInitialState(),
        screen: 'briefing',
      };

    case 'BUILD': {
      const def = BUILDINGS.find((b) => b.key === action.building);
      if (!def) return state;
      if (state.buildings[action.building]) return state;
      if (!canAfford(state.resources, def.cost)) return state;
      if (state.gameOver) return state;

      const newResources = { ...state.resources };
      for (const key of Object.keys(def.cost) as (keyof Resources)[]) {
        newResources[key] -= def.cost[key] ?? 0;
      }
      return {
        ...state,
        resources: clampResources(newResources, state.maxResources),
        buildings: { ...state.buildings, [action.building]: true },
        buildingsBuilt: state.buildingsBuilt + 1,
      };
    }

    case 'ADVANCE_DAY': {
      if (state.gameOver) return state;
      if (state.pendingEvent) return state; // Must resolve event first

      const aliveCrew = getAliveCrew(state.crew);
      if (aliveCrew.length === 0) {
        return {
          ...state,
          gameOver: true,
          victory: false,
          score: calculateScore({ ...state, gameOver: true, victory: false }),
          screen: 'report',
        };
      }

      // Calculate daily changes
      const production = getDailyProduction(state.buildings);
      const consumption = getDailyConsumption(state.crew);
      const healthBonus = getHealthBonus(state.buildings);

      const newResources: Resources = {
        oxygen: state.resources.oxygen + production.oxygen - consumption.oxygen,
        water: state.resources.water + production.water - consumption.water,
        food: state.resources.food + production.food - consumption.food,
        electricity: state.resources.electricity + production.electricity - consumption.electricity,
      };

      const clampedResources = clampResources(newResources, state.maxResources);

      // Update crew health — bonus for good conditions, starvation damage
      const updatedCrew = state.crew.map((c) => {
        if (!c.alive) return c;
        let h = c.health + healthBonus;
        // If resources are healthy, small natural recovery
        if (clampedResources.oxygen > 20 && clampedResources.water > 20 && clampedResources.food > 20) {
          h += 2;
        }
        return { ...c, health: Math.min(100, Math.round(h)) };
      });

      const interimState: GameState = {
        ...state,
        resources: clampedResources,
        crew: updatedCrew,
      };

      // Check starvation
      const starvation = checkResourceStarvation(interimState);
      let crewAfterDamage = interimState.crew;
      const eventMessages: string[] = [];
      let summaryParts: string[] = [];

      const resourceChanges: Resources = {
        oxygen: clampedResources.oxygen - state.resources.oxygen,
        water: clampedResources.water - state.resources.water,
        food: clampedResources.food - state.resources.food,
        electricity: clampedResources.electricity - state.resources.electricity,
      };

      if (starvation.damage > 0) {
        const result = applyCrewDamage(interimState.crew, starvation.damage);
        crewAfterDamage = result.crew;
        starvation.reasons.forEach((r) => {
          eventMessages.push(r);
          summaryParts.push(r);
        });
        if (result.deaths.length > 0) {
          result.deaths.forEach((d) => {
            eventMessages.push(`${d.name} has died.`);
            summaryParts.push(`Lost: ${d.name}`);
          });
        }
      }

      // Check if crew is all dead
      if (getAliveCrew(crewAfterDamage).length === 0) {
        const finalState = {
          ...interimState,
          crew: crewAfterDamage,
          day: state.day,
          gameOver: true,
          victory: false,
          score: 0,
          screen: 'report' as const,
        };
        return {
          ...finalState,
          score: calculateScore(finalState),
        };
      }

      // Check if this is the last day
      const nextDay = state.day + 1;
      if (nextDay > state.maxDays) {
        // Mission complete!
        const finalState = {
          ...interimState,
          crew: crewAfterDamage,
          gameOver: true,
          victory: true,
          score: 0,
          screen: 'report' as const,
        };
        return {
          ...finalState,
          score: calculateScore(finalState),
        };
      }

      // Pick a random event (about 55% chance per day)
      const usedIds = new Set(state.eventHistory.map((e) => {
        const ev = EVENT_POOL.find((p) => p.title === e.title);
        return ev?.id ?? '';
      }));
      let event = null;
      if (Math.random() < 0.55) {
        event = pickRandomEvent(nextDay, usedIds);
      }

      const dayLog: DayLog = {
        day: state.day,
        summary: summaryParts.length > 0 ? summaryParts.join(' ') : 'Day completed successfully.',
        resourceChanges,
        events: eventMessages,
      };

      return {
        ...interimState,
        crew: crewAfterDamage,
        day: nextDay,
        pendingEvent: event,
        dayLog: [...state.dayLog, dayLog],
      };
    }

    case 'RESOLVE_EVENT': {
      if (!state.pendingEvent) return state;
      const event = state.pendingEvent;
      const choice = event.choices[action.choiceIndex];
      if (!choice) return state;

      const newResources = { ...state.resources };
      const eff = choice.effects;
      if (eff.oxygen) newResources.oxygen += eff.oxygen;
      if (eff.water) newResources.water += eff.water;
      if (eff.food) newResources.food += eff.food;
      if (eff.electricity) newResources.electricity += eff.electricity;

      const clampedResources = clampResources(newResources, state.maxResources);

      // Apply crew health effects
      let newCrew = state.crew.map((c) => ({ ...c }));
      if (eff.crewHealth) {
        const alive = newCrew.filter((c) => c.alive);
        const perCrew = eff.crewHealth / alive.length;
        for (const c of alive) {
          c.health = Math.max(0, Math.min(100, Math.round(c.health + perCrew)));
          if (c.health <= 0) c.alive = false;
        }
      }

      // Check deaths from event
      const deaths = newCrew.filter((c) => !c.alive && state.crew.find((sc) => sc.id === c.id)?.alive);

      const eventEntry = {
        day: event.day,
        title: event.title,
        choice: choice.label,
        outcome: choice.outcomeText,
      };

      // Update last day log with event
      const updatedLog = [...state.dayLog];
      if (updatedLog.length > 0) {
        const lastLog = { ...updatedLog[updatedLog.length - 1] };
        lastLog.events = [...lastLog.events, `Event: ${event.title} — ${choice.outcomeText}`];
        updatedLog[updatedLog.length - 1] = lastLog;
      }

      const newState: GameState = {
        ...state,
        resources: clampedResources,
        crew: newCrew,
        pendingEvent: null,
        eventHistory: [...state.eventHistory, eventEntry],
        decisionsMade: state.decisionsMade + 1,
        dayLog: updatedLog,
      };

      // Check if all crew died from event
      if (getAliveCrew(newCrew).length === 0) {
        return {
          ...newState,
          gameOver: true,
          victory: false,
          score: calculateScore({ ...newState, gameOver: true, victory: false }),
          screen: 'report',
        };
      }

      return newState;
    }

    case 'RESET_GAME':
      return { ...createInitialState(), screen: 'landing' };

    default:
      return state;
  }
}
