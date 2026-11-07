import React from 'react';
import { Clock, AlertTriangle, AlertCircle, BookMarked, Bell, Shield, Info, CheckCircle2 } from 'lucide-react';
import { Emprunt, Adherent } from '../types';
import { computeRetardStatus } from '../data/mockData';

interface MyLoansScreenProps {
  emprunts: Emprunt[];
  currentUser: Adherent;
}

export const MyLoansScreen: React.FC<MyLoansScreenProps> = ({ emprunts, currentUser }) => {
  // Filter loans only for the current user (RLS simulation)
  const myLoans = emprunts.filter((e) => e.adherent_id === currentUser.id && !e.date_retour);

  // Quota calculation (max 3 books)
  const quotaUsed = myLoans.length;
  const quotaMax = 3;

  return (
    <div className="flex flex-col min-h-full px-4 py-4 pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mes Emprunts</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suivi en temps réel de vos prêts auprès de la bibliothèque USMBA.
        </p>
      </div>

      {/* Quota & Rules Card */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3.5 mb-4 border border-slate-200 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Quota d’emprunts en cours</span>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs">
            {quotaUsed} / {quotaMax} livres
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${
              quotaUsed >= quotaMax ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${(quotaUsed / quotaMax) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Durée maximale : 15 jours</span>
          <span>{quotaMax - quotaUsed} prêt(s) restant(s)</span>
        </div>
      </div>

      {/* Code Couleur Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 mb-4 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5 shadow-xs">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Code couleur officiel des retards :</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-medium">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
            <span className="font-bold">BLEU</span>
            <p className="text-[10px] opacity-80">À temps</p>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
            <span className="font-bold">JAUNE</span>
            <p className="text-[10px] opacity-80">1 à 7 j. retard</p>
          </div>
          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
            <span className="font-bold">ROUGE</span>
            <p className="text-[10px] opacity-80">&gt; 7 j. retard</p>
          </div>
        </div>
      </div>

      {/* Push Notifications Section */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-900/50">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-950 dark:text-blue-200">
          <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Système de notifications push actives</span>
        </div>
        <div className="space-y-1.5">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Rappel J-2 : </span>
              Notification automatique 48h avant la date limite de retour de chaque ouvrage.
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-600 dark:text-red-400">Alerte passage Rouge : </span>
              Notification d'urgence dès que le retard dépasse 7 jours pour restitution immédiate.
            </div>
          </div>
        </div>
      </div>

      {/* List of Loans */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ouvrages empruntés ({myLoans.length})
        </h2>

        {myLoans.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aucun emprunt en cours</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
              Vous n'avez aucun livre emprunté en ce moment. Vous pouvez emprunter jusqu'à 3 livres au catalogue.
            </p>
          </div>
        ) : (
          myLoans.map((loan) => {
            const { statut, joursDiff } = computeRetardStatus(loan.date_retour_prevue, loan.date_retour);

            // Style configuration based on BLEU, JAUNE, ROUGE
            const colorConfig = {
              BLEU: {
                badgeBg: 'bg-blue-600 text-white',
                border: 'border-blue-400 dark:border-blue-700',
                cardBg: 'bg-blue-50/40 dark:bg-blue-950/20',
                icon: Clock,
                statusText: `Dans les délais (${joursDiff} j. restants)`,
                textColor: 'text-blue-700 dark:text-blue-300',
              },
              JAUNE: {
                badgeBg: 'bg-amber-500 text-white',
                border: 'border-amber-400 dark:border-amber-600',
                cardBg: 'bg-amber-50/40 dark:bg-amber-950/20',
                icon: AlertTriangle,
                statusText: `Petit retard (${joursDiff} jour${joursDiff > 1 ? 's' : ''})`,
                textColor: 'text-amber-700 dark:text-amber-300',
              },
              ROUGE: {
                badgeBg: 'bg-red-600 text-white',
                border: 'border-red-500 dark:border-red-700',
                cardBg: 'bg-red-50/40 dark:bg-red-950/20',
                icon: AlertCircle,
                statusText: `Grand retard (${joursDiff} jours · Urgent)`,
                textColor: 'text-red-700 dark:text-red-300',
              },
              RETOURNE: {
                badgeBg: 'bg-slate-500 text-white',
                border: 'border-slate-200',
                cardBg: 'bg-slate-50',
                icon: CheckCircle2,
                statusText: 'Retourné',
                textColor: 'text-slate-500',
              },
            }[statut];

            const StatusIcon = colorConfig.icon;

            return (
              <div
                key={loan.id}
                className={`rounded-2xl p-4 border-2 ${colorConfig.border} ${colorConfig.cardBg} bg-white dark:bg-slate-900 shadow-sm transition`}
              >
                <div className="flex gap-3">
                  <img
                    src={loan.oeuvre_couverture || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'}
                    alt={loan.oeuvre_titre}
                    className="w-16 h-22 object-cover rounded-xl shadow-xs shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Color Status Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorConfig.badgeBg} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{colorConfig.statusText}</span>
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {loan.oeuvre_titre}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        ISBN : {loan.oeuvre_isbn}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span>Emprunté le :</span>
                        <span className="font-medium">{loan.date_emprunt}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Retour prévu :</span>
                        <span className={colorConfig.textColor}>{loan.date_retour_prevue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {statut === 'ROUGE' && (
                  <div className="mt-3 p-2 rounded-xl bg-red-100/80 dark:bg-red-950/80 text-red-800 dark:text-red-200 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Rappel urgent : Déposez cet exemplaire à la bibliothèque dès aujourd’hui.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
