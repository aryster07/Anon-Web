import { AnimatePresence } from 'framer-motion';
import ProgressHeader from '@/components/ProgressHeader';
import { useDedicationStore } from '@/lib/dedicationStore';
import StepRecipient from '@/components/steps/StepRecipient';
import StepTheme from '@/components/steps/StepTheme';
import StepSong from '@/components/steps/StepSong';
import StepMessage from '@/components/steps/StepMessage';
import StepPhoto from '@/components/steps/StepPhoto';
import StepAnonymity from '@/components/steps/StepAnonymity';
import StepDelivery from '@/components/steps/StepDelivery';
import StepComplete from '@/components/steps/StepComplete';

const CreatePage = () => {
  const { currentStep, nextStep } = useDedicationStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepRecipient onNext={nextStep} />;
      case 2:
        return <StepTheme onNext={nextStep} />;
      case 3:
        return <StepSong onNext={nextStep} />;
      case 4:
        return <StepMessage onNext={nextStep} />;
      case 5:
        return <StepPhoto onNext={nextStep} />;
      case 6:
        return <StepAnonymity onNext={nextStep} />;
      case 7:
        return <StepDelivery onNext={nextStep} />;
      case 8:
        return <StepComplete />;
      default:
        return <StepRecipient onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader />
      <main className="container max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreatePage;
