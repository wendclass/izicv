import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

interface UserListItem {
  id: string;
  full_name: string;
  email: string;
  statut: 'actif' | 'suspendu';
  methode_connexion: 'google' | 'email';
  created_at: string;
  derniere_connexion: string;
  cv_count: number;
  pdf_exports_count: number;
  most_frequent_device: string;
  most_frequent_country: string;
}

interface UsersListSectionProps {
  onSelectUser: (userId: string) => void;
}

export const UsersListSection: React.FC<UsersListSectionProps> = ({ onSelectUser }) => {
  const { adminToken } = useAdmin();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'suspendu'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'google' | 'email'>('all');
  const [hasCvFilter, setHasCvFilter] = useState<'all' | 'with_cv' | 'without_cv'>('all');

  // Sorting state
  const [sortField, setSortField] = useState<keyof UserListItem>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state (25 par page comme demandé en 4.2)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs.');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la liste.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field: keyof UserListItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filtered & sorted users
  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = u.full_name?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          if (!matchName && !matchEmail) return false;
        }

        // Status
        if (statusFilter !== 'all' && u.statut !== statusFilter) {
          return false;
        }

        // Method
        if (methodFilter !== 'all' && u.methode_connexion !== methodFilter) {
          return false;
        }

        // CV Filter
        if (hasCvFilter === 'with_cv' && u.cv_count === 0) return false;
        if (hasCvFilter === 'without_cv' && u.cv_count > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
  }, [users, searchQuery, statusFilter, methodFilter, hasCvFilter, sortField, sortDirection]);

  // Paginated slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage]);

  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;

  // Export CSV (Section 4.2: champs ci-dessus uniquement, sans le contenu des CV)
  const handleExportCSV = async () => {
    if (processedUsers.length === 0) return;

    // Headers
    const headers = [
      'Identifiant',
      'Nom complet',
      'Email',
      'Methode connexion',
      'Statut',
      'Date inscription',
      'Derniere connexion',
      'Nombre de CVs',
      'Exports PDF',
    ];

    const rows = processedUsers.map((u) => [
      `"${u.id}"`,
      `"${u.full_name?.replace(/"/g, '""') || ''}"`,
      `"${u.email}"`,
      `"${u.methode_connexion}"`,
      `"${u.statut}"`,
      `"${u.created_at}"`,
      `"${u.derniere_connexion}"`,
      u.cv_count,
      u.pdf_exports_count,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_izicv_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Audit log
    if (adminToken) {
      try {
        await fetch('/api/admin/log-action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            action: 'admin_export_csv',
            target_type: 'users',
            details: `Export CSV de ${processedUsers.length} utilisateurs`,
          }),
        });
      } catch {}
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Utilisateurs
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {users.length} au total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Consultation des fiches utilisateurs, recherche instantanée et accès aux CVs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Actualiser la liste"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={processedUsers.length === 0}
            className="min-h-[44px] px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou par adresse e-mail..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          {/* Statut filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Statut du compte :</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif uniquement</option>
              <option value="suspendu">Suspendu uniquement</option>
            </select>
          </div>

          {/* Méthode filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Méthode de connexion :</label>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="all">Toutes les méthodes</option>
              <option value="google">Google</option>
              <option value="email">Email / mot de passe</option>
            </select>
          </div>

          {/* CVs filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Création de CV :</label>
            <select
              value={hasCvFilter}
              onChange={(e) => {
                setHasCvFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="with_cv">Avec au moins 1 CV</option>
              <option value="without_cv">Sans aucun CV</option>
            </select>
          </div>
        </div>
      </div>

      {/* State: Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchUsers} className="font-bold underline cursor-pointer">
            Réessayer
          </button>
        </div>
      )}

      {/* State: Loading */}
      {isLoading && users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement des utilisateurs...</p>
        </div>
      ) : processedUsers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Aucun utilisateur trouvé</p>
          <p className="text-xs text-slate-500">Aucun résultat ne correspond aux filtres de recherche.</p>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-4">
          {/* Desktop Table (Hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('full_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nom</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>E-mail</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Méthode</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Inscription</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('derniere_connexion')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Dernière co.</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('cv_count')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>CVs</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/70"
                      onClick={() => handleSort('pdf_exports_count')}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Exports</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => onSelectUser(u.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {u.full_name || 'Utilisateur sans nom'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                          {u.methode_connexion === 'google' ? 'Google' : 'Email'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(u.derniere_connexion)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-teal-700">
                        {u.cv_count}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {u.pdf_exports_count}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.statut === 'suspendu'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {u.statut === 'suspendu' ? 'Suspendu' : 'Actif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUser(u.id);
                          }}
                          className="px-2.5 py-1 text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Fiche</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (Android comfortable, Section 4.2) */}
          <div className="md:hidden space-y-3">
            {paginatedUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer active:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {u.full_name || 'Sans nom'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      u.statut === 'suspendu'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {u.statut === 'suspendu' ? 'Suspendu' : 'Actif'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">CVs créés :</span>
                    <span className="font-bold text-teal-700">{u.cv_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Méthode :</span>
                    <span className="font-semibold text-slate-700">
                      {u.methode_connexion === 'google' ? 'Google' : 'Email'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Inscrit le :</span>
                    <span className="text-slate-600 truncate block">{formatDate(u.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls (25 items per page) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-2xs text-xs">
              <span className="text-slate-500">
                Page <strong className="text-slate-800">{currentPage}</strong> sur{' '}
                <strong className="text-slate-800">{totalPages}</strong> ({processedUsers.length} résultats)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 cursor-pointer"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
