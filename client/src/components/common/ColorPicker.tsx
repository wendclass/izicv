import React, { useState } from 'react';
import { COLOR_PALETTES } from '../../data/sampleData';
import { Palette, Check } from 'lucide-react';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-2xs"
        title="Changer la couleur d'accent"
      >
        <span
          className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
          style={{ backgroundColor: currentColor }}
        />
        <span className="hidden sm:inline">Couleur</span>
        <Palette className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Couleur d'accent
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTES.map((preset) => {
                const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      onChange(preset.hex);
                    }}
                    title={preset.name}
                    className="group relative w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border border-black/10"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex input */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium shrink-0">Personnalisée :</label>
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#0d9488"
                  className="w-full text-xs font-mono uppercase px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
