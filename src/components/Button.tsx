import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: `
    bg-gradient-to-r from-cyber-cyan-dim to-cyber-blue-electric
    hover:from-cyber-cyan hover:to-cyber-blue
    text-white border-cyber-cyan/40
    shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]
  `,
  secondary: `
    bg-space-700/60 hover:bg-space-600/80
    text-lunar-100 border-cyber-cyan/20 hover:border-cyber-cyan/40
  `,
  danger: `
    bg-gradient-to-r from-danger-600 to-danger-500
    hover:from-danger-500 hover:to-danger-400
    text-white border-danger-400/40
    shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]
  `,
  ghost: `
    bg-transparent hover:bg-space-700/40
    text-lunar-200 border-transparent hover:border-cyber-cyan/20
  `,
  success: `
    bg-gradient-to-r from-good-600 to-good-500
    hover:from-good-500 hover:to-good-400
    text-white border-good-400/40
    shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]
  `,
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        border font-display font-medium tracking-wide
        transition-all duration-300 active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        no-select
        ${className}
      `}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
