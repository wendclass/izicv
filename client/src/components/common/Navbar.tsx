import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, LogOut, User as UserIcon, Sparkles, Cloud } from 'lucide-react';

interface NavbarProps {
  onOpenAuth?: () => void;
  currentView?: 'dashboard' | 'editor';
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigateHome }) => {
  const { user, logout, isGuest, isGoogleDriveConnected } = useAuth();

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
        >
          <img
            src="/favicon.svg"
            alt="iziCV Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
                iziCV
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50/80 text-amber-600 border border-teal-300 shadow-xs tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block">
              Crée ton CV parfait en quelques clics
            </p>
          </div>
        </div>

        {/* Right navigation / Auth state */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isGoogleDriveConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium" title="Tes CV sont synchronisés sur ton Google Drive personnel">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  Google Drive
                </span>
              ) : isGuest ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Mode Découverte
                </span>
              ) : null}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 bg-slate-50 px-2 sm:px-3 py-1.5 rounded-full border border-slate-200 max-w-[120px] sm:max-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium truncate">
                  {user.fullName || user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Se déconnecter"
                className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden xs:inline">Connexion / Inscription</span>
                <span className="xs:hidden">Connexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
