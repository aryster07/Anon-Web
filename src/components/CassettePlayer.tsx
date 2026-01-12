import { motion } from 'framer-motion';
import { Play, Pause, Music } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CassettePlayerProps {
  songTitle?: string;
  artistName?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  accentColor?: string;
}

const CassettePlayer = ({ 
  songTitle = "Your Song", 
  artistName = "Special", 
  isPlaying = true, 
  onTogglePlay,
  accentColor = 'from-pink-500 to-rose-500'
}: CassettePlayerProps) => {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.div 
      className="relative mx-auto"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Cassette Body */}
      <div className="relative w-72 h-44 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-2xl overflow-hidden border-4 border-gray-300">
        {/* Top label area */}
        <div className={cn(
          "absolute top-2 left-2 right-2 h-20 rounded-lg bg-gradient-to-r p-3",
          accentColor
        )}>
          <div className="bg-white/20 rounded px-2 py-1 backdrop-blur-sm">
            <p className="text-white text-xs font-bold truncate">{songTitle}</p>
            <p className="text-white/80 text-[10px] truncate">{artistName}</p>
          </div>
          
          {/* Decorative lines */}
          <div className="absolute bottom-2 left-3 right-3 space-y-1">
            <div className="h-0.5 bg-white/30 rounded" />
            <div className="h-0.5 bg-white/20 rounded w-3/4" />
          </div>
        </div>

        {/* Tape reels */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-14">
          {/* Left reel */}
          <motion.div
            className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner flex items-center justify-center"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-800" />
            </div>
            {/* Spokes */}
            <div className="absolute w-full h-0.5 bg-gray-700" />
            <div className="absolute w-full h-0.5 bg-gray-700 rotate-60" />
            <div className="absolute w-full h-0.5 bg-gray-700 -rotate-60" />
          </motion.div>

          {/* Right reel */}
          <motion.div
            className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner flex items-center justify-center"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-800" />
            </div>
            {/* Spokes */}
            <div className="absolute w-full h-0.5 bg-gray-700" />
            <div className="absolute w-full h-0.5 bg-gray-700 rotate-60" />
            <div className="absolute w-full h-0.5 bg-gray-700 -rotate-60" />
          </motion.div>
        </div>

        {/* Tape window */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900/80 rounded-sm border border-gray-600">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-900/50 via-amber-800/30 to-amber-900/50"
            animate={{ x: isPlaying ? [0, 10, 0] : 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Screw holes */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-gray-400 shadow-inner" />
        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-gray-400 shadow-inner" />
      </div>

      {/* Play button overlay */}
      {onTogglePlay && (
        <motion.button
          onClick={onTogglePlay}
          className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovering ? 1 : 0 }}
        >
          <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-xl">
            {isPlaying ? (
              <Pause className="w-7 h-7 text-gray-900" />
            ) : (
              <Play className="w-7 h-7 text-gray-900 ml-1" />
            )}
          </div>
        </motion.button>
      )}

      {/* Shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full" />
    </motion.div>
  );
};

export default CassettePlayer;
