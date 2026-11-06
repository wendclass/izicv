import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Resume, ResumeData, ResumeTheme, TemplateId } from '../../types/cv';
import { EditorToolbar } from './EditorToolbar';
import { SectionManager } from './SectionManager';
import { LivePreview } from '../preview/LivePreview';
import { exportResumeToPDF } from '../../services/pdfExport';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SAMPLE_RESUME_DATA, EMPTY_RESUME_DATA } from '../../data/sampleData';
import { Edit3, Eye, Download, Loader2 } from 'lucide-react';

interface EditorViewProps {
  resumeId: string;
  onBackToDashboard: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ resumeId, onBackToDashboard }) => {
  const { isGuest } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  const saveTimeoutRef = useRef<any>(null);

  // Load resume data
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isGuest || resumeId.startsWith('local-')) {
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
          setResume(res);
        } catch (err) {
          console.error('Erreur chargement CV:', err);
          setResume(createInitialResume(resumeId));
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

  // Trigger auto-save with debounce
  const triggerAutoSave = useCallback(
    (updatedResume: Resume) => {
      setIsSaving(true);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (isGuest || resumeId.startsWith('local-')) {
            localStorage.setItem(`izicv_resume_${resumeId}`, JSON.stringify(updatedResume));
          } else {
            await api.updateResume(resumeId, {
              title: updatedResume.title,
              templateId: updatedResume.templateId,
              theme: updatedResume.theme,
              data: updatedResume.data,
            });
          }
        } catch (err) {
          console.error('Erreur sauvegarde automatique:', err);
        } finally {
          setIsSaving(false);
        }
      }, 700);
    },
    [isGuest, resumeId]
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
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    setIsDownloading(true);
    try {
      await exportResumeToPDF('editor-resume-preview', resume.data, {
        customFileName: resume.title ? `CV_${resume.title.replace(/\s+/g, '_')}` : undefined,
      });
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Une erreur est survenue lors du téléchargement du PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading || !resume) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Chargement de votre CV...</p>
        </div>
      </div>
    );
  }

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
        isSaving={isSaving}
        onBack={onBackToDashboard}
        onDownloadPDF={handleDownloadPDF}
        isDownloading={isDownloading}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
      />

      {/* Main layout */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col md:flex-row gap-6 md:h-[calc(100vh-8.5rem)] md:overflow-hidden pb-20 md:pb-4">
        {/* LEFT COLUMN: Section Manager Form */}
        <div
          className={`w-full md:w-[48%] lg:w-[45%] md:h-full md:overflow-y-auto pr-0 md:pr-2 ${
            mobileView === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          <SectionManager data={resume.data} onChange={handleDataChange} />
        </div>

        {/* RIGHT COLUMN: Live A4 Preview */}
        <div
          className={`w-full md:w-[52%] lg:w-[55%] h-[calc(100vh-14rem)] md:h-full ${
            mobileView === 'form' ? 'hidden md:block' : 'block'
          }`}
        >
          <LivePreview
            data={resume.data}
            theme={resume.theme}
            templateId={resume.templateId}
            previewElementId="editor-resume-preview"
          />
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR (Visible on screens < md) */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-2">
        {/* Switch to Form tab */}
        <button
          type="button"
          onClick={() => setMobileView('form')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mobileView === 'form'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Formulaire</span>
        </button>

        {/* Switch to Preview tab */}
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mobileView === 'preview'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Aperçu CV</span>
        </button>

        {/* Quick Download PDF */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          title="Télécharger le PDF"
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          ) : (
            <Download className="w-4 h-4 text-teal-300" />
          )}
        </button>
      </div>
    </div>
  );
};
