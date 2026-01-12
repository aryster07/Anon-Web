import { motion } from 'framer-motion';
import { useMemo } from 'react';

const Confetti = () => {
  const confettiPieces = useMemo(() => {
    const colors = ['#ec4899', '#f43f5e', '#f97316', '#8b5cf6', '#06b6d4'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.size > 8 ? '50%' : '2px',
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: piece.rotation + 720,
            opacity: 0,
          }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
