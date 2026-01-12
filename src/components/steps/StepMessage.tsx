import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';
import { getThemeById } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface StepMessageProps {
  onNext: () => void;
}

const StepMessage = ({ onNext }: StepMessageProps) => {
  const { data, setMessage } = useDedicationStore();
  const theme = getThemeById(data.themeId);
  const maxChars = 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-8', theme.accentClass)}
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </motion.div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Write your message
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        What do you want to say to {data.recipientName}?
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <textarea
            value={data.message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
            placeholder="Write something heartfelt..."
            rows={6}
            className={cn(
              'w-full p-4 rounded-2xl border-2 border-border bg-background focus:outline-none transition-colors resize-none',
              'focus:border-primary'
            )}
            aria-label={`Your message to ${data.recipientName}`}
            aria-describedby="char-count"
          />
          <div id="char-count" className="absolute bottom-3 right-3 text-xs text-muted-foreground" aria-live="polite">
            {data.message.length}/{maxChars}
          </div>
        </div>

        <AnimatedButton
          onClick={onNext}
          disabled={!data.message.trim()}
          className="w-full"
          size="lg"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default StepMessage;
