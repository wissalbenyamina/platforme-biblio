import React, { useState } from 'react';
import { PlusCircle, Search, Edit2, Trash2, BookOpen, Check, X, AlertCircle } from 'lucide-react';
import { Oeuvre, Exemplaire } from '../types';

interface AdminLivresPageProps {
  oeuvres: Oeuvre[];
  exemplaires: Exemplaire[];
  onAddBook: (book: Oeuvre, copiesCount: number) => void;
  onUpdateBook: (book: Oeuvre) => void;
  onDeleteBook: (bookId: string) => void;
}

const CATEGORIES = [
  'Informatique & IA',
  'Sciences Exactes',
  'Droit & Économie',
  'Médecine & Santé',
  'Lettres & Histoire',
];

export const AdminLivresPage: React.FC<AdminLivresPageProps> = ({
  oeuvres,
  exemplaires,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Oeuvre | null>(null);

  // Form states
  const [isbn, setIsbn] = useState('');
  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [couvertureUrl, setCouvertureUrl] = useState('');
  const [description, setDescription] = useState('');
  const [exemplairesCount, setExemplairesCount] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredBooks = oeuvres.filter(
    (b) =>
      b.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingBook(null);
    setIsbn('');
    setTitre('');
    setAuteur('');
    setCategorie(CATEGORIES[0]);
    setCouvertureUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80');
    setDescription('');
    setExemplairesCount(2);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Oeuvre) => {
    setEditingBook(book);
    setIsbn(book.isbn);
    setTitre(book.titre);
    setAuteur(book.auteur);
    setCategorie(book.categorie);
    setCouvertureUrl(book.couverture_url);
    setDescription(book.description || '');
    setExemplairesCount(book.total_exemplaires || 2);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbn.trim() || !titre.trim() || !auteur.trim()) {
      setFormError('L’ISBN, le titre et l’auteur sont obligatoires.');
      return;
    }

    if (editingBook) {
      onUpdateBook({
        ...editingBook,
        isbn,
        titre,
        auteur,
        categorie,
        couverture_url: couvertureUrl,
        description,
      });
    } else {
      const newBook: Oeuvre = {
        id: `o-${Date.now()}`,
        isbn: isbn.trim(),
        titre: titre.trim(),
        auteur: auteur.trim(),
        categorie,
        couverture_url: couvertureUrl.trim(),
        description: description.trim(),
        disponibles_count: exemplairesCount,
        total_exemplaires: exemplairesCount,
      };
      onAddBook(newBook, exemplairesCount);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestion du Catalogue & Livres
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ajout, modification et inventaire des {oeuvres.length} ouvrages de la bibliothèque.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un livre au catalogue</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, auteur ou ISBN..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          {filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''} répertorié{filteredBooks.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Couverture & Titre</th>
                <th className="py-3.5 px-4">Auteur</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">ISBN</th>
                <th className="py-3.5 px-4 text-center">Exemplaires en rayon</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBooks.map((book) => {
                const isAvailable = (book.disponibles_count ?? 0) > 0;
                return (
                  <tr key={book.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.couverture_url}
                          alt={book.titre}
                          className="w-10 h-14 object-cover rounded-lg shadow-xs bg-slate-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {book.titre}
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {isAvailable ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {book.auteur}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                        {book.categorie}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {book.isbn}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-xs">
                      <span className={isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {book.disponibles_count ?? 0}
                      </span>
                      <span className="text-slate-400 text-[11px] font-normal"> / {book.total_exemplaires || 2}</span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(book)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirmez-vous la suppression de l'ouvrage "${book.titre}" ?`)) {
                              onDeleteBook(book.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBook ? "Modifier l'ouvrage" : 'Ajouter un livre au catalogue USMBA'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Code ISBN (unique)
                </label>
                <input
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Ex: 978-2100825424"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titre du livre
                </label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auteur(s)
                  </label>
                  <input
                    type="text"
                    required
                    value={auteur}
                    onChange={(e) => setAuteur(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingBook && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre d'exemplaires physiques à créer
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={exemplairesCount}
                    onChange={(e) => setExemplairesCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL de la couverture
                </label>
                <input
                  type="url"
                  required
                  value={couvertureUrl}
                  onChange={(e) => setCouvertureUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Résumé de l'ouvrage..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  {editingBook ? 'Enregistrer les modifications' : 'Ajouter le livre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
