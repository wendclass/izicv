import React, { useState } from 'react';
import { PersonalInfo } from '../../../types/cv';
import { PhotoUploadModal } from '../../common/PhotoUploadModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Github,
  Camera,
  Trash2,
} from 'lucide-react';

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const updateField = (field: keyof PersonalInfo, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Photo banner / preview */}
      <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center shadow-inner">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Photo de profil"
                className="w-full h-full object-cover"
                style={{ transform: `scale(${data.photoZoom || 1})` }}
              />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Photo de profil (Optionnelle)</h4>
          <p className="text-[11px] text-slate-500">
            {data.photoUrl
              ? "Photo ajoutée. Tu peux l'ajuster ou la supprimer à tout moment."
              : 'Ajoute une photo nette et lumineuse.'}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline py-1"
            >
              {data.photoUrl ? 'Modifier / Recadrer' : 'Ajouter une photo'}
            </button>
            {data.photoUrl && (
              <button
                type="button"
                onClick={() => updateField('photoUrl', '')}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 py-1"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main personal inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Prénom</label>
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: Thomas"
            value={data.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Nom</label>
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: Leroy"
            value={data.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Titre du CV / Poste visé
          </label>
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: Chef de Projet Digital Senior | Expert UX"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            Email
          </label>
          <input
            type="email"
            inputMode="email"
            placeholder="thomas.leroy@exemple.fr"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            Téléphone
          </label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="+33 6 12 34 56 78"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Ville
          </label>
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: Paris, Dakar, Bruxelles..."
            value={data.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            Pays (Optionnel)
          </label>
          <input
            type="text"
            autoCapitalize="words"
            placeholder="ex: France, Sénégal, Belgique, Canada..."
            value={data.country || ''}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Linkedin className="w-3 h-3 text-slate-400" />
            LinkedIn
          </label>
          <input
            type="text"
            placeholder="linkedin.com/in/thomasleroy"
            value={data.linkedin || ''}
            onChange={(e) => updateField('linkedin', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            Site web / Portfolio
          </label>
          <input
            type="text"
            placeholder="thomasleroy.design"
            value={data.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Github className="w-3 h-3 text-slate-400" />
            GitHub / Autre lien
          </label>
          <input
            type="text"
            placeholder="github.com/thomasleroy"
            value={data.github || ''}
            onChange={(e) => updateField('github', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhotoUrl={data.photoUrl}
        currentZoom={data.photoZoom}
        onSave={(url, zoom) => {
          onChange({
            ...data,
            photoUrl: url,
            photoZoom: zoom,
          });
        }}
        onRemove={() => {
          onChange({
            ...data,
            photoUrl: '',
            photoZoom: 1,
          });
        }}
      />
    </div>
  );
};
