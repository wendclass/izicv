import React, { useState, useEffect } from 'react';
import { Shield, Clock, Filter, RefreshCw, AlertTriangle, CheckCircle, Info, LogOut } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface AuditLogEntry {
  id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: string;
  created_at: string;
}

export const AuditLogSection: React.FC = () => {
  const { adminToken } = useAdmin();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des journaux');
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer le journal d audit');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'admin_login_success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Connexion admin
          </span>
        );
      case 'admin_login_denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Accès refusé
          </span>
        );
      case 'admin_logout':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <LogOut className="w-3 h-3 text-amber-600" />
            Déconnexion
          </span>
        );
      case 'view_audit_logs':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <Info className="w-3 h-3 text-sky-600" />
            Audit consulté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (selectedActionFilter !== 'all' && l.action !== selectedActionFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetails = l.details?.toLowerCase().includes(q);
      const matchAction = l.action.toLowerCase().includes(q);
      const matchTarget = l.target_type?.toLowerCase().includes(q);
      return matchDetails || matchAction || matchTarget;
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Journal d'audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Historique certifié et immuable des actions d'administration et de sécurité.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={isLoading}
          className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs inline-flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par mot-clé, détail ou cible..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="all">Toutes les actions</option>
            <option value="admin_login_success">Connexions réussies</option>
            <option value="admin_login_denied">Tentatives refusées</option>
            <option value="admin_logout">Déconnexions</option>
            <option value="view_audit_logs">Consultations du journal</option>
          </select>
        </div>
      </div>

      {/* State: Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchLogs}
            className="font-bold underline cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* State: Loading */}
      {isLoading && logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement du journal d'audit...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Shield className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Aucun enregistrement trouvé</p>
          <p className="text-xs text-slate-500">Aucun événement ne correspond aux critères de filtre sélectionnés.</p>
        </div>
      ) : (
        /* Logs: Responsive Card list on Mobile, clean Table on Desktop */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date et heure</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Cible</th>
                  <th className="py-3 px-4">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {log.target_type || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Android optimized, no horizontal scroll) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>{getActionBadge(log.action)}</div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDate(log.created_at)}
                  </span>
                </div>
                {log.details && (
                  <p className="text-xs text-slate-700 font-medium">
                    {log.details}
                  </p>
                )}
                {log.target_type && (
                  <div className="text-[11px] text-slate-400">
                    Cible : <span className="font-medium text-slate-600">{log.target_type}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
