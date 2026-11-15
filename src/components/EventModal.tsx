import { AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { GameEvent } from '@/game/types';
import Button from '@/components/Button';
import Starfield from '@/components/Starfield';

interface EventModalProps {
  event: GameEvent;
  onResolve: (choiceIndex: number) => void;
}

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-cyber-blue-bright',
    border: 'border-cyber-blue/40',
    bg: 'bg-cyber-blue/10',
    label: 'ALERT',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warn-400',
    border: 'border-warn-400/40',
    bg: 'bg-warn-500/10',
    label: 'WARNING',
  },
  danger: {
    icon: ShieldAlert,
    color: 'text-danger-400',
    border: 'border-danger-400/40',
    bg: 'bg-danger-500/10',
    label: 'EMERGENCY',
  },
};

function getIcon(name: string): LucideIcon {
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? AlertTriangle;
}

export default function EventModal({ event, onResolve }: EventModalProps) {
  const sev = severityConfig[event.severity];
  const SevIcon = sev.icon;
  const EventIcon = getIcon(event.icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <Starfield density={30} />
      <div className="absolute inset-0 bg-space-black/80 backdrop-blur-sm" />

      <div className={`relative z-10 w-full max-w-lg panel-glass-strong rounded-2xl border-2 ${sev.border} animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-thin`}>
        {/* Header */}
        <div className={`px-5 py-4 ${sev.bg} border-b ${sev.border} rounded-t-2xl`}>
          <div className="flex items-center gap-2 mb-2">
            <SevIcon className={`w-4 h-4 ${sev.color}`} />
            <span className={`text-xs font-display font-bold tracking-widest ${sev.color}`}>
              {sev.label} — DAY {event.day}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${sev.bg} border ${sev.border} flex items-center justify-center flex-shrink-0`}>
              <EventIcon className={`w-6 h-6 ${sev.color}`} />
            </div>
            <h2 className="text-xl font-display font-bold text-white leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-lunar-200 leading-relaxed mb-4">
            {event.description}
          </p>

          {/* NASA Fact */}
          {event.nasaFact && (
            <div className="rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyber-blue-bright flex-shrink-0 mt-0.5" />
                <p className="text-xs text-lunar-300 leading-relaxed">
                  <span className="text-cyber-blue-bright font-semibold">NASA Fact: </span>
                  {event.nasaFact.replace('NASA fact: ', '')}
                </p>
              </div>
            </div>
          )}

          {/* Choices */}
          <div className="space-y-3">
            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => onResolve(i)}
                className={`
                  w-full text-left rounded-xl p-4 border transition-all duration-300 active:scale-[0.98]
                  ${choice.isRecommended
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/40 hover:bg-cyber-cyan/20 hover:border-cyber-cyan/60'
                    : 'bg-space-700/40 border-white/10 hover:bg-space-600/60 hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {choice.isRecommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-cyan/20 text-cyber-cyan-bright font-display font-medium tracking-wide">
                          RECOMMENDED
                        </span>
                      )}
                      <span className="text-sm font-display font-semibold text-white">
                        {choice.label}
                      </span>
                    </div>
                    <p className="text-xs text-lunar-400 leading-relaxed">
                      {choice.description}
                    </p>
                    {/* Effects */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {choice.effects.oxygen !== undefined && (
                        <EffectChip label="O₂" value={choice.effects.oxygen} />
                      )}
                      {choice.effects.water !== undefined && (
                        <EffectChip label="H₂O" value={choice.effects.water} />
                      )}
                      {choice.effects.food !== undefined && (
                        <EffectChip label="Food" value={choice.effects.food} />
                      )}
                      {choice.effects.electricity !== undefined && (
                        <EffectChip label="Pwr" value={choice.effects.electricity} />
                      )}
                      {choice.effects.crewHealth !== undefined && (
                        <EffectChip label="Crew HP" value={choice.effects.crewHealth} />
                      )}
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-lunar-600 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EffectChip({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  return (
    <span
      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
        isPositive
          ? 'bg-good-500/15 text-good-400'
          : 'bg-danger-500/15 text-danger-400'
      }`}
    >
      {isPositive ? '+' : ''}{value} {label}
    </span>
  );
}
