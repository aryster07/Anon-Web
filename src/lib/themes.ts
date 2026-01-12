export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgClass: string;
  primaryClass: string;
  gradientClass: string;
  accentClass: string;
  cardBgClass: string;
}

export const themes: Theme[] = [
  {
    id: 'crush',
    name: 'Crush',
    emoji: '💘',
    description: 'For your secret admirer moments',
    bgClass: 'bg-pink-50',
    primaryClass: 'text-pink-500',
    gradientClass: 'from-pink-400 via-rose-400 to-pink-500',
    accentClass: 'bg-pink-500',
    cardBgClass: 'bg-gradient-to-br from-pink-100 to-rose-100',
  },
  {
    id: 'partner',
    name: 'Partner',
    emoji: '💕',
    description: 'For your significant other',
    bgClass: 'bg-red-50',
    primaryClass: 'text-red-500',
    gradientClass: 'from-red-400 via-rose-400 to-red-500',
    accentClass: 'bg-red-500',
    cardBgClass: 'bg-gradient-to-br from-red-100 to-rose-100',
  },
  {
    id: 'friend',
    name: 'Friend',
    emoji: '👋',
    description: 'For your amazing friends',
    bgClass: 'bg-cyan-50',
    primaryClass: 'text-cyan-500',
    gradientClass: 'from-cyan-400 via-blue-400 to-cyan-500',
    accentClass: 'bg-cyan-500',
    cardBgClass: 'bg-gradient-to-br from-cyan-100 to-blue-100',
  },
  {
    id: 'bestfriend',
    name: 'Best Friend',
    emoji: '⭐',
    description: 'For your ride or die',
    bgClass: 'bg-violet-50',
    primaryClass: 'text-violet-500',
    gradientClass: 'from-violet-400 via-purple-400 to-violet-500',
    accentClass: 'bg-violet-500',
    cardBgClass: 'bg-gradient-to-br from-violet-100 to-purple-100',
  },
  {
    id: 'parents',
    name: 'Parents',
    emoji: '🏠',
    description: 'For mom & dad',
    bgClass: 'bg-emerald-50',
    primaryClass: 'text-emerald-500',
    gradientClass: 'from-emerald-400 via-green-400 to-emerald-500',
    accentClass: 'bg-emerald-500',
    cardBgClass: 'bg-gradient-to-br from-emerald-100 to-green-100',
  },
  {
    id: 'relative',
    name: 'Relative',
    emoji: '👨‍👩‍👧',
    description: 'For family bonds',
    bgClass: 'bg-amber-50',
    primaryClass: 'text-amber-500',
    gradientClass: 'from-amber-400 via-orange-400 to-amber-500',
    accentClass: 'bg-amber-500',
    cardBgClass: 'bg-gradient-to-br from-amber-100 to-orange-100',
  },
  {
    id: 'special',
    name: 'Someone Special',
    emoji: '✨',
    description: 'For anyone who matters',
    bgClass: 'bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50',
    primaryClass: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500',
    gradientClass: 'from-pink-400 via-purple-400 to-orange-400',
    accentClass: 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500',
    cardBgClass: 'bg-gradient-to-br from-pink-100 via-purple-100 to-orange-100',
  },
];

export const getThemeById = (id: string): Theme => {
  return themes.find(t => t.id === id) || themes[0];
};
