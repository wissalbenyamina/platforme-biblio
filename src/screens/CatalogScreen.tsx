import React, { useState, useMemo } from 'react';
import { Search, ScanBarcode, Filter, BookOpen, CheckCircle, XCircle, ArrowLeft, Bookmark, Sparkles, ChevronRight, X } from 'lucide-react';
import { Oeuvre, Adherent } from '../types';

interface CatalogScreenProps {
  oeuvres: Oeuvre[];
  currentUser: Adherent;
  onReserveBook?: (oeuvre: Oeuvre) => void;
}

const CATEGORIES = [
  'Toutes',
  'Informatique & IA',
  'Sciences Exactes',
  'Droit & Économie',
  'Médecine & Santé',
  'Lettres & Histoire',
];

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ oeuvres, currentUser, onReserveBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedBook, setSelectedBook] = useState<Oeuvre | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filtered books
  const filteredBooks = useMemo(() => {
    return oeuvres.filter((b) => {
      const matchesCategory =
        selectedCategory === 'Toutes' || b.categorie === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        b.titre.toLowerCase().includes(term) ||
        b.auteur.toLowerCase().includes(term) ||
        b.isbn.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [oeuvres, selectedCategory, searchTerm]);

  // Paginated books
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage]);

  const handleScanIsbnFound = (isbn: string) => {
    setIsScannerOpen(false);
    setSearchTerm(isbn);
    const found = oeuvres.find((b) => b.isbn.replace(/[-\s]/g, '') === isbn.replace(/[-\s]/g, ''));
    if (found) {
      setSelectedBook(found);
    }
  };

  const handleReservation = (book: Oeuvre) => {
    if (onReserveBook) {
      onReserveBook(book);
    }
    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setSelectedBook(null);
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Top Search & Scan Bar */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Titre, auteur ou ISBN..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Barcode Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 transition shrink-0"
            title="Scanner le code-barres ISBN"
          >
            <ScanBarcode className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 mt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span>{filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''} trouvé{filteredBooks.length > 1 ? 's' : ''}</span>
          <span>Page {currentPage} sur {totalPages}</span>
        </div>

        {paginatedBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aucun livre trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('Toutes'); }}
              className="mt-3 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {paginatedBooks.map((book) => {
              const isAvailable = (book.disponibles_count ?? 0) > 0;
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="bg-white dark:bg-slate-800/90 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col cursor-pointer active:scale-[0.98] transition hover:border-blue-400"
                >
                  {/* Book Cover with Lazy Loading */}
                  <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={book.couverture_url}
                      alt={book.titre}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // Fallback image
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    {/* Badge Disponible / Indisponible */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                          isAvailable
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}
                      >
                        {isAvailable ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="p-2.5 flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider line-clamp-1">
                        {book.categorie}
                      </p>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5 leading-snug">
                        {book.titre}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {book.auteur}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{book.disponibles_count ?? 0} ex. dispo</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-xs font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Book Detail Modal / Bottom Sheet */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center sm:items-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {selectedBook.categorie}
              </span>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <img
                src={selectedBook.couverture_url}
                alt={selectedBook.titre}
                className="w-24 h-32 object-cover rounded-xl shadow-md shrink-0 bg-slate-100"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedBook.titre}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {selectedBook.auteur}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    ISBN : {selectedBook.isbn}
                  </p>
                </div>

                <div className="mt-2">
                  {(selectedBook.disponibles_count ?? 0) > 0 ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>{selectedBook.disponibles_count} exemplaire(s) disponible(s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span>Tous les exemplaires sont actuellement empruntés</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Description de l’ouvrage
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedBook.description ||
                  "Manuel universitaire de référence pour les étudiants de l'Université Sidi Mohamed Ben Abdellah. Disponible pour consultation sur place ou prêt de 15 jours à la bibliothèque."}
              </p>
            </div>

            {/* Reservation Button if 0 available */}
            {(selectedBook.disponibles_count ?? 0) === 0 ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleReservation(selectedBook)}
                  disabled={reservationSuccess}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{reservationSuccess ? 'Réservation confirmée !' : 'Réserver ce livre'}</span>
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Vous recevrez une notification dès qu’un exemplaire sera restitué à la bibliothèque.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between">
                <span>Rendez-vous au guichet pour l’emprunter (15 jours).</span>
                <span className="font-semibold text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  En rayon
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal for ISBN Scan */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-semibold">Scanner le code-barres ISBN</span>
            <button
              onClick={() => setIsScannerOpen(false)}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner viewfinder */}
          <div className="my-auto mx-auto w-full max-w-xs aspect-video relative border-2 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center bg-slate-900/40 p-4">
            <ScanBarcode className="w-12 h-12 text-blue-400 animate-pulse mb-2" />
            <p className="text-xs text-white text-center font-medium">
              Centrez le code-barres ISBN au dos du livre
            </p>
            <p className="text-[10px] text-slate-300 mt-1">Recherche instantanée on-device</p>
          </div>

          {/* Quick simulation pills */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-300 mb-2 font-medium">Ou sélectionner un ISBN test :</p>
            <div className="space-y-1.5">
              {oeuvres.slice(0, 3).map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleScanIsbnFound(book.isbn)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-blue-900/40 flex items-center justify-between"
                >
                  <span className="truncate pr-2">{book.titre}</span>
                  <span className="font-mono text-[10px] text-blue-400 shrink-0">{book.isbn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
