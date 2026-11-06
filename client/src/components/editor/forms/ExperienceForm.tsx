import React, { useState } from 'react';
import { ExperienceItem } from '../../../types/cv';
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ListPlus,
} from 'lucide-react';

interface ExperienceFormProps {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ items = [], onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);

  const addItem = () => {
    const newItem: ExperienceItem = {
      id: 'exp-' + Date.now(),
      title: '',
      company: '',
      city: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    onChange([...items, newItem]);
    setExpandedId(newItem.id);
  };

  const updateItem = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const duplicateItem = (item: ExperienceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: ExperienceItem = {
      ...item,
      id: 'exp-' + Date.now(),
      title: `${item.title} (Copie)`,
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

  const insertBullet = (id: string, currentDesc: string) => {
    const updated = currentDesc ? `${currentDesc}\n• ` : '• ';
    updateItem(id, 'description', updated);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Aucune expérience ajoutée pour le moment.</p>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une expérience
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
                {/* Header item bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-center justify-between p-3 cursor-pointer bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {item.title || 'Nouvelle expérience'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {item.company ? `${item.company} • ` : ''}
                        {item.startDate || 'Date début'} — {item.current ? 'Présent' : item.endDate || 'Date fin'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => moveItem(index, 'up', e)}
                      title="Monter"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={(e) => moveItem(index, 'down', e)}
                      title="Descendre"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => duplicateItem(item, e)}
                      title="Dupliquer"
                      className="p-1 text-slate-400 hover:text-teal-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeItem(item.id, e)}
                      title="Supprimer"
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Form */}
                {isExpanded && (
                  <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Intitulé du poste *
                        </label>
                        <input
                          type="text"
                          placeholder="ex: Chef de Projet Digital"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Entreprise / Structure *
                        </label>
                        <input
                          type="text"
                          placeholder="ex: Agence Horizon"
                          value={item.company}
                          onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Ville / Lieu</label>
                        <input
                          type="text"
                          placeholder="ex: Paris, Lyon, Dakar, Télétravail..."
                          value={item.city || ''}
                          onChange={(e) => updateItem(item.id, 'city', e.target.value)}
                          className="w-full px-3 py-2 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">Période</label>
                          <label className="flex items-center gap-1.5 text-[11px] text-teal-800 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.current}
                              onChange={(e) => updateItem(item.id, 'current', e.target.checked)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            Poste actuel
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Début (ex: 2022-03)"
                            value={item.startDate}
                            onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            disabled={item.current}
                            placeholder={item.current ? 'Présent' : 'Fin (ex: 2024-01)'}
                            value={item.current ? '' : item.endDate}
                            onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">
                          Description & Réalisations clés
                        </label>
                        <button
                          type="button"
                          onClick={() => insertBullet(item.id, item.description)}
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded"
                        >
                          <ListPlus className="w-3 h-3" />
                          Ajouter une puce (•)
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="• Pilotage d'une équipe de 5 personnes&#10;• Augmentation de 25% du chiffre d'affaires..."
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden leading-relaxed"
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
            className="w-full py-2.5 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une autre expérience
          </button>
        </div>
      )}
    </div>
  );
};
