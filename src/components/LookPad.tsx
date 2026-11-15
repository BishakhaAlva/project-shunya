import { useRef, useState, useCallback, useEffect } from 'react';

interface LookPadProps {
  onLook: (delta: { x: number; y: number }) => void;
}

// Touch drag area for camera look controls (right side of screen on mobile)
export default function LookPad({ onLook }: LookPadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    lastPosRef.current = { x: clientX, y: clientY };
    setActive(true);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - lastPosRef.current.x;
    const dy = clientY - lastPosRef.current.y;
    lastPosRef.current = { x: clientX, y: clientY };
    onLook({ x: dx, y: dy });
  }, [onLook]);

  const handleEnd = useCallback(() => {
    setActive(false);
    touchIdRef.current = null;
    onLook({ x: 0, y: 0 });
  }, [onLook]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (touchIdRef.current !== null) return;
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
          handleMove(touch.clientX, touch.clientY);
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

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div
      ref={ref}
      className="absolute top-0 right-0 bottom-0 w-1/2 z-5"
      style={{ touchAction: 'none' }}
    >
      {/* Visual hint when active */}
      {active && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 pointer-events-none">
          <div className="hud-pastel rounded-lg px-2 py-1 text-[10px] text-sage-300 font-display tracking-wide">
            LOOK
          </div>
        </div>
      )}
    </div>
  );
}
