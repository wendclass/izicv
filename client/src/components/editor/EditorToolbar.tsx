import React, { useState } from 'react';
import { ResumeTheme, TemplateId, FontFamilyId } from '../../types/cv';
import { ColorPicker } from '../common/ColorPicker';
import { FontSelector } from '../common/FontSelector';
import { TEMPLATES } from '../../templates';
import {
  ArrowLeft,
  Download,
  Share2,
  LayoutTemplate,
  Check,
  CheckCircle,
  Loader2,
  Edit3,
  WifiOff,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

export type SaveStatusType = 'saved' | 'saving' | 'offline' | 'error';

interface EditorToolbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  templateId: TemplateId;
  onTemplateChange: (newTemplate: TemplateId) => void;
  theme: ResumeTheme;
  onThemeChange: (newTheme: ResumeTheme) => void;
  saveStatus: SaveStatusType;
  onRetrySync?: () => void;
  onBack: () => void;
  onDownloadPDF: () => void;
  isDownloading: boolean;
  onSharePDF?: () => void;
  isSharing?: boolean;
  isGoogleDriveConnected?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  title,
  onTitleChange,
  templateId,
  onTemplateChange,
  theme,
  onThemeChange,
  saveStatus,
  onRetrySync,
  onBack,
  onDownloadPDF,
  isDownloading,
  onSharePDF,
  isSharing = false,
  isGoogleDriveConnected = false,
}) => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="no-print bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Back + Title + Save/Offline indicator */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-800 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mes CVs</span>
          </button>

          {/* Editable Title */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-xs sm:text-sm font-bold text-slate-900 border-b border-teal-500 px-1 py-0.5 focus:outline-hidden max-w-[140px] sm:max-w-[220px]"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 cursor-pointer group truncate"
                title="Touche pour renommer ton CV"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]">
                  {title || 'Mon CV'}
                </span>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}

            {/* Auto-save & Network status indicator */}
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] shrink-0">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1 text-teal-700 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                  <span className="hidden md:inline">Enregistrement…</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span className="hidden md:inline">
                    {isGoogleDriveConnected ? 'Enregistré sur Google Drive' : 'Enregistré'}
                  </span>
                </div>
              )}
              {saveStatus === 'offline' && (
                <div
                  className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                  title="Hors ligne : tes modifications seront envoyées au retour du réseau"
                >
                  <WifiOff className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline">Hors ligne</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1 text-rose-700 font-medium">
                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span className="hidden md:inline">Erreur</span>
                  {onRetrySync && (
                    <button
                      type="button"
                      onClick={onRetrySync}
                      className="inline-flex items-center gap-0.5 text-[10px] underline hover:text-rose-900 cursor-pointer"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      Réessayer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Customization Controls (Template, Color, Font, Share, Download PDF) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Template Button */}
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Changer de modèle"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Modèle</span>
          </button>

          {/* Color Picker */}
          <ColorPicker
            currentColor={theme.primaryColor}
            onChange={(color) => onThemeChange({ ...theme, primaryColor: color })}
          />

          {/* Font Picker */}
          <FontSelector
            currentFont={theme.fontFamily}
            onChange={(font: FontFamilyId) => onThemeChange({ ...theme, fontFamily: font })}
          />

          {/* Share Button (desktop / tablet) */}
          {onSharePDF && (
            <button
              type="button"
              onClick={onSharePDF}
              disabled={isSharing || isDownloading}
              className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Partager le PDF"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-teal-700" />
              )}
              <span>Partager</span>
            </button>
          )}

          {/* Download PDF Button (desktop) */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isDownloading || isSharing}
            className="hidden md:inline-flex min-h-[40px] items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Export en cours...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Choisir un modèle de CV
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Toutes tes données sont conservées lors du changement de modèle.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {TEMPLATES.map((tmpl) => {
                const isSelected = templateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      onTemplateChange(tmpl.id);
                      setIsTemplateModalOpen(false);
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {tmpl.badge}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mb-1">{tmpl.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
