import { forwardRef } from 'react';
import { Heart, Music, Sparkles } from 'lucide-react';
import { Theme } from '@/lib/themes';
import { DedicationData, SongData } from '@/lib/dedicationStore';

interface StoryCardProps {
  data: DedicationData;
  theme: Theme;
  songData: SongData | null;
}

// Instagram Story optimized card (9:16 aspect ratio - fits perfectly in Instagram story frame)
// Uses inline styles for html2canvas compatibility
const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ data, theme, songData }, ref) => {
    const messageLength = data.message.length;
    
    // Responsive text sizing based on message length
    const getMessageStyles = () => {
      if (messageLength <= 50) {
        return { fontSize: '18px', lineHeight: '1.6', truncateAt: 80 };
      } else if (messageLength <= 100) {
        return { fontSize: '16px', lineHeight: '1.5', truncateAt: 120 };
      } else if (messageLength <= 200) {
        return { fontSize: '14px', lineHeight: '1.5', truncateAt: 200 };
      } else if (messageLength <= 300) {
        return { fontSize: '13px', lineHeight: '1.4', truncateAt: 280 };
      } else {
        return { fontSize: '12px', lineHeight: '1.4', truncateAt: 350 };
      }
    };

    const messageStyles = getMessageStyles();
    const truncatedMessage = data.message.length > messageStyles.truncateAt 
      ? data.message.substring(0, messageStyles.truncateAt) + '...' 
      : data.message;

    // Theme-based gradient backgrounds - inline CSS for html2canvas
    const getGradientStyle = () => {
      switch (theme.id) {
        case 'crush':
          return 'linear-gradient(135deg, #fda4af 0%, #f472b6 50%, #d946ef 100%)';
        case 'partner':
          return 'linear-gradient(135deg, #f87171 0%, #fb7185 50%, #ec4899 100%)';
        case 'friend':
          return 'linear-gradient(135deg, #67e8f9 0%, #38bdf8 50%, #3b82f6 100%)';
        case 'bestfriend':
          return 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #6366f1 100%)';
        case 'parents':
          return 'linear-gradient(135deg, #6ee7b7 0%, #2dd4bf 50%, #22c55e 100%)';
        case 'relative':
          return 'linear-gradient(135deg, #fcd34d 0%, #fb923c 50%, #f87171 100%)';
        case 'special':
          return 'linear-gradient(135deg, #f9a8d4 0%, #c084fc 50%, #6366f1 100%)';
        default:
          return 'linear-gradient(135deg, #f472b6 0%, #f43f5e 50%, #ec4899 100%)';
      }
    };

    return (
      <div
        ref={ref}
        style={{
          width: '360px',
          height: '640px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          background: getGradientStyle(),
        }}
      >
        {/* Decorative circles - solid colors for html2canvas */}
        <div style={{
          position: 'absolute',
          top: '48px',
          left: '16px',
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '96px',
          right: '32px',
          width: '140px',
          height: '140px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          top: '33%',
          right: '16px',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
        }} />

        {/* Floating decorative elements */}
        <div style={{ position: 'absolute', top: '64px', right: '32px' }}>
          <Sparkles style={{ width: '24px', height: '24px', color: 'rgba(255, 255, 255, 0.3)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '144px', left: '24px' }}>
          <Heart style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.25)' }} fill="currentColor" />
        </div>

        {/* Main content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}>
          {/* Top badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
              }} />
              <span style={{
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.05em',
              }}>
                Someone sent you a note
              </span>
              <div style={{
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
              }} />
            </div>
          </div>

          {/* Photo section (if available) */}
          {data.photoUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}>
                  <img 
                    src={data.photoUrl} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}>
                  <Heart style={{ width: '10px', height: '10px', color: '#f43f5e' }} fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* Recipient name */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '12px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '8px',
          }}>
            <div style={{
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <span style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>For</span>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                margin: 0,
              }}>
                {data.recipientName}
              </h2>
              <span style={{ fontSize: '18px' }}>{theme.emoji}</span>
            </div>
          </div>

          {/* Message card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
            <div style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Quotation marks */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: '30px',
                color: '#fbcfe8',
                fontFamily: 'Georgia, serif',
                lineHeight: 1,
              }}>"</div>
              <p style={{
                color: '#1f2937',
                textAlign: 'center',
                fontWeight: '500',
                padding: '0 16px',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: messageStyles.fontSize,
                lineHeight: messageStyles.lineHeight,
                margin: 0,
              }}>
                {truncatedMessage}
              </p>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                fontSize: '30px',
                color: '#fbcfe8',
                fontFamily: 'Georgia, serif',
                lineHeight: 1,
              }}>"</div>
            </div>
            
            {/* Song info with album cover */}
            {songData?.title && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(229, 231, 235, 0.6)',
                flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(90deg, #fdf2f8 0%, #faf5ff 100%)',
                  borderRadius: '8px',
                  padding: '8px',
                }}>
                  {/* Album cover */}
                  {songData.albumCover ? (
                    <img 
                      src={songData.albumCover} 
                      alt={songData.album || 'Album'}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        flexShrink: 0,
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      flexShrink: 0,
                    }}>
                      <Music style={{ width: '16px', height: '16px', color: 'white' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#1f2937',
                      fontSize: '11px',
                      fontWeight: '600',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{songData.title}</p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '9px',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{songData.artist}</p>
                  </div>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#ec4899',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid white',
                      borderTop: '3px solid transparent',
                      borderBottom: '3px solid transparent',
                      marginLeft: '2px',
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* From section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            marginTop: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'white',
            }}>
              <Heart style={{ width: '10px', height: '10px' }} fill="currentColor" />
              <span style={{ fontSize: '11px', fontWeight: '500' }}>
                {data.isAnonymous ? 'From someone special 🎭' : `From ${data.senderName}`}
              </span>
              <Heart style={{ width: '10px', height: '10px' }} fill="currentColor" />
            </div>
          </div>

          {/* Bottom branding */}
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <img 
              src="/logo.png" 
              alt="Just a Note" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
              crossOrigin="anonymous"
            />
            <div>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}>Just a Note</span>
              <span style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '9px',
                marginLeft: '4px',
              }}>justanot.me</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StoryCard.displayName = 'StoryCard';

export default StoryCard;
