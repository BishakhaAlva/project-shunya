import { useRef, useState, useCallback, useEffect } from 'react';

interface JoystickProps {
  onInput: (input: { x: number; y: number } | null) => void;
}

export default function Joystick({ onInput }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setActive(true);
    updateKnob(clientX, clientY);
  }, []);

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    const knob = knobRef.current;
    if (!knob) return;

    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const maxDist = 45;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // Normalized input (-1 to 1)
    const nx = knobX / maxDist;
    const ny = knobY / maxDist;

    onInput({ x: nx, y: ny });
  }, [onInput]);

  const handleEnd = useCallback(() => {
    setActive(false);
    touchIdRef.current = null;
    const knob = knobRef.current;
    if (knob) {
      knob.style.transform = 'translate(0px, 0px)';
    }
    onInput(null);
  }, [onInput]);

  // Touch events
  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!touch) return;
      touchIdRef.current = touch.identifier;
      handleStart(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          updateKnob(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchIdRef.current) {
          handleEnd();
          break;
        }
      }
    };

    base.addEventListener('touchstart', onTouchStart, { passive: false });
    base.addEventListener('touchmove', onTouchMove, { passive: false });
    base.addEventListener('touchend', onTouchEnd);
    base.addEventListener('touchcancel', onTouchEnd);

    return () => {
      base.removeEventListener('touchstart', onTouchStart);
      base.removeEventListener('touchmove', onTouchMove);
      base.removeEventListener('touchend', onTouchEnd);
      base.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleStart, updateKnob, handleEnd]);

  // Mouse events for desktop testing
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);

    const onMouseMove = (ev: MouseEvent) => updateKnob(ev.clientX, ev.clientY);
    const onMouseUp = () => {
      handleEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={baseRef}
      className="joystick-base relative w-32 h-32 rounded-full flex items-center justify-center no-select"
      onMouseDown={onMouseDown}
      style={{ touchAction: 'none' }}
    >
      {/* Direction hints */}
      <div className="absolute inset-0 rounded-full opacity-20 flex items-center justify-center">
        <div className="absolute top-1 text-sage-300 text-xs font-display">N</div>
        <div className="absolute bottom-1 text-sage-300 text-xs font-display">S</div>
        <div className="absolute left-1 text-sage-300 text-xs font-display">W</div>
        <div className="absolute right-1 text-sage-300 text-xs font-display">E</div>
      </div>
      <div
        ref={knobRef}
        className={`joystick-knob w-14 h-14 rounded-full transition-transform duration-75 ${active ? '' : 'transition-transform duration-200'}`}
        style={{ transform: 'translate(0px, 0px)' }}
      />
    </div>
  );
}
