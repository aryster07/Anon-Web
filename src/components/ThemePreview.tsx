import { motion } from 'framer-motion';
import { Theme } from '@/lib/themes';
import { Music, MessageCircle, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemePreviewProps {
  theme: Theme;
  recipientName: string;
}

const ThemePreview = ({ theme, recipientName }: ThemePreviewProps) => {
  return (
    <motion.div
      key={theme.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('rounded-3xl p-6 shadow-lg', theme.cardBgClass)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl', `bg-gradient-to-br ${theme.gradientClass}`)}>
          {theme.emoji}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">For</p>
          <h3 className="font-semibold text-foreground">{recipientName || 'Someone'}</h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur rounded-xl">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', theme.accentClass)}>
            <Music className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-muted-foreground/20 rounded-full w-24" />
            <div className="h-1.5 bg-muted-foreground/10 rounded-full w-16 mt-1" />
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur rounded-xl">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', theme.accentClass)}>
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="h-2 bg-muted-foreground/20 rounded-full w-full" />
            <div className="h-2 bg-muted-foreground/10 rounded-full w-3/4 mt-1" />
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur rounded-xl">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', theme.accentClass)}>
            <Image className="w-4 h-4 text-white" />
          </div>
          <div className="w-12 h-12 bg-muted-foreground/10 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
};

export default ThemePreview;
