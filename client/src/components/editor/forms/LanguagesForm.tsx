import React, { useState } from 'react';
import { LanguageItem } from '../../../types/cv';
import { Plus, Trash2, Languages as LangIcon, ChevronUp, ChevronDown } from 'lucide-react';

interface LanguagesFormProps {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}

export const LanguagesForm: React.FC<LanguagesFormProps> = ({ items = [], onChange }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState('Courant (C1)');

  const levelOptions = [
    'Langue maternelle',
    'Bilingue (C2)',
    'Courant (C1)',
    'Intermédiaire supérieur (B2)',
    'Intermédiaire (B1)',
    'Notions (A2)',
    'Débutant (A1)',
  ];

  const handleAddLanguage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLanguage.trim()) return;

    const newItem: LanguageItem = {
      id: 'lang-' + Date.now(),
      language: newLanguage.trim(),
      level: newLevel,
    };

    onChange([...items, newItem]);
    setNewLanguage('');
  };

  const removeLanguage = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateLanguage = (id: string, field: keyof LanguageItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const moveLanguage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Form */}
      <form onSubmit={handleAddLanguage} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <LangIcon className="w-4 h-4 text-teal-600" />
          Ajouter une langue
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: Français, Anglais, Espagnol..."
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />

          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            className="w-full px-2.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-700 font-medium"
          >
            {levelOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!newLanguage.trim()}
          className="w-full min-h-[48px] py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Ajouter la langue
        </button>
      </form>

      {/* List of current languages */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          Aucune langue ajoutée. Ajoute tes langues ci-dessus.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs gap-3 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="text"
                  autoCapitalize="words"
                  value={item.language}
                  onChange={(e) => updateLanguage(item.id, 'language', e.target.value)}
                  className="font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 focus:outline-hidden text-xs sm:text-sm"
                />
                <select
                  value={item.level}
                  onChange={(e) => updateLanguage(item.id, 'level', e.target.value)}
                  className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-md px-2 py-1 focus:outline-hidden font-medium"
                >
                  {levelOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reorder and Delete controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveLanguage(index, 'up')}
                  aria-label={`Monter la langue ${item.language}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveLanguage(index, 'down')}
                  aria-label={`Descendre la langue ${item.language}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeLanguage(item.id)}
                  aria-label={`Supprimer la langue ${item.language}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
