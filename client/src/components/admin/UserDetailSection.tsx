import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Smartphone,
  Globe,
  FileText,
  Clock,
  Eye,
  Shield,
  AlertTriangle,
  Lock,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { ResumeReadOnlyModal } from './ResumeReadOnlyModal';

interface UserDetailProps {
  userId: string;
  onBack: () => void;
}

export const UserDetailSection: React.FC<UserDetailProps> = ({ userId, onBack }) => {
  const { adminToken } = useAdmin();
  const [userData, setUserData] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read-only modal state
  const [selectedResume, setSelectedResume] = useState<any | null>(null);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        throw new Error("Impossible de charger la fiche de l'utilisateur.");
      }
      const data = await res.json();
      setUserData(data.user);
      setResumes(data.resumes || []);
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Chargement de la fiche utilisateur...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste des utilisateurs
        </button>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-2">
          <p className="font-bold">{error || 'Utilisateur introuvable.'}</p>
          <button
            type="button"
            onClick={fetchUserDetails}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </button>
      </div>

      {/* Account Identity Card (Section 4.3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-black text-lg flex items-center justify-center shrink-0">
              {userData.full_name ? userData.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {userData.full_name || 'Utilisateur sans nom'}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    userData.statut === 'suspendu'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {userData.statut === 'suspendu' ? 'Suspendu' : 'Actif'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">{userData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600">
              Méthode : <strong className="text-slate-800">{userData.methode_connexion === 'google' ? 'Google' : 'Email'}</strong>
            </span>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Inscription :
            </span>
            <span className="font-semibold text-slate-800">{formatDate(userData.created_at)}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Dernière connexion :
            </span>
            <span className="font-semibold text-slate-800">{formatDate(userData.derniere_connexion)}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Nombre de CVs :
            </span>
            <span className="font-bold text-teal-700">{resumes.length}</span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Identifiant :
            </span>
            <span className="font-mono text-[11px] text-slate-600 truncate block" title={userData.id}>
              {userData.id.substring(0, 12)}...
            </span>
          </div>
        </div>
      </div>

      {/* CVs List of this User (Section 4.3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Curriculum Vitae créés ({resumes.length})
          </h4>
        </div>

        {resumes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Aucun CV créé</p>
            <p className="text-[11px] text-slate-400">Cet utilisateur n'a pas encore enregistré de CV sur la plateforme.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full border border-white shadow-2xs shrink-0"
                        style={{ backgroundColor: r.theme_color || '#0d9488' }}
                        title={`Couleur: ${r.theme_color}`}
                      />
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {r.title}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                      {r.template_id}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Créé le : {formatDate(r.created_at)}</span>
                    <span>Mis à jour : {formatDate(r.updated_at)}</span>
                  </div>
                </div>

                {/* Read-only button */}
                <button
                  type="button"
                  onClick={() => setSelectedResume(r)}
                  className="w-full min-h-[40px] px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter en lecture seule & Télécharger</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Activity Timeline (Section 4.3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          Chronologie des événements de l'utilisateur
        </h4>

        {events.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            Aucun événement enregistré pour cet utilisateur pour le moment.
          </p>
        ) : (
          <div className="space-y-3 border-l-2 border-slate-100 pl-4 ml-1">
            {events.map((e, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{e.event_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{formatDate(e.created_at)}</span>
                </div>
                {e.device_type && (
                  <p className="text-[11px] text-slate-500">
                    Appareil : {e.device_type} • Pays : {e.country || 'Inconnu'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Actions Bar (Section 4.3 & 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Actions sur le compte
        </h4>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="min-h-[42px] px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{userData.statut === 'suspendu' ? 'Réactiver le compte' : 'Suspendre le compte'}</span>
          </button>
          <button
            type="button"
            className="min-h-[42px] px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Envoyer réinitialisation mot de passe</span>
          </button>
          <button
            type="button"
            className="min-h-[42px] px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer le compte</span>
          </button>
        </div>
      </div>

      {/* Read-Only Modal if opened */}
      {selectedResume && (
        <ResumeReadOnlyModal
          resume={selectedResume}
          ownerEmail={userData.email}
          onClose={() => setSelectedResume(null)}
        />
      )}
    </div>
  );
};
