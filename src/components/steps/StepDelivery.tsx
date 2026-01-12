import { motion } from 'framer-motion';
import { Share2, Send } from 'lucide-react';
import { useState } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';
import { cn } from '@/lib/utils';

interface StepDeliveryProps {
  onNext: () => void;
}

const StepDelivery = ({ onNext }: StepDeliveryProps) => {
  const { data, setDeliveryMethod, setRecipientInstagram, setSenderEmail } = useDedicationStore();
  const [emailError, setEmailError] = useState('');
  const [instagramError, setInstagramError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInstagram = (handle: string) => {
    // Instagram handles: 1-30 chars, alphanumeric, underscores, periods (no @ required)
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
    return instagramRegex.test(cleanHandle);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSenderEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientInstagram(value);
    if (value && !validateInstagram(value)) {
      setInstagramError('Please enter a valid Instagram handle');
    } else {
      setInstagramError('');
    }
  };

  const isDeliverValid = () => {
    if (data.deliveryMethod !== 'deliver') return true;
    return (
      data.recipientInstagram && 
      data.senderEmail && 
      validateEmail(data.senderEmail) && 
      validateInstagram(data.recipientInstagram)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        How should we deliver it?
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Choose how {data.recipientName} will receive this
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setDeliveryMethod('self')}
            className={cn(
              'p-6 rounded-2xl border-2 transition-all text-left',
              data.deliveryMethod === 'self'
                ? 'border-foreground bg-foreground/5'
                : 'border-border hover:border-muted-foreground'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Share Yourself</h3>
            <p className="text-sm text-muted-foreground">Get a link to share manually</p>
          </motion.button>

          <motion.button
            onClick={() => setDeliveryMethod('deliver')}
            className={cn(
              'p-6 rounded-2xl border-2 transition-all text-left',
              data.deliveryMethod === 'deliver'
                ? 'border-foreground bg-foreground/5'
                : 'border-border hover:border-muted-foreground'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Let Us Deliver</h3>
            <p className="text-sm text-muted-foreground">We'll send it via Instagram DM</p>
          </motion.button>
        </div>

        {data.deliveryMethod === 'deliver' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div>
              <input
                type="text"
                value={data.recipientInstagram}
                onChange={handleInstagramChange}
                placeholder="@their_instagram"
                className={cn(
                  "w-full p-4 rounded-2xl border-2 bg-background focus:outline-none transition-colors",
                  instagramError ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                )}
                aria-label="Recipient's Instagram handle"
                aria-invalid={!!instagramError}
              />
              {instagramError && (
                <p className="text-sm text-red-500 mt-1">{instagramError}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                value={data.senderEmail}
                onChange={handleEmailChange}
                placeholder="Your email (for status updates)"
                className={cn(
                  "w-full p-4 rounded-2xl border-2 bg-background focus:outline-none transition-colors",
                  emailError ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                )}
                aria-label="Your email address"
                aria-invalid={!!emailError}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>
          </motion.div>
        )}

        <AnimatedButton
          onClick={onNext}
          disabled={!isDeliverValid()}
          className="w-full"
          size="lg"
        >
          Create Dedication
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default StepDelivery;
