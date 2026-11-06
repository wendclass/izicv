import React, { useState } from 'react';
import { TemplateId } from '../../types/cv';
import { TEMPLATES } from '../../templates';
import { Sparkles, FileText, Check, X, ArrowRight } from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, templateId: TemplateId, useSampleData: boolean) => void;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('Mon Nouveau CV');
  const [templateId, setTemplateId] = useState<TemplateId>('modern-sidebar');
  const [useSampleData, setUseSampleData] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(title.trim() || 'Mon Nouveau CV', templateId, useSampleData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Créer un nouveau CV</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Titre de votre CV</label>
            <input
              type="text"
              required
              placeholder="ex: CV Chef de Projet — 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Template Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Modèle de départ</label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((tmpl) => {
                const isSelected = templateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500">{tmpl.badge}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{tmpl.name.split('—')[0]}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Data Toggle */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-slate-800">Contenu initial</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseSampleData(true)}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  useSampleData
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Pré-rempli</span>
                </div>
                <div className="text-[10px] font-normal opacity-80">
                  Exemple complet à adapter (recommandé)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseSampleData(false)}
                className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                  !useSampleData
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vierge</span>
                </div>
                <div className="text-[10px] font-normal opacity-80">
                  Formulaire vide prêt à être complété
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 cursor-pointer"
            >
              <span>Commencer l'édition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
