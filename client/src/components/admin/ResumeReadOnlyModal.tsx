import React, { useState } from 'react';
import { X, Download, Eye, FileText, Lock, Sparkles, Check, Loader2 } from 'lucide-react';
import { ModernSidebarTemplate } from '../../templates/ModernSidebarTemplate';
import { MinimalistCleanTemplate } from '../../templates/MinimalistCleanTemplate';
import { exportResumeToPDF } from '../../services/pdfExport';
import { useAdmin } from '../../contexts/AdminContext';

interface ResumeReadOnlyModalProps {
  resume: {
    id: string;
    title: string;
    template_id: string;
    theme_color: string;
    font_family: string;
    created_at: string;
    updated_at: string;
    data: any;
  };
  ownerEmail?: string;
  onClose: () => void;
}

export const ResumeReadOnlyModal: React.FC<ResumeReadOnlyModalProps> = ({
  resume,
  ownerEmail,
  onClose,
}) => {
  const { adminToken } = useAdmin();
  const [activeTab, setActiveTab] = useState<'preview' | 'sections'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const theme = {
    primaryColor: resume.theme_color || '#0d9488',
    fontFamily: resume.font_family || 'inter',
    spacing: 'normal' as const,
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // 1. Export vectoriel
      await exportResumeToPDF('admin-resume-preview', resume.data, {
        customFileName: `CV_${resume.title.replace(/\s+/g, '_')}`,
      });

      // 2. Journal d'audit : enregistrer l'action côté serveur
      if (adminToken) {
        try {
          await fetch('/api/admin/log-action', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              action: 'admin_download_pdf',
              target_type: 'resume',
              target_id: resume.id,
              details: `Téléchargement du PDF pour le CV "${resume.title}" (propriétaire: ${ownerEmail || 'inconnu'})`,
            }),
          });
        } catch {}
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const renderTemplate = () => {
    if (resume.template_id === 'minimalist-clean') {
      return <MinimalistCleanTemplate data={resume.data} theme={theme} id="admin-resume-preview" />;
    }
    return <ModernSidebarTemplate data={resume.data} theme={theme} id="admin-resume-preview" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: resume.theme_color || '#0d9488' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {resume.title}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Lecture seule
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Modèle : <span className="font-semibold">{resume.template_id}</span> • Utilisateur : <span className="font-semibold">{ownerEmail || 'Anonyme'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* View switcher tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Rendu visuel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'sections' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Données saisies
              </button>
            </div>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="min-h-[40px] px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Génération...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Téléchargé !</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Fermer la fenêtre"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {activeTab === 'preview' ? (
            <div className="flex justify-center">
              <div className="w-full max-w-[210mm] bg-white shadow-md rounded-xl overflow-hidden pointer-events-none select-none">
                {renderTemplate()}
              </div>
            </div>
          ) : (
            /* Structured Form Breakdown */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Informations personnelles */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Informations personnelles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nom complet :</span>
                    <span className="font-bold text-slate-800">
                      {resume.data?.personalInfo?.firstName} {resume.data?.personalInfo?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Titre visé :</span>
                    <span className="font-semibold text-slate-700">
                      {resume.data?.personalInfo?.jobTitle || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">E-mail :</span>
                    <span className="text-slate-700">{resume.data?.personalInfo?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Téléphone :</span>
                    <span className="text-slate-700">{resume.data?.personalInfo?.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Localisation :</span>
                    <span className="text-slate-700">{resume.data?.personalInfo?.city || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Profil professionnel */}
              {resume.data?.profileSummary && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Résumé professionnel
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {resume.data.profileSummary}
                  </p>
                </div>
              )}

              {/* Expériences */}
              {resume.data?.experiences?.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Expériences professionnelles ({resume.data.experiences.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {resume.data.experiences.map((exp: any, i: number) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{exp.jobTitle} • {exp.employer}</span>
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            {exp.startDate} - {exp.current ? 'Présent' : exp.endDate}
                          </span>
                        </div>
                        {exp.city && <p className="text-[11px] text-slate-500">{exp.city}</p>}
                        {exp.description && (
                          <p className="text-slate-600 whitespace-pre-wrap pt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formations */}
              {resume.data?.educations?.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Formations et diplômes ({resume.data.educations.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {resume.data.educations.map((edu: any, i: number) => (
                      <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{edu.degree} • {edu.school}</span>
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            {edu.startDate} - {edu.current ? 'En cours' : edu.endDate}
                          </span>
                        </div>
                        {edu.city && <p className="text-[11px] text-slate-500">{edu.city}</p>}
                        {edu.description && (
                          <p className="text-slate-600 whitespace-pre-wrap pt-1">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compétences et Langues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resume.data?.skills?.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Compétences ({resume.data.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.data.skills.map((skill: any, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {skill.name} {skill.level ? `(${skill.level})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {resume.data?.languages?.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Langues ({resume.data.languages.length})
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {resume.data.languages.map((lang: any, i: number) => (
                        <div key={i} className="flex justify-between border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-700">{lang.name}</span>
                          <span className="text-slate-500">{lang.level || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
