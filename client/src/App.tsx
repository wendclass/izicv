import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EditorView } from './components/editor/EditorView';
import { AuthModal } from './components/auth/AuthModal';

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
