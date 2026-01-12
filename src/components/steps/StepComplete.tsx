import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, Sparkles, Loader2, Heart, Mail, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import Confetti from '@/components/Confetti';
import { useDedicationStore } from '@/lib/dedicationStore';
import { getThemeById } from '@/lib/themes';
import { saveDedication } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const StepComplete = () => {
  const navigate = useNavigate();
  const { data, reset } = useDedicationStore();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [dedicationId, setDedicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = getThemeById(data.themeId);

  // Debug log
  console.log('StepComplete - deliveryMethod:', data.deliveryMethod);
  console.log('StepComplete - full data:', data);

  // Save to Firebase on mount
  useEffect(() => {
    const saveToFirebase = async () => {
      console.log('Saving dedication with deliveryMethod:', data.deliveryMethod);
      try {
        setIsLoading(true);
        const id = await saveDedication(data);
        console.log('Saved dedication with ID:', id);
        setDedicationId(id);
        // Try to store in sessionStorage (may fail if photo is too large)
        try {
          // Store a minimal version without the photo for sessionStorage
          const minimalData = { ...data, photoUrl: data.photoUrl ? 'HAS_PHOTO' : null };
          sessionStorage.setItem('dedication', JSON.stringify(minimalData));
          // Store full data reference by ID
          sessionStorage.setItem(`dedication_${id}`, JSON.stringify(data));
        } catch (storageErr) {
          console.warn('Could not save to sessionStorage (quota exceeded):', storageErr);
        }
      } catch (err) {
        console.error('Error saving dedication:', err);
        setError('Failed to save. Please try again.');
        // Fallback to base64 encoding (without photo to avoid quota issues)
        const dataWithoutPhoto = { ...data, photoUrl: null };
        const fallbackId = btoa(JSON.stringify(dataWithoutPhoto))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        setDedicationId(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };
    
    saveToFirebase();
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const shareUrl = dedicationId 
    ? `${window.location.origin}/view/${dedicationId}`
    : '';

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    reset();
    navigate('/create');
  };

  const handleViewDedication = () => {
    if (dedicationId) {
      navigate(`/view/${dedicationId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        {data.deliveryMethod === 'deliver' 
          ? "We've got it from here! 💌" 
          : "Your dedication is ready!"}
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        {data.deliveryMethod === 'deliver'
          ? `We'll deliver your message to ${data.recipientName} via Instagram`
          : `Share it with ${data.recipientName} and make their day`}
      </p>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn('w-full max-w-sm rounded-3xl p-6 mb-6', theme.cardBgClass)}
      >
        <div className="flex items-center gap-3 mb-4">
          {data.photoUrl ? (
            <img 
              src={data.photoUrl} 
              alt="Uploaded" 
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl', theme.accentClass)}>
              {theme.emoji}
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">For</p>
            <h3 className="font-semibold text-foreground">{data.recipientName}</h3>
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
          "{data.message}"
        </p>
        <p className="text-xs text-muted-foreground">
          From: {data.isAnonymous ? 'Anonymous 🎭' : data.senderName}
        </p>
      </motion.div>

      {/* Share Link or Delivery Confirmation */}
      <div className="w-full max-w-md space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-2xl">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.deliveryMethod === 'deliver' ? 'Submitting your request...' : 'Creating your link...'}
            </span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 rounded-2xl text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : data.deliveryMethod === 'deliver' ? (
          // Delivery confirmation UI
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-pink-200 dark:border-pink-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delivery Request Submitted!</h3>
                <p className="text-sm text-muted-foreground">We'll handle it from here</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>Usually delivered within 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>We'll DM @{data.recipientInstagram?.replace('@', '')} on Instagram</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-pink-500" />
                <span>You'll get an email when it's delivered</span>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">
                💕 Sit back and relax! We'll take care of the rest.
              </p>
            </div>
          </motion.div>
        ) : (
          // Self-share UI with link
          <div className="flex items-center gap-2 p-3 bg-muted rounded-2xl">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none truncate"
            />
            <motion.button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-background hover:bg-background/80 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
          </div>
        )}

        <div className="flex gap-3">
          {data.deliveryMethod !== 'deliver' && (
            <AnimatedButton
              variant="secondary"
              onClick={handleViewDedication}
              className="flex-1"
              size="lg"
              disabled={isLoading}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View
            </AnimatedButton>
          )}
          <AnimatedButton
            onClick={handleCreateAnother}
            className="flex-1"
            size="lg"
          >
            Create Another
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
};

export default StepComplete;
