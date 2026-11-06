import React from 'react';
import { ReferenceItem } from '../../../types/cv';
import { Plus, Trash2, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';

interface ReferencesFormProps {
  items: ReferenceItem[];
  onChange: (items: ReferenceItem[]) => void;
}

export const ReferencesForm: React.FC<ReferencesFormProps> = ({ items = [], onChange }) => {
  const addItem = () => {
    const newItem: ReferenceItem = {
      id: 'ref-' + Date.now(),
      name: '',
      role: '',
      company: '',
      phone: '',
      email: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ReferenceItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
          <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Aucune référence professionnelle ajoutée.</p>
          <button
            type="button"
            onClick={addItem}
            className="w-full max-w-xs mx-auto min-h-[48px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une référence
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Référence #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    aria-label="Monter cette référence"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    aria-label="Descendre cette référence"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Supprimer cette référence"
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  autoCapitalize="words"
                  placeholder="Nom complet (ex: Sophie Martin)"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
                <input
                  type="text"
                  autoCapitalize="words"
                  placeholder="Poste / Rôle (ex: Directrice des Opérations)"
                  value={item.role}
                  onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  autoCapitalize="words"
                  placeholder="Entreprise (ex: Horizon Numérique)"
                  value={item.company}
                  onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Contact (ex: sophie@exemple.fr ou tél)"
                  value={item.email || item.phone || ''}
                  onChange={(e) => updateItem(item.id, 'email', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full min-h-[48px] py-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-800 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une référence
          </button>
        </div>
      )}
    </div>
  );
};
