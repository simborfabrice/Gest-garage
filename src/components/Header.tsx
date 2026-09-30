import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Palette,
  Building2,
  Plus,
  FilePlus,
  Printer,
  Calendar,
  DollarSign,
  Car,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    garage,
    theme,
    setIsThemeModalOpen,
    setIsGarageModalOpen,
    setActiveTab,
  } = useApp();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'calendar':
        return 'Planning & Rendez-vous Atelier';
      case 'clients':
        return 'Répertoire Clients & Véhicules';
      case 'suppliers':
        return 'Gestion Fournisseurs & Commandes';
      case 'documents':
        return 'Devis, Bons de Commande & Facturation';
      case 'cash':
        return 'Caisse & Encaissements Journaliers';
      case 'accounting':
        return 'Tableau de Bord Comptable';
      default:
        return 'Gestion de Garage';
    }
  };

  return (
    <header
      className="h-16 px-6 border-b flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs transition-colors"
      style={{
        backgroundColor: theme.headerBgColor || '#ffffff',
        color: theme.headerTextColor || '#0f172a',
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Zone 1: Brand & Context Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          onClick={() => setIsGarageModalOpen(true)}
          className="flex items-center gap-2 cursor-pointer group"
          title="Modifier le logo et l'identité du garage"
        >
          {garage.logoUrl ? (
            <img
              src={garage.logoUrl}
              alt="Logo garage"
              className="w-8 h-8 object-contain rounded-md border border-slate-200 p-0.5 group-hover:border-slate-400 transition-colors"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-xs"
              style={{ backgroundColor: theme.primaryColor }}
            >
              AP
            </div>
          )}
          <span className="font-extrabold text-slate-900 text-sm tracking-tight hidden sm:inline">
            {garage.name}
          </span>
        </div>

        <span className="text-slate-300 hidden sm:inline">/</span>

        <h2 className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
          {getTabTitle()}
        </h2>
      </div>

      {/* Zone 3: Primary Actions (Colors customizer, Garage info, Quick action) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Color Switcher Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Modifier toutes les couleurs de l'application"
        >
          <Palette className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">Couleurs & Thème</span>
          <span
            className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </button>

        {/* Logo & Garage Info Button */}
        <button
          onClick={() => setIsGarageModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Intégrer ou changer le logo et coordonnées"
        >
          <Building2 className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden md:inline">Logo & Garage</span>
        </button>

        {/* Quick New Document Shortcut */}
        <button
          onClick={() => setActiveTab('documents')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-xs"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouveau Devis / Facture</span>
        </button>
      </div>
    </header>
  );
};
