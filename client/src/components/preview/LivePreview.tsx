import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, ResumeTheme, TemplateId } from '../../types/cv';
import { getTemplateById } from '../../templates';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Smartphone, Eye } from 'lucide-react';

interface LivePreviewProps {
  data: ResumeData;
  theme: ResumeTheme;
  templateId: TemplateId;
  previewElementId?: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  data,
  theme,
  templateId,
  previewElementId = 'resume-preview',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [autoFitCalculated, setAutoFitCalculated] = useState(false);
  const templateDef = getTemplateById(templateId);
  const TemplateComponent = templateDef.component;

  // Auto-fit calculation on mount / resize
  const computeFitZoom = () => {
    if (!containerRef.current) return 0.5;
    const containerWidth = containerRef.current.clientWidth;
    // A4 width is 794px at standard 96 DPI (210mm)
    // We add 32px padding margin
    const availableWidth = containerWidth - (window.innerWidth < 640 ? 24 : 48);
    const fitScale = Math.min(1.1, Math.max(0.35, availableWidth / 794));
    return Number(fitScale.toFixed(2));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile screen: auto-fit to screen width
        setZoomLevel(computeFitZoom());
      } else if (!autoFitCalculated) {
        setZoomLevel(computeFitZoom());
        setAutoFitCalculated(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.35, Number((prev + delta).toFixed(2))), 1.4));
  };

  const resetToFit = () => {
    setZoomLevel(computeFitZoom());
  };

  // A4 dimensions in px at standard screen 96 DPI: 794 x 1123
  const scaledWidth = 794 * zoomLevel;
  const scaledHeight = 1123 * zoomLevel;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-slate-200/90 rounded-2xl overflow-hidden border border-slate-300/70 shadow-inner relative"
    >
      {/* Zoom and Preview Toolbar */}
      <div className="no-print bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="font-bold text-slate-900 truncate text-[11px] sm:text-xs">
            {templateDef.name.split('—')[0]}
          </span>
          <span className="hidden xs:inline-flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
            <Eye className="w-2.5 h-2.5" />
            Rendu A4
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleZoom(-0.08)}
            title="Zoom arrière"
            className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-700 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] sm:text-[11px] font-mono px-1 min-w-[38px] sm:min-w-[42px] text-center font-bold text-slate-800">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={() => handleZoom(0.08)}
            title="Zoom avant"
            className="p-1 sm:p-1.5 hover:bg-white rounded text-slate-700 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetToFit}
            title="Ajuster automatiquement à l'écran"
            className="px-1.5 py-1 text-[10px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded ml-1 border border-teal-200 transition-colors flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Ajuster</span>
          </button>
        </div>
      </div>

      {/* Preview Sheet Container */}
      <div className="flex-1 overflow-auto p-2 sm:p-6 flex items-start justify-center">
        {/* Dynamic Wrapper Box sizing strictly to scaled dimensions to eliminate unwanted whitespace */}
        <div
          style={{
            width: `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
            position: 'relative',
          }}
          className="transition-all duration-150 my-auto"
        >
          <div
            className="origin-top-left shadow-2xl rounded-sm absolute top-0 left-0"
            style={{
              transform: `scale(${zoomLevel})`,
              width: '794px',
              minHeight: '1123px',
            }}
          >
            <TemplateComponent data={data} theme={theme} id={previewElementId} />
          </div>
        </div>
      </div>
    </div>
  );
};
