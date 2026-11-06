import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { Navbar } from './components/common/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EditorView } from './components/editor/EditorView';
import { AuthModal } from './components/auth/AuthModal';
import { PrivacyView } from './components/legal/PrivacyView';
import { TermsView } from './components/legal/TermsView';
import { NotFoundView } from './components/common/NotFoundView';
import { AdminLayout } from './components/admin/AdminLayout';
import { ExternalLink } from 'lucide-react';

type ViewMode = 'dashboard' | 'editor' | 'privacy' | 'terms' | 'classs' | 'not_found';

function getViewFromPath(pathname: string): ViewMode {
  const clean = pathname.toLowerCase().replace(/\/$/, '');
  if (!clean || clean === '') return 'dashboard';
  if (clean === '/privacy' || clean === '/confidentialite') return 'privacy';
  if (clean === '/terms' || clean === '/conditions') return 'terms';
  if (clean === '/classs') return 'classs';
  return 'not_found';
}

const AppContent: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const { isAdminAuthenticated, isLoading: isAdminLoading } = useAdmin();

  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return getViewFromPath(window.location.pathname);
    }
    return 'dashboard';
  });
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set noindex, nofollow for /classs route
  useEffect(() => {
    if (currentView === 'classs') {
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'noindex, nofollow');
    }
  }, [currentView]);

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'privacy') targetPath = '/privacy';
      else if (view === 'terms') targetPath = '/terms';
      else if (view === 'classs') targetPath = '/classs';

      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenEditor = (resumeId: string) => {
    setActiveResumeId(resumeId);
    setCurrentView('editor');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveResumeId(null);
    navigateTo('dashboard');
  };

  if (isAuthLoading || (currentView === 'classs' && isAdminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Chargement d'iziCV...</p>
        </div>
      </div>
    );
  }

  // Si on est sur /classs ET que l'administrateur est authentifié : afficher le tableau de bord admin
  if (currentView === 'classs' && isAdminAuthenticated) {
    return <AdminLayout />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView === 'editor' ? 'editor' : 'dashboard'}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateHome={handleBackToDashboard}
      />

      {/* Main View */}
      <main className="flex-1">
        {currentView === 'classs' ? (
          // Visiteur non autorisé ou non connecté sur /classs : réponse 404 trompeuse identique à une fausse page
          <NotFoundView onGoHome={handleBackToDashboard} isClasssRoute={true} />
        ) : currentView === 'not_found' ? (
          <NotFoundView onGoHome={handleBackToDashboard} isClasssRoute={false} />
        ) : currentView === 'privacy' ? (
          <PrivacyView onBack={handleBackToDashboard} />
        ) : currentView === 'terms' ? (
          <TermsView onBack={handleBackToDashboard} />
        ) : currentView === 'editor' && activeResumeId ? (
          <EditorView
            resumeId={activeResumeId}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <DashboardView
            onOpenEditor={handleOpenEditor}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* FOOTER AVEC LIENS CONFIDENTIALITE & CONDITIONS ET SIGNATURE CLASS S (Aucun lien vers /classs) */}
      <footer className="no-print py-6 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('privacy');
            }}
            className="text-slate-600 hover:text-teal-700 hover:underline font-medium transition-colors"
          >
            Règles de confidentialité
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('terms');
            }}
            className="text-slate-600 hover:text-teal-700 hover:underline font-medium transition-colors"
          >
            Conditions d'utilisation
          </a>
        </nav>
        <div>
          <span>Un outil signé </span>
          <span className="font-semibold text-slate-700">Class S</span>
          <span>, </span>
          <a
            href="https://wendclass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 hover:text-teal-800 hover:underline font-semibold inline-flex items-center gap-0.5"
          >
            wendclass.com
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;
