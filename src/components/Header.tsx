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
  Database,
  FileText,
} from 'lucide-react';
import { formatDateFull } from '../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    activeTab,
    garage,
    theme,
    documents,
    setViewingDocument,
    setIsThemeModalOpen,
    setIsGarageModalOpen,
    setIsBackupModalOpen,
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
      className="min-h-16 h-18 px-6 border-b flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs transition-colors"
      style={{
        backgroundColor: theme.headerBgColor || '#ffffff',
        color: theme.headerTextColor || '#0f172a',
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Zone 1: Brand & Context Breadcrumb */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          onClick={() => setIsGarageModalOpen(true)}
          className="flex items-center gap-3 cursor-pointer group p-1 -m-1 rounded-lg hover:bg-slate-100/70 transition-all"
          title="Modifier le logo et l'identité du garage (redimensionnable)"
        >
          {garage.logoUrl ? (
            <img
              src={garage.logoUrl}
              alt="Logo garage"
              className="object-contain shrink-0 bg-transparent transition-transform group-hover:scale-105"
              style={{
                height: `${Math.min(Math.max((garage.logoSize || 140) * 0.46, 44), 62)}px`,
                maxWidth: '200px',
                width: 'auto',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
            />
          ) : (
            <div
              className="rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs"
              style={{
                backgroundColor: theme.primaryColor,
                height: `${Math.min(Math.max((garage.logoSize || 140) * 0.46, 44), 62)}px`,
                width: `${Math.min(Math.max((garage.logoSize || 140) * 0.46, 44), 62)}px`,
              }}
            >
              AP
            </div>
          )}
          <div className="hidden sm:block leading-tight">
            <span className="font-black text-slate-900 text-sm tracking-tight block">
              {garage.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Atelier automobile
            </span>
          </div>
        </div>

        <span className="text-slate-300 hidden sm:inline">/</span>

        <h2 className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
          {getTabTitle()}
        </h2>

        <span className="text-slate-300 hidden md:inline">·</span>
        <span className="text-xs text-slate-500 font-medium hidden md:inline capitalize">
          {formatDateFull(new Date())}
        </span>
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

        {/* Sauvegarde & Restauration Button */}
        <button
          onClick={() => setIsBackupModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Sauvegarder ou restaurer toutes les données (documents, devis, factures, caisse, etc.)"
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden lg:inline">Sauvegarde & Restauration</span>
          <span className="lg:hidden hidden sm:inline">Sauvegarde</span>
        </button>

        {/* Quick Open Documents Viewer Button (A4 Preview) */}
        <button
          onClick={() => {
            if (documents.length > 0) {
              setViewingDocument(documents[0]);
            } else {
              setActiveTab('documents');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          title="Aperçu avant impression au format A4 de tous les documents (devis, commandes, factures, fournisseurs)"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline">Aperçu Documents A4 ({documents.length})</span>
          <span className="xl:hidden hidden sm:inline">Aperçu A4</span>
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
