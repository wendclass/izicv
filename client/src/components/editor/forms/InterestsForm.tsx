import React, { useState } from 'react';
import { InterestItem } from '../../../types/cv';
import { Plus, X, Heart } from 'lucide-react';

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

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="ex: Photographie, Semi-marathon, Bénévolat..."
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!newInterest.trim()}
          className="inline-flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">
          Aucun centre d'intérêt renseigné.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-full text-xs font-medium"
            >
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => removeInterest(item.id)}
                className="text-slate-400 hover:text-rose-600 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
