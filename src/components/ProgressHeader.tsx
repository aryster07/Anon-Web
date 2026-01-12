import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDedicationStore } from '@/lib/dedicationStore';

interface ProgressHeaderProps {
  totalSteps?: number;
}

const ProgressHeader = ({ totalSteps = 8 }: ProgressHeaderProps) => {
  const navigate = useNavigate();
  const { currentStep, prevStep, reset } = useDedicationStore();
  const progress = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      navigate('/');
    }
  };

  const handleClose = () => {
    reset();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{currentStep}</span>
            <span>/</span>
            <span>{totalSteps}</span>
          </div>
          
          <motion.button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full gradient-bg rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;
