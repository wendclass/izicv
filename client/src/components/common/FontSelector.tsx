import React, { useState } from 'react';
import { FONT_OPTIONS } from '../../data/sampleData';
import { FontFamilyId } from '../../types/cv';
import { Type, Check } from 'lucide-react';

interface FontSelectorProps {
  currentFont: FontFamilyId;
  onChange: (font: FontFamilyId) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ currentFont, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = FONT_OPTIONS.find((f) => f.id === currentFont) || FONT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-2xs"
        title="Changer la police d'écriture"
      >
        <Type className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">{activeOption.name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Police typographique
            </div>
            {FONT_OPTIONS.map((font) => {
              const isSelected = currentFont === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => {
                    onChange(font.id as FontFamilyId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <span>{font.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
