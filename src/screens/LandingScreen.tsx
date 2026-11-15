import { Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Starfield from '@/components/Starfield';

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      <Starfield density={100} showMoon />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full panel-glass mb-6 animate-fade-in-down">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-xs font-display tracking-widest text-cyber-cyan-bright uppercase">
            Lunar Colony Survival Game
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white animate-fade-in-up leading-tight">
          PROJECT
        </h1>
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-display font-black text-cyber-cyan-bright animate-fade-in-up text-shadow-glow leading-tight tracking-wider">
          SHUNYA
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-lg sm:text-xl md:text-2xl font-body text-lunar-200 animate-fade-in-up font-light tracking-wide">
          Your Mission. Your Decisions. Your Survival.
        </p>

        {/* Description */}
        <p className="mt-8 text-sm sm:text-base text-lunar-400 max-w-lg mx-auto leading-relaxed animate-fade-in-up">
          You are the commander of Lunar Outpost Alpha. Four astronauts depend on you.
          Manage oxygen, water, food, and power for 15 days. Build your colony. Survive the unknown.
        </p>

        {/* Start button */}
        <div className="mt-10 animate-fade-in-up">
          <Button
            size="lg"
            fullWidth
            onClick={onStart}
            className="text-xl"
          >
            <span className="flex items-center justify-center gap-3">
              <Rocket className="w-6 h-6" />
              Begin Mission
            </span>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in-up">
          {[
            { icon: Rocket, label: '15-Day Mission' },
            { icon: ShieldCheck, label: 'Build & Survive' },
            { icon: Sparkles, label: 'Learn Real NASA Science' },
          ].map((feat) => (
            <div
              key={feat.label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg panel-glass"
            >
              <feat.icon className="w-4 h-4 text-cyber-cyan" />
              <span className="text-xs font-display text-lunar-200 tracking-wide">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-lunar-500 text-xs font-display tracking-widest animate-float">
        <span className="opacity-60">EXPLORE</span>
      </div>
    </div>
  );
}
