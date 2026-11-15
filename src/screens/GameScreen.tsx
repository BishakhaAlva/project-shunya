import { useState } from 'react';
import {
  Wind, Droplets, Apple, Zap, Heart,
  Home, Sun, Sprout, Shield,
  ChevronRight, Calendar, AlertTriangle, Skull, CheckCircle2,
  Info, Plus, Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BuildingKey, GameState } from '@/game/types';
import { BUILDINGS, DAILY_CONSUMPTION_PER_CREW } from '@/game/data';
import { canAfford } from '@/game/engine';
import Button from '@/components/Button';
import Panel from '@/components/Panel';
import ResourceBar from '@/components/ResourceBar';
import Starfield from '@/components/Starfield';
import EventModal from '@/components/EventModal';

interface GameScreenProps {
  state: GameState;
  onBuild: (building: BuildingKey) => void;
  onAdvanceDay: () => void;
  onResolveEvent: (choiceIndex: number) => void;
  onExplore: () => void;
}

type Tab = 'resources' | 'build' | 'crew';

const iconMap: Record<string, LucideIcon> = {
  Home, Sun, Sprout, Droplets, Shield,
  Wind, Apple, Zap, Heart,
};

export default function GameScreen({ state, onBuild, onAdvanceDay, onResolveEvent, onExplore }: GameScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('resources');
  const [showLog, setShowLog] = useState(false);

  const aliveCrew = state.crew.filter((c) => c.alive);
  const dayPct = (state.day / state.maxDays) * 100;
  const hasEvent = state.pendingEvent !== null;

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <Starfield density={40} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 animate-fade-in-down">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl panel-glass flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <div className="text-xs text-lunar-400 font-display tracking-wide">LUNAR OUTPOST ALPHA</div>
              <div className="text-lg font-display font-bold text-white">
                Day {state.day}
                <span className="text-lunar-500 text-sm font-normal"> / {state.maxDays}</span>
              </div>
            </div>
          </div>

          {/* Day progress */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-lunar-400 font-display">{Math.round(dayPct)}% Complete</div>
            <div className="w-24 h-2 rounded-full bg-space-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-blue transition-all duration-700"
                style={{ width: `${dayPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Crew health quick view */}
        <Panel className="p-3 mb-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-danger-400" />
              <span className="text-xs font-display font-medium tracking-wide text-lunar-200 uppercase">
                Crew Status
              </span>
            </div>
            <span className="text-xs text-lunar-400">
              {aliveCrew.length}/{state.crew.length} alive
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {state.crew.map((member) => (
              <div key={member.id} className="text-center">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-display font-bold mb-1 ${
                    member.alive
                      ? 'bg-gradient-to-br from-cyber-cyan to-cyber-blue text-white'
                      : 'bg-space-700 text-lunar-500'
                  }`}
                >
                  {member.alive ? member.name.charAt(0) : <Skull className="w-4 h-4" />}
                </div>
                <div className="text-[10px] text-lunar-400 truncate">{member.name.split(' ')[0]}</div>
                {member.alive ? (
                  <div className="h-1.5 rounded-full bg-space-700 overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        member.health > 60 ? 'bg-good-500' : member.health > 30 ? 'bg-warn-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${member.health}%` }}
                    />
                  </div>
                ) : (
                  <div className="text-[10px] text-danger-400 mt-1">KIA</div>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'resources', label: 'Resources', icon: Zap },
            { key: 'build', label: 'Construct', icon: Home },
            { key: 'crew', label: 'Crew', icon: Heart },
          ] as { key: Tab; label: string; icon: LucideIcon }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-display font-medium tracking-wide transition-all duration-300
                ${activeTab === tab.key
                  ? 'bg-cyber-cyan/15 text-cyber-cyan-bright border border-cyber-cyan/30'
                  : 'panel-glass text-lunar-400 hover:text-lunar-200'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'resources' && (
          <div className="space-y-3 animate-fade-in-up">
            <ResourceBar
              icon={Wind}
              label="Oxygen"
              value={state.resources.oxygen}
              max={state.maxResources.oxygen}
              color="cyan"
              unit="L"
            />
            <ResourceBar
              icon={Droplets}
              label="Water"
              value={state.resources.water}
              max={state.maxResources.water}
              color="blue"
              unit="L"
            />
            <ResourceBar
              icon={Apple}
              label="Food"
              value={state.resources.food}
              max={state.maxResources.food}
              color="green"
              unit="kg"
            />
            <ResourceBar
              icon={Zap}
              label="Electricity"
              value={state.resources.electricity}
              max={state.maxResources.electricity}
              color="amber"
              unit="kWh"
            />

            {/* Daily consumption info */}
            <Panel className="p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-lunar-400" />
                <span className="text-xs font-display text-lunar-300">Daily Usage (per crew member)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'O₂', val: DAILY_CONSUMPTION_PER_CREW.oxygen },
                  { label: 'H₂O', val: DAILY_CONSUMPTION_PER_CREW.water },
                  { label: 'Food', val: DAILY_CONSUMPTION_PER_CREW.food },
                  { label: 'Pwr', val: DAILY_CONSUMPTION_PER_CREW.electricity },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-space-700/40 py-1.5">
                    <div className="text-sm font-mono font-bold text-danger-400">-{item.val}</div>
                    <div className="text-[10px] text-lunar-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Production summary */}
            <Panel className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-good-400" />
                <span className="text-xs font-display text-lunar-300">Daily Production (from buildings)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <ProductionCell label="O₂" value={getProd(state, 'oxygen')} />
                <ProductionCell label="H₂O" value={getProd(state, 'water')} />
                <ProductionCell label="Food" value={getProd(state, 'food')} />
                <ProductionCell label="Pwr" value={getProd(state, 'electricity')} />
              </div>
            </Panel>
          </div>
        )}

        {activeTab === 'build' && (
          <div className="space-y-3 animate-fade-in-up">
            {BUILDINGS.map((def) => {
              const built = state.buildings[def.key];
              const affordable = canAfford(state.resources, def.cost);
              const Icon = iconMap[def.icon] ?? Home;

              return (
                <Panel key={def.key} className={`p-4 ${built ? 'border-good-500/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        built
                          ? 'bg-good-500/20 border border-good-500/30'
                          : 'bg-cyber-cyan/10 border border-cyber-cyan/20'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${built ? 'text-good-400' : 'text-cyber-cyan'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-display font-semibold text-white">{def.name}</h3>
                        {built && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-good-500/20 text-good-400 font-display tracking-wide">
                            BUILT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-lunar-400 leading-relaxed mb-2">{def.description}</p>

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {def.benefits.oxygenProd && <BenefitChip icon={Plus} label={`+${def.benefits.oxygenProd} O₂/day`} />}
                        {def.benefits.waterProd && <BenefitChip icon={Plus} label={`+${def.benefits.waterProd} H₂O/day`} />}
                        {def.benefits.foodProd && <BenefitChip icon={Plus} label={`+${def.benefits.foodProd} Food/day`} />}
                        {def.benefits.electricityProd && <BenefitChip icon={Plus} label={`+${def.benefits.electricityProd} Pwr/day`} />}
                        {def.benefits.radiationProtection && <BenefitChip icon={Shield} label="Rad Protection" />}
                        {def.benefits.crewHealthBonus && <BenefitChip icon={Plus} label={`+${def.benefits.crewHealthBonus} HP/day`} />}
                      </div>

                      {/* NASA fact */}
                      <div className="rounded-lg bg-cyber-blue/10 border border-cyber-blue/15 p-2 mb-2">
                        <p className="text-[11px] text-lunar-400 leading-relaxed">
                          <span className="text-cyber-blue-bright font-semibold">NASA Fact: </span>
                          {def.nasaFact.replace('NASA fact: ', '')}
                        </p>
                      </div>

                      {/* Cost & build button */}
                      {!built && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(def.cost).map(([key, val]) => {
                              const resourceKey = key as keyof typeof state.resources;
                              const has = state.resources[resourceKey] >= (val ?? 0);
                              return (
                                <span
                                  key={key}
                                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                                    has ? 'bg-space-700/60 text-lunar-200' : 'bg-danger-500/15 text-danger-400'
                                  }`}
                                >
                                  -{val} {key === 'oxygen' ? 'O₂' : key === 'water' ? 'H₂O' : key === 'electricity' ? 'Pwr' : key}
                                </span>
                              );
                            })}
                          </div>
                          <Button
                            size="sm"
                            variant={affordable ? 'primary' : 'secondary'}
                            disabled={!affordable || hasEvent}
                            onClick={() => onBuild(def.key)}
                          >
                            Build
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {activeTab === 'crew' && (
          <div className="space-y-3 animate-fade-in-up">
            {state.crew.map((member) => (
              <Panel key={member.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-display font-bold ${
                      member.alive
                        ? 'bg-gradient-to-br from-cyber-cyan to-cyber-blue text-white'
                        : 'bg-space-700 text-lunar-500'
                    }`}
                  >
                    {member.alive ? member.name.charAt(0) : <Skull className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-display font-semibold text-white">{member.name}</div>
                    <div className="text-xs text-lunar-400">{member.role}</div>
                  </div>
                  <div className="text-right">
                    {member.alive ? (
                      <>
                        <div className={`text-lg font-mono font-bold ${
                          member.health > 60 ? 'text-good-400' : member.health > 30 ? 'text-warn-400' : 'text-danger-400'
                        }`}>
                          {member.health}
                        </div>
                        <div className="text-[10px] text-lunar-500">HP</div>
                      </>
                    ) : (
                      <div className="text-sm text-danger-400 font-display">DECEASED</div>
                    )}
                  </div>
                </div>
                {member.alive && (
                  <div className="h-2 rounded-full bg-space-700 overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        member.health > 60 ? 'bg-good-500' : member.health > 30 ? 'bg-warn-500' : 'bg-danger-500'
                      }`}
                      style={{ width: `${member.health}%` }}
                    />
                  </div>
                )}
              </Panel>
            ))}

            {/* Mission log */}
            <Panel className="p-4">
              <button
                onClick={() => setShowLog(!showLog)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyber-cyan" />
                  <span className="text-sm font-display font-semibold text-lunar-100">Mission Log</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-lunar-400 transition-transform ${showLog ? 'rotate-90' : ''}`} />
              </button>
              {showLog && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                  {state.dayLog.length === 0 ? (
                    <p className="text-xs text-lunar-500">No days logged yet. Advance to Day 2 to start your log.</p>
                  ) : (
                    [...state.dayLog].reverse().map((log) => (
                      <div key={log.day} className="rounded-lg bg-space-700/30 p-2.5 border border-white/5">
                        <div className="text-xs font-display font-bold text-cyber-cyan mb-1">Day {log.day}</div>
                        <p className="text-xs text-lunar-400 leading-relaxed mb-1">{log.summary}</p>
                        {log.events.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {log.events.map((ev, i) => (
                              <p key={i} className="text-[11px] text-warn-400 flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                {ev}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 panel-glass-strong border-t border-cyber-cyan/20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={onExplore}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl panel-glass border border-sage-600/30 text-sage-200 hover:border-sage-500/50 hover:text-sage-100 transition-all duration-300 active:scale-95 no-select"
            >
              <Compass className="w-5 h-5" />
              <span className="text-sm font-display font-medium tracking-wide hidden sm:inline">Explore Surface</span>
            </button>
            <Button
              variant={hasEvent ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              disabled={hasEvent}
              onClick={onAdvanceDay}
            >
              <span className="flex items-center justify-center gap-2">
                {hasEvent ? (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Resolve Emergency First
                  </>
                ) : (
                  <>
                    Advance to Day {state.day + 1}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Event modal */}
      {hasEvent && state.pendingEvent && (
        <EventModal event={state.pendingEvent} onResolve={onResolveEvent} />
      )}
    </div>
  );
}

function getProd(state: GameState, key: 'oxygen' | 'water' | 'food' | 'electricity'): number {
  let total = 0;
  for (const def of BUILDINGS) {
    if (!state.buildings[def.key]) continue;
    const b = def.benefits;
    if (key === 'oxygen' && b.oxygenProd) total += b.oxygenProd;
    if (key === 'water' && b.waterProd) total += b.waterProd;
    if (key === 'food' && b.foodProd) total += b.foodProd;
    if (key === 'electricity' && b.electricityProd) total += b.electricityProd;
  }
  return total;
}

function ProductionCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-space-700/40 py-1.5">
      <div className={`text-sm font-mono font-bold ${value > 0 ? 'text-good-400' : 'text-lunar-600'}`}>
        {value > 0 ? '+' : ''}{value}
      </div>
      <div className="text-[10px] text-lunar-500">{label}</div>
    </div>
  );
}

function BenefitChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-good-500/10 text-good-400 font-medium">
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
