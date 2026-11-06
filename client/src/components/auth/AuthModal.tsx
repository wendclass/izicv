import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
} from 'lucide-react';

/*
  CONFIG FOURNISSEUR D'AUTHENTIFICATION GOOGLE & SUPABASE :
  -------------------------------------------------------------
  URLs de redirection OAuth à déclarer dans la console Google Cloud / Supabase :
  - Développement : http://localhost:5173/auth/callback
  - Production : https://izicv.vercel.app/auth/callback

  Variables d'environnement nécessaires (.env) :
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_GOOGLE_CLIENT_ID
*/

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(defaultMode === 'login');
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, register, guestLogin, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isResetMode) {
        // Password reset simulation / handler
        setResetSent(true);
        setLoading(false);
        return;
      }

      if (isLogin) {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Indique ton nom complet pour continuer.');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Erreur connexion Google:', err);
      setError(err.message || 'La connexion avec Google a échoué.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = () => {
    guestLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mb-2 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isResetMode
              ? 'Réinitialise ton mot de passe'
              : isLogin
              ? 'Bon retour sur iziCV'
              : 'Crée ton compte iziCV'}
          </h2>
          <p className="text-xs text-slate-500">
            {isResetMode
              ? 'Saisis ton e-mail pour recevoir les instructions.'
              : isLogin
              ? 'Connecte-toi pour retrouver tes CVs enregistrés.'
              : 'Enregistre tes CVs et télécharge-les gratuitement en illimité.'}
          </p>
        </div>

        {/* 1. GOOGLE CONTINUER FIRST (Section 9) */}
        {!isResetMode && (
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full min-h-[48px] py-2.5 px-4 bg-white hover:bg-slate-50 disabled:opacity-70 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600 shrink-0" />
                  <span>Connexion à Google Drive...</span>
                </>
              ) : (
                <>
                  {/* Google G SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="shrink-0 mx-3 text-[11px] font-medium text-slate-400">
                ou avec ton adresse e-mail
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {!isResetMode && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Créer un compte
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs p-4 rounded-xl space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <p className="font-bold">E-mail de réinitialisation envoyé !</p>
            <p className="text-[11px]">
              Vérifie ta boîte de réception pour réinitialiser ton mot de passe.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetSent(false);
              }}
              className="mt-2 text-xs text-teal-700 font-bold underline"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && !isResetMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nom & Prénom</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    autoCapitalize="words"
                    placeholder="ex: Thomas Leroy"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Adresse e-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  inputMode="email"
                  required
                  placeholder="ton.email@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            {!isResetMode && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Mot de passe</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-12 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  {/* Password visibility toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Chargement en cours...'
              ) : isResetMode ? (
                <span>Envoyer le lien de réinitialisation</span>
              ) : isLogin ? (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {isResetMode && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetMode(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Annuler et revenir à la connexion
                </button>
              </div>
            )}
          </form>
        )}

        {/* Discovery guest mode */}
        {!isResetMode && (
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGuest}
              className="text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors py-1 cursor-pointer"
            >
              Ou continuer directement en <span className="underline font-bold">Mode Découverte</span> (sans compte)
            </button>
          </div>
        )}

        {/* CLASS S SIGNATURE (Section 11) */}
        {/* Logo Class S : emplacement réservé */}
        <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          <span>Un outil signé </span>
          <span className="font-semibold text-slate-600">Class S</span>
          <span> : </span>
          <a
            href="https://wendclass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 hover:text-teal-800 hover:underline font-semibold inline-flex items-center gap-0.5"
          >
            wendclass.com
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
