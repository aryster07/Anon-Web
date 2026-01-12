import { motion } from 'framer-motion';
import { themes } from '@/lib/themes';
import ThemeCard from '@/components/ThemeCard';
import ThemePreview from '@/components/ThemePreview';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';
import { getThemeById } from '@/lib/themes';

interface StepThemeProps {
  onNext: () => void;
}

const StepTheme = ({ onNext }: StepThemeProps) => {
  const { data, setThemeId } = useDedicationStore();
  const selectedTheme = getThemeById(data.themeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Pick a vibe for {data.recipientName}
        </h1>
        <p className="text-muted-foreground">
          Choose a theme that matches your relationship
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ThemeCard
              theme={theme}
              isSelected={data.themeId === theme.id}
              onClick={() => setThemeId(theme.id)}
            />
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Preview</h3>
        <div className="max-w-sm mx-auto">
          <ThemePreview theme={selectedTheme} recipientName={data.recipientName} />
        </div>
      </div>

      <div className="flex justify-center">
        <AnimatedButton onClick={onNext} size="lg" className="min-w-[200px]">
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default StepTheme;
