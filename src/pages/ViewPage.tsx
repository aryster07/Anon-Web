import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Gift, Play, Pause, Heart, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AnimatedButton from '@/components/AnimatedButton';
import FloatingHearts from '@/components/FloatingHearts';
import { getThemeById, Theme } from '@/lib/themes';
import { DedicationData, SongData } from '@/lib/dedicationStore';
import { getDedication, incrementViews } from '@/lib/firebase';
import { recordView, getSenderEmail } from '@/lib/adminService';
import { sendViewedNotification } from '@/lib/emailService';
import { cn } from '@/lib/utils';

type ViewStage = 'intro' | 'reveal';

const ViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [stage, setStage] = useState<ViewStage>('intro');
  const [data, setData] = useState<DedicationData | null>(null);
  const [theme, setTheme] = useState<Theme>(getThemeById('crush'));
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [hasNotifiedView, setHasNotifiedView] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parseSongData = (dedication: DedicationData) => {
    if (dedication.songUrl) {
      try {
        const parsed = JSON.parse(dedication.songUrl);
        setSongData(parsed);
      } catch {
        setSongData({ url: dedication.songUrl });
      }
    }
  };

  // Notify sender when recipient opens the dedication
  const notifySenderOfView = async () => {
    if (!id || id === 'demo' || hasNotifiedView) return;
    
    try {
      // Record the view in Firebase
      await recordView(id);
      
      // Get sender email and send notification
      const senderEmail = await getSenderEmail(id);
      if (senderEmail && data?.recipientName) {
        const viewLink = window.location.href;
        await sendViewedNotification(senderEmail, data.recipientName, viewLink);
      }
      
      setHasNotifiedView(true);
    } catch (error) {
      console.error('Failed to notify sender:', error);
    }
  };

  useEffect(() => {
    const loadDedication = async () => {
      setIsLoading(true);
      
      if (id && id !== 'demo') {
        // First try Firebase (short IDs like "Abc123xy")
        if (id.length <= 12) {
          const firebaseData = await getDedication(id);
          if (firebaseData) {
            setData(firebaseData);
            setTheme(getThemeById(firebaseData.themeId));
            parseSongData(firebaseData);
            // Increment view count
            incrementViews(id);
            setIsLoading(false);
            return;
          }
          
          // Try localStorage backup for short IDs
          try {
            const localData = localStorage.getItem(`dedication_${id}`);
            if (localData) {
              const parsedData = JSON.parse(localData) as DedicationData;
              setData(parsedData);
              setTheme(getThemeById(parsedData.themeId));
              parseSongData(parsedData);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Could not read from localStorage:', e);
          }
        }
        
        // Try base64 decode (legacy URLs)
        try {
          let base64 = id.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const decoded = atob(base64);
          const parsedData = JSON.parse(decoded) as DedicationData;
          if (parsedData.recipientName && parsedData.message) {
            setData(parsedData);
            setTheme(getThemeById(parsedData.themeId));
            parseSongData(parsedData);
            setIsLoading(false);
            return;
          }
        } catch {
          // Try sessionStorage
        }
      }

      // Try sessionStorage
      const storedData = sessionStorage.getItem('dedication');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData) as DedicationData;
          setData(parsedData);
          setTheme(getThemeById(parsedData.themeId));
          parseSongData(parsedData);
          setIsLoading(false);
          return;
        } catch {
          // Show error
        }
      }
      
      if (id && id !== 'demo') {
        setLoadError(true);
      } else {
        // Demo data
        const demoData: DedicationData = {
          recipientName: 'Sarah',
          themeId: 'crush',
          songUrl: 'https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8',
          message: 'Every time I see you, my heart skips a beat. You make my days brighter just by being you. I never knew someone could mean so much to me until I met you. 💕',
          photoUrl: null,
          isAnonymous: true,
          senderName: '',
          deliveryMethod: 'self',
          recipientInstagram: '',
          senderEmail: '',
        };
        setData(demoData);
        setSongData({ url: demoData.songUrl });
      }
      setIsLoading(false);
    };
    
    loadDedication();
  }, [id]);

  const handleOpen = () => {
    setStage('reveal');
    
    // Notify sender that recipient opened the dedication
    notifySenderOfView();
    
    setTimeout(() => {
      setShowFullMessage(true);
      // Note: For YouTube songs, playback starts when the iframe loads with autoplay
      // For legacy audio preview (if no YouTube), use audio element
      if (songData?.preview && !songData.youtubeVideoId) {
        audioRef.current = new Audio(songData.preview);
        if (songData.startTime && songData.startTime > 0) {
          audioRef.current.currentTime = songData.startTime;
        }
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
        setIsPlaying(true);
      } else if (songData?.youtubeVideoId) {
        // YouTube will autoplay via iframe
        setIsPlaying(true);
      }
    }, 800);
  };

  const togglePlay = () => {
    // For YouTube, we can't easily toggle - it's in an iframe
    if (songData?.youtubeVideoId) {
      // Toggle visual state - actual control is via iframe
      setIsPlaying(!isPlaying);
      return;
    }
    
    if (!songData?.preview) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(songData.preview);
        if (songData.startTime && songData.startTime > 0) {
          audioRef.current.currentTime = songData.startTime;
        }
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getSpotifyEmbedUrl = (url: string) => {
    if (url.includes('spotify.com/track/')) {
      const trackId = url.split('track/')[1]?.split('?')[0];
      if (trackId) return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    }
    return null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      let videoId = '';
      let startTime = 0;
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
        // Check for timestamp in URL
        const timeMatch = url.match(/[?&]t=(\d+)/);
        if (timeMatch) {
          startTime = parseInt(timeMatch[1]);
        }
      } else {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        const timeMatch = url.match(/[?&]t=(\d+)/);
        if (timeMatch) {
          startTime = parseInt(timeMatch[1]);
        }
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full mb-4"
        />
        <p className="text-gray-500">Loading your dedication...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dedication Not Found</h1>
        <p className="text-gray-500 mb-6 text-center">This dedication link may be invalid or expired.</p>
        <AnimatedButton onClick={() => navigate('/create')} size="lg">
          Create Your Own 💕
        </AnimatedButton>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full"
        />
      </div>
    );
  }

  const spotifyEmbed = songData?.url ? getSpotifyEmbedUrl(songData.url) : null;
  const youtubeEmbed = songData?.url ? getYouTubeEmbedUrl(songData.url) : null;
  const hasCustomSong = (songData?.videoId || songData?.youtubeVideoId || songData?.preview || songData?.type === 'spotify') && (songData?.title || songData?.type === 'youtube' || songData?.type === 'spotify');
  
  // Generate Spotify embed URL from stored data
  const getSpotifyClipEmbed = () => {
    if (songData?.type === 'spotify' && songData?.trackId) {
      return `https://open.spotify.com/embed/track/${songData.trackId}?utm_source=generator&theme=0`;
    }
    return null;
  };
  
  // Generate YouTube embed URL from stored clip data
  const getYouTubeClipEmbed = () => {
    // New format: type: 'youtube' with videoId and startTime
    if (songData?.type === 'youtube' && songData?.videoId) {
      const start = songData.startTime || 0;
      return `https://www.youtube.com/embed/${songData.videoId}?start=${start}&autoplay=1&modestbranding=1`;
    }
    // Legacy format: youtubeVideoId
    if (songData?.youtubeVideoId) {
      const start = songData.youtubeStartTime || 0;
      return `https://www.youtube.com/embed/${songData.youtubeVideoId}?start=${start}&autoplay=1&modestbranding=1`;
    }
    return null;
  };
  
  const spotifyClipEmbed = getSpotifyClipEmbed();
  const youtubeClipEmbed = getYouTubeClipEmbed();
  const isYouTubeType = songData?.type === 'youtube' || songData?.youtubeVideoId;
  const isSpotifyType = songData?.type === 'spotify';

  return (
    <div className={cn(
      'min-h-screen transition-all duration-1000 overflow-hidden',
      stage === 'intro' ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : theme.bgClass
    )}>
      <AnimatePresence mode="wait">
        {stage === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 relative"
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%` 
                  }}
                  animate={{ 
                    y: [0, -100],
                    opacity: [0.2, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

            {/* Gift box animation */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotateZ: [-2, 2, -2]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-8"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-pink-400 via-rose-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl">
                <Gift className="w-14 h-14 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-1 -left-2"
              >
                <Sparkles className="w-5 h-5 text-pink-300" />
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-pink-200 text-sm mb-2"
            >
              ✨ A special surprise awaits ✨
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold text-white text-center mb-4"
            >
              Someone made this
              <br />
              <span className="bg-gradient-to-r from-pink-300 via-rose-300 to-orange-300 bg-clip-text text-transparent">
                just for you
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-center mb-10 max-w-sm"
            >
              A heartfelt dedication with music and love is waiting inside
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <AnimatedButton
                variant="landing"
                size="lg"
                onClick={handleOpen}
                className="group px-10"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Open Your Gift
              </AnimatedButton>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen py-8 px-4 relative"
          >
            <FloatingHearts />
            
            <div className="max-w-md mx-auto">
              {/* Photo Section - Top (Polaroid style) */}
              {data.photoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: -3 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-8 mx-auto w-fit"
                >
                  <div className="bg-white p-3 pb-12 rounded-sm shadow-2xl">
                    <img
                      src={data.photoUrl}
                      alt={data.recipientName}
                      className="w-64 h-64 object-cover"
                    />
                    <p className="absolute bottom-3 left-0 right-0 text-center text-gray-600 text-sm">
                      For {data.recipientName} 💕
                    </p>
                  </div>
                  {/* Decorative tape */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-5 bg-yellow-200/90 rotate-3 shadow-sm" />
                </motion.div>
              )}

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <div className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm mb-3',
                  theme.accentClass
                )}>
                  <span>{theme.emoji}</span>
                  <span>A {theme.name} Dedication</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  For <span className={theme.primaryClass}>{data.recipientName}</span>
                </h1>
              </motion.div>

              {/* Music Player - Vinyl Style */}
              {(hasCustomSong || spotifyEmbed || youtubeEmbed) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                    <p className="text-center text-gray-500 text-sm mb-4">🎵 A song for you 🎵</p>
                    
                    {(youtubeClipEmbed || isYouTubeType) ? (
                      <>
                        {/* YouTube Clip Player */}
                        <div className="relative">
                          {/* Album art and info above the player (if available) */}
                          {songData?.albumCover && (
                            <div className="flex items-center gap-4 mb-4">
                              <img 
                                src={songData.albumCover} 
                                alt={songData.title || 'Album'} 
                                className="w-16 h-16 rounded-xl shadow-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{songData?.title}</p>
                                <p className="text-sm text-gray-500 truncate">{songData?.artist}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* YouTube Player */}
                          <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                            <iframe
                              src={youtubeClipEmbed || ''}
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              className="rounded-xl"
                            />
                          </div>
                          
                          {/* Music Visualizer Bars */}
                          <div className="flex items-end justify-center gap-1 mt-4 h-8">
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className={cn('w-1 rounded-full', theme.accentClass)}
                                animate={isPlaying ? {
                                  height: [8, 20 + Math.random() * 12, 8],
                                } : { height: 8 }}
                                transition={{
                                  duration: 0.4 + Math.random() * 0.3,
                                  repeat: Infinity,
                                  delay: i * 0.05,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    ) : hasCustomSong ? (
                      <>
                        {/* Custom Vinyl Player (legacy audio preview) */}
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          {/* Vinyl Record */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl"
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            {/* Vinyl grooves */}
                            {[2, 4, 6, 8, 10].map(i => (
                              <div key={i} className={`absolute inset-${i} rounded-full border border-gray-700/30`} style={{ inset: `${i * 4}px` }} />
                            ))}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                            
                            {/* Center - Album Art */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full shadow-inner overflow-hidden">
                              {songData?.albumCover ? (
                                <img src={songData.albumCover} alt="Album" className="w-full h-full object-cover" />
                              ) : (
                                <div className={cn("w-full h-full", theme.accentClass)} />
                              )}
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-900" />
                          </motion.div>

                          {/* Play button overlay */}
                          <button
                            onClick={togglePlay}
                            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors z-10"
                          >
                            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-opacity">
                              {isPlaying ? (
                                <Pause className="w-7 h-7 text-gray-900" />
                              ) : (
                                <Play className="w-7 h-7 text-gray-900 ml-1" />
                              )}
                            </div>
                          </button>

                          {/* Glow */}
                          <div className={cn("absolute inset-0 rounded-full blur-xl opacity-30 -z-10", theme.accentClass)} />
                        </div>

                        {/* Song Info */}
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">{songData?.title}</p>
                          <p className="text-sm text-gray-500">{songData?.artist}</p>
                        </div>

                        {/* Music Visualizer Bars */}
                        <div className="flex items-end justify-center gap-1 mt-4 h-8">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              className={cn('w-1 rounded-full', theme.accentClass)}
                              animate={isPlaying ? {
                                height: [8, 20 + Math.random() * 12, 8],
                              } : { height: 8 }}
                              transition={{
                                duration: 0.4 + Math.random() * 0.3,
                                repeat: Infinity,
                                delay: i * 0.05,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (isSpotifyType || spotifyClipEmbed) ? (
                      <div className="rounded-xl overflow-hidden">
                        <iframe
                          src={spotifyClipEmbed || spotifyEmbed || ''}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-xl"
                        />
                      </div>
                    ) : youtubeEmbed ? (
                      <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                          src={youtubeEmbed}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-xl"
                        />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}

              {/* Message - Note Style */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateZ: -2 }}
                animate={{ 
                  opacity: showFullMessage ? 1 : 0, 
                  y: showFullMessage ? 0 : 30, 
                  rotateZ: showFullMessage ? 1 : -2 
                }}
                transition={{ delay: 0.7, type: "spring" }}
                className="relative mb-8"
              >
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-yellow-200/50 relative overflow-hidden">
                  {/* Paper lines */}
                  <div className="absolute inset-x-6 top-6 bottom-6 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="border-b border-blue-200/30 h-7" />
                    ))}
                  </div>
                  
                  {/* Red margin */}
                  <div className="absolute left-10 top-0 bottom-0 w-px bg-red-300/50" />
                  
                  <div className="relative z-10">
                    <p className="text-gray-700 text-lg leading-relaxed pl-6 whitespace-pre-wrap">
                      "{data.message}"
                    </p>
                  </div>
                  
                  {/* Pin */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-400 rounded-full shadow-lg border-2 border-red-300">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Sender */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showFullMessage ? 1 : 0 }}
                transition={{ delay: 1 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur rounded-full shadow-md">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-gray-600">
                    From: {data.isAnonymous ? (
                      <span className="font-semibold">Someone who cares 🎭</span>
                    ) : (
                      <span className="font-semibold">{data.senderName}</span>
                    )}
                  </span>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showFullMessage ? 1 : 0, y: showFullMessage ? 0 : 20 }}
                transition={{ delay: 1.2 }}
                className="text-center pb-8"
              >
                <p className="text-gray-500 text-sm mb-4">Want to make someone's day too?</p>
                <AnimatedButton
                  onClick={() => navigate('/create')}
                  size="lg"
                  className="group"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Your Own
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </AnimatedButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewPage;
