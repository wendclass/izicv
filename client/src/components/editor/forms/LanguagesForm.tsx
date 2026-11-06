import React, { useState } from 'react';
import { LanguageItem } from '../../../types/cv';
import { Plus, Trash2, Languages as LangIcon } from 'lucide-react';

interface LanguagesFormProps {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}

export const LanguagesForm: React.FC<LanguagesFormProps> = ({ items = [], onChange }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState('Courant (C1/C2)');

  const levelOptions = [
    'Langue maternelle',
    'Bilingue (C2)',
    'Courant (C1)',
    'Intermédiaire avancé (B2)',
    'Intermédiaire (B1)',
    'Notions de base (A2)',
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

  return (
    <div className="space-y-4">
      {/* Quick Add Form */}
      <form onSubmit={handleAddLanguage} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <LangIcon className="w-3.5 h-3.5 text-teal-600" />
          Ajouter une langue
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="ex: Français, Anglais, Espagnol..."
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />

          <select
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-700"
          >
            {levelOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newLanguage.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter la langue
          </button>
        </div>
      </form>

      {/* List of current languages */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">
          Aucune langue ajoutée.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs gap-2"
            >
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={item.language}
                  onChange={(e) => updateLanguage(item.id, 'language', e.target.value)}
                  className="font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 focus:outline-hidden text-xs flex-1"
                />
                <select
                  value={item.level}
                  onChange={(e) => updateLanguage(item.id, 'level', e.target.value)}
                  className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 rounded-md px-2 py-0.5 focus:outline-hidden"
                >
                  {levelOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeLanguage(item.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
