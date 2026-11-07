import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { Adherent } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: Adherent) => void;
  onGoToRegister: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic_link'>('password');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (inputEmail: string): boolean => {
    const trimmed = inputEmail.trim().toLowerCase();
    if (!trimmed.endsWith('@usmba.ac.ma')) {
      setErrorMessage(
        "Accès refusé : Seules les adresses institutionnelles se terminant par @usmba.ac.ma sont acceptées."
      );
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === 'magic_link') {
        setMagicLinkSent(true);
        return;
      }

      // Check if user is a librarian or student
      const isLibrarian = email.toLowerCase().includes('biblio') || email.toLowerCase().includes('alami');
      const mockUser: Adherent = {
        id: isLibrarian ? 'biblio-001' : 'adh-001',
        email: email.trim().toLowerCase(),
        nom: isLibrarian ? 'Dr. Fatima Zahra Alami' : 'Wissal Benyamina',
        numero_carte: isLibrarian ? 'BIB-USMBA-01' : 'N134089241',
        filiere: isLibrarian ? 'Bibliothèque Centrale USMBA' : 'FST Fès - Master IA & Big Data',
        role: isLibrarian ? 'bibliothecaire' : 'adherent',
      };
      onLoginSuccess(mockUser);
    }, 600);
  };

  const handleQuickFill = (type: 'student' | 'librarian') => {
    if (type === 'student') {
      setEmail('wissal.benyamina@usmba.ac.ma');
      setPassword('Usmba2026!');
    } else {
      setEmail('biblio.centrale@usmba.ac.ma');
      setPassword('BiblioMaster2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col min-h-full px-5 py-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-2 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3">
          <span className="font-extrabold text-2xl tracking-tight">U</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Biblio USMBA</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
          Université Sidi Mohamed Ben Abdellah · Portail de la Bibliothèque Universitaire
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Toggle Mode */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => { setMode('password'); setMagicLinkSent(false); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'password'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Mot de passe
          </button>
          <button
            type="button"
            onClick={() => { setMode('magic_link'); setMagicLinkSent(false); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'magic_link'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lien magique
          </button>
        </div>

        {magicLinkSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lien envoyé !</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Un lien magique sécurisé a été transmis à <span className="font-medium text-slate-800 dark:text-slate-200">{email}</span>.
            </p>
            <button
              onClick={() => {
                const mockUser: Adherent = {
                  id: 'adh-001',
                  email: email.trim().toLowerCase(),
                  nom: 'Wissal Benyamina',
                  numero_carte: 'N134089241',
                  filiere: 'FST Fès - Master IA & Big Data',
                  role: 'adherent',
                };
                onLoginSuccess(mockUser);
              }}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              Simuler le clic sur le lien magique
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Adresse email institutionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="nom.prenom@usmba.ac.ma"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Domaine strict requis : <span className="font-mono text-blue-600 dark:text-blue-400">@usmba.ac.ma</span>
              </p>
            </div>

            {/* Password Field (if mode === 'password') */}
            {mode === 'password' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email verification reminder */}
            <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
              Vérification de l’email obligatoire avant le premier accès.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Vérification en cours...</span>
              ) : mode === 'password' ? (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Envoyer le lien magique</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* First Access / Student Card Registration */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Premier accès étudiant à la bibliothèque ?
        </p>
        <button
          onClick={onGoToRegister}
          className="mt-2 w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scanner ma carte d’étudiant</span>
        </button>
      </div>

      {/* Fast Demo Shortcuts */}
      <div className="mt-auto pt-6 text-center">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Comptes de test rapides (USMBA) :</span>
        <div className="flex gap-2 justify-center mt-2">
          <button
            type="button"
            onClick={() => handleQuickFill('student')}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition"
          >
            Étudiant (Wissal)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('librarian')}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition"
          >
            Bibliothécaire (Dr. Alami)
          </button>
        </div>
      </div>
    </div>
  );
};
