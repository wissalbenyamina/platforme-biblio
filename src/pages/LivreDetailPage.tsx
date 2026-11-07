import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Bookmark, Share2, Shield, Clock } from 'lucide-react';
import { Oeuvre, Adherent } from '../types';

interface LivreDetailPageProps {
  book: Oeuvre;
  currentUser: Adherent | null;
  onBack: () => void;
  onReserve: (book: Oeuvre) => void;
}

export const LivreDetailPage: React.FC<LivreDetailPageProps> = ({
  book,
  currentUser,
  onBack,
  onReserve,
}) => {
  const [reservedSuccess, setReservedSuccess] = useState(false);
  const isAvailable = (book.disponibles_count ?? 0) > 0;

  const handleReservationClick = () => {
    onReserve(book);
    setReservedSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au catalogue</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Cover image */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={book.couverture_url}
                alt={book.titre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                    isAvailable
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-red-600/90 text-white'
                  }`}
                >
                  {isAvailable ? 'Disponible' : 'Indisponible'}
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[11px] font-mono text-slate-400">
                Cote USMBA : USMBA-FST-{book.isbn.slice(-4)}
              </span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {book.categorie}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">
                {book.titre}
              </h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-2">
                Par <span className="font-semibold text-slate-900 dark:text-white">{book.auteur}</span>
              </p>
              <p className="text-xs font-mono text-slate-400 mt-1">
                ISBN : {book.isbn}
              </p>
            </div>

            {/* Inventory Status Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  État des exemplaires physiques :
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {isAvailable ? (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>{book.disponibles_count} exemplaire(s) disponible(s) en rayon</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span>0 exemplaire disponible (tous empruntés)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span>Durée de prêt : <strong>15 jours</strong></span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Description de l'ouvrage
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {book.description ||
                  "Manuel universitaire de référence recommandé pour les étudiants de l'Université Sidi Mohamed Ben Abdellah. Couvre les notions théoriques fondamentales, les études de cas réelles et les travaux dirigés associés aux filières accréditées."}
              </p>
            </div>

            {/* Actions: Reserve if 0 available */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {!isAvailable ? (
                <div className="space-y-3">
                  {reservedSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>Votre demande de réservation a été enregistrée avec succès. Vous recevrez une notification par email dès sa restitution.</span>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleReservationClick}
                        className="py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-500/20 flex items-center gap-2 transition"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Réserver cet ouvrage</span>
                      </button>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Réservé aux adhérents USMBA. Priorité accordée dès la remise en rayon au guichet de prêt.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between">
                  <span>Cet ouvrage est disponible en rayon. Rendez-vous au guichet de prêt avec votre carte d'étudiant pour l'enregistrer (15 jours).</span>
                  <span className="font-bold px-3 py-1 bg-blue-600 text-white rounded-xl shrink-0">
                    En rayon
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
