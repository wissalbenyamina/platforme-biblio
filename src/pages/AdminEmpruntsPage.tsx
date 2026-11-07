import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, ScanBarcode, CheckCircle2, AlertTriangle, AlertCircle, Clock, X, Check, Filter } from 'lucide-react';
import { Emprunt, Oeuvre, Adherent, Exemplaire } from '../types';
import { computeRetardStatus } from '../data/mockData';

interface AdminEmpruntsPageProps {
  emprunts: Emprunt[];
  oeuvres: Oeuvre[];
  adherents: Adherent[];
  exemplaires: Exemplaire[];
  onAddEmprunt: (newEmprunt: Emprunt) => void;
  onReturnEmprunt: (empruntId: string, exemplaireId: string) => void;
}

export const AdminEmpruntsPage: React.FC<AdminEmpruntsPageProps> = ({
  emprunts,
  oeuvres,
  adherents,
  exemplaires,
  onAddEmprunt,
  onReturnEmprunt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColor, setFilterColor] = useState<'ALL' | 'ROUGE' | 'JAUNE' | 'BLEU'>('ALL');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // New loan state
  const [loanIsbn, setLoanIsbn] = useState('');
  const [loanCarte, setLoanCarte] = useState('');
  const [loanError, setLoanError] = useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = useState<string | null>(null);

  // Return scan state
  const [returnIsbn, setReturnIsbn] = useState('');
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  // Computed and sorted loans
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

  // Filtered
  const filteredLoans = useMemo(() => {
    return activeLoans.filter((l) => {
      const matchColor = filterColor === 'ALL' || l.statut === filterColor;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        l.oeuvre_titre?.toLowerCase().includes(term) ||
        l.adherent_nom?.toLowerCase().includes(term) ||
        l.adherent_numero_carte?.toLowerCase().includes(term) ||
        l.oeuvre_isbn?.toLowerCase().includes(term);
      return matchColor && matchSearch;
    });
  }, [activeLoans, filterColor, searchTerm]);

  const handleRegisterLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanError(null);
    setLoanSuccess(null);

    const adherent = adherents.find(
      (a) => a.numero_carte.toUpperCase() === loanCarte.trim().toUpperCase()
    );
    if (!adherent) {
      setLoanError("Adhérent introuvable pour ce numéro de carte / CNE.");
      return;
    }

    const currentCount = emprunts.filter((emp) => emp.adherent_id === adherent.id && !emp.date_retour).length;
    if (currentCount >= 3) {
      setLoanError(`Règle d'affaires USMBA : Cet adhérent a déjà atteint le quota maximum de 3 emprunts.`);
      return;
    }

    const cleanIsbn = loanIsbn.replace(/[-\s]/g, '');
    const oeuvre = oeuvres.find((o) => o.isbn.replace(/[-\s]/g, '') === cleanIsbn);
    if (!oeuvre) {
      setLoanError("Aucun ouvrage ne correspond à cet ISBN dans le catalogue.");
      return;
    }

    const freeCopy = exemplaires.find((ex) => ex.oeuvre_id === oeuvre.id && ex.disponible);
    if (!freeCopy) {
      setLoanError("Tous les exemplaires physiques de cet ouvrage sont déjà prêtés.");
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
      exemplaire_id: freeCopy.id,
      oeuvre_id: oeuvre.id,
      oeuvre_titre: oeuvre.titre,
      oeuvre_isbn: oeuvre.isbn,
      oeuvre_couverture: oeuvre.couverture_url,
      date_emprunt: todayStr,
      date_retour_prevue: prevueStr,
      date_retour: null,
    };

    onAddEmprunt(newLoan);
    setLoanSuccess(`Prêt de 15 jours validé pour ${adherent.nom} !`);
    setLoanIsbn('');
    setLoanCarte('');

    setTimeout(() => {
      setIsLoanModalOpen(false);
      setLoanSuccess(null);
    }, 1500);
  };

  const handleRegisterReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = returnIsbn.replace(/[-\s]/g, '');
    const match = activeLoans.find((l) => l.oeuvre_isbn?.replace(/[-\s]/g, '') === clean);
    if (!match) {
      setReturnSuccess("Aucun emprunt actif ne correspond à cet ISBN.");
      return;
    }

    onReturnEmprunt(match.id, match.exemplaire_id);
    setReturnSuccess(`Livre "${match.oeuvre_titre}" restitué avec succès. Exemplaire remis en rayon.`);
    setReturnIsbn('');

    setTimeout(() => {
      setIsReturnModalOpen(false);
      setReturnSuccess(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestion des Emprunts & Retards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tableau des prêts actifs trié automatiquement par ordre d'urgence (Rouge en premier).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvel emprunt (Scan)</span>
          </button>
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>Retour de livre (Scan)</span>
          </button>
        </div>
      </div>

      {/* Search and Color Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par étudiant, CNE, livre..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        {/* Color filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Filtrer par statut :</span>
          {(['ALL', 'ROUGE', 'JAUNE', 'BLEU'] as const).map((col) => (
            <button
              key={col}
              onClick={() => setFilterColor(col)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterColor === col
                  ? col === 'ROUGE'
                    ? 'bg-red-600 text-white shadow-xs'
                    : col === 'JAUNE'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : col === 'BLEU'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {col === 'ALL' ? 'Tous' : col}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Loans */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Statut de retard</th>
                <th className="py-3.5 px-4">Ouvrage & ISBN</th>
                <th className="py-3.5 px-4">Adhérent & CNE</th>
                <th className="py-3.5 px-4">Date d'emprunt</th>
                <th className="py-3.5 px-4">Retour prévu</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun emprunt actif ne correspond à ce filtre.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isRouge = loan.statut === 'ROUGE';
                  const isJaune = loan.statut === 'JAUNE';

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isRouge
                          ? 'bg-red-50/20 dark:bg-red-950/10'
                          : isJaune
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : ''
                      }`}
                    >
                      {/* Statut */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs ${
                            isRouge
                              ? 'bg-red-600'
                              : isJaune
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                        >
                          {isRouge ? <AlertCircle className="w-3 h-3" /> : isJaune ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{loan.statut}</span>
                          <span className="opacity-90 font-normal">
                            ({isRouge || isJaune ? `+${loan.joursDiff}j` : `${loan.joursDiff}j restants`})
                          </span>
                        </span>
                      </td>

                      {/* Ouvrage */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {loan.oeuvre_titre}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {loan.oeuvre_isbn}
                        </div>
                      </td>

                      {/* Adhérent */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {loan.adherent_nom}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {loan.adherent_numero_carte}
                        </div>
                      </td>

                      {/* Date emprunt */}
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {loan.date_emprunt}
                      </td>

                      {/* Retour prévu */}
                      <td className="py-4 px-4 font-bold font-mono">
                        <span className={isRouge ? 'text-red-600 dark:text-red-400' : isJaune ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}>
                          {loan.date_retour_prevue}
                        </span>
                      </td>

                      {/* Action Retour */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onReturnEmprunt(loan.id, loan.exemplaire_id)}
                          className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 ml-auto shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Valider le retour</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouvel Emprunt */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enregistrer un nouvel emprunt
              </h3>
              <button
                onClick={() => { setIsLoanModalOpen(false); setLoanError(null); setLoanSuccess(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  1. Code-barres ISBN de l'ouvrage
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={loanIsbn}
                    onChange={(e) => setLoanIsbn(e.target.value)}
                    placeholder="978-2100825424"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setLoanIsbn(oeuvres[0]?.isbn || '978-2100825424')}
                    className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-semibold"
                  >
                    Simuler Scan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  2. Numéro de carte / CNE de l'adhérent
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={loanCarte}
                    onChange={(e) => setLoanCarte(e.target.value.toUpperCase())}
                    placeholder="N134089241"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setLoanCarte('N134089241')}
                    className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-semibold"
                  >
                    Carte Wissal
                  </button>
                </div>
              </div>

              {loanError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loanError}</span>
                </div>
              )}

              {loanSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{loanSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Confirmer l'emprunt (15 jours)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Retour Livre */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enregistrer un retour de livre
              </h3>
              <button
                onClick={() => { setIsReturnModalOpen(false); setReturnSuccess(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scanner le code-barres ISBN du livre rapporté
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={returnIsbn}
                    onChange={(e) => setReturnIsbn(e.target.value)}
                    placeholder="978-..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  {activeLoans[0]?.oeuvre_isbn && (
                    <button
                      type="button"
                      onClick={() => setReturnIsbn(activeLoans[0].oeuvre_isbn || '')}
                      className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-semibold"
                    >
                      Scan 1er retard
                    </button>
                  )}
                </div>
              </div>

              {returnSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{returnSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
              >
                Valider la restitution et libérer l'exemplaire
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
