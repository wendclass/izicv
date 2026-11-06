import React from 'react';
import { CustomSection, CustomSectionItem } from '../../../types/cv';
import { Plus, Trash2, BookOpen } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Title editor */}
      <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            Titre de la section
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="ex: Projets Personnels, Bénévolat, Publications..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold"
          />
        </div>

        <button
          type="button"
          onClick={onDeleteSection}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors flex items-center gap-1 self-end"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer la section
        </button>
      </div>

      {/* Items list */}
      {(section.items || []).length === 0 ? (
        <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-500">Aucun élément dans cette section.</p>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un élément
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {section.items.map((item, index) => (
            <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Élément #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Titre principal (ex: Création d'une application open-source)"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="sm:col-span-2 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
                <input
                  type="text"
                  placeholder="Sous-titre / Rôle / Organisme (Optionnel)"
                  value={item.subtitle || ''}
                  onChange={(e) => updateItem(item.id, 'subtitle', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Date / Période (ex: 2023 - 2024)"
                  value={item.date || ''}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <textarea
                  rows={2}
                  placeholder="Description détaillée ou points clés..."
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="sm:col-span-2 w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-2 border border-dashed border-teal-300 text-teal-800 hover:bg-teal-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un élément
          </button>
        </div>
      )}
    </div>
  );
};
