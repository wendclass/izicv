import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { AuditLogSection } from './AuditLogSection';
import { UsersListSection } from './UsersListSection';
import { UserDetailSection } from './UserDetailSection';

type AdminSection = 'overview' | 'users' | 'activity' | 'audit' | 'settings';

export const AdminLayout: React.FC = () => {
  const { adminEmail, logout } = useAdmin();
  const [currentSection, setCurrentSection] = useState<AdminSection>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, phase: 'Phase 3' },
    { id: 'users', label: 'Utilisateurs', icon: Users, phase: 'Actif' },
    { id: 'activity', label: 'Activité', icon: Activity, phase: 'Phase 3' },
    { id: 'audit', label: "Journal d'audit", icon: ShieldAlert, phase: 'Actif' },
    { id: 'settings', label: 'Réglages', icon: Settings, phase: 'Actif' },
  ];

  const handleNavClick = (sectionId: AdminSection) => {
    setCurrentSection(sectionId);
    setSelectedUserId(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Top Mobile Bar */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="iziCV" className="w-8 h-8 rounded-xl shadow-xs" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">iziCV Admin</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-teal-50 text-teal-700 font-bold rounded-full border border-teal-200">
                Class S
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{adminEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-xl bg-slate-50 border border-slate-200"
          aria-label="Menu de navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-slate-900/40 backdrop-blur-xs z-30 flex flex-col">
          <div className="bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Connecté en tant que :</span>
              <span className="font-bold text-slate-700 truncate max-w-[180px]">{adminEmail}</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id as AdminSection)}
                    className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.phase !== 'Actif' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.phase}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={logout}
                className="w-full min-h-[48px] px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-screen">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="iziCV" className="w-9 h-9 rounded-xl shadow-xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">iziCV Admin</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 bg-teal-50 text-teal-700 font-bold rounded-full border border-teal-200">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Class S Administration</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id as AdminSection)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.phase !== 'Actif' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-normal ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {item.phase}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Session info & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-teal-600" />
              <span>Session active (max 2h)</span>
            </div>
            <p className="text-xs font-bold text-slate-700 truncate" title={adminEmail || ''}>
              {adminEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full min-h-[42px] px-3 py-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {currentSection === 'audit' && <AuditLogSection />}

        {currentSection === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h2>
                <p className="text-xs sm:text-sm text-slate-500">Statistiques globales, taux de passage et croissance.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Module prévu pour la Phase 3</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                La table des événements et les cartes de métriques clés (utilisateurs, CV créés, exports PDF, graphiques de répartition) seront activées dès la validation de la Phase 1 et 2.
              </p>
            </div>
          </div>
        )}

        {currentSection === 'users' && (
          selectedUserId ? (
            <UserDetailSection
              userId={selectedUserId}
              onBack={() => setSelectedUserId(null)}
            />
          ) : (
            <UsersListSection
              onSelectUser={(userId) => {
                setSelectedUserId(userId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}

        {currentSection === 'activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Activité en direct</h2>
                <p className="text-xs sm:text-sm text-slate-500">Flux d'événements et diagnostic des erreurs d'export.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-700">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Module prévu pour la Phase 3</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Le flux chronologique des événements de l'application et les alertes d'erreurs PDF seront connectés avec la télémétrie.
              </p>
            </div>
          </div>
        )}

        {currentSection === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Réglages du tableau de bord</h2>
              <p className="text-xs sm:text-sm text-slate-500">Paramètres de sécurité et de session de l'administrateur.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Adresse Google Administrateur autorisée
                </label>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 font-bold flex items-center justify-between">
                  <span>{adminEmail}</span>
                  <span className="text-[10px] font-sans font-normal text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    ADMIN_EMAIL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Cette valeur est configurée côté serveur via la variable d'environnement ADMIN_EMAIL et ne peut être modifiée depuis l'interface web.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Sécurité de session</h4>
                <ul className="text-xs text-slate-500 space-y-1 list-disc pl-5">
                  <li>Expiration automatique après 2 heures d'inactivité.</li>
                  <li>Protection contre les tentatives répétées (blocage 404).</li>
                  <li>Réponse 404 trompeuse pour tout visiteur non autorisé.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[44px] px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Fermer la session administrateur</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
