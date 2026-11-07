import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ScanBarcode, BookOpen, ChevronRight, CheckCircle, XCircle, X, Camera, Sparkles } from 'lucide-react';
import { Oeuvre, Adherent } from '../types';

interface CataloguePageProps {
  oeuvres: Oeuvre[];
  currentUser: Adherent | null;
  onSelectBook: (bookId: string) => void;
}

const CATEGORIES = [
  'Toutes',
  'Informatique & IA',
  'Sciences Exactes',
  'Droit & Économie',
  'Médecine & Santé',
  'Lettres & Histoire',
];

export const CataloguePage: React.FC<CataloguePageProps> = ({ oeuvres, currentUser, onSelectBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [currentPage, setCurrentPage] = useState(1);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');
  const [scannerCameraActive, setScannerCameraActive] = useState(false);

  const videoScannerRef = useRef<HTMLVideoElement>(null);
  const pageSize = 20;

  // Filter books
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

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage]);

  const startScannerCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoScannerRef.current) {
        videoScannerRef.current.srcObject = stream;
        videoScannerRef.current.play();
        setScannerCameraActive(true);
      }
    } catch {
      setScannerCameraActive(false);
    }
  };

  const stopScannerCamera = () => {
    if (videoScannerRef.current && videoScannerRef.current.srcObject) {
      const stream = videoScannerRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoScannerRef.current.srcObject = null;
      setScannerCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isBarcodeModalOpen) {
      stopScannerCamera();
    }
  }, [isBarcodeModalOpen]);

  const handleIsbnDetected = (isbnToFind: string) => {
    setIsBarcodeModalOpen(false);
    stopScannerCamera();
    const clean = isbnToFind.replace(/[-\s]/g, '');
    const found = oeuvres.find((b) => b.isbn.replace(/[-\s]/g, '') === clean);
    if (found) {
      onSelectBook(found.id);
    } else {
      setSearchTerm(isbnToFind);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Hero / Search Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fonds Documentaire Général USMBA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Catalogue de la Bibliothèque Universitaire
          </h1>
          <p className="text-blue-100/80 text-sm mt-2 max-w-2xl leading-relaxed">
            Recherchez parmi l'ensemble des ouvrages des facultés et écoles de l'USMBA. Empruntez en rayon ou réservez un exemplaire en un instant.
          </p>

          {/* Search Bar + Barcode Scanner Trigger */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher par titre, auteur ou code ISBN..."
                className="w-full pl-11 pr-10 py-3 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm font-medium placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsBarcodeModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition shrink-0"
              title="Scanner le code-barres ISBN avec votre webcam"
            >
              <ScanBarcode className="w-4 h-4" />
              <span>Scanner un livre (ISBN)</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-slate-200 dark:border-slate-800">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6">
        <span>
          Affichage de <strong>{filteredBooks.length}</strong> ouvrage{filteredBooks.length > 1 ? 's' : ''} au catalogue
        </span>
        <span>Page {currentPage} sur {totalPages} (20 livres / page)</span>
      </div>

      {/* Book Grid */}
      {paginatedBooks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Aucun ouvrage trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Aucun livre ne correspond à votre recherche "{searchTerm}". Essayez un autre terme ou réinitialisez la sélection.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('Toutes'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedBooks.map((book) => {
            const isAvailable = (book.disponibles_count ?? 0) > 0;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex flex-col cursor-pointer"
              >
                {/* Book Cover with Lazy Loading */}
                <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={book.couverture_url}
                    alt={book.titre}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${
                        isAvailable
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-red-600/90 text-white'
                      }`}
                    >
                      {isAvailable ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                      {book.categorie}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {book.titre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-medium">
                      {book.auteur}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      ISBN : {book.isbn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                    <span className={isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {book.disponibles_count ?? 0} ex. en rayon
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Fiche <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            ← Page précédente
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            Page suivante →
          </button>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Scanner un livre (Code-barres ISBN)
                </h3>
              </div>
              <button
                onClick={() => setIsBarcodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Webcam Stream Box */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-blue-500 mb-4 flex items-center justify-center">
              {scannerCameraActive ? (
                <video ref={videoScannerRef} playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">Webcam inactive</p>
                  <button
                    onClick={startScannerCamera}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    Allumer la webcam
                  </button>
                </div>
              )}
            </div>

            {/* Manual ISBN alternative */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ou saisie manuelle de l'ISBN :
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualIsbn}
                    onChange={(e) => setManualIsbn(e.target.value)}
                    placeholder="Ex: 978-2100825424"
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                  <button
                    onClick={() => handleIsbnDetected(manualIsbn)}
                    disabled={!manualIsbn.trim()}
                    className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Sample Quick ISBN triggers */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  ISBN disponibles pour test rapide :
                </span>
                <div className="space-y-1.5">
                  {oeuvres.slice(0, 3).map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleIsbnDetected(book.isbn)}
                      className="w-full text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                        {book.titre}
                      </span>
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 shrink-0">
                        {book.isbn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
