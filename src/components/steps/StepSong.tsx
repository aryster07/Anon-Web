import { motion } from 'framer-motion';
import { Music, Link2, Disc3, Clock, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import SongSearch from '@/components/SongSearch';
import { useDedicationStore } from '@/lib/dedicationStore';
import { Song } from '@/lib/songService';
import { cn } from '@/lib/utils';

interface StepSongProps {
  onNext: () => void;
}

// Platform detection
type Platform = 'youtube' | 'youtube-music' | 'spotify' | 'unknown';

const StepSong = ({ onNext }: StepSongProps) => {
  const { data, setSongUrl } = useDedicationStore();
  const [mode, setMode] = useState<'search' | 'link'>('search');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [startMinutes, setStartMinutes] = useState(0);
  const [startSeconds, setStartSeconds] = useState(0);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    const songData = JSON.stringify({
      type: 'itunes',
      title: song.title,
      artist: song.artist,
      albumCover: song.albumCover,
      preview: song.preview,
      id: song.id,
    });
    setSongUrl(songData);
  };

  const handleClearSong = () => {
    setSelectedSong(null);
    setSongUrl('');
  };

  // Detect platform from URL
  const detectPlatform = (url: string): Platform => {
    if (url.includes('music.youtube.com')) return 'youtube-music';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    return 'unknown';
  };

  // Extract video ID from YouTube/YT Music URLs
  const getVideoId = (url: string): string => {
    // YouTube Music: music.youtube.com/watch?v=xxx
    if (url.includes('music.youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || '';
    }
    // Regular YouTube: youtube.com/watch?v=xxx
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || '';
    }
    // Short YouTube: youtu.be/xxx
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return '';
  };

  // Extract Spotify track ID
  const getSpotifyTrackId = (url: string): string => {
    if (url.includes('spotify.com/track/')) {
      return url.split('track/')[1]?.split('?')[0] || '';
    }
    return '';
  };

  const handleLinkChange = (url: string) => {
    setLinkUrl(url);
    
    // Extract existing timestamp if present
    const timeMatch = url.match(/[?&]t=(\d+)/);
    if (timeMatch) {
      const totalSecs = parseInt(timeMatch[1]);
      setStartMinutes(Math.floor(totalSecs / 60));
      setStartSeconds(totalSecs % 60);
    }
  };

  const platform = detectPlatform(linkUrl);
  const videoId = getVideoId(linkUrl);
  const spotifyId = getSpotifyTrackId(linkUrl);
  const totalStartTime = startMinutes * 60 + startSeconds;
  const canChooseTime = platform === 'youtube' || platform === 'youtube-music';

  // Save link data
  const saveLinkData = () => {
    if (platform === 'youtube' || platform === 'youtube-music') {
      if (videoId) {
        const songData = JSON.stringify({
          type: 'youtube',
          platform: platform,
          videoId: videoId,
          startTime: totalStartTime,
          endTime: totalStartTime + 30,
          url: linkUrl,
        });
        setSongUrl(songData);
      }
    } else if (platform === 'spotify' && spotifyId) {
      const songData = JSON.stringify({
        type: 'spotify',
        trackId: spotifyId,
        url: linkUrl,
      });
      setSongUrl(songData);
    }
  };

  // Update store when time changes
  useEffect(() => {
    if (mode === 'link' && (videoId || spotifyId)) {
      saveLinkData();
    }
  }, [startMinutes, startSeconds, videoId, spotifyId, linkUrl]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate embed URL
  const getEmbedUrl = () => {
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?start=${totalStartTime}`;
    }
    if (spotifyId) {
      return `https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const hasValidLink = videoId || spotifyId;
  const hasSong = mode === 'search' ? !!selectedSong : hasValidLink;

  // Platform info
  const platformInfo = {
    'youtube': { name: 'YouTube', color: 'text-red-500', bg: 'from-red-50 to-orange-50', border: 'border-red-200/50', icon: '🎬' },
    'youtube-music': { name: 'YouTube Music', color: 'text-red-600', bg: 'from-red-50 to-pink-50', border: 'border-red-200/50', icon: '🎵' },
    'spotify': { name: 'Spotify', color: 'text-green-500', bg: 'from-green-50 to-emerald-50', border: 'border-green-200/50', icon: '💚' },
    'unknown': { name: 'Unknown', color: 'text-gray-500', bg: 'from-gray-50 to-gray-100', border: 'border-gray-200/50', icon: '🔗' },
  };

  const currentPlatform = platformInfo[platform];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-8"
      >
        <Music className="w-8 h-8 text-white" />
      </motion.div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Add a song 🎵
      </h1>
      <p className="text-muted-foreground text-center mb-6">
        Search or paste a link from YouTube, YT Music, or Spotify
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setMode('search')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'search' 
              ? 'bg-white text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Disc3 className="w-4 h-4" />
          Search
        </button>
        <button
          onClick={() => setMode('link')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'link' 
              ? 'bg-white text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Link2 className="w-4 h-4" />
          Paste Link
        </button>
      </div>

      <div className="w-full max-w-md space-y-6 relative">
        {mode === 'search' ? (
          <>
            <SongSearch
              onSelectSong={handleSongSelect}
              selectedSong={selectedSong}
              onClear={handleClearSong}
            />
            <p className="text-xs text-center text-gray-400">
              💡 30-second preview • For custom clip selection, use "Paste Link"
            </p>
          </>
        ) : (
          <div className="space-y-4">
            {/* URL Input */}
            <div className="relative">
              <Link2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", hasValidLink ? currentPlatform.color : 'text-gray-400')} />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => handleLinkChange(e.target.value)}
                placeholder="Paste YouTube, YT Music, or Spotify link..."
                className={cn(
                  "w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-background transition-colors focus:outline-none",
                  hasValidLink 
                    ? `border-${platform === 'spotify' ? 'green' : 'red'}-300 focus:border-${platform === 'spotify' ? 'green' : 'red'}-400`
                    : 'border-border focus:border-primary'
                )}
                aria-label="Song URL"
              />
            </div>

            {/* Platform Badge */}
            {hasValidLink && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className={cn("text-sm font-medium", currentPlatform.color)}>
                  {currentPlatform.icon} {currentPlatform.name} detected
                </span>
                {canChooseTime && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Custom clip
                  </span>
                )}
              </motion.div>
            )}

            {/* Video/Track Preview */}
            {embedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <iframe
                  src={embedUrl}
                  width="100%"
                  height={platform === 'spotify' ? '152' : '200'}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-2xl"
                />
              </motion.div>
            )}

            {/* Time Selector - Only for YouTube/YT Music */}
            {canChooseTime && videoId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={cn("rounded-2xl p-5 border bg-gradient-to-r", currentPlatform.bg, currentPlatform.border)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className={cn("w-5 h-5", currentPlatform.color)} />
                  <span className="font-semibold text-gray-800">Choose your 30-second clip</span>
                </div>

                {/* Time Input */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex flex-col items-center">
                    <label className="text-xs text-gray-500 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={startMinutes}
                      onChange={(e) => setStartMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className={cn("w-16 h-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none", 
                        platform === 'spotify' ? 'focus:border-green-400' : 'focus:border-red-400'
                      )}
                    />
                  </div>
                  <span className="text-2xl font-bold text-gray-400 mt-5">:</span>
                  <div className="flex flex-col items-center">
                    <label className="text-xs text-gray-500 mb-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={startSeconds}
                      onChange={(e) => setStartSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className={cn("w-16 h-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none",
                        platform === 'spotify' ? 'focus:border-green-400' : 'focus:border-red-400'
                      )}
                    />
                  </div>
                </div>

                {/* Visual indicator */}
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Clip plays from</span>
                    <span className={cn("font-bold", currentPlatform.color)}>
                      {formatTime(totalStartTime)} → {formatTime(totalStartTime + 30)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  🎬 Watch the preview above to find the perfect moment
                </p>
              </motion.div>
            )}

            {/* Spotify notice */}
            {platform === 'spotify' && spotifyId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 rounded-xl p-4 border border-green-200/50 text-center"
              >
                <p className="text-sm text-green-700">
                  💚 Spotify plays a 30-second preview (Spotify's limitation)
                </p>
              </motion.div>
            )}

            {/* Empty state */}
            {!hasValidLink && (
              <div className="text-center py-6">
                <div className="flex justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💚</span>
                  </div>
                </div>
                <p className="text-gray-500 font-medium">Paste a link from:</p>
                <p className="text-sm text-gray-400 mt-1">
                  YouTube • YouTube Music • Spotify
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  🎯 YouTube/YT Music = Choose any 30 seconds<br/>
                  Spotify = 30-sec preview
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <AnimatedButton
            variant="secondary"
            onClick={onNext}
            className="flex-1"
            size="lg"
          >
            Skip
          </AnimatedButton>
          <AnimatedButton
            onClick={() => {
              if (mode === 'link') {
                saveLinkData();
              }
              onNext();
            }}
            disabled={!hasSong}
            className="flex-1"
            size="lg"
          >
            Continue
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
};

export default StepSong;
