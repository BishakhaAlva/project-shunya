import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Panel({ children, className = '', glow = false }: PanelProps) {
  return (
    <div
      className={`
        panel-glass rounded-2xl
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
