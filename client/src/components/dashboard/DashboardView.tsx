import React, { useState, useEffect } from 'react';
import { Resume, TemplateId } from '../../types/cv';
import { ResumeCard } from './ResumeCard';
import { CreateResumeModal } from './CreateResumeModal';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SAMPLE_RESUME_DATA, EMPTY_RESUME_DATA } from '../../data/sampleData';
import { exportResumeToPDF } from '../../services/pdfExport';
import { ModernSidebarTemplate } from '../../templates/ModernSidebarTemplate';
import { MinimalistCleanTemplate } from '../../templates/MinimalistCleanTemplate';
import {
  Plus,
  Sparkles,
  Search,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenEditor: (resumeId: string) => void;
  onOpenAuth: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenEditor, onOpenAuth }) => {
  const { user, isGuest } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [exportingResume, setExportingResume] = useState<Resume | null>(null);

  // Load resumes from API or local storage
  const loadResumes = async () => {
    setLoading(true);
    if (isGuest) {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('izicv_resume_'));
      const list: Resume[] = [];
      for (const key of keys) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.id) list.push(item);
        } catch {}
      }
      // If none, create default sample CV
      if (list.length === 0) {
        const sampleCV: Resume = {
          id: 'local-demo-1',
          userId: 'guest',
          title: 'Mon CV — Développeur / Chef de Projet',
          templateId: 'modern-sidebar',
          theme: { primaryColor: '#0d9488', fontFamily: 'inter' },
          data: SAMPLE_RESUME_DATA,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`izicv_resume_${sampleCV.id}`, JSON.stringify(sampleCV));
        list.push(sampleCV);
      }
      setResumes(list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } else {
      try {
        const data = await api.getResumes();
        if (data.length === 0) {
          // Create initial sample CV on first account load
          const created = await api.createResume({
            title: 'Mon Premier CV Professionnel',
            templateId: 'modern-sidebar',
            theme: { primaryColor: '#0d9488', fontFamily: 'inter' },
            data: SAMPLE_RESUME_DATA,
          });
          setResumes([created]);
        } else {
          setResumes(data);
        }
      } catch (err) {
        console.error('Erreur chargement CVs:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadResumes();
  }, [user, isGuest]);

  const handleCreate = async (title: string, templateId: TemplateId, useSampleData: boolean) => {
    setIsCreateModalOpen(false);
    const initialData = useSampleData ? SAMPLE_RESUME_DATA : EMPTY_RESUME_DATA;

    if (isGuest) {
      const newId = 'local-' + Date.now();
      const newResume: Resume = {
        id: newId,
        userId: 'guest',
        title,
        templateId,
        theme: { primaryColor: '#0d9488', fontFamily: 'inter' },
        data: initialData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`izicv_resume_${newId}`, JSON.stringify(newResume));
      setResumes([newResume, ...resumes]);
      onOpenEditor(newId);
    } else {
      try {
        const created = await api.createResume({
          title,
          templateId,
          theme: { primaryColor: '#0d9488', fontFamily: 'inter' },
          data: initialData,
        });
        setResumes([created, ...resumes]);
        onOpenEditor(created.id);
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la création du CV');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    if (isGuest) {
      const source = resumes.find((r) => r.id === id);
      if (!source) return;
      const newId = 'local-' + Date.now();
      const duplicate: Resume = {
        ...source,
        id: newId,
        title: `${source.title} (Copie)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`izicv_resume_${newId}`, JSON.stringify(duplicate));
      setResumes([duplicate, ...resumes]);
    } else {
      try {
        await api.duplicateResume(id);
        await loadResumes();
      } catch (err: any) {
        alert(err.message || 'Erreur lors de la duplication');
      }
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    if (isGuest) {
      const updated = resumes.map((r) =>
        r.id === id ? { ...r, title: newTitle, updatedAt: new Date().toISOString() } : r
      );
      setResumes(updated);
      const target = updated.find((r) => r.id === id);
      if (target) {
        localStorage.setItem(`izicv_resume_${id}`, JSON.stringify(target));
      }
    } else {
      try {
        await api.updateResume(id, { title: newTitle });
        setResumes(
          resumes.map((r) =>
            r.id === id ? { ...r, title: newTitle, updatedAt: new Date().toISOString() } : r
          )
        );
      } catch (err: any) {
        alert(err.message || 'Erreur renommage');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce CV ? Cette action est irréversible.')) {
      return;
    }

    if (isGuest) {
      localStorage.removeItem(`izicv_resume_${id}`);
      setResumes(resumes.filter((r) => r.id !== id));
    } else {
      try {
        await api.deleteResume(id);
        setResumes(resumes.filter((r) => r.id !== id));
      } catch (err: any) {
        alert(err.message || 'Erreur suppression');
      }
    }
  };

  const handleDownloadPDF = async (resumeToDownload: Resume) => {
    setExportingResume(resumeToDownload);
    setTimeout(async () => {
      try {
        await exportResumeToPDF('dashboard-export-preview', resumeToDownload.data, {
          customFileName: `CV_${resumeToDownload.title.replace(/\s+/g, '_')}`,
        });
      } catch (err) {
        console.error('Erreur export direct PDF:', err);
      } finally {
        setExportingResume(null);
      }
    }, 200);
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.data?.personalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.data?.personalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 text-white p-5 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <FileText className="w-96 h-96 -mr-16 -mt-10" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" />
            <span>Générateur de CV Professionnel 100% Neutre & Gratuit</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Créez un CV percutant en quelques minutes.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-teal-100/90 leading-relaxed">
            Choisissez votre modèle, personnalisez les couleurs, renseignez vos expériences et téléchargez votre PDF haute définition prêt à l'emploi.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg shadow-teal-950/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>Créer mon CV</span>
            </button>

            {isGuest && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-teal-900/60 hover:bg-teal-900/80 text-white border border-teal-500/30 text-xs font-semibold transition-all cursor-pointer text-center"
              >
                <span>Créer un compte pour sauvegarder en ligne</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Simple & Immédiat</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">Aperçu direct et sauvegarde en continu</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">2 Modèles Élégants</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">Basculez de l'un à l'autre sans perte de données</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% Neutre & Sans Marque</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">Export PDF vectoriel pur sans filigrane</div>
          </div>
        </div>
      </div>
      {/* Section Header with Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Mes CVs</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {resumes.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Gérez, éditez, dupliquez et exportez vos différents profils
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un CV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau CV</span>
          </button>
        </div>
      </div>

      {/* Resumes Grid / Empty State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Chargement de votre espace personnel...</p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? 'Aucun CV ne correspond à votre recherche' : 'Vous n\'avez pas encore de CV'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Essayez avec d\'autres mots-clés ou réinitialisez le filtre.'
                : 'Créez votre premier CV en quelques clics ou commencez avec un modèle pré-rempli pour gagner du temps.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer mon premier CV</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((r) => (
            <ResumeCard
              key={r.id}
              resume={r}
              onEdit={onOpenEditor}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onRename={handleRename}
              onDownloadPDF={handleDownloadPDF}
            />
          ))}
        </div>
      )}

      {/* Hidden Offscreen Container for Direct Dashboard PDF Export */}
      {exportingResume && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          {exportingResume.templateId === 'minimalist-clean' ? (
            <MinimalistCleanTemplate
              data={exportingResume.data}
              theme={exportingResume.theme}
              id="dashboard-export-preview"
            />
          ) : (
            <ModernSidebarTemplate
              data={exportingResume.data}
              theme={exportingResume.theme}
              id="dashboard-export-preview"
            />
          )}
        </div>
      )}

      {/* Create Modal */}
      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};
