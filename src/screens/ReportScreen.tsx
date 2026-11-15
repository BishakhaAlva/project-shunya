import {
  Trophy, Skull, Heart, Building2, MousePointerClick, Calendar,
  RotateCcw, Home, Star, Award,
} from 'lucide-react';
import type { GameState } from '@/game/types';
import { getScoreRank } from '@/game/engine';
import { BUILDINGS } from '@/game/data';
import Button from '@/components/Button';
import Panel from '@/components/Panel';
import Starfield from '@/components/Starfield';

interface ReportScreenProps {
  state: GameState;
  onRestart: () => void;
  onHome: () => void;
}

export default function ReportScreen({ state, onRestart, onHome }: ReportScreenProps) {
  const rank = getScoreRank(state.score);
  const aliveCrew = state.crew.filter((c) => c.alive);
  const buildingsBuilt = BUILDINGS.filter((b) => state.buildings[b.key]).length;
  const avgHealth = aliveCrew.length > 0
    ? Math.round(aliveCrew.reduce((sum, c) => sum + c.health, 0) / aliveCrew.length)
    : 0;

  // Star rating (0-5)
  const stars = state.victory
    ? aliveCrew.length >= 4 ? 5 : aliveCrew.length >= 3 ? 4 : aliveCrew.length >= 2 ? 3 : 2
    : state.day > 10 ? 1 : 0;

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <Starfield density={60} showMoon />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-scale-in">
            {state.victory ? (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-good-500/30 to-cyber-cyan/30 border-2 border-good-500/40 flex items-center justify-center animate-pulse-glow">
                <Trophy className="w-10 h-10 text-good-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-danger-500/20 border-2 border-danger-500/40 flex items-center justify-center">
                <Skull className="w-10 h-10 text-danger-400" />
              </div>
            )}
          </div>

          <h1 className={`text-3xl sm:text-4xl font-display font-black ${state.victory ? 'text-good-400' : 'text-danger-400'} text-shadow-glow`}>
            {state.victory ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          </h1>
          <p className="mt-2 text-sm text-lunar-300">
            {state.victory
              ? `Your crew survived all ${state.maxDays} days on the Moon!`
              : `Your crew could not survive. The mission ended on Day ${state.day}.`}
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6 animate-fade-in-up">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-8 h-8 transition-all duration-500 ${
                i <= stars
                  ? 'text-warn-400 fill-warn-400'
                  : 'text-lunar-700'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Score */}
        <Panel className="p-6 mb-4 text-center animate-fade-in-up" glow>
          <div className="text-xs font-display tracking-widest text-lunar-400 uppercase mb-1">Final Score</div>
          <div className="text-5xl font-display font-black text-cyber-cyan-bright text-shadow-glow animate-count-up">
            {state.score}
          </div>
          <div className={`mt-2 text-sm font-display font-bold ${rank.color}`}>
            {rank.title}
          </div>
        </Panel>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-in-up">
          <StatCard icon={Calendar} label="Days Survived" value={`${state.day}/${state.maxDays}`} color="cyan" />
          <StatCard icon={Heart} label="Crew Alive" value={`${aliveCrew.length}/${state.crew.length}`} color={aliveCrew.length === state.crew.length ? 'green' : 'red'} />
          <StatCard icon={Building2} label="Buildings Built" value={`${buildingsBuilt}/${BUILDINGS.length}`} color="blue" />
          <StatCard icon={MousePointerClick} label="Decisions Made" value={String(state.decisionsMade)} color="amber" />
        </div>

        {/* Crew final report */}
        <Panel className="p-4 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-sm font-display font-semibold text-lunar-100">Crew Report</h2>
          </div>
          <div className="space-y-2">
            {state.crew.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg bg-space-700/30 p-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold ${
                      member.alive
                        ? 'bg-gradient-to-br from-cyber-cyan to-cyber-blue text-white'
                        : 'bg-space-700 text-lunar-500'
                    }`}
                  >
                    {member.alive ? member.name.charAt(0) : <Skull className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm text-lunar-200">{member.name}</span>
                </div>
                <div className="text-right">
                  {member.alive ? (
                    <span className={`text-sm font-mono font-bold ${
                      member.health > 60 ? 'text-good-400' : member.health > 30 ? 'text-warn-400' : 'text-danger-400'
                    }`}>
                      {member.health} HP
                    </span>
                  ) : (
                    <span className="text-xs text-danger-400">Lost on mission</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {aliveCrew.length > 0 && (
            <div className="mt-3 text-center text-xs text-lunar-400">
              Average crew health: <span className="text-cyber-cyan font-bold">{avgHealth}%</span>
            </div>
          )}
        </Panel>

        {/* Buildings constructed */}
        <Panel className="p-4 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-sm font-display font-semibold text-lunar-100">Colony Construction</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {BUILDINGS.map((def) => {
              const built = state.buildings[def.key];
              return (
                <div
                  key={def.key}
                  className={`flex items-center gap-2 rounded-lg p-2 ${
                    built ? 'bg-good-500/10 border border-good-500/20' : 'bg-space-700/20 border border-white/5'
                  }`}
                >
                  <span className={`text-xs ${built ? 'text-good-400' : 'text-lunar-600'}`}>
                    {built ? '✓' : '○'}
                  </span>
                  <span className={`text-xs ${built ? 'text-lunar-200' : 'text-lunar-600'}`}>
                    {def.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Decision history */}
        {state.eventHistory.length > 0 && (
          <Panel className="p-4 mb-4 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-cyber-cyan" />
              <h2 className="text-sm font-display font-semibold text-lunar-100">Mission Decisions</h2>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {state.eventHistory.map((entry, i) => (
                <div key={i} className="rounded-lg bg-space-700/30 p-2.5 border border-white/5">
                  <div className="text-xs font-display font-bold text-cyber-cyan mb-0.5">
                    Day {entry.day}: {entry.title}
                  </div>
                  <div className="text-xs text-lunar-300">
                    <span className="text-lunar-400">Choice: </span>{entry.choice}
                  </div>
                  <div className="text-xs text-lunar-400 mt-0.5 italic">{entry.outcome}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Educational summary */}
        <div className="rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 p-4 mb-6 animate-fade-in-up">
          <div className="flex items-start gap-2">
            <Trophy className="w-4 h-4 text-cyber-blue-bright flex-shrink-0 mt-0.5" />
            <p className="text-xs text-lunar-300 leading-relaxed">
              <strong className="text-cyber-blue-bright">Did you know? </strong>
              NASA's real Artemis program plans to send astronauts back to the Moon for long-term stays.
              The challenges you faced in this game — oxygen, water, radiation, and power — are the same
              real scientists and engineers are solving right now!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6 animate-fade-in-up">
          <Button variant="ghost" onClick={onHome}>
            <span className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Home
            </span>
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onRestart}>
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Play Again
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  color: 'cyan' | 'green' | 'red' | 'blue' | 'amber';
}) {
  const colorMap = {
    cyan: 'text-cyber-cyan-bright',
    green: 'text-good-400',
    red: 'text-danger-400',
    blue: 'text-cyber-blue-bright',
    amber: 'text-warn-400',
  };
  return (
    <div className="panel-glass rounded-xl p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${colorMap[color]}`} />
      <div className={`text-xl font-display font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-[10px] text-lunar-400 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
