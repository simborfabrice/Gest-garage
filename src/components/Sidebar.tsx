import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Users,
  Truck,
  FileText,
  Coins,
  TrendingUp,
  Palette,
  Building2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    garage,
    theme,
    setIsThemeModalOpen,
    setIsGarageModalOpen,
    resetAllData,
  } = useApp();

  const navItems = [
    {
      id: 'calendar',
      label: 'Calendrier & RDV',
      icon: Calendar,
      description: 'Planning atelier & ponts',
    },
    {
      id: 'clients',
      label: 'Clients & Véhicules',
      icon: Users,
      description: 'Parc auto & coordonnées',
    },
    {
      id: 'suppliers',
      label: 'Fournisseurs',
      icon: Truck,
      description: 'Commandes & pièces',
    },
    {
      id: 'documents',
      label: 'Devis & Facturation',
      icon: FileText,
      description: 'Bons de commande & factures',
    },
    {
      id: 'cash',
      label: 'Caisse Journalière',
      icon: Coins,
      description: 'Détail des règlements & caisse',
    },
    {
      id: 'accounting',
      label: 'Comptabilité',
      icon: TrendingUp,
      description: 'Marge, TVA & balance',
    },
  ];

  const isLight =
    theme.sidebarBgColor === '#ffffff' ||
    theme.sidebarBgColor.startsWith('#f') ||
    theme.sidebarTextColor === '#0f172a';

  return (
    <aside
      className="w-64 shrink-0 border-r flex flex-col justify-between min-h-screen transition-colors duration-200 select-none"
      style={{
        backgroundColor: theme.sidebarBgColor || '#0f172a',
        color: theme.sidebarTextColor || '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Top Garage Brand Lockup with Logo */}
      <div className="p-4 border-b border-white/10">
        <div
          onClick={() => setIsGarageModalOpen(true)}
          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:ring-1 hover:ring-white/20 hover:bg-white/5"
          title="Modifier le logo et les coordonnées du garage (cliquez pour redimensionner)"
        >
          {garage.logoUrl ? (
            <img
              src={garage.logoUrl}
              alt={garage.name}
              className="object-contain shrink-0 bg-transparent transition-transform hover:scale-105"
              style={{
                width: `${Math.min(Math.max((garage.logoSize || 140) * 0.45, 44), 66)}px`,
                height: `${Math.min(Math.max((garage.logoSize || 140) * 0.45, 44), 66)}px`,
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
            />
          ) : (
            <div
              className="rounded-lg flex items-center justify-center font-black text-white shrink-0 shadow-xs text-sm"
              style={{
                backgroundColor: theme.primaryColor,
                width: `${Math.min(Math.max((garage.logoSize || 140) * 0.45, 44), 66)}px`,
                height: `${Math.min(Math.max((garage.logoSize || 140) * 0.45, 44), 66)}px`,
              }}
            >
              AP
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-sm truncate tracking-tight">
              {garage.name}
            </h1>
            <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Atelier & Facturation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-3 mb-2 block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Modules Atelier
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                isActive
                  ? 'text-white shadow-xs'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? theme.primaryColor : undefined,
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Customizer Bottom Controls */}
      <div className="p-3 border-t border-inherit space-y-1.5">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-3 mb-1 block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Personnalisation
        </span>

        {/* Change Colors Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Changer les Couleurs</span>
          </div>
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </button>

        {/* Change Logo & Garage Details */}
        <button
          onClick={() => setIsGarageModalOpen(true)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Modifier Logo & Garage</span>
        </button>

        {/* Demo reset */}
        <button
          onClick={() => {
            if (confirm('Réinitialiser toutes les données aux valeurs de démonstration ?')) {
              resetAllData();
            }
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] transition-colors rounded ${
            isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Données de démonstration</span>
        </button>
      </div>
    </aside>
  );
};
