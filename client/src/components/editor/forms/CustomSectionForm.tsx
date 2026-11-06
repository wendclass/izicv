import React from 'react';
import { CustomSection, CustomSectionItem } from '../../../types/cv';
import { Plus, Trash2, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomSectionFormProps {
  section: CustomSection;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateItems: (newItems: CustomSectionItem[]) => void;
  onDeleteSection: () => void;
}

export const CustomSectionForm: React.FC<CustomSectionFormProps> = ({
  section,
  onUpdateTitle,
  onUpdateItems,
  onDeleteSection,
}) => {
  const addItem = () => {
    const newItem: CustomSectionItem = {
      id: 'item-' + Date.now(),
      title: '',
      subtitle: '',
      date: '',
      description: '',
    };
    onUpdateItems([...(section.items || []), newItem]);
  };

  const updateItem = (id: string, field: keyof CustomSectionItem, value: string) => {
    const updated = (section.items || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdateItems(updated);
  };

  const removeItem = (id: string) => {
    const filtered = (section.items || []).filter((item) => item.id !== id);
    onUpdateItems(filtered);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = section.items || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onUpdateItems(newItems);
  };

  return (
    <div className="space-y-4">
      {/* Title editor */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Titre de la section
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="ex: Projets Personnels, Bénévolat, Publications..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold"
          />
        </div>

        <button
          type="button"
          onClick={onDeleteSection}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 self-auto sm:self-end cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer la section
        </button>
      </div>

      {/* Items list */}
      {(section.items || []).length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
          <p className="text-xs text-slate-500">Aucun élément dans cette section pour l'instant.</p>
          <button
            type="button"
            onClick={addItem}
            className="w-full max-w-xs mx-auto min-h-[48px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter un élément
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {section.items.map((item, index) => (
            <div key={item.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Élément #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    aria-label="Monter cet élément"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === section.items.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    aria-label="Descendre cet élément"
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Supprimer cet élément"
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Titre principal (ex: Application Open Source)"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
                <input
                  type="text"
                  placeholder="Sous-titre / Rôle (ex: Développeur principal)"
                  value={item.subtitle || ''}
                  onChange={(e) => updateItem(item.id, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Date / Année (ex: 2024)"
                  value={item.date || ''}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Description / Lien"
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
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
            Ajouter un élément
          </button>
        </div>
      )}
    </div>
  );
};
