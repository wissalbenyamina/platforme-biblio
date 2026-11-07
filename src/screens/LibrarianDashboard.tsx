import React, { useState, useMemo } from 'react';
import { BarChart3, ScanBarcode, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, AlertCircle, Clock, User, BookOpen, RefreshCw, X, PlusCircle, Check } from 'lucide-react';
import { Emprunt, Oeuvre, Adherent, Exemplaire } from '../types';
import { computeRetardStatus } from '../data/mockData';

interface LibrarianDashboardProps {
  emprunts: Emprunt[];
  oeuvres: Oeuvre[];
  adherents: Adherent[];
  exemplaires: Exemplaire[];
  onAddEmprunt: (newEmprunt: Emprunt) => void;
  onReturnEmprunt: (empruntId: string, exemplaireId: string) => void;
}

export const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({
  emprunts,
  oeuvres,
  adherents,
  exemplaires,
  onAddEmprunt,
  onReturnEmprunt,
}) => {
  const [filterStatut, setFilterStatut] = useState<'ALL' | 'ROUGE' | 'JAUNE' | 'BLEU'>('ALL');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // New loan form state
  const [scanIsbn, setScanIsbn] = useState('');
  const [scanCarte, setScanCarte] = useState('');
  const [loanError, setLoanError] = useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = useState<string | null>(null);

  // Return scan state
  const [returnScanIsbn, setReturnScanIsbn] = useState('');
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  // Compute delay statuses and sort by urgency (ROUGE first, then JAUNE, then BLEU)
  const activeLoansWithStatus = useMemo(() => {
    return emprunts
      .filter((e) => !e.date_retour)
      .map((e) => {
        const { statut, joursDiff } = computeRetardStatus(e.date_retour_prevue, e.date_retour);
        let priority = 3; // BLEU
        if (statut === 'ROUGE') priority = 1;
        else if (statut === 'JAUNE') priority = 2;
        return {
          ...e,
          statut,
          joursDiff,
          priority,
        };
      })
      .sort((a, b) => a.priority - b.priority || b.joursDiff - a.joursDiff);
  }, [emprunts]);

  // Statistics for the 3-color breakdown chart
  const stats = useMemo(() => {
    let bleus = 0;
    let jaunes = 0;
    let rouges = 0;
    activeLoansWithStatus.forEach((l) => {
      if (l.statut === 'BLEU') bleus++;
      else if (l.statut === 'JAUNE') jaunes++;
      else if (l.statut === 'ROUGE') rouges++;
    });
    const total = activeLoansWithStatus.length;
    return {
      bleus,
      jaunes,
      rouges,
      total,
      pctBleu: total > 0 ? (bleus / total) * 100 : 0,
      pctJaune: total > 0 ? (jaunes / total) * 100 : 0,
      pctRouge: total > 0 ? (rouges / total) * 100 : 0,
    };
  }, [activeLoansWithStatus]);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    if (filterStatut === 'ALL') return activeLoansWithStatus;
    return activeLoansWithStatus.filter((l) => l.statut === filterStatut);
  }, [activeLoansWithStatus, filterStatut]);

  // Handle adding an emprunt (Scanner ISBN + Carte Adhérent)
  const handleRegisterLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanError(null);
    setLoanSuccess(null);

    // 1. Find adherent
    const adherent = adherents.find(
      (a) => a.numero_carte.toUpperCase() === scanCarte.trim().toUpperCase()
    );
    if (!adherent) {
      setLoanError("Adhérent non trouvé pour ce numéro de carte. Vérifiez le CNE.");
      return;
    }

    // 2. Check 3-loan limit
    const activeCount = emprunts.filter(
      (emp) => emp.adherent_id === adherent.id && !emp.date_retour
    ).length;
    if (activeCount >= 3) {
      setLoanError(`Règle d'affaires USMBA : Cet adhérent a déjà ${activeCount}/3 emprunts en cours.`);
      return;
    }

    // 3. Find book
    const cleanedIsbn = scanIsbn.replace(/[-\s]/g, '');
    const oeuvre = oeuvres.find(
      (o) => o.isbn.replace(/[-\s]/g, '') === cleanedIsbn
    );
    if (!oeuvre) {
      setLoanError("Ouvrage non trouvé pour cet ISBN dans le catalogue.");
      return;
    }

    // 4. Find available copy
    const dispoEx = exemplaires.find(
      (ex) => ex.oeuvre_id === oeuvre.id && ex.disponible
    );
    if (!dispoEx) {
      setLoanError("Aucun exemplaire physique de cet ouvrage n'est disponible en rayon.");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const prevueDate = new Date();
    prevueDate.setDate(prevueDate.getDate() + 15);
    const prevueStr = prevueDate.toISOString().split('T')[0];

    const newLoan: Emprunt = {
      id: `emp-${Date.now()}`,
      adherent_id: adherent.id,
      adherent_nom: adherent.nom,
      adherent_numero_carte: adherent.numero_carte,
      exemplaire_id: dispoEx.id,
      oeuvre_id: oeuvre.id,
      oeuvre_titre: oeuvre.titre,
      oeuvre_isbn: oeuvre.isbn,
      oeuvre_couverture: oeuvre.couverture_url,
      date_emprunt: todayStr,
      date_retour_prevue: prevueStr,
      date_retour: null,
    };

    onAddEmprunt(newLoan);
    setLoanSuccess(`Emprunt validé avec succès pour ${adherent.nom} (Retour max : ${prevueStr})`);
    setScanIsbn('');
    setScanCarte('');

    setTimeout(() => {
      setIsLoanModalOpen(false);
      setLoanSuccess(null);
    }, 1800);
  };

  // Handle return by ISBN scan
  const handleRegisterReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedIsbn = returnScanIsbn.replace(/[-\s]/g, '');
    const activeMatch = activeLoansWithStatus.find(
      (l) => l.oeuvre_isbn?.replace(/[-\s]/g, '') === cleanedIsbn
    );

    if (!activeMatch) {
      setReturnSuccess("Aucun emprunt en cours ne correspond à cet ISBN.");
      return;
    }

    onReturnEmprunt(activeMatch.id, activeMatch.exemplaire_id);
    setReturnSuccess(`Retour validé pour "${activeMatch.oeuvre_titre}" ! Exemplaire remis en rayon.`);
    setReturnScanIsbn('');

    setTimeout(() => {
      setIsReturnModalOpen(false);
      setReturnSuccess(null);
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-full px-4 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestion des emprunts et retards · Bibliothèque Universitaire USMBA
          </p>
        </div>
      </div>

      {/* 3-Color Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Répartition des retards ({stats.total} prêts actifs)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Vue SQL live</span>
        </div>

        {/* 3-Color Horizontal Stacked Bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
          {stats.rouges > 0 && (
            <div
              style={{ width: `${stats.pctRouge}%` }}
              className="bg-red-600 rounded-l-full transition-all"
              title={`Rouges: ${stats.rouges}`}
            />
          )}
          {stats.jaunes > 0 && (
            <div
              style={{ width: `${stats.pctJaune}%` }}
              className="bg-amber-500 transition-all"
              title={`Jaunes: ${stats.jaunes}`}
            />
          )}
          {stats.bleus > 0 && (
            <div
              style={{ width: `${stats.pctBleu}%` }}
              className="bg-blue-600 rounded-r-full transition-all"
              title={`Bleus: ${stats.bleus}`}
            />
          )}
        </div>

        {/* 3-Color Stat Counters (Clickable filters) */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setFilterStatut(filterStatut === 'ROUGE' ? 'ALL' : 'ROUGE')}
            className={`p-2 rounded-xl text-center border transition ${
              filterStatut === 'ROUGE'
                ? 'bg-red-50 dark:bg-red-950/60 border-red-500 ring-2 ring-red-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>ROUGE</span>
            </div>
            <p className="text-base font-extrabold text-red-700 dark:text-red-300 tabular-nums">
              {stats.rouges}
            </p>
            <p className="text-[10px] text-slate-400">&gt; 7 j. retard</p>
          </button>

          <button
            onClick={() => setFilterStatut(filterStatut === 'JAUNE' ? 'ALL' : 'JAUNE')}
            className={`p-2 rounded-xl text-center border transition ${
              filterStatut === 'JAUNE'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>JAUNE</span>
            </div>
            <p className="text-base font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">
              {stats.jaunes}
            </p>
            <p className="text-[10px] text-slate-400">1 à 7 j. retard</p>
          </button>

          <button
            onClick={() => setFilterStatut(filterStatut === 'BLEU' ? 'ALL' : 'BLEU')}
            className={`p-2 rounded-xl text-center border transition ${
              filterStatut === 'BLEU'
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-400'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>BLEU</span>
            </div>
            <p className="text-base font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">
              {stats.bleus}
            </p>
            <p className="text-[10px] text-slate-400">À temps</p>
          </button>
        </div>
      </div>

      {/* Librarian Scan Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setIsLoanModalOpen(true)}
          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvel emprunt (Scan)</span>
        </button>
        <button
          onClick={() => setIsReturnModalOpen(true)}
          className="py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
        >
          <ScanBarcode className="w-4 h-4" />
          <span>Retour de livre (Scan)</span>
        </button>
      </div>

      {/* Urgency-Sorted Loans List */}
      <div className="space-y-2.5 flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Emprunts triés par urgence (Rouge en premier)
          </span>
          {filterStatut !== 'ALL' && (
            <button
              onClick={() => setFilterStatut('ALL')}
              className="text-blue-600 dark:text-blue-400 font-semibold"
            >
              Tous voir
            </button>
          )}
        </div>

        {filteredLoans.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Aucun emprunt dans cette catégorie
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isRouge = loan.statut === 'ROUGE';
            const isJaune = loan.statut === 'JAUNE';

            return (
              <div
                key={loan.id}
                className={`p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs flex flex-col gap-2 transition ${
                  isRouge
                    ? 'border-red-400 dark:border-red-800/80 bg-red-50/20 dark:bg-red-950/10'
                    : isJaune
                    ? 'border-amber-400 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                          isRouge
                            ? 'bg-red-600'
                            : isJaune
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                      >
                        {loan.statut} : {isRouge || isJaune ? `+${loan.joursDiff} jours` : `${loan.joursDiff} j. restants`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {loan.date_retour_prevue}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {loan.oeuvre_titre}
                    </h4>

                    {/* Student Info */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{loan.adherent_nom}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {loan.adherent_numero_carte}
                      </span>
                    </div>
                  </div>

                  {/* Direct Return Button */}
                  <button
                    onClick={() => onReturnEmprunt(loan.id, loan.exemplaire_id)}
                    className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-medium transition shrink-0"
                  >
                    Valider retour
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nouvel Emprunt par Scan (ISBN + Carte Adhérent) */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enregistrer un emprunt (Scan)
              </h3>
              <button
                onClick={() => { setIsLoanModalOpen(false); setLoanError(null); setLoanSuccess(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Le bibliothécaire scanne l'ISBN du livre et la carte d'étudiant de l'adhérent (règle max 3 livres).
            </p>

            <form onSubmit={handleRegisterLoan} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Code-barres ISBN du livre
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={scanIsbn}
                    onChange={(e) => setScanIsbn(e.target.value)}
                    placeholder="978-2100825424"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setScanIsbn(oeuvres[0]?.isbn || '978-2100825424')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Simuler Scan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Numéro de carte / CNE Adhérent
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={scanCarte}
                    onChange={(e) => setScanCarte(e.target.value.toUpperCase())}
                    placeholder="N134089241"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setScanCarte('N134089241')}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Carte Wissal
                  </button>
                </div>
              </div>

              {loanError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loanError}</span>
                </div>
              )}

              {loanSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loanSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Valider l'emprunt (15 jours)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Retour par Scan ISBN */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enregistrer un retour (Scan ISBN)
              </h3>
              <button
                onClick={() => { setIsReturnModalOpen(false); setReturnSuccess(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterReturn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scanner le code-barres ISBN du livre rendu
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={returnScanIsbn}
                    onChange={(e) => setReturnScanIsbn(e.target.value)}
                    placeholder="978-..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  {activeLoansWithStatus[0]?.oeuvre_isbn && (
                    <button
                      type="button"
                      onClick={() => setReturnScanIsbn(activeLoansWithStatus[0].oeuvre_isbn || '')}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                    >
                      Scan 1er retard
                    </button>
                  )}
                </div>
              </div>

              {returnSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{returnSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer la restitution</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
