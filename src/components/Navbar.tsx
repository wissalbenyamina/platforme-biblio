import React from 'react';
import { BookOpen, Clock, LayoutDashboard, LogIn, LogOut, Moon, Sun, User, Shield, Code, BookPlus } from 'lucide-react';
import { Adherent } from '../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: Adherent | null;
  onLogout: () => void;
  onQuickRoleSwitch: (role: 'adherent' | 'bibliothecaire' | 'deconnecte') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCodeViewer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  currentUser,
  onLogout,
  onQuickRoleSwitch,
  isDark,
  onToggleTheme,
  onOpenCodeViewer,
}) => {
  const isLibrarian = currentUser?.role === 'bibliothecaire';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/catalogue')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-base tracking-tighter">USMBA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                  BiblioUSMBA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-semibold">
                  Portail Web
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium hidden sm:block">
                Université Sidi Mohamed Ben Abdellah · Fès
              </p>
            </div>
          </button>
        </div>

        {/* Primary Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('/catalogue')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              currentPath === '/catalogue' || currentPath.startsWith('/catalogue/')
                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catalogue des livres</span>
          </button>

          {currentUser && !isLibrarian && (
            <button
              onClick={() => onNavigate('/mes-emprunts')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentPath === '/mes-emprunts'
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Mes emprunts</span>
            </button>
          )}

          {isLibrarian && (
            <button
              onClick={() => onNavigate('/admin')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentPath.startsWith('/admin')
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Espace Bibliothécaire</span>
            </button>
          )}
        </nav>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Tester Pills */}
          <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 font-medium px-2">Rôle :</span>
            <button
              onClick={() => onQuickRoleSwitch('adherent')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                currentUser?.role === 'adherent'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Adhérent
            </button>
            <button
              onClick={() => onQuickRoleSwitch('bibliothecaire')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                currentUser?.role === 'bibliothecaire'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Bibliothécaire
            </button>
            <button
              onClick={() => onQuickRoleSwitch('deconnecte')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                !currentUser
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Public
            </button>
          </div>

          {/* Code Next.js & SQL Inspector Modal Trigger */}
          <button
            onClick={onOpenCodeViewer}
            className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            title="Consulter l'arborescence Next.js App Router et le script SQL Supabase"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Livrables Next.js & SQL</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.nom}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser.numero_carte}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/connexion')}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </button>
              <button
                onClick={() => onNavigate('/inscription')}
                className="hidden sm:flex py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition items-center gap-1.5"
              >
                <span>Inscription Carte</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
