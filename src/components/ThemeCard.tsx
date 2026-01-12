import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Theme } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

const ThemeCard = ({ theme, isSelected, onClick }: ThemeCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-2xl border-2 transition-all text-left',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected
          ? 'border-foreground shadow-lg'
          : 'border-border hover:border-muted-foreground/30'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}
      
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3', theme.cardBgClass)}>
        {theme.emoji}
      </div>
      
      <h3 className="font-semibold text-foreground mb-1">{theme.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
    </motion.button>
  );
};

export default ThemeCard;
