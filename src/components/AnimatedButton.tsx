import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'landing';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton = ({ className, variant = 'primary', size = 'md', children, disabled, onClick, type = 'button' }: AnimatedButtonProps) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90 focus:ring-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    ghost: 'bg-transparent hover:bg-muted focus:ring-muted',
    landing: 'bg-white text-black hover:bg-white/90 focus:ring-white shadow-xl',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], disabled && 'opacity-50 cursor-not-allowed', className)}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
