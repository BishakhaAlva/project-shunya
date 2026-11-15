import type { LucideIcon } from 'lucide-react';

interface ResourceBarProps {
  icon: LucideIcon;
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: 'cyan' | 'blue' | 'green' | 'amber';
  showChange?: number;
}

const colorMap = {
  cyan: {
    bar: 'from-cyber-cyan-dim to-cyber-cyan',
    text: 'text-cyber-cyan-bright',
    glow: 'rgba(34, 211, 238, 0.4)',
    bg: 'bg-cyber-cyan/10',
  },
  blue: {
    bar: 'from-cyber-blue to-cyber-blue-bright',
    text: 'text-cyber-blue-bright',
    glow: 'rgba(59, 130, 246, 0.4)',
    bg: 'bg-cyber-blue/10',
  },
  green: {
    bar: 'from-good-600 to-good-400',
    text: 'text-good-400',
    glow: 'rgba(74, 222, 128, 0.4)',
    bg: 'bg-good-500/10',
  },
  amber: {
    bar: 'from-warn-600 to-warn-400',
    text: 'text-warn-400',
    glow: 'rgba(251, 191, 36, 0.4)',
    bg: 'bg-warn-500/10',
  },
};

export default function ResourceBar({
  icon: Icon,
  label,
  value,
  max,
  unit = '%',
  color,
  showChange,
}: ResourceBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = colorMap[color];
  const isCritical = pct < 15;
  const isLow = pct < 30;

  return (
    <div className={`rounded-xl p-3 ${c.bg} border border-white/5`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${c.text}`} />
          <span className="text-xs font-display font-medium tracking-wide text-lunar-200 uppercase">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {showChange !== undefined && showChange !== 0 && (
            <span
              className={`text-xs font-mono font-bold ${
                showChange > 0 ? 'text-good-400' : 'text-danger-400'
              }`}
            >
              {showChange > 0 ? '+' : ''}
              {showChange.toFixed(0)}
            </span>
          )}
          <span className={`text-sm font-mono font-bold ${isCritical ? 'text-danger-400 animate-pulse' : c.text}`}>
            {Math.round(value)}
            <span className="text-lunar-500 text-xs ml-0.5">{unit}</span>
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-space-black/60 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-700 ease-out relative`}
          style={{
            width: `${pct}%`,
            boxShadow: `0 0 10px ${c.glow}`,
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'scan 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      {(isLow || isCritical) && (
        <div className={`text-xs mt-1.5 font-medium ${isCritical ? 'text-danger-400' : 'text-warn-400'}`}>
          {isCritical ? 'CRITICAL LEVEL!' : 'Low supply'}
        </div>
      )}
    </div>
  );
}
