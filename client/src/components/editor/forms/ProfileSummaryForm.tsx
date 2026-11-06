import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';

interface ProfileSummaryFormProps {
  value: string;
  onChange: (val: string) => void;
}

export const ProfileSummaryForm: React.FC<ProfileSummaryFormProps> = ({ value, onChange }) => {
  const suggestions = [
    "Professionnel dynamique et orienté résultats avec 5 ans d'expérience...",
    "Passionné par l'innovation et le développement, je recherche un rôle stimulant...",
    "Diplômé en management avec une expertise avérée en conduite du changement...",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 bg-teal-50/70 border border-teal-200/70 rounded-xl text-teal-900 text-xs">
        <Lightbulb className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Conseil pour un profil percutant :</span> Rédigez un court paragraphe de 3 à 5 lignes présentant vos points forts, vos années d'expérience et ce que vous apportez à l'entreprise.
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          <label>Texte de présentation / Résumé</label>
          <span className="text-slate-400 font-normal">{value?.length || 0} caractères</span>
        </div>
        <textarea
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Présentez brièvement vos compétences clés, vos réalisations majeures et votre projet professionnel..."
          className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden leading-relaxed"
        />
      </div>

      {/* Quick suggestions */}
      {!value && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Exemples d'accroches :
          </span>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(sug)}
                className="text-left text-[11px] text-slate-600 hover:text-teal-800 bg-slate-50 hover:bg-teal-50/50 p-2 rounded-lg border border-slate-200 transition-colors"
              >
                "{sug}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
