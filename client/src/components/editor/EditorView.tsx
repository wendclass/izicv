import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Resume, ResumeData, ResumeTheme, TemplateId, SectionKey } from '../../types/cv';
import { EditorToolbar, SaveStatusType } from './EditorToolbar';
import { SectionManager } from './SectionManager';
import { LivePreview } from '../preview/LivePreview';
import { exportResumeToPDF, shareResumePDF } from '../../services/pdfExport';
import { ModernSidebarTemplate } from '../../templates/ModernSidebarTemplate';
import { MinimalistCleanTemplate } from '../../templates/MinimalistCleanTemplate';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SAMPLE_RESUME_DATA } from '../../data/sampleData';
import { saveResumeToDrive } from '../../services/googleDrive';
import { trackEvent } from '../../services/telemetry';
import {
  Eye,
  Download,
  Share2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface EditorViewProps {
  resumeId: string;
  onBackToDashboard: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ resumeId, onBackToDashboard }) => {
  const { isGuest, isGoogleDriveConnected, googleAccessToken } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('saved');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Mobile guided steps state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Success toast state for PDF download/share
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Conflict resolution state
  const [conflictResume, setConflictResume] = useState<Resume | null>(null);

  // Pending unsynced changes ref
  const pendingSyncRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<any>(null);

  // Load resume data
  useEffect(() => {
    async function load() {
      setLoading(true);
      const isLocal = isGuest || resumeId.startsWith('local-');

      if (isLocal) {
        const localSaved = localStorage.getItem(`izicv_resume_${resumeId}`);
        if (localSaved) {
          try {
            setResume(JSON.parse(localSaved));
          } catch {
            setResume(createInitialResume(resumeId));
          }
        } else {
          setResume(createInitialResume(resumeId));
        }
      } else {
        try {
          const res = await api.getResume(resumeId);
          // Check local offline cache to see if we have unsynced edits newer than server
          const localCache = localStorage.getItem(`izicv_resume_${resumeId}`);
          if (localCache) {
            try {
              const parsedLocal = JSON.parse(localCache);
              if (
                new Date(parsedLocal.updatedAt).getTime() > new Date(res.updatedAt).getTime()
              ) {
                setConflictResume(res);
                setResume(parsedLocal);
                pendingSyncRef.current = true;
                setLoading(false);
                return;
              }
            } catch {}
          }
          setResume(res);
        } catch (err) {
          console.error('Erreur chargement CV distant, bascule sur local:', err);
          const localSaved = localStorage.getItem(`izicv_resume_${resumeId}`);
          if (localSaved) {
            try {
              setResume(JSON.parse(localSaved));
            } catch {
              setResume(createInitialResume(resumeId));
            }
          } else {
            setResume(createInitialResume(resumeId));
          }
        }
      }
      setLoading(false);
    }

    load();
  }, [resumeId, isGuest]);

  function createInitialResume(id: string): Resume {
    return {
      id,
      userId: 'user',
      title: 'Mon CV Professionnel',
      templateId: 'modern-sidebar',
      theme: {
        primaryColor: '#0d9488',
        fontFamily: 'inter',
      },
      data: SAMPLE_RESUME_DATA,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Network online/offline listener
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSyncRef.current && resume) {
        triggerAutoSave(resume, true);
      } else {
        setSaveStatus('saved');
      }
    };

    const handleOffline = () => {
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setSaveStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [resume]);

  // Warn before closing tab only if unsynced changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSyncRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Android Back Button integration (history pushState & popstate)
  useEffect(() => {
    // Initial state
    window.history.replaceState({ iziCV: true, step: currentStepIndex, preview: isPreviewModalOpen }, '');

    const handlePopState = (e: PopStateEvent) => {
      if (isPreviewModalOpen) {
        // If preview modal was open, close it
        setIsPreviewModalOpen(false);
        return;
      }

      if (currentStepIndex > 0) {
        // Go back one step
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPreviewModalOpen, currentStepIndex]);

  const openPreviewModal = () => {
    window.history.pushState({ iziCV: true, preview: true }, '');
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  // Trigger auto-save with debounce and local-first fallback
  const triggerAutoSave = useCallback(
    (updatedResume: Resume, forceImmediate = false) => {
      // 1. Immediately save to local storage (local-first)
      localStorage.setItem(`izicv_resume_${resumeId}`, JSON.stringify(updatedResume));
      pendingSyncRef.current = true;

      if (!navigator.onLine) {
        setSaveStatus('offline');
        return;
      }

      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      const syncFn = async () => {
        try {
          if (isGoogleDriveConnected && googleAccessToken) {
            await saveResumeToDrive(googleAccessToken, updatedResume);
          } else if (!isGuest && !resumeId.startsWith('local-')) {
            await api.updateResume(resumeId, {
              title: updatedResume.title,
              templateId: updatedResume.templateId,
              theme: updatedResume.theme,
              data: updatedResume.data,
            });
          }
          pendingSyncRef.current = false;
          setSaveStatus('saved');
        } catch (err) {
          console.error('Erreur sauvegarde réseau / Google Drive:', err);
          if (!navigator.onLine) {
            setSaveStatus('offline');
          } else {
            setSaveStatus('error');
          }
        }
      };

      if (forceImmediate) {
        syncFn();
      } else {
        saveTimeoutRef.current = setTimeout(syncFn, 700);
      }
    },
    [isGuest, resumeId, isGoogleDriveConnected, googleAccessToken]
  );

  const handleDataChange = (newData: ResumeData) => {
    if (!resume) return;
    const updated = {
      ...resume,
      data: newData,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    triggerAutoSave(updated);
  };

  const handleTemplateChange = (newTemplate: TemplateId) => {
    if (!resume) return;
    const updated = {
      ...resume,
      templateId: newTemplate,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    triggerAutoSave(updated);
    trackEvent('modele_change', { cvId: resume.id, templateId: newTemplate });
  };

  const handleThemeChange = (newTheme: ResumeTheme) => {
    if (!resume) return;
    const updated = {
      ...resume,
      theme: newTheme,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    triggerAutoSave(updated);
    trackEvent('couleur_change', { cvId: resume.id, themeColor: newTheme.primaryColor });
  };

  // Download PDF with visible toast confirmation
  const handleDownloadPDF = async () => {
    if (!resume) return;
    setIsDownloading(true);
    try {
      const filename = await exportResumeToPDF('editor-resume-export-sheet', resume.data, {
        customFileName: resume.title ? `CV_${resume.title.replace(/\s+/g, '_')}` : undefined,
      });
      setToastMessage(`Ton CV est prêt : ${filename}`);
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Une erreur est survenue lors de la création du PDF. Réessaie dans un instant.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Share PDF via Android native share dialog (WhatsApp, Gmail, Drive...)
  const handleSharePDF = async () => {
    if (!resume) return;
    setIsSharing(true);
    try {
      const { filename, shared } = await shareResumePDF('editor-resume-export-sheet', resume.data, {
        customFileName: resume.title ? `CV_${resume.title.replace(/\s+/g, '_')}` : undefined,
      });
      if (shared) {
        setToastMessage(`Ton CV a été partagé avec succès (${filename}).`);
      } else {
        setToastMessage(`Ton CV est prêt : ${filename}`);
      }
      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Erreur partage PDF:', err);
      alert('Le partage a échoué. Ton CV a été téléchargé.');
    } finally {
      setIsSharing(false);
    }
  };

  // Step definition on mobile
  const steps: { key: SectionKey | 'personal'; label: string }[] = resume
    ? [
        { key: 'personal', label: 'Infos personnelles' },
        ...resume.data.sectionsOrder.map((key) => {
          switch (key) {
            case 'profile':
              return { key, label: 'Profil & Résumé' };
            case 'experience':
              return { key, label: 'Expérience' };
            case 'education':
              return { key, label: 'Formation' };
            case 'skills':
              return { key, label: 'Compétences' };
            case 'languages':
              return { key, label: 'Langues' };
            case 'certifications':
              return { key, label: 'Certifications' };
            case 'interests':
              return { key, label: "Centres d'intérêt" };
            case 'references':
              return { key, label: 'Références' };
            default:
              return { key, label: 'Section personnalisée' };
          }
        }),
      ]
    : [];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      window.history.pushState({ iziCV: true, step: next }, '');
      setCurrentStepIndex(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      openPreviewModal();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prev = currentStepIndex - 1;
      window.history.pushState({ iziCV: true, step: prev }, '');
      setCurrentStepIndex(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToDashboard();
    }
  };

  const handleJumpToStep = (index: number) => {
    window.history.pushState({ iziCV: true, step: index }, '');
    setCurrentStepIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || !resume) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Chargement de ton CV...</p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-100 relative">
      {/* Editor top toolbar */}
      <EditorToolbar
        title={resume.title}
        onTitleChange={handleTitleChange}
        templateId={resume.templateId}
        onTemplateChange={handleTemplateChange}
        theme={resume.theme}
        onThemeChange={handleThemeChange}
        saveStatus={saveStatus}
        onRetrySync={() => triggerAutoSave(resume, true)}
        onBack={onBackToDashboard}
        onDownloadPDF={handleDownloadPDF}
        isDownloading={isDownloading}
        onSharePDF={handleSharePDF}
        isSharing={isSharing}
        isGoogleDriveConnected={isGoogleDriveConnected}
      />

      {/* Toast Notification Banner (Ton CV est prêt : CV_Nom_Prenom.pdf) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold truncate">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conflict Resolution Banner */}
      {conflictResume && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-2">
          <span>
            Une version différente existe sur le serveur. Tes modifications locales les plus récentes ont été conservées.
          </span>
          <button
            type="button"
            onClick={() => {
              setResume(conflictResume);
              setConflictResume(null);
              triggerAutoSave(conflictResume, true);
            }}
            className="underline font-bold text-amber-900 shrink-0"
          >
            Restaurer la version serveur
          </button>
        </div>
      )}

      {/* MOBILE STEP PROGRESS BAR (Visible only on screens < 768px / md) */}
      <div className="no-print md:hidden bg-white border-b border-slate-200 px-4 py-2.5 sticky top-[105px] z-20 shadow-2xs">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-800">
            Étape {currentStepIndex + 1} sur {steps.length} : {currentStep.label}
          </span>
          <span className="text-[11px] font-bold text-teal-700">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>

        {/* Progress line */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-teal-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Horizontally scrollable step chips/pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {steps.map((st, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={`min-h-[36px] px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  isCurrent
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : isPassed
                    ? 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}. {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col md:flex-row gap-6 md:h-[calc(100vh-8.5rem)] md:overflow-hidden pb-24 md:pb-4">
        {/* MOBILE MODE: Single active section step */}
        <div className="w-full md:hidden">
          <SectionManager
            data={resume.data}
            onChange={handleDataChange}
            singleSectionKey={currentStep.key}
          />
        </div>

        {/* DESKTOP LEFT COLUMN: Full Accordion Section Manager */}
        <div className="hidden md:block w-full md:w-[48%] lg:w-[45%] md:h-full md:overflow-y-auto pr-0 md:pr-2">
          <SectionManager data={resume.data} onChange={handleDataChange} />
        </div>

        {/* DESKTOP RIGHT COLUMN: Live A4 Preview */}
        <div className="hidden md:block w-full md:w-[52%] lg:w-[55%] h-full">
          <LivePreview
            data={resume.data}
            theme={resume.theme}
            templateId={resume.templateId}
            previewElementId="editor-resume-desktop-preview"
          />
        </div>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (FAB) "Aperçu" */}
      <div className="no-print md:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={openPreviewModal}
          className="min-h-[50px] min-w-[50px] px-4 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-slate-900/30 transition-transform active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-teal-400" />
          <span>Aperçu</span>
        </button>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (< 768px) */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        {/* Bouton Retour */}
        <button
          type="button"
          onClick={handlePrevStep}
          className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStepIndex === 0 ? 'Mes CVs' : 'Retour'}</span>
        </button>

        {/* Bouton Continuer (Principal) */}
        <button
          type="button"
          onClick={handleNextStep}
          className="flex-1 min-h-[48px] px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
        >
          <span>{currentStepIndex === steps.length - 1 ? "Voir l'aperçu du CV" : 'Continuer'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FULL-SCREEN PREVIEW MODAL (Mobile < 768px) */}
      {isPreviewModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          {/* Top modal bar */}
          <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-800">Aperçu de ton CV</h3>
            </div>

            <button
              type="button"
              onClick={closePreviewModal}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 mr-1" />
              Fermer
            </button>
          </div>

          {/* Modal Preview Body */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center">
            <div className="w-full h-full max-w-2xl">
              <LivePreview
                data={resume.data}
                theme={resume.theme}
                templateId={resume.templateId}
                previewElementId="editor-resume-mobile-preview"
              />
            </div>
          </div>

          {/* Modal Bottom Action Bar */}
          <div className="bg-white border-t border-slate-200 p-3 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSharePDF}
              disabled={isSharing || isDownloading}
              className="flex-1 min-h-[48px] py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>Partager</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading || isSharing}
              className="flex-1 min-h-[48px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exportation...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED OFFSCREEN UN-SCALED A4 CONTAINER FOR PDF EXPORT */}
      <div
        aria-hidden="true"
        className="no-print"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '794px',
          minHeight: '1123px',
          transform: 'none',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
      >
        {resume.templateId === 'minimalist-clean' ? (
          <MinimalistCleanTemplate
            data={resume.data}
            theme={resume.theme}
            id="editor-resume-export-sheet"
          />
        ) : (
          <ModernSidebarTemplate
            data={resume.data}
            theme={resume.theme}
            id="editor-resume-export-sheet"
          />
        )}
      </div>
    </div>
  );
};
