import React, { useState, useEffect } from 'react';
import { Adherent, Oeuvre, Exemplaire, Emprunt } from './types';
import {
  INITIAL_ADHERENTS,
  INITIAL_OEUVRES,
  INITIAL_EXEMPLAIRES,
  INITIAL_EMPRUNTS,
  computeRetardStatus,
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { AdminSidebar } from './components/AdminSidebar';
import { ConnexionPage } from './pages/ConnexionPage';
import { InscriptionPage } from './pages/InscriptionPage';
import { CataloguePage } from './pages/CataloguePage';
import { LivreDetailPage } from './pages/LivreDetailPage';
import { MesEmpruntsPage } from './pages/MesEmpruntsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminEmpruntsPage } from './pages/AdminEmpruntsPage';
import { AdminLivresPage } from './pages/AdminLivresPage';
import { NextJsCodeViewerModal } from './components/NextJsCodeViewerModal';

export default function App() {
  // Theme state: dark / light
  const [isDark, setIsDark] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Database persistent state
  const [adherents, setAdherents] = useState<Adherent[]>(INITIAL_ADHERENTS);
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>(INITIAL_OEUVRES);
  const [exemplaires, setExemplaires] = useState<Exemplaire[]>(INITIAL_EXEMPLAIRES);
  const [emprunts, setEmprunts] = useState<Emprunt[]>(INITIAL_EMPRUNTS);

  // Authentication state (default: logged in as Wissal Benyamina - Adhérent)
  const [currentUser, setCurrentUser] = useState<Adherent | null>(INITIAL_ADHERENTS[0]);

  // Real URL path state:
  // '/connexion' | '/inscription' | '/catalogue' | '/catalogue/:id' | '/mes-emprunts' | '/admin' | '/admin/emprunts' | '/admin/livres'
  const [currentPath, setCurrentPath] = useState<string>('/catalogue');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // URL Navigation helper
  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentPath(`/catalogue/${bookId}`);
  };

  // Quick switch between test roles
  const handleQuickRoleSwitch = (role: 'adherent' | 'bibliothecaire' | 'deconnecte') => {
    if (role === 'adherent') {
      setCurrentUser(INITIAL_ADHERENTS[0]);
      setCurrentPath('/catalogue');
    } else if (role === 'bibliothecaire') {
      setCurrentUser(INITIAL_ADHERENTS[3]);
      setCurrentPath('/admin');
    } else {
      setCurrentUser(null);
      setCurrentPath('/connexion');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPath('/connexion');
  };

  const handleLoginSuccess = (user: Adherent) => {
    setCurrentUser(user);
    if (user.role === 'bibliothecaire') {
      setCurrentPath('/admin');
    } else {
      setCurrentPath('/catalogue');
    }
  };

  const handleRegisterSuccess = (newAdherent: Adherent) => {
    setAdherents((prev) => [...prev, newAdherent]);
    setCurrentUser(newAdherent);
    setCurrentPath('/catalogue');
  };

  // Book reservation
  const handleReserveBook = (book: Oeuvre) => {
    console.log(`Réservation confirmée pour l'ouvrage : ${book.titre}`);
  };

  // New loan registered by librarian
  const handleAddEmprunt = (newLoan: Emprunt) => {
    setEmprunts((prev) => [newLoan, ...prev]);

    setExemplaires((prev) =>
      prev.map((ex) => (ex.id === newLoan.exemplaire_id ? { ...ex, disponible: false } : ex))
    );

    setOeuvres((prev) =>
      prev.map((o) => {
        if (o.id === newLoan.oeuvre_id) {
          const count = o.disponibles_count ?? 1;
          return { ...o, disponibles_count: Math.max(0, count - 1) };
        }
        return o;
      })
    );
  };

  // Loan return registered by librarian
  const handleReturnEmprunt = (empruntId: string, exemplaireId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let foundOeuvreId: string | undefined;

    setEmprunts((prev) =>
      prev.map((emp) => {
        if (emp.id === empruntId) {
          foundOeuvreId = emp.oeuvre_id;
          return { ...emp, date_retour: todayStr };
        }
        return emp;
      })
    );

    setExemplaires((prev) =>
      prev.map((ex) => (ex.id === exemplaireId ? { ...ex, disponible: true } : ex))
    );

    if (foundOeuvreId) {
      setOeuvres((prev) =>
        prev.map((o) => {
          if (o.id === foundOeuvreId) {
            return { ...o, disponibles_count: (o.disponibles_count ?? 0) + 1 };
          }
          return o;
        })
      );
    }
  };

  // Book management: add, edit, delete
  const handleAddBook = (book: Oeuvre, copiesCount: number) => {
    setOeuvres((prev) => [book, ...prev]);

    const newCopies: Exemplaire[] = Array.from({ length: copiesCount }).map((_, i) => ({
      id: `ex-${book.id}-${i + 1}`,
      oeuvre_id: book.id,
      cote: `USMBA-BU-${book.isbn.slice(-4)}-${i + 1}`,
      disponible: true,
    }));
    setExemplaires((prev) => [...newCopies, ...prev]);
  };

  const handleUpdateBook = (updatedBook: Oeuvre) => {
    setOeuvres((prev) => prev.map((o) => (o.id === updatedBook.id ? updatedBook : o)));
  };

  const handleDeleteBook = (bookId: string) => {
    setOeuvres((prev) => prev.filter((o) => o.id !== bookId));
    setExemplaires((prev) => prev.filter((ex) => ex.oeuvre_id !== bookId));
    setEmprunts((prev) => prev.filter((emp) => emp.oeuvre_id !== bookId));
  };

  // Urgent loans count for sidebar badge
  const urgentCount = emprunts.filter((e) => {
    if (e.date_retour) return false;
    const { statut } = computeRetardStatus(e.date_retour_prevue, e.date_retour);
    return statut === 'ROUGE';
  }).length;

  const isAdminRoute = currentPath.startsWith('/admin');
  const selectedBook = selectedBookId ? oeuvres.find((b) => b.id === selectedBookId) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white">
      {/* Top Desktop Navigation Bar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickRoleSwitch={handleQuickRoleSwitch}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenCodeViewer={() => setIsCodeModalOpen(true)}
      />

      {/* Main Desktop Layout */}
      <div className="flex-1 flex flex-col w-full">
        {isAdminRoute && currentUser?.role === 'bibliothecaire' ? (
          /* Admin Layout with Side Navigation */
          <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
            <AdminSidebar
              currentPath={currentPath}
              onNavigate={handleNavigate}
              urgentCount={urgentCount}
            />

            <div className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
              {currentPath === '/admin' && (
                <AdminDashboardPage
                  emprunts={emprunts}
                  oeuvres={oeuvres}
                  adherents={adherents}
                  onNavigate={handleNavigate}
                />
              )}
              {currentPath === '/admin/emprunts' && (
                <AdminEmpruntsPage
                  emprunts={emprunts}
                  oeuvres={oeuvres}
                  adherents={adherents}
                  exemplaires={exemplaires}
                  onAddEmprunt={handleAddEmprunt}
                  onReturnEmprunt={handleReturnEmprunt}
                />
              )}
              {currentPath === '/admin/livres' && (
                <AdminLivresPage
                  oeuvres={oeuvres}
                  exemplaires={exemplaires}
                  onAddBook={handleAddBook}
                  onUpdateBook={handleUpdateBook}
                  onDeleteBook={handleDeleteBook}
                />
              )}
            </div>
          </div>
        ) : (
          /* Public / Student Pages */
          <main className="flex-1 w-full">
            {currentPath === '/connexion' && (
              <ConnexionPage
                onLoginSuccess={handleLoginSuccess}
                onNavigate={handleNavigate}
              />
            )}

            {currentPath === '/inscription' && (
              <InscriptionPage
                onBack={() => handleNavigate('/connexion')}
                onRegistered={handleRegisterSuccess}
              />
            )}

            {currentPath === '/catalogue' && (
              <CataloguePage
                oeuvres={oeuvres}
                currentUser={currentUser}
                onSelectBook={handleSelectBook}
              />
            )}

            {currentPath.startsWith('/catalogue/') && selectedBook && (
              <LivreDetailPage
                book={selectedBook}
                currentUser={currentUser}
                onBack={() => handleNavigate('/catalogue')}
                onReserve={handleReserveBook}
              />
            )}

            {currentPath === '/mes-emprunts' && currentUser && (
              <MesEmpruntsPage
                emprunts={emprunts}
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            )}
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Université Sidi Mohamed Ben Abdellah
            </span>
            <span>·</span>
            <span>Réseau des Bibliothèques Universitaires de Fès</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Arborescence Next.js & Script SQL
            </button>
            <span>·</span>
            <span>Stack : Next.js + Supabase + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Next.js & SQL Code Modal */}
      <NextJsCodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
