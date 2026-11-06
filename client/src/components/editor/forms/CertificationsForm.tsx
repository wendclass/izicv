import React, { useState } from 'react';
import { CertificationItem } from '../../../types/cv';
import { Plus, Trash2, Award } from 'lucide-react';

interface CertificationsFormProps {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ items = [], onChange }) => {
  const addItem = () => {
    const newItem: CertificationItem = {
      id: 'cert-' + Date.now(),
      title: '',
      issuer: '',
      date: '',
      description: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof CertificationItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-5 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
          <Award className="w-7 h-7 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">Aucune certification ou distinction.</p>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une certification
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Certification #{index + 1}</span>
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
                  placeholder="Intitulé (ex: Scrum Master PSM I)"
                  value={item.title}
                  onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden font-medium"
                />
                <input
                  type="text"
                  placeholder="Organisme émetteur (ex: Scrum.org)"
                  value={item.issuer}
                  onChange={(e) => updateItem(item.id, 'issuer', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Année (ex: 2023)"
                  value={item.date}
                  onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Détails (Optionnel)"
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
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
            Ajouter une certification
          </button>
        </div>
      )}
    </div>
  );
};
