import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';

interface StepRecipientProps {
  onNext: () => void;
}

const StepRecipient = ({ onNext }: StepRecipientProps) => {
  const { data, setRecipientName } = useDedicationStore();

  const handleContinue = () => {
    if (data.recipientName.trim()) {
      onNext();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && data.recipientName.trim()) {
      onNext();
    }
  };

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
        className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-8"
      >
        <Heart className="w-8 h-8 text-white" />
      </motion.div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Who's the lucky one?
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Enter the name of the person you're dedicating this to
      </p>

      <div className="w-full max-w-sm space-y-6">
        <input
          type="text"
          value={data.recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter their name..."
          className="w-full text-center text-xl p-4 rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors"
          autoFocus
          aria-label="Recipient's name"
        />

        {data.recipientName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground"
          >
            Creating dedication for <span className="font-semibold text-foreground">{data.recipientName}</span>
          </motion.p>
        )}

        <AnimatedButton
          onClick={handleContinue}
          disabled={!data.recipientName.trim()}
          className="w-full"
          size="lg"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default StepRecipient;
