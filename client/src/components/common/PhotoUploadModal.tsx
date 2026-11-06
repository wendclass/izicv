import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, ZoomIn, Image as ImageIcon, X, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  currentZoom?: number;
  onSave: (photoUrl: string, zoom: number) => void;
  onRemove: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl = '',
  currentZoom = 1,
  onSave,
  onRemove,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(currentPhotoUrl);
  const [zoom, setZoom] = useState<number>(currentZoom || 1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Touch gesture refs
  const touchStartRef = useRef<{ dist: number; x: number; y: number; zoom: number; offX: number; offY: number }>({
    dist: 0,
    x: 0,
    y: 0,
    zoom: 1,
    offX: 0,
    offY: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setPhotoUrl(currentPhotoUrl);
      setZoom(currentZoom || 1);
      setOffset({ x: 0, y: 0 });
      setError(null);
    }
  }, [isOpen, currentPhotoUrl, currentZoom]);

  if (!isOpen) return null;

  /**
   * Compress and resize client-side to max 800px on long edge, JPEG quality ~0.82 (< 200KB)
   */
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Format non reconnu. Choisis une image au format JPG, PNG ou WebP.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setError("Impossible de lire ce fichier. Tu peux continuer ton CV sans photo.");
      setIsProcessing(false);
    };

    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        setError("Impossible de charger l'image. Tu peux continuer sans photo.");
        setIsProcessing(false);
      };

      img.onload = () => {
        try {
          const maxDimension = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setPhotoUrl(src);
            setIsProcessing(false);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG at 0.82 quality for crisp display under 150-200 KB
          let compressed = canvas.toDataURL('image/jpeg', 0.82);

          // If still over ~250KB, compress with slightly lower quality
          if (compressed.length > 350000) {
            compressed = canvas.toDataURL('image/jpeg', 0.70);
          }

          setPhotoUrl(compressed);
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        } catch {
          // Fallback to original src if canvas fails
          setPhotoUrl(src);
        } finally {
          setIsProcessing(false);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset inputs so same file can be re-selected if desired
    e.target.value = '';
  };

  // Touch gesture handlers for mobile pinch-to-zoom and drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStartRef.current.dist = dist;
      touchStartRef.current.zoom = zoom;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current.x = touch.clientX;
      touchStartRef.current.y = touch.clientY;
      touchStartRef.current.offX = offset.x;
      touchStartRef.current.offY = offset.y;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (touchStartRef.current.dist > 0) {
        const factor = dist / touchStartRef.current.dist;
        const newZoom = Math.min(Math.max(touchStartRef.current.zoom * factor, 1), 3);
        setZoom(Number(newZoom.toFixed(2)));
      }
    } else if (e.touches.length === 1) {
      // Finger drag
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      setOffset({
        x: touchStartRef.current.offX + dx,
        y: touchStartRef.current.offY + dy,
      });
    }
  };

  const handleConfirm = () => {
    onSave(photoUrl, zoom);
    onClose();
  };

  const handleClear = () => {
    setPhotoUrl('');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    onRemove();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Camera className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-sm sm:text-base">Photo de profil</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-teal-800">
              Compression et optimisation de la photo en cours...
            </p>
          </div>
        )}

        {/* Photo Preview & Controls */}
        {photoUrl ? (
          <div className="space-y-4">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="flex justify-center py-2 touch-none select-none"
            >
              <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-teal-500/30 shadow-inner bg-slate-100 flex items-center justify-center cursor-move">
                <img
                  src={photoUrl}
                  alt="Aperçu photo"
                  className="w-full h-full object-cover transition-transform"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  }}
                  draggable={false}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Pince pour zoomer ou déplace avec le doigt pour centrer ton visage.
            </p>

            {/* Zoom Slider */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                  Niveau de zoom
                </span>
                <span className="text-slate-500 font-mono font-bold">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2"
              />
            </div>

            {/* Photo replacement buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[44px] py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Reprendre photo</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="min-h-[44px] py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>Autre image</span>
              </button>
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold py-2 px-3 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer la photo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Take Photo with Device Camera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[80px] p-4 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-900">Prendre une photo</p>
                  <p className="text-[10px] text-teal-700 mt-0.5">Avec l'appareil photo</p>
                </div>
              </button>

              {/* Option 2: Choose from Gallery */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="min-h-[80px] p-4 border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-teal-100 text-slate-500 group-hover:text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900">Choisir dans la galerie</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG ou WebP</p>
                </div>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Ta photo est automatiquement allégée et optimisée pour ton CV.
            </p>
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
