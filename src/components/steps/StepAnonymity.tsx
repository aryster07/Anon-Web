import { motion } from 'framer-motion';
import { Ghost, User } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';
import { cn } from '@/lib/utils';

interface StepAnonymityProps {
  onNext: () => void;
}

const StepAnonymity = ({ onNext }: StepAnonymityProps) => {
  const { data, setIsAnonymous, setSenderName } = useDedicationStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Who's it from?
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Choose whether to reveal your identity
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={() => setIsAnonymous(true)}
            className={cn(
              'p-6 rounded-2xl border-2 transition-all text-left',
              data.isAnonymous
                ? 'border-foreground bg-foreground/5'
                : 'border-border hover:border-muted-foreground'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Ghost className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Stay Anonymous</h3>
            <p className="text-sm text-muted-foreground">Keep it mysterious</p>
          </motion.button>

          <motion.button
            onClick={() => setIsAnonymous(false)}
            className={cn(
              'p-6 rounded-2xl border-2 transition-all text-left',
              !data.isAnonymous
                ? 'border-foreground bg-foreground/5'
                : 'border-border hover:border-muted-foreground'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Reveal Yourself</h3>
            <p className="text-sm text-muted-foreground">Let them know it's you</p>
          </motion.button>
        </div>

        {!data.isAnonymous && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={data.senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full text-center p-4 rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
              autoFocus
              aria-label="Your name"
            />
          </motion.div>
        )}

        <AnimatedButton
          onClick={onNext}
          disabled={!data.isAnonymous && !data.senderName.trim()}
          className="w-full"
          size="lg"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default StepAnonymity;
