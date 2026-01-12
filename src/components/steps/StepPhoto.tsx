import { motion } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import AnimatedButton from '@/components/AnimatedButton';
import { useDedicationStore } from '@/lib/dedicationStore';

interface StepPhotoProps {
  onNext: () => void;
}

const StepPhoto = ({ onNext }: StepPhotoProps) => {
  const { data, setPhotoUrl } = useDedicationStore();
  const [isDragging, setIsDragging] = useState(false);

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1200px on longest side)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels until under 1MB
          let quality = 0.8;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Keep reducing quality until under ~800KB (leaving room for other data)
          while (compressedDataUrl.length > 800000 && quality > 0.1) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          console.log(`Image compressed: ${file.size} bytes -> ${compressedDataUrl.length} bytes (quality: ${quality})`);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedDataUrl = await compressImage(file);
        setPhotoUrl(compressedDataUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Failed to process image. Please try a different photo.');
      }
    }
  }, [setPhotoUrl, compressImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

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
        <Camera className="w-8 h-8 text-white" />
      </motion.div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Add a photo
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        Optional but makes it extra special
      </p>

      <div className="w-full max-w-md space-y-6">
        {data.photoUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden aspect-square"
          >
            <img
              src={data.photoUrl}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setPhotoUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`
              flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}
            `}
          >
            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">Drop an image here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        )}

        <div className="flex gap-3">
          <AnimatedButton
            variant="secondary"
            onClick={onNext}
            className="flex-1"
            size="lg"
          >
            Skip
          </AnimatedButton>
          <AnimatedButton
            onClick={onNext}
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

export default StepPhoto;
