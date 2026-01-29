import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Play, Pause, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { getNote, incrementViews } from '../services/noteService';
import { VIBES, NoteData, Vibe } from '../types';

const ViewNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        const data = await getNote(id);
        if (data) {
          setNote(data);
          incrementViews(id);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();

    return () => {
      audioRef.current?.pause();
    };
  }, [id]);

  const togglePlay = () => {
    if (!note?.songData?.preview) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    } else {
      audioRef.current = new Audio(note.songData.preview);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-royal-gold" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-6">
        <div className="text-6xl">😢</div>
        <h1 className="text-2xl font-bold text-slate-900">Note not found</h1>
        <p className="text-slate-500 text-center">This note may have been removed or never existed</p>
        <Link
          to="/"
          className="mt-4 px-6 py-3 bg-royal-gold text-white font-bold rounded-full"
        >
          Create Your Own Note
        </Link>
      </div>
    );
  }

  const vibe: Vibe | undefined = VIBES.find((v) => v.id === note.vibe);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-4xl">{vibe?.emoji || '💌'}</div>
        <div className="w-6" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-md w-full">
          {/* Recipient */}
          <div className="text-center mb-8">
            <p className="text-slate-500 text-sm">A note for</p>
            <h1 className="text-3xl font-serif font-bold gold-text-gradient mt-1">
              {note.recipientName}
            </h1>
          </div>

          {/* Photo */}
          {note.photoBase64 && (
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={note.photoBase64}
                alt="Memory"
                className="w-full aspect-square object-cover"
              />
            </div>
          )}

          {/* Song player */}
          {note.song && (
            <div className="mb-8 bg-white rounded-2xl p-4 shadow-md border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={note.song.albumCover}
                    alt={note.song.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center 
                      hover:bg-black/40 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause size={24} className="text-white" fill="white" />
                    ) : (
                      <Play size={24} className="text-white" fill="white" />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{note.song.title}</p>
                  <p className="text-sm text-slate-500 truncate">{note.song.artist}</p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-royal-gold transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 mb-8">
            <MessageCircle size={24} className="text-royal-gold mb-4" />
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{note.message}</p>
          </div>

          {/* Sender */}
          <div className="text-center text-slate-500">
            {note.isAnonymous ? (
              <p className="italic">Sent anonymously with ❤️</p>
            ) : (
              <p>
                With love, <span className="font-bold text-slate-700">{note.senderName}</span>
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-gradient text-white 
                font-bold rounded-full shadow-gold-glow hover:scale-105 transition-transform"
            >
              <Heart size={20} />
              Create Your Own Note
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-400">
        Made with ❤️ by Just A Note
      </footer>
    </div>
  );
};

export default ViewNote;
