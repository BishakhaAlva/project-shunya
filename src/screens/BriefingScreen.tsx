import { Users, CalendarDays, Target, Rocket, ArrowRight, Info } from 'lucide-react';
import Button from '@/components/Button';
import Panel from '@/components/Panel';
import Starfield from '@/components/Starfield';
import { CREW_NAMES, INITIAL_RESOURCES, MAX_DAYS } from '@/game/data';

interface BriefingScreenProps {
  onBegin: () => void;
  onBack: () => void;
}

export default function BriefingScreen({ onBegin, onBack }: BriefingScreenProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-6 overflow-y-auto">
      <Starfield density={60} />

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full panel-glass mb-4">
            <Info className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-xs font-display tracking-widest text-cyber-cyan-bright uppercase">
              Mission Briefing
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Lunar Outpost Alpha
          </h1>
          <p className="mt-2 text-sm text-lunar-400">
            Day 0 — Pre-landing briefing
          </p>
        </div>

        {/* Mission objectives */}
        <Panel className="p-5 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-display font-semibold text-lunar-100">Mission Objectives</h2>
          </div>
          <ul className="space-y-2.5 text-sm text-lunar-300">
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan mt-0.5">▸</span>
              <span>Keep all crew members alive for <strong className="text-white">{MAX_DAYS} days</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan mt-0.5">▸</span>
              <span>Manage <strong className="text-white">oxygen, water, food, and electricity</strong> — each day they go down as your crew uses them.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan mt-0.5">▸</span>
              <span>Build structures to <strong className="text-white">produce more resources</strong> and protect your crew.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyber-cyan mt-0.5">▸</span>
              <span>Handle <strong className="text-white">emergencies</strong> — solar storms, equipment failures, and more!</span>
            </li>
          </ul>
        </Panel>

        {/* Crew roster */}
        <Panel className="p-5 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-display font-semibold text-lunar-100">Your Crew</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CREW_NAMES.map((member) => (
              <div key={member.id} className="rounded-xl bg-space-700/40 p-3 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center text-white text-xs font-display font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-display text-white font-medium">{member.name}</div>
                    <div className="text-xs text-lunar-400">{member.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Starting resources */}
        <Panel className="p-5 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-display font-semibold text-lunar-100">Starting Supplies</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Oxygen', value: INITIAL_RESOURCES.oxygen, max: 200, unit: 'L' },
              { label: 'Water', value: INITIAL_RESOURCES.water, max: 200, unit: 'L' },
              { label: 'Food', value: INITIAL_RESOURCES.food, max: 200, unit: 'kg' },
              { label: 'Power', value: INITIAL_RESOURCES.electricity, max: 200, unit: 'kWh' },
            ].map((r) => (
              <div key={r.label} className="text-center rounded-xl bg-space-700/40 p-3 border border-white/5">
                <div className="text-2xl font-display font-bold text-cyber-cyan-bright">{r.value}</div>
                <div className="text-xs text-lunar-400 mt-0.5">{r.label} ({r.unit})</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* How to play */}
        <Panel className="p-5 mb-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-display font-semibold text-lunar-100">How to Play</h2>
          </div>
          <div className="space-y-3 text-sm text-lunar-300">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-cyan/20 text-cyber-cyan-bright text-xs font-display font-bold flex items-center justify-center">1</span>
              <p>Each day, your crew automatically uses oxygen, water, food, and power.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-cyan/20 text-cyber-cyan-bright text-xs font-display font-bold flex items-center justify-center">2</span>
              <p>Build structures like solar panels and hydroponic farms to produce resources.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-cyan/20 text-cyber-cyan-bright text-xs font-display font-bold flex items-center justify-center">3</span>
              <p>When an emergency appears, choose how to respond — each choice has consequences!</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-cyan/20 text-cyber-cyan-bright text-xs font-display font-bold flex items-center justify-center">4</span>
              <p>Tap "Advance Day" when you are ready to move forward. Plan carefully!</p>
            </div>
          </div>
        </Panel>

        {/* Real vs game note */}
        <div className="rounded-xl bg-cyber-blue/10 border border-cyber-blue/20 p-4 mb-6 animate-fade-in-up">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyber-blue-bright flex-shrink-0 mt-0.5" />
            <p className="text-xs text-lunar-300 leading-relaxed">
              <strong className="text-cyber-blue-bright">Real or Game?</strong> Throughout the game, look for
              <span className="text-cyber-cyan font-medium"> "NASA fact"</span> boxes — those are real science facts.
              Everything else is simplified for gameplay and is not real NASA data.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-4 animate-fade-in-up">
          <Button variant="ghost" size="md" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onBegin}>
            <span className="flex items-center justify-center gap-2">
              Launch Mission
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
