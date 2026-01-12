import { motion } from 'framer-motion';
import { Heart, ArrowRight, Music, Palette, Ghost } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FloatingHearts from '@/components/FloatingHearts';
import AnimatedButton from '@/components/AnimatedButton';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Music, text: 'Auto-play songs' },
    { icon: Palette, text: '7 themes' },
    { icon: Ghost, text: '100% anonymous' },
  ];

  return (
    <div className="min-h-screen bg-anon-dark text-white relative overflow-hidden">
      <FloatingHearts />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-anon-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anon-orange/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-8 shadow-xl anon-glow"
        >
          <Heart className="w-8 h-8 text-white fill-white" />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/10 mb-6"
        >
          <span className="text-sm">✨ Anonymous Dedications</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4"
        >
          <span className="gradient-text">Send love</span>
          <br />
          <span className="text-white/90">without saying who you are</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-white/60 text-center max-w-xl mb-10"
        >
          Create beautiful dedications with music, photos, and heartfelt messages. 
          Share them anonymously or reveal yourself.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatedButton
            variant="landing"
            size="lg"
            onClick={() => navigate('/create')}
            className="group"
          >
            Create a Dedication
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </AnimatedButton>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <feature.icon className="w-4 h-4 text-anon-pink" />
              <span className="text-sm text-white/70">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-sm text-white/30"
        >
          Made with 💕 by Anon
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;
