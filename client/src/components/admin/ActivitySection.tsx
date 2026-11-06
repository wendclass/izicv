import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Filter,
  RefreshCw,
  Clock,
  Smartphone,
  Globe,
  Download,
  Share2,
  FileText,
  UserPlus,
  LogIn,
  Layers,
  Palette,
  CheckCircle,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface EventItem {
  id: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  properties?: Record<string, any>;
  device_type?: string;
  country?: string;
  created_at: string;
}

export const ActivitySection: React.FC = () => {
  const { adminToken } = useAdmin();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [exportErrorsCount, setExportErrorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'errors'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const fetchActivity = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        activeTab === 'errors'
          ? '/api/admin/activity?exportErrorsOnly=true'
          : eventTypeFilter !== 'all'
          ? `/api/admin/activity?type=${eventTypeFilter}`
          : '/api/admin/activity';

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erreur lors du chargement des événements');
      }

      const json = await res.json();
      setEvents(json.events || []);
      setExportErrorsCount(json.exportErrorsCount || 0);
    } catch (err: any) {
      setError(err.message || "Impossible de charger l'activité");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [activeTab, eventTypeFilter]);

  const getEventBadge = (name: string) => {
    switch (name) {
      case 'inscription':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <UserPlus className="w-3 h-3 text-emerald-600" />
            Inscription
          </span>
        );
      case 'connexion':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            <LogIn className="w-3 h-3 text-teal-600" />
            Connexion
          </span>
        );
      case 'cv_cree':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <FileText className="w-3 h-3 text-sky-600" />
            CV créé
          </span>
        );
      case 'cv_modifie':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <FileText className="w-3 h-3 text-blue-600" />
            CV modifié
          </span>
        );
      case 'modele_change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Layers className="w-3 h-3 text-indigo-600" />
            Modèle changé
          </span>
        );
      case 'couleur_change':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-800 border border-violet-200">
            <Palette className="w-3 h-3 text-violet-600" />
            Couleur changée
          </span>
        );
      case 'pdf_telecharge':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Download className="w-3 h-3 text-amber-600" />
            PDF exporté
          </span>
        );
      case 'pdf_partage':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Share2 className="w-3 h-3 text-cyan-600" />
            PDF partagé
          </span>
        );
      case 'pwa_installee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Smartphone className="w-3 h-3 text-purple-600" />
            PWA installée
          </span>
        );
      case 'erreur_export':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Erreur export
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {name}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Subtabs (Section 4.4) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Activité en direct
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Flux chronologique des interactions et diagnostic des erreurs d'export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Subtabs: Tous les événements vs Erreurs d'export */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Tous les événements
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('errors')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'errors'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>Erreurs d'export</span>
              {exportErrorsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'errors' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {exportErrorsCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={fetchActivity}
            disabled={isLoading}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Actualiser le flux"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter by event type if tab is 'all' */}
      {activeTab === 'all' && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs font-semibold text-slate-600">Filtrer par type :</label>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">Tous les types ({events.length})</option>
            <option value="inscription">Inscriptions</option>
            <option value="connexion">Connexions</option>
            <option value="cv_cree">CVs créés</option>
            <option value="cv_modifie">CVs modifiés</option>
            <option value="modele_change">Modèles changés</option>
            <option value="couleur_change">Couleurs changées</option>
            <option value="pdf_telecharge">Exports PDF</option>
            <option value="pdf_partage">Partages PDF</option>
            <option value="pwa_installee">Installations PWA</option>
            <option value="erreur_export">Erreurs d'export</option>
          </select>
        </div>
      )}

      {/* State: Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchActivity} className="font-bold underline cursor-pointer">
            Réessayer
          </button>
        </div>
      )}

      {/* State: Loading */}
      {isLoading && events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement du flux d'activité...</p>
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          {activeTab === 'errors' ? (
            <>
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Aucune erreur d'export détectée</p>
              <p className="text-xs text-slate-500">Tous les exports PDF se sont déroulés avec succès.</p>
            </>
          ) : (
            <>
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Aucun événement enregistré</p>
              <p className="text-xs text-slate-500">Les événements apparaîtront ici dès que les utilisateurs interagissent avec l'outil.</p>
            </>
          )}
        </div>
      ) : (
        /* Chronological Feed */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {events.map((e) => (
            <div
              key={e.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors ${
                e.event_name === 'erreur_export' ? 'bg-rose-50/30' : ''
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {getEventBadge(e.event_name)}
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatDate(e.created_at)}
                  </span>
                </div>

                {/* Event Properties / Details */}
                {e.properties && Object.keys(e.properties).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[11px] pt-0.5">
                    {e.properties.templateId && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                        Modèle : {e.properties.templateId}
                      </span>
                    )}
                    {e.properties.themeColor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: e.properties.themeColor }}
                        />
                        {e.properties.themeColor}
                      </span>
                    )}
                    {e.properties.errorMessage && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-mono font-semibold">
                        {e.properties.errorMessage}
                      </span>
                    )}
                    {e.properties.method && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {e.properties.method}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Device and Country tags */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-slate-400 text-xs">
                {e.device_type && e.device_type !== 'unknown' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 font-medium">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    {e.device_type}
                  </span>
                )}
                {e.country && e.country !== 'Inconnu' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 font-medium font-mono">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {e.country}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
