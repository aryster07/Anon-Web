import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, Play, Pause, X, Loader2, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { searchSongs, getPopularSongs, Song, formatDuration } from '@/lib/songService';
import { cn } from '@/lib/utils';

interface SongSearchProps {
  onSelectSong: (song: Song) => void;
  selectedSong?: Song | null;
  onClear?: () => void;
}

const SongSearch = ({ onSelectSong, selectedSong, onClear }: SongSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Preview states
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load popular songs on mount
  useEffect(() => {
    const loadPopular = async () => {
      try {
        const songs = await getPopularSongs();
        setPopularSongs(songs);
      } catch (err) {
        console.error('Failed to load popular songs:', err);
      }
    };
    loadPopular();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const songs = await searchSongs(query);
        setResults(songs);
        if (songs.length === 0) {
          setError(`No results for "${query}"`);
        }
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  // Click/touch outside to close - improved for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Setup preview audio when song is selected
  useEffect(() => {
    if (selectedSong?.preview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      
      const audio = new Audio(selectedSong.preview);
      audio.volume = 0.6;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 30);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('ended', () => {
        setIsPreviewPlaying(false);
        setCurrentTime(0);
      });
      
      previewAudioRef.current = audio;
    }
    
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, [selectedSong?.id]);

  const handlePlay = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (playingId === song.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (song.preview) {
      audioRef.current = new Audio(song.preview);
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {
        setPlayingId(null);
      });
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(song.id);
    }
  };

  const handleSelect = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    onSelectSong(song);
    setShowResults(false);
    setQuery('');
  };

  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setIsPreviewPlaying(false);
    setCurrentTime(0);
    setDuration(30);
    onClear?.();
  };

  const handlePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.play().catch(() => {
        setIsPreviewPlaying(false);
      });
      setIsPreviewPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const displaySongs = query.trim() ? results : popularSongs;
  const showDropdown = showResults && (displaySongs.length > 0 || isSearching || error);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Selected Song Card */}
      {selectedSong ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-50 via-white to-orange-50 rounded-2xl border border-pink-200/50 overflow-hidden"
        >
          {/* Song Header */}
          <div className="p-4 flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedSong.albumCover}
                alt={selectedSong.album}
                className="w-16 h-16 rounded-xl object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=🎵';
                }}
              />
              <motion.div
                animate={isPreviewPlaying ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Music className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{selectedSong.title}</p>
              <p className="text-sm text-gray-500 truncate">{selectedSong.artist}</p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Preview Player - Full 30 seconds */}
          {selectedSong.preview && (
            <div className="px-4 pb-4 space-y-3">
              {/* Progress bar with waveform */}
              <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden">
                {/* Waveform visualization */}
                <div className="absolute inset-0 flex items-center justify-around px-1">
                  {[...Array(50)].map((_, i) => {
                    const height = 30 + Math.sin(i * 0.4) * 20 + Math.sin(i * 0.8) * 10;
                    const barProgress = (i / 50) * 100;
                    const isPlayed = barProgress <= progress;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "w-0.5 rounded-full transition-colors duration-100",
                          isPlayed 
                            ? "bg-gradient-to-t from-pink-500 to-orange-400" 
                            : "bg-gray-300"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviewPlay}
                  className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  {isPreviewPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                  <p className="text-xs text-gray-400">30 sec preview</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                🎵 This 30-second preview will play for your recipient
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search for a song..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors text-base"
              aria-label="Search for a song"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 animate-spin pointer-events-none" />
            )}
          </div>

          {/* Search Results / Popular Songs */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[60vh] sm:max-h-96 overflow-y-auto"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Header */}
                {!query.trim() && popularSongs.length > 0 && (
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-orange-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      Popular Songs
                    </div>
                  </div>
                )}

                {/* Loading */}
                {isSearching && (
                  <div className="p-6 text-center">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                )}

                {/* Error */}
                {error && !isSearching && (
                  <div className="p-6 text-center">
                    <Music className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">{error}</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}

                {/* Song List */}
                {!isSearching && !error && displaySongs.map((song, index) => (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelect(song)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 hover:bg-pink-50 transition-colors text-left",
                      index !== displaySongs.length - 1 && "border-b border-gray-100"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={song.albumCover}
                        alt={song.album}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=🎵';
                        }}
                      />
                      {song.preview && (
                        <button
                          onClick={(e) => handlePlay(song, e)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                        >
                          {playingId === song.id ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                      )}
                      {playingId === song.id && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm">{song.title}</p>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default SongSearch;
