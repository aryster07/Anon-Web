import React from 'react';
import { ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';
import { Song } from '../types';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ 
  children, onClick, disabled, icon: Icon, className = '' 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full h-14 bg-gold-gradient text-white font-bold rounded-full shadow-gold-glow 
      flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] 
      transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    <span>{children}</span>
    {Icon && <Icon size={20} />}
  </button>
);

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center 
      hover:border-royal-gold/50 transition-colors"
  >
    <ArrowLeft size={18} className="text-slate-600" />
  </button>
);

interface StepIndicatorProps {
  step: number;
  total: number;
  label?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step, total, label }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-royal-gold">Step {step} of {total}</span>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gold-gradient rounded-full transition-all duration-500"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  </div>
);

interface SongPlayerProps {
  song: Song;
  isPlaying: boolean;
  onToggle: () => void;
}

export const SongPlayer: React.FC<SongPlayerProps> = ({ song, isPlaying, onToggle }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center gap-3">
    <div 
      className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
      style={{ backgroundImage: `url(${song.albumCover || song.coverUrl})` }}
    />
    <div className="flex-1 min-w-0">
      <p className="font-bold text-slate-900 truncate text-sm">{song.title}</p>
      <p className="text-xs text-slate-500 truncate">{song.artist}</p>
    </div>
    <button
      onClick={onToggle}
      className="w-10 h-10 rounded-full bg-royal-gold text-white flex items-center justify-center flex-shrink-0"
    >
      {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
    </button>
  </div>
);

interface ImagePreviewProps {
  src: string;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onRemove }) => (
  <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
    <img src={src} alt="Preview" className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
    <button
      onClick={onRemove}
      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-slate-700 
        hover:text-red-500 hover:bg-white transition-all shadow-sm flex items-center justify-center"
    >
      ✕
    </button>
    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
      Photo attached
    </div>
  </div>
);
