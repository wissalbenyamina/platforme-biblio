import React, { useMemo } from 'react';
import { LayoutDashboard, AlertCircle, AlertTriangle, Clock, ArrowRight, BookOpen, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Emprunt, Oeuvre, Adherent } from '../types';
import { computeRetardStatus } from '../data/mockData';

interface AdminDashboardPageProps {
  emprunts: Emprunt[];
  oeuvres: Oeuvre[];
  adherents: Adherent[];
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  emprunts,
  oeuvres,
  adherents,
  onNavigate,
}) => {
  // Active loans calculation
  const activeLoans = useMemo(() => {
    return emprunts
      .filter((e) => !e.date_retour)
      .map((e) => {
        const { statut, joursDiff } = computeRetardStatus(e.date_retour_prevue, e.date_retour);
        let priority = 3;
        if (statut === 'ROUGE') priority = 1;
        else if (statut === 'JAUNE') priority = 2;
        return { ...e, statut, joursDiff, priority };
      })
      .sort((a, b) => a.priority - b.priority || b.joursDiff - a.joursDiff);
  }, [emprunts]);

  const stats = useMemo(() => {
    let bleus = 0;
    let jaunes = 0;
    let rouges = 0;
    activeLoans.forEach((l) => {
      if (l.statut === 'BLEU') bleus++;
      else if (l.statut === 'JAUNE') jaunes++;
      else if (l.statut === 'ROUGE') rouges++;
    });
    const total = activeLoans.length;
    return {
      bleus,
      jaunes,
      rouges,
      total,
      pctBleu: total > 0 ? (bleus / total) * 100 : 0,
      pctJaune: total > 0 ? (jaunes / total) * 100 : 0,
      pctRouge: total > 0 ? (rouges / total) * 100 : 0,
    };
  }, [activeLoans]);

  // Donut chart stroke-dasharray geometry (circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.32)
  const C = 251.32;
  const strokeRouge = (stats.pctRouge / 100) * C;
  const strokeJaune = (stats.pctJaune / 100) * C;
  const strokeBleu = (stats.pctBleu / 100) * C;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tableau de bord Bibliothécaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervision en temps réel des prêts universitaires et suivi d'urgence des retards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/emprunts')}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <span>Gérer les prêts & retours</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 STAT CARDS (Rouge, Jaune, Bleu) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Rouge : Grand retard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-red-200 dark:border-red-900/60 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>ROUGE · Grand retard</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
              {stats.rouges}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Retards &gt; 7 jours · Restitution urgente
            </p>
          </div>
          <span className="w-3 h-3 rounded-full bg-red-600" />
        </div>

        {/* Jaune : Petit retard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-900/60 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>JAUNE · Petit retard</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
              {stats.jaunes}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Retard entre 1 et 7 jours
            </p>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500" />
        </div>

        {/* Bleu : À temps */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-900/60 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
              <span>BLEU · Dans les délais</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
              {stats.bleus}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Prêts actifs &lt; 15 jours
            </p>
          </div>
          <span className="w-3 h-3 rounded-full bg-blue-600" />
        </div>
      </div>

      {/* DONUT CHART & REPARTITION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3-Color Donut Chart Card */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Graphique en anneau (3 couleurs)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ventilation des {stats.total} emprunts selon la vue SQL live
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Total : {stats.total}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            {/* SVG Donut */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* ROUGE segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="14"
                  strokeDasharray={`${strokeRouge} ${C}`}
                  strokeDashoffset="0"
                  className="transition-all duration-500"
                />
                {/* JAUNE segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="14"
                  strokeDasharray={`${strokeJaune} ${C}`}
                  strokeDashoffset={-strokeRouge}
                  className="transition-all duration-500"
                />
                {/* BLEU segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="14"
                  strokeDasharray={`${strokeBleu} ${C}`}
                  strokeDashoffset={-(strokeRouge + strokeJaune)}
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {stats.total}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Prêts actifs
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span className="font-bold text-red-700 dark:text-red-300">Rouge (&gt; 7j)</span>
                </div>
                <span className="font-extrabold text-red-900 dark:text-red-200">
                  {stats.rouges} ({Math.round(stats.pctRouge)}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-700 dark:text-amber-300">Jaune (1-7j)</span>
                </div>
                <span className="font-extrabold text-amber-900 dark:text-amber-200">
                  {stats.jaunes} ({Math.round(stats.pctJaune)}%)
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="font-bold text-blue-700 dark:text-blue-300">Bleu (À temps)</span>
                </div>
                <span className="font-extrabold text-blue-900 dark:text-blue-200">
                  {stats.bleus} ({Math.round(stats.pctBleu)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Urgent Loans preview */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prêts prioritaires (Triés par urgence)
              </h3>
              <button
                onClick={() => onNavigate('/admin/emprunts')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Tout voir →
              </button>
            </div>

            <div className="space-y-2.5">
              {activeLoans.slice(0, 3).map((loan) => (
                <div
                  key={loan.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                    loan.statut === 'ROUGE'
                      ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-900'
                      : loan.statut === 'JAUNE'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                      : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white ${
                          loan.statut === 'ROUGE'
                            ? 'bg-red-600'
                            : loan.statut === 'JAUNE'
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                      >
                        {loan.statut}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {loan.oeuvre_titre}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Adhérent : <strong>{loan.adherent_nom}</strong> ({loan.adherent_numero_carte})
                    </p>
                  </div>

                  <span className="text-xs font-bold font-mono">
                    {loan.statut === 'ROUGE' || loan.statut === 'JAUNE'
                      ? `+${loan.joursDiff} jours`
                      : `${loan.joursDiff} j. restants`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Règle USMBA : 3 livres max · 15 jours</span>
            <button
              onClick={() => onNavigate('/admin/emprunts')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400"
            >
              Accéder au module d'emprunt & retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
