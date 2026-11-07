import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, ArrowRight, CheckCircle2, KeyRound, Sparkles, GraduationCap } from 'lucide-react';
import { Adherent } from '../types';

interface ConnexionPageProps {
  onLoginSuccess: (user: Adherent) => void;
  onNavigate: (path: string) => void;
}

export const ConnexionPage: React.FC<ConnexionPageProps> = ({ onLoginSuccess, onNavigate }) => {
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

      const isLibrarian = email.toLowerCase().includes('biblio') || email.toLowerCase().includes('alami');
      const user: Adherent = {
        id: isLibrarian ? 'biblio-001' : 'adh-001',
        email: email.trim().toLowerCase(),
        nom: isLibrarian ? 'Dr. Fatima Zahra Alami' : 'Wissal Benyamina',
        numero_carte: isLibrarian ? 'BIB-USMBA-01' : 'N134089241',
        filiere: isLibrarian ? 'Bibliothèque Centrale USMBA' : 'FST Fès - Master Big Data & IA',
        role: isLibrarian ? 'bibliothecaire' : 'adherent',
      };
      onLoginSuccess(user);
    }, 500);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Presentation Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Portail Institutionnel des Bibliothèques</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Accédez aux ressources documentaires de l'USMBA.
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Consultez le catalogue unifié de l'Université Sidi Mohamed Ben Abdellah (FST, FLSH, FSJES, FMP, ENSA, EST), réservez des ouvrages et gérez vos emprunts en quelques clics.
          </p>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Conditions d’accès institutionnel
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Adresse email se terminant obligatoirement par <strong>@usmba.ac.ma</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Vérification de l’email requise avant la première connexion.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Premier accès étudiant : Inscription instantanée par scan de carte d’étudiant via webcam.</span>
              </li>
            </ul>
          </div>

          {/* Quick Demo Credentials */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 block mb-2">Comptes de démonstration USMBA :</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-medium transition"
              >
                Remplir Étudiant (Wissal Benyamina)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('librarian')}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-xs font-medium transition"
              >
                Remplir Bibliothécaire (Dr. Alami)
              </button>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connexion au portail</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authentification sécurisée Supabase Auth · USMBA
              </p>
            </div>

            {/* Toggle Mode */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('password'); setMagicLinkSent(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === 'password'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Email + Mot de passe
              </button>
              <button
                type="button"
                onClick={() => { setMode('magic_link'); setMagicLinkSent(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === 'magic_link'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Lien magique
              </button>
            </div>

            {magicLinkSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lien d'authentification envoyé</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Un lien sécurisé a été transmis à <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. Cliquez dessus pour accéder directement à la bibliothèque.
                </p>
                <button
                  onClick={() => {
                    onLoginSuccess({
                      id: 'adh-001',
                      email: email.trim().toLowerCase(),
                      nom: 'Wissal Benyamina',
                      numero_carte: 'N134089241',
                      filiere: 'FST Fès - Master Big Data & IA',
                      role: 'adherent',
                    });
                  }}
                  className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  Simuler l'ouverture du lien magique
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Adresse email institutionnelle
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="prenom.nom@usmba.ac.ma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format strict : <span className="font-mono text-blue-600 dark:text-blue-400">...@usmba.ac.ma</span>
                  </p>
                </div>

                {mode === 'password' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300">
                  Vérification de l’email obligatoire avant le premier accès à la bibliothèque.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Vérification du domaine...</span>
                  ) : mode === 'password' ? (
                    <>
                      <span>Se connecter à la bibliothèque</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Recevoir le lien magique</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Link to Registration */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nouvel étudiant à l'USMBA ?
              </p>
              <button
                onClick={() => onNavigate('/inscription')}
                className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scanner votre carte d'étudiant pour vous inscrire</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
