import React, { useState } from 'react';
import { Home, Loader2, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface NotFoundViewProps {
  onGoHome: () => void;
  isClasssRoute?: boolean;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome, isClasssRoute = false }) => {
  const { loginWithGoogle } = useAdmin();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    setLoginFailed(false);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId || typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      // Fallback Google One Tap / Credential prompt if GIS tokenClient is not available
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              const ok = await loginWithGoogle(response.credential);
              if (!ok) setLoginFailed(true);
            } else {
              setLoginFailed(true);
            }
            setIsLoggingIn(false);
          },
        });
        (window as any).google.accounts.id.prompt();
        return;
      }
      setIsLoggingIn(false);
      setLoginFailed(true);
      return;
    }

    // Google Identity Services Token Client
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            // Verify access token with server
            try {
              const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: tokenResponse.access_token }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.token && data.email) {
                  sessionStorage.setItem('izicv_admin_token', data.token);
                  sessionStorage.setItem('izicv_admin_email', data.email);
                  sessionStorage.setItem('izicv_admin_last_active', Date.now().toString());
                  window.location.reload();
                  return;
                }
              }
              setLoginFailed(true);
            } catch (e) {
              setLoginFailed(true);
            }
          } else {
            setLoginFailed(true);
          }
          setIsLoggingIn(false);
        },
      });

      client.requestAccessToken();
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
      setLoginFailed(true);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Badge */}
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-black text-slate-300 tracking-tighter block">
            404
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            Page introuvable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            La page que tu recherches n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3 justify-center items-center">
          <button
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </button>

          {/* Continuer avec Google uniquement si on est sur la route /classs */}
          {isClasssRoute && (
            <div className="w-full pt-4 border-t border-slate-200/60 space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full min-h-[48px] px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {loginFailed && (
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Accès non autorisé (404)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
