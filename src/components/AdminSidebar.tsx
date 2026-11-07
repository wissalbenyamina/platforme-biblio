import React from 'react';
import { LayoutDashboard, BookMarked, BookPlus, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  urgentCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath, onNavigate, urgentCount }) => {
  const navItems = [
    {
      path: '/admin',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d’ensemble & statistiques',
    },
    {
      path: '/admin/emprunts',
      label: 'Gestion des emprunts',
      icon: BookMarked,
      badge: urgentCount > 0 ? `${urgentCount} urgent${urgentCount > 1 ? 's' : ''}` : undefined,
      badgeColor: 'bg-red-600 text-white',
      description: 'Prêts, retours et alertes retards',
    },
    {
      path: '/admin/livres',
      label: 'Gestion des livres',
      icon: BookPlus,
      description: 'Inventaire, ajouts & suppressions',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Espace Bibliothécaire
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Bibliothèque Universitaire USMBA
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 pl-6 leading-tight">
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onNavigate('/catalogue')}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voir le catalogue public</span>
        </button>
      </div>
    </aside>
  );
};
