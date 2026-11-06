import React, { useState } from 'react';
import { EducationItem } from '../../../types/cv';
import { DateSelector } from '../../common/DateSelector';
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react';

interface EducationFormProps {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ items = [], onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const addItem = () => {
    const newItem: EducationItem = {
      id: 'edu-' + Date.now(),
      degree: '',
      school: '',
      city: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const updateItem = (id: string, field: keyof EducationItem, value: any) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const duplicateItem = (item: EducationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: EducationItem = {
      ...item,
      id: 'edu-' + Date.now(),
      degree: `${item.degree} (Copie)`,
    };
    onChange([...items, duplicated]);
    setExpandedId(duplicated.id);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(items.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
          <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Aucune formation ajoutée pour le moment.</p>
          <button
            type="button"
            onClick={addItem}
            className="w-full max-w-xs mx-auto min-h-[48px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une formation
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                        {item.degree || 'Nouvelle formation'}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 truncate block">
                        {item.school ? `${item.school} • ` : ''}
                        {item.startDate || 'Début'} - {item.current ? 'En cours' : item.endDate || 'Fin'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => moveItem(index, 'up', e)}
                      aria-label="Monter cette formation"
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={(e) => moveItem(index, 'down', e)}
                      aria-label="Descendre cette formation"
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => duplicateItem(item, e)}
                      aria-label="Dupliquer cette formation"
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-teal-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeItem(item.id, e)}
                      aria-label="Supprimer cette formation"
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3.5 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Diplôme / Intitulé de la formation *
                        </label>
                        <input
                          type="text"
                          autoCapitalize="words"
                          placeholder="ex: Master 2 Management de Projets Digitaux"
                          value={item.degree}
                          onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Établissement / École *
                        </label>
                        <input
                          type="text"
                          autoCapitalize="words"
                          placeholder="ex: Université Paris 1 Panthéon-Sorbonne"
                          value={item.school}
                          onChange={(e) => updateItem(item.id, 'school', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Ville / Lieu</label>
                        <input
                          type="text"
                          autoCapitalize="words"
                          placeholder="ex: Paris, Dakar, Montréal..."
                          value={item.city || ''}
                          onChange={(e) => updateItem(item.id, 'city', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">Période</label>
                          <label className="flex items-center gap-1.5 text-xs text-teal-800 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.current}
                              onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                            />
                            En cours (études actuelles)
                          </label>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-0.5">Date de début</span>
                            <DateSelector
                              value={item.startDate}
                              onChange={(val) => updateItem(item.id, 'startDate', val)}
                              placeholderPrefix="Début"
                            />
                          </div>

                          {!item.current && (
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Date de fin</span>
                              <DateSelector
                                value={item.endDate}
                                onChange={(val) => updateItem(item.id, 'endDate', val)}
                                placeholderPrefix="Fin"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Description / Mention / Spécialisation (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Mention Très Bien, major de promotion"
                        value={item.description || ''}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="w-full min-h-[48px] py-3 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-800 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une formation
          </button>
        </div>
      )}
    </div>
  );
};
