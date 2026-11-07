import React, { useState } from 'react';
import { Database, FileCode, Copy, Check, Terminal, FolderTree, X, Mail } from 'lucide-react';
import { SQL_SCHEMA_CONTENT } from '../sql/schemaContent';

interface NextJsCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NextJsCodeViewerModal: React.FC<NextJsCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'sql' | 'cron' | 'launch'>('tree');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const NEXTJS_TREE = `biblio-usmba-web/
├── app/
│   ├── layout.tsx                     # Layout racine (Header USMBA, polices, mode sombre)
│   ├── page.tsx                       # Redirection automatique vers /catalogue
│   ├── (auth)/
│   │   ├── connexion/
│   │   │   └── page.tsx               # Écran 1 : Authentification (@usmba.ac.ma strict)
│   │   └── inscription/
│   │       └── page.tsx               # Écran 2 : Scan carte étudiant (OCR Tesseract.js client)
│   ├── catalogue/
│   │   ├── page.tsx                   # Écran 3 & 4 : Grille catalogue, recherche, scan ISBN
│   │   └── [id]/
│   │       └── page.tsx               # Page détail du livre & bouton réservation
│   ├── mes-emprunts/
│   │   └── page.tsx                   # Écran 5 : Suivi emprunts (Bleu, Jaune, Rouge)
│   └── admin/                         # Espace réservé bibliothécaire (protégé par middleware)
│       ├── layout.tsx                 # Layout avec barre latérale (Sidebar)
│       ├── page.tsx                   # Tableau de bord : 3 cartes stats + graphique en anneau
│       ├── emprunts/
│       │   └── page.tsx               # Liste triée par urgence (Rouge en 1er) & scan prêt/retour
│       └── livres/
│           └── page.tsx               # Gestion du fonds : ajouter, modifier, supprimer
│
├── components/
│   ├── Navbar.tsx                     # Barre supérieure (logo USMBA, liens, profil, mode sombre)
│   ├── AdminSidebar.tsx               # Menu latéral de l'espace bibliothécaire
│   ├── BarcodeScannerModal.tsx        # Lecteur code-barres ISBN (webcam avec html5-qrcode)
│   ├── DonutChart.tsx                 # Graphique en anneau à 3 couleurs SVG
│   └── BookCard.tsx                   # Carte livre avec next/image optimisée
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Client Supabase pour composants client
│   │   ├── server.ts                  # Client Supabase pour Server Components
│   │   └── middleware.ts              # Protection des routes /admin par rôle
│   └── utils.ts
│
├── supabase/
│   ├── schema.sql                     # Script PostgreSQL complet (tables, trigger, RLS, vue)
│   └── functions/
│       └── send-loan-reminders/       # Edge Function Deno (envoi emails J-2 et passage Rouge)
│           └── index.ts
│
├── public/
│   └── images/
├── .env.example                       # Variables NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SERVICE_ROLE
├── middleware.ts                      # Middleware Next.js de vérification auth & rôle
├── next.config.mjs
├── package.json
└── tailwind.config.ts`;

  const CRON_EDGE_FUNCTION = `-- ============================================================================
-- SUPABASE EDGE FUNCTION & PG_CRON POUR LES NOTIFICATIONS EMAIL
-- Rappel automatique 2 jours avant échéance (J-2) et alerte de passage en ROUGE (> 7 jours)
-- ============================================================================

-- 1. Extension pg_cron pour exécuter une tâche planifiée quotidienne à 07:00 UTC
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Tâche quotidienne appelant l'Edge Function de notification
SELECT cron.schedule(
    'envoyer-rappels-emprunts-quotidien',
    '0 7 * * *', -- Tous les jours à 07:00
    $$
    SELECT
      net.http_post(
          url := 'https://<PROJECT-REF>.supabase.co/functions/v1/send-loan-reminders',
          headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object('execution_date', CURRENT_DATE)
      );
    $$
);

/*
LOGIQUE DANS L'EDGE FUNCTION (Deno/TypeScript) :
1. Rappel J-2 :
   SELECT a.email, a.nom, o.titre, e.date_retour_prevue
   FROM public.emprunts e
   JOIN public.adherents a ON e.adherent_id = a.id
   JOIN public.exemplaires ex ON e.exemplaire_id = ex.id
   JOIN public.oeuvres o ON ex.oeuvre_id = o.id
   WHERE e.date_retour IS NULL AND e.date_retour_prevue = CURRENT_DATE + INTERVAL '2 days';

2. Passage en Rouge (> 7 jours) :
   SELECT a.email, a.nom, o.titre, e.date_retour_prevue
   FROM public.emprunts e
   JOIN public.adherents a ON e.adherent_id = a.id
   JOIN public.exemplaires ex ON e.exemplaire_id = ex.id
   JOIN public.oeuvres o ON ex.oeuvre_id = o.id
   WHERE e.date_retour IS NULL AND e.date_retour_prevue = CURRENT_DATE - INTERVAL '8 days';
*/`;

  const LAUNCH_INSTRUCTIONS = `# GUIDE COMPLET DE DÉPLOIEMENT & LANCEMENT NEXT.JS + SUPABASE

# 1. Cloner ou initialiser le projet Next.js App Router
npx create-next-app@latest biblio-usmba --typescript --tailwind --app --eslint
cd biblio-usmba

# 2. Installer les dépendances optimisées
npm install @supabase/supabase-js @supabase/ssr tesseract.js lucide-react

# 3. Configurer les variables d'environnement (.env.local)
cp .env.example .env.local
# Renseigner vos identifiants Supabase :
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 4. Exécuter le script SQL dans votre projet Supabase
# Ouvrez votre console Supabase > SQL Editor > Collez le script complet fourni (schema.sql)
# Cliquez sur "Run" pour activer les 4 tables, le trigger de domaine @usmba.ac.ma, la vue et le RLS.

# 5. Lancer le serveur de développement en pleine page
npm run dev
# Ouvrez http://localhost:3000 dans votre navigateur (Desktop-first).

# 6. Déploiement en production sur Vercel
# Connectez votre dépôt GitHub à Vercel et ajoutez les variables d'environnement définies ci-dessus.
# Le build Next.js avec Server Components et dynamic imports est optimisé pour un score Web Vitals maximal.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Livrables Architecture Next.js & Supabase (USMBA)
              </h2>
              <p className="text-xs text-slate-500">
                Spécifications techniques, script SQL complet et guide de déploiement Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-2">
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'tree'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Arborescence Next.js (App Router)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Script SQL Complet (RLS, Trigger, Vue)</span>
          </button>

          <button
            onClick={() => setActiveTab('cron')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'cron'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Rappels Email (Cron & Edge Function)</span>
          </button>

          <button
            onClick={() => setActiveTab('launch')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'launch'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Instructions Vercel & npm</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs relative">
          <div className="absolute top-4 right-6 z-10">
            <button
              onClick={() => {
                const text =
                  activeTab === 'tree'
                    ? NEXTJS_TREE
                    : activeTab === 'sql'
                    ? SQL_SCHEMA_CONTENT
                    : activeTab === 'cron'
                    ? CRON_EDGE_FUNCTION
                    : LAUNCH_INSTRUCTIONS;
                handleCopy(text);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier ce code'}</span>
            </button>
          </div>

          <pre className="whitespace-pre-wrap leading-relaxed pr-24">
            {activeTab === 'tree' && NEXTJS_TREE}
            {activeTab === 'sql' && SQL_SCHEMA_CONTENT}
            {activeTab === 'cron' && CRON_EDGE_FUNCTION}
            {activeTab === 'launch' && LAUNCH_INSTRUCTIONS}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Plateforme web Next.js 14/15 App Router avec Server Components et Supabase Auth/PostgreSQL.</span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-medium hover:bg-slate-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
