import React from 'react';
import { Clock, AlertTriangle, AlertCircle, BookMarked, Bell, Shield, Info, CheckCircle2, BookOpen } from 'lucide-react';
import { Emprunt, Adherent } from '../types';
import { computeRetardStatus } from '../data/mockData';

interface MesEmpruntsPageProps {
  emprunts: Emprunt[];
  currentUser: Adherent;
  onNavigate: (path: string) => void;
}

export const MesEmpruntsPage: React.FC<MesEmpruntsPageProps> = ({ emprunts, currentUser, onNavigate }) => {
  const myLoans = emprunts.filter((e) => e.adherent_id === currentUser.id && !e.date_retour);
  const quotaUsed = myLoans.length;
  const quotaMax = 3;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mes Emprunts en cours
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Suivi personnalisé des prêts de <strong>{currentUser.nom}</strong> ({currentUser.numero_carte} · {currentUser.filiere})
          </p>
        </div>

        {/* Quota Indicator */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Quota utilisé</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {quotaUsed} / {quotaMax} livres empruntés
            </span>
          </div>
          <div className="w-12 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ml-2">
            <div
              className={`h-full ${quotaUsed >= quotaMax ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${(quotaUsed / quotaMax) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rules & Color Code Legend Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Code couleur officiel de la bibliothèque USMBA
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-blue-800 dark:text-blue-200">BLEU</span>
              </div>
              <p className="text-xs font-semibold text-blue-950 dark:text-blue-100 mt-1">Pas en retard</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">Date de retour non dépassée</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">JAUNE</span>
              </div>
              <p className="text-xs font-semibold text-amber-950 dark:text-amber-100 mt-1">Petit retard</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">1 à 7 jours de retard</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-xs font-bold text-red-800 dark:text-red-200">ROUGE</span>
              </div>
              <p className="text-xs font-semibold text-red-950 dark:text-red-100 mt-1">Grand retard</p>
              <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5">Plus de 7 jours de retard</p>
            </div>
          </div>
        </div>

        {/* Email Reminder Alerts */}
        <div className="md:col-span-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl p-6 border border-blue-200 dark:border-blue-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-200 mb-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Rappels par email automatiques</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Le service cron de Supabase envoie automatiquement :
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 mt-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Un rappel <strong>2 jours avant</strong> l'échéance.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Une notification d'alerte lors du passage au statut <strong>Rouge</strong>.</span>
              </li>
            </ul>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-mono">
            Adresse liée : {currentUser.email}
          </p>
        </div>
      </div>

      {/* Loans Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Détail de vos emprunts en cours ({myLoans.length})
        </h2>

        {myLoans.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun emprunt en cours</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Vous n'avez aucun livre emprunté en ce moment. Vous pouvez sélectionner jusqu'à 3 ouvrages au catalogue.
            </p>
            <button
              onClick={() => onNavigate('/catalogue')}
              className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myLoans.map((loan) => {
              const { statut, joursDiff } = computeRetardStatus(loan.date_retour_prevue, loan.date_retour);

              const colorConfig = {
                BLEU: {
                  badge: 'bg-blue-600 text-white',
                  border: 'border-blue-300 dark:border-blue-800',
                  bg: 'bg-blue-50/20 dark:bg-blue-950/10',
                  icon: Clock,
                  text: `Dans les délais (${joursDiff} jours restants)`,
                },
                JAUNE: {
                  badge: 'bg-amber-500 text-white',
                  border: 'border-amber-300 dark:border-amber-800',
                  bg: 'bg-amber-50/20 dark:bg-amber-950/10',
                  icon: AlertTriangle,
                  text: `Petit retard : +${joursDiff} jour(s)`,
                },
                ROUGE: {
                  badge: 'bg-red-600 text-white',
                  border: 'border-red-400 dark:border-red-800',
                  bg: 'bg-red-50/20 dark:bg-red-950/10',
                  icon: AlertCircle,
                  text: `Grand retard : +${joursDiff} jours (Urgent)`,
                },
                RETOURNE: {
                  badge: 'bg-slate-500 text-white',
                  border: 'border-slate-200',
                  bg: 'bg-slate-50',
                  icon: CheckCircle2,
                  text: 'Retourné',
                },
              }[statut];

              const Icon = colorConfig.icon;

              return (
                <div
                  key={loan.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 ${colorConfig.border} ${colorConfig.bg} shadow-sm flex flex-col justify-between`}
                >
                  <div className="flex gap-4">
                    <img
                      src={loan.oeuvre_couverture || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                      alt={loan.oeuvre_titre}
                      className="w-24 h-32 object-cover rounded-2xl shadow-md shrink-0 bg-slate-100 dark:bg-slate-800"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs mb-2 ${colorConfig.badge}">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colorConfig.badge} flex items-center gap-1`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{colorConfig.text}</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {loan.oeuvre_titre}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                          ISBN : {loan.oeuvre_isbn}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>Date d'emprunt :</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{loan.date_emprunt}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Retour prévu avant :</span>
                          <span className="font-bold text-slate-900 dark:text-white">{loan.date_retour_prevue}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {statut === 'ROUGE' && (
                    <div className="mt-4 p-3 rounded-2xl bg-red-100/70 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Ce prêt dépasse 7 jours de retard. Veuillez restituer l'ouvrage à la bibliothèque immédiatement.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
