import { create } from 'zustand';

export interface SongData {
  type?: 'youtube' | 'itunes' | 'spotify'; // Type of song source
  platform?: 'youtube' | 'youtube-music'; // For YouTube sources
  preview?: string;
  title?: string;
  artist?: string;
  albumCover?: string;
  id?: number;
  url?: string; // For Spotify/YouTube URLs
  startTime?: number; // Start time in seconds
  endTime?: number; // End time in seconds
  // YouTube clip data
  videoId?: string; // New format
  youtubeVideoId?: string; // Legacy
  youtubeStartTime?: number;
  youtubeEndTime?: number;
  // Spotify data
  trackId?: string;
}

export interface DedicationData {
  recipientName: string;
  themeId: string;
  songUrl: string;
  songData?: SongData;
  message: string;
  photoUrl: string | null;
  isAnonymous: boolean;
  senderName: string;
  deliveryMethod: 'self' | 'deliver';
  recipientInstagram: string;
  senderEmail: string;
  encryptedContent?: string;
  encryptedLogistics?: {
    senderEmail: string;
    recipientName: string;
    recipientInstagram: string;
  };
}

interface DedicationStore {
  data: DedicationData;
  currentStep: number;
  setRecipientName: (name: string) => void;
  setThemeId: (id: string) => void;
  setSongUrl: (url: string) => void;
  setMessage: (message: string) => void;
  setPhotoUrl: (url: string | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setSenderName: (name: string) => void;
  setDeliveryMethod: (method: 'self' | 'deliver') => void;
  setRecipientInstagram: (handle: string) => void;
  setSenderEmail: (email: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialData: DedicationData = {
  recipientName: '',
  themeId: 'crush',
  songUrl: '',
  songData: undefined,
  message: '',
  photoUrl: null,
  isAnonymous: true,
  senderName: '',
  deliveryMethod: 'self',
  recipientInstagram: '',
  senderEmail: '',
};

export const useDedicationStore = create<DedicationStore>((set) => ({
  data: initialData,
  currentStep: 1,
  setRecipientName: (name) => set((state) => ({ data: { ...state.data, recipientName: name } })),
  setThemeId: (id) => set((state) => ({ data: { ...state.data, themeId: id } })),
  setSongUrl: (url) => set((state) => ({ data: { ...state.data, songUrl: url } })),
  setMessage: (message) => set((state) => ({ data: { ...state.data, message: message } })),
  setPhotoUrl: (url) => set((state) => ({ data: { ...state.data, photoUrl: url } })),
  setIsAnonymous: (isAnonymous) => set((state) => ({ data: { ...state.data, isAnonymous } })),
  setSenderName: (name) => set((state) => ({ data: { ...state.data, senderName: name } })),
  setDeliveryMethod: (method) => set((state) => ({ data: { ...state.data, deliveryMethod: method } })),
  setRecipientInstagram: (handle) => set((state) => ({ data: { ...state.data, recipientInstagram: handle } })),
  setSenderEmail: (email) => set((state) => ({ data: { ...state.data, senderEmail: email } })),
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 8) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  reset: () => set({ data: initialData, currentStep: 1 }),
}));
