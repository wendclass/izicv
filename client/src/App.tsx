import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EditorView } from './components/editor/EditorView';
import { AuthModal } from './components/auth/AuthModal';
import { ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenEditor = (resumeId: string) => {
    setActiveResumeId(resumeId);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveResumeId(null);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Chargement d'iziCV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateHome={handleBackToDashboard}
      />

      {/* Main View */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <DashboardView
            onOpenEditor={handleOpenEditor}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : activeResumeId ? (
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

      {/* CLASS S SIGNATURE FOOTER (Section 11) */}
      {/* Logo Class S : emplacement réservé */}
      <footer className="no-print py-4 px-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
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
      <AppContent />
    </AuthProvider>
  );
};

export default App;
