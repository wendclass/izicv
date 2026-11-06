import React, { useState } from 'react';
import { InterestItem } from '../../../types/cv';
import { Plus, X, Heart, ChevronUp, ChevronDown } from 'lucide-react';

interface InterestsFormProps {
  items: InterestItem[];
  onChange: (items: InterestItem[]) => void;
}

export const InterestsForm: React.FC<InterestsFormProps> = ({ items = [], onChange }) => {
  const [newInterest, setNewInterest] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newInterest.trim()) return;

    const newItem: InterestItem = {
      id: 'int-' + Date.now(),
      name: newInterest.trim(),
    };

    onChange([...items, newItem]);
    setNewInterest('');
  };

  const removeInterest = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const moveInterest = (index: number, direction: 'up' | 'down') => {
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
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          autoCapitalize="words"
          placeholder="ex: Photographie, Semi-marathon, Bénévolat..."
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!newInterest.trim()}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">
          Aucun centre d'intérêt renseigné. Ajoute tes loisirs ci-dessus.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item, index) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 shrink-0" />
              <span>{item.name}</span>
              <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveInterest(index, 'up')}
                  aria-label="Monter ce centre d'intérêt"
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveInterest(index, 'down')}
                  aria-label="Descendre ce centre d'intérêt"
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeInterest(item.id)}
                  aria-label="Supprimer ce centre d'intérêt"
                  className="p-1 text-slate-400 hover:text-rose-600 ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
