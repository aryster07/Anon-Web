import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VinylPlayerProps {
  albumArt?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  accentColor?: string;
}

const VinylPlayer = ({ albumArt, isPlaying = true, onTogglePlay, accentColor = 'bg-pink-500' }: VinylPlayerProps) => {
  const [hovering, setHovering] = useState(false);

  return (
    <div 
      className="relative w-48 h-48 mx-auto"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Vinyl Record */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl"
        animate={{ 
          rotate: isPlaying ? 360 : 0,
        }}
        transition={{
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-2 rounded-full border border-gray-700/30" />
        <div className="absolute inset-4 rounded-full border border-gray-700/30" />
        <div className="absolute inset-6 rounded-full border border-gray-700/30" />
        <div className="absolute inset-8 rounded-full border border-gray-700/30" />
        <div className="absolute inset-10 rounded-full border border-gray-700/30" />
        
        {/* Vinyl shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        
        {/* Center label */}
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full shadow-inner flex items-center justify-center overflow-hidden",
          accentColor
        )}>
          {albumArt ? (
            <img src={albumArt} alt="Album" className="w-full h-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-900" />
          )}
        </div>
        
        {/* Center hole */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-900" />
      </motion.div>

      {/* Play/Pause overlay */}
      {onTogglePlay && (
        <motion.button
          onClick={onTogglePlay}
          className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovering ? 1 : 0 }}
        >
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-gray-900" />
            ) : (
              <Play className="w-6 h-6 text-gray-900 ml-1" />
            )}
          </div>
        </motion.button>
      )}

      {/* Tonearm */}
      <motion.div
        className="absolute -right-4 -top-4 origin-top-right"
        animate={{ rotate: isPlaying ? 25 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="w-2 h-24 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-500 rounded-full" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-6 bg-gray-600 rotate-45 origin-top" />
      </motion.div>

      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-xl opacity-30 -z-10",
        accentColor
      )} />
    </div>
  );
};

export default VinylPlayer;
