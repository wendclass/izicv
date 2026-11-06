import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Download,
  Share2,
  Smartphone,
  TrendingUp,
  Calendar,
  Layers,
  Palette,
  Globe,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export const OverviewSection: React.FC = () => {
  const { adminToken } = useAdmin();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async (selectedPeriod = period) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/overview?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer la vue d ensemble');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(period);
  }, [period]);

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || {};
  const breakdowns = data?.breakdowns || {};
  const dailySignups = data?.dailySignups || [];

  // Max count for chart scaling
  const maxDailyCount = Math.max(...dailySignups.map((d: any) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header and Period Selector (Section 4.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Vue d'ensemble
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Chiffres clés, taux de conversion et croissance de l'application.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Period selector */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center text-xs font-semibold text-slate-600">
            {[
              { id: '7d', label: '7 jours' },
              { id: '30d', label: '30 jours' },
              { id: '90d', label: '90 jours' },
              { id: 'all', label: 'Tout' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === p.id
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchOverview(period)}
            disabled={isLoading}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Actualiser les statistiques"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* State: Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchOverview(period)}
            className="font-bold underline cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Key Metric Cards Grid (Section 4.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total utilisateurs</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalUsers ?? 0}
          </div>
          <p className="text-[11px] text-teal-700 font-medium">
            +{metrics.newUsersInPeriod ?? 0} sur la période
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Utilisateurs actifs</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.activeUsers ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">Au moins 1 action récente</p>
        </div>

        {/* Resumes Created */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">CVs créés</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalResumes ?? 0}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">
            +{metrics.resumesInPeriod ?? 0} sur la période
          </p>
        </div>

        {/* PDF Exports */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Exports PDF vectoriels</span>
            <Download className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalPdfExports ?? 0}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            {metrics.pdfShares ?? 0} partages • {metrics.pwaInstalls ?? 0} PWA
          </p>
        </div>
      </div>

      {/* Funnel of Conversion (Section 4.1: Taux de passage) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Taux de passage (Tunnel d'utilisation)
          </h3>
          <span className="text-xs text-slate-400">De l'inscription à l'export</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Step 1: Inscrits */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-slate-500 font-semibold block">1. Utilisateurs inscrits</span>
            <div className="text-xl font-black text-slate-800">{funnel.totalRegistered ?? 0}</div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full w-full" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">100% du socle</span>
          </div>

          {/* Step 2: Création de CV */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-slate-500 font-semibold block">2. Ont créé au moins 1 CV</span>
            <div className="text-xl font-black text-teal-700">
              {funnel.usersWithCv ?? 0}{' '}
              <span className="text-xs font-normal text-slate-500">({funnel.rateCreateCv ?? 0}%)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, funnel.rateCreateCv ?? 0)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Taux de conversion création
            </span>
          </div>

          {/* Step 3: Export PDF */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="text-slate-500 font-semibold block">3. Ont exporté un PDF</span>
            <div className="text-xl font-black text-emerald-700">
              {funnel.usersWithExport ?? 0}{' '}
              <span className="text-xs font-normal text-slate-500">({funnel.rateExportPdf ?? 0}%)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, funnel.rateExportPdf ?? 0)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Taux de finalisation vers l'emploi
            </span>
          </div>
        </div>
      </div>

      {/* Daily Signups Chart (Section 4.1: Courbe des inscriptions) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Inscriptions par jour
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {dailySignups.length} derniers jours
          </span>
        </div>

        {/* Responsive Bar Chart without horizontal scroll */}
        <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 px-1 border-b border-slate-100">
          {dailySignups.map((item: any, idx: number) => {
            const heightPercent = maxDailyCount > 0 ? (item.count / maxDailyCount) * 100 : 0;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-xs">
                  {item.date} : {item.count} inscrit{item.count > 1 ? 's' : ''}
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    item.count > 0
                      ? 'bg-teal-500 hover:bg-teal-600 group-hover:bg-teal-600'
                      : 'bg-slate-100'
                  }`}
                  style={{ height: `${Math.max(item.count > 0 ? 8 : 2, heightPercent)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{dailySignups[0]?.date || ''}</span>
          <span>Aujourd'hui</span>
        </div>
      </div>

      {/* Breakdowns Grid (Section 4.1: Modèle, Couleur, Appareil, Pays) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Template Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Modèles de CV</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">Moderne (Sidebar)</span>
                <span className="font-bold text-teal-700">
                  {breakdowns.templates?.['modern-sidebar'] || 0}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full"
                  style={{
                    width: `${
                      (breakdowns.templates?.['modern-sidebar'] || 0) +
                        (breakdowns.templates?.['minimalist-clean'] || 0) >
                      0
                        ? ((breakdowns.templates?.['modern-sidebar'] || 0) /
                            ((breakdowns.templates?.['modern-sidebar'] || 0) +
                              (breakdowns.templates?.['minimalist-clean'] || 0))) *
                          100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-700">Minimaliste (Clean)</span>
                <span className="font-bold text-teal-700">
                  {breakdowns.templates?.['minimalist-clean'] || 0}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-400 h-full"
                  style={{
                    width: `${
                      (breakdowns.templates?.['modern-sidebar'] || 0) +
                        (breakdowns.templates?.['minimalist-clean'] || 0) >
                      0
                        ? ((breakdowns.templates?.['minimalist-clean'] || 0) /
                            ((breakdowns.templates?.['modern-sidebar'] || 0) +
                              (breakdowns.templates?.['minimalist-clean'] || 0))) *
                          100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Palette className="w-4 h-4 text-teal-600" />
            <span>Couleurs d'accent</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(breakdowns.colors || {}).length === 0 ? (
              <span className="text-[11px] text-slate-400">Aucune donnée</span>
            ) : (
              Object.entries(breakdowns.colors || {}).map(([hex, count]: any) => (
                <div
                  key={hex}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-bold text-slate-700">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>Types d'appareils</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">Android</span>
              <span className="font-bold text-slate-800">{breakdowns.devices?.android || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">iPhone / iOS</span>
              <span className="font-bold text-slate-800">{breakdowns.devices?.ios || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-600 font-medium">Ordinateur (Desktop)</span>
              <span className="font-bold text-slate-800">{breakdowns.devices?.desktop || 0}</span>
            </div>
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Pays détectés</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {Object.entries(breakdowns.countries || {}).length === 0 ? (
              <span className="text-[11px] text-slate-400">Aucune donnée</span>
            ) : (
              Object.entries(breakdowns.countries || {}).slice(0, 4).map(([code, count]: any) => (
                <div key={code} className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-slate-700">{code}</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
