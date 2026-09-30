import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Palette,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Layout,
  Layers,
  Wallpaper,
  FileText,
  Sliders,
} from 'lucide-react';
import { DEFAULT_THEME } from '../services/storage';

export const ThemeModal: React.FC = () => {
  const { theme, updateTheme, isThemeModalOpen, setIsThemeModalOpen } = useApp();
  const [activeSection, setActiveSection] = useState<'presets' | 'background' | 'brand' | 'bars' | 'cards'>('presets');

  if (!isThemeModalOpen) return null;

  // Complete Ready-Made Themes
  const COMPLETE_THEMES = [
    {
      name: 'Atelier Bleu Pro',
      desc: 'Style standard garage moderne, fond clair et barre nuit',
      config: {
        primaryColor: '#0284c7',
        secondaryColor: '#f59e0b',
        appBackgroundColor: '#f8fafc',
        appBackgroundType: 'solid' as const,
        sidebarBgColor: '#0f172a',
        sidebarTextColor: '#f8fafc',
        headerBgColor: '#ffffff',
        headerTextColor: '#0f172a',
        cardBgColor: '#ffffff',
        cardBorderColor: '#e2e8f0',
        textPrimaryColor: '#0f172a',
        tableHeaderBgColor: '#f1f5f9',
        documentHeaderColor: '#0f172a',
      },
    },
    {
      name: 'Racing GT Carbone',
      desc: 'Ambiance atelier sport mécanique, fond sombre et rouge vif',
      config: {
        primaryColor: '#dc2626',
        secondaryColor: '#f97316',
        appBackgroundColor: '#0f172a',
        appBackgroundType: 'carbon_pattern' as const,
        sidebarBgColor: '#0b1120',
        sidebarTextColor: '#f1f5f9',
        headerBgColor: '#1e293b',
        headerTextColor: '#ffffff',
        cardBgColor: '#1e293b',
        cardBorderColor: '#334155',
        textPrimaryColor: '#f8fafc',
        tableHeaderBgColor: '#334155',
        documentHeaderColor: '#991b1b',
      },
    },
    {
      name: 'Émeraude Éco & Hybride',
      desc: 'Atelier éco-responsable, vert forêt et fond doux',
      config: {
        primaryColor: '#059669',
        secondaryColor: '#10b981',
        appBackgroundColor: '#f0fdf4',
        appBackgroundType: 'subtle_grid' as const,
        sidebarBgColor: '#064e3b',
        sidebarTextColor: '#ecfdf5',
        headerBgColor: '#ffffff',
        headerTextColor: '#064e3b',
        cardBgColor: '#ffffff',
        cardBorderColor: '#bbf7d0',
        textPrimaryColor: '#064e3b',
        tableHeaderBgColor: '#ecfdf5',
        documentHeaderColor: '#064e3b',
      },
    },
    {
      name: 'Ambre Vintage & Prestige',
      desc: 'Esprit restauration de véhicules anciens, tons chauds',
      config: {
        primaryColor: '#d97706',
        secondaryColor: '#b45309',
        appBackgroundColor: '#fbfbfa',
        appBackgroundType: 'solid' as const,
        sidebarBgColor: '#1c1917',
        sidebarTextColor: '#fafaf9',
        headerBgColor: '#ffffff',
        headerTextColor: '#292524',
        cardBgColor: '#ffffff',
        cardBorderColor: '#e7e5e4',
        textPrimaryColor: '#1c1917',
        tableHeaderBgColor: '#f5f5f4',
        documentHeaderColor: '#78350f',
      },
    },
    {
      name: 'Bleu Nuit Minéral',
      desc: 'Contraste élégant sombre pour diagnostic haute technologie',
      config: {
        primaryColor: '#3b82f6',
        secondaryColor: '#38bdf8',
        appBackgroundColor: '#090d16',
        appBackgroundType: 'dots_pattern' as const,
        sidebarBgColor: '#050810',
        sidebarTextColor: '#e2e8f0',
        headerBgColor: '#0f172a',
        headerTextColor: '#ffffff',
        cardBgColor: '#0f172a',
        cardBorderColor: '#1e293b',
        textPrimaryColor: '#f1f5f9',
        tableHeaderBgColor: '#1e293b',
        documentHeaderColor: '#1e3a8a',
      },
    },
    {
      name: 'Pureté Blanche & Cyan',
      desc: 'Minimalisme d’atelier immaculé, haute lisibilité',
      config: {
        primaryColor: '#0891b2',
        secondaryColor: '#06b6d4',
        appBackgroundColor: '#ffffff',
        appBackgroundType: 'subtle_grid' as const,
        sidebarBgColor: '#f8fafc',
        sidebarTextColor: '#0f172a',
        headerBgColor: '#ffffff',
        headerTextColor: '#0f172a',
        cardBgColor: '#ffffff',
        cardBorderColor: '#e2e8f0',
        textPrimaryColor: '#0f172a',
        tableHeaderBgColor: '#f8fafc',
        documentHeaderColor: '#0e7490',
      },
    },
  ];

  const BG_COLOR_PRESETS = [
    { name: 'Gris Clair Atelier', hex: '#f8fafc' },
    { name: 'Blanc Pur', hex: '#ffffff' },
    { name: 'Sable / Travertin', hex: '#f5f5f4' },
    { name: 'Gris Perle', hex: '#f1f5f9' },
    { name: 'Anthracite Sombre', hex: '#0f172a' },
    { name: 'Noir Carbone', hex: '#18181b' },
    { name: 'Bleu Minuit', hex: '#090d16' },
    { name: 'Vert Forêt Sombre', hex: '#052e16' },
  ];

  const PRIMARY_COLOR_PRESETS = [
    { name: 'Bleu Atelier Pro', hex: '#0284c7' },
    { name: 'Bleu Cobalt', hex: '#2563eb' },
    { name: 'Rouge Racing GT', hex: '#dc2626' },
    { name: 'Émeraude Vert', hex: '#059669' },
    { name: 'Orange Mécanique', hex: '#ea580c' },
    { name: 'Ambre Or', hex: '#d97706' },
    { name: 'Violet Performance', hex: '#7c3aed' },
    { name: 'Graphite Sombre', hex: '#334155' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-800" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Personnalisation Complète des Couleurs & Fond d'Écran
            </h2>
          </div>
          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 bg-slate-100/70 text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSection('presets')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'presets' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thèmes Clés en Main</span>
          </button>

          <button
            onClick={() => setActiveSection('background')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'background' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallpaper className="w-3.5 h-3.5" />
            <span>Fond d'Écran de l'App</span>
          </button>

          <button
            onClick={() => setActiveSection('brand')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'brand' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Couleurs Principales & Accent</span>
          </button>

          <button
            onClick={() => setActiveSection('bars')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'bars' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Barres Latérale & En-Tête</span>
          </button>

          <button
            onClick={() => setActiveSection('cards')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSection === 'cards' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cartes, Tableaux & Documents</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* SECTION 1: PRESETS */}
          {activeSection === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Thèmes Clés en Main Instantanés</h3>
                <p className="text-slate-500">Sélectionnez une ambiance d'atelier prédéfinie ou ajustez chaque élément individuellement.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {COMPLETE_THEMES.map((item) => {
                  const isCurrent = theme.primaryColor.toLowerCase() === item.config.primaryColor.toLowerCase() &&
                                    theme.appBackgroundColor.toLowerCase() === item.config.appBackgroundColor.toLowerCase();

                  return (
                    <div
                      key={item.name}
                      onClick={() => updateTheme(item.config)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                        isCurrent ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md bg-sky-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        {isCurrent && <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded">Actif</span>}
                      </div>
                      <p className="text-slate-500 text-[11px] mb-3">{item.desc}</p>

                      {/* Mini Swatches Preview */}
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200">
                        <div className="w-5 h-5 rounded border border-slate-300" style={{ backgroundColor: item.config.appBackgroundColor }} title="Fond d'écran" />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: item.config.sidebarBgColor }} title="Barre latérale" />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: item.config.primaryColor }} title="Couleur principale" />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: item.config.secondaryColor }} title="Couleur accent" />
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: item.config.documentHeaderColor }} title="Documents PDF" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: APP BACKGROUND */}
          {activeSection === 'background' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Fond d'Écran de toute l'Application</h3>
                <p className="text-slate-500">Personnalisez la couleur d'arrière-plan globale visible sur tout le logiciel.</p>
              </div>

              {/* Color Picker for Background */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Couleur de fond personnalisée
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-slate-600">{theme.appBackgroundColor}</span>
                    <input
                      type="color"
                      value={theme.appBackgroundColor}
                      onChange={(e) => {
                        const newBg = e.target.value;
                        // Auto-adjust text color contrast if very dark background
                        const isDark = newBg.startsWith('#0') || newBg.startsWith('#1') || newBg.startsWith('#2');
                        updateTheme({
                          appBackgroundColor: newBg,
                          textPrimaryColor: isDark ? '#f8fafc' : '#0f172a',
                        });
                      }}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BG_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => {
                        const isDark = preset.hex.startsWith('#0') || preset.hex.startsWith('#1');
                        updateTheme({
                          appBackgroundColor: preset.hex,
                          textPrimaryColor: isDark ? '#f8fafc' : '#0f172a',
                        });
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg border text-left font-medium transition-all hover:border-slate-400 bg-white"
                      style={{
                        borderColor: theme.appBackgroundColor.toLowerCase() === preset.hex.toLowerCase() ? '#0284c7' : '#e2e8f0',
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="truncate text-slate-700 text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Pattern */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-800 block">
                  Style de texture / Trame de fond d'écran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'solid', name: 'Couleur Unie Épurée', desc: 'Sans texture' },
                    { id: 'subtle_grid', name: 'Quadrillage Technique', desc: 'Esprit atelier & mécanique' },
                    { id: 'dots_pattern', name: 'Points de Précision', desc: 'Design industriel moderne' },
                    { id: 'carbon_pattern', name: 'Trame Carbone GT', desc: 'Esprit sport automobile' },
                    { id: 'gradient_radial', name: 'Halo Lumineux', desc: 'Léger dégradé zénithal' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => updateTheme({ appBackgroundType: pat.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        theme.appBackgroundType === pat.id
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-900 block">{pat.name}</span>
                      <span className="text-slate-500 text-[10px] block mt-0.5">{pat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: BRAND & ACCENT */}
          {activeSection === 'brand' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Couleur Principale & Accent Secondaire</h3>
                <p className="text-slate-500">Définissez la couleur des boutons d'action, sélecteurs, badges et alertes.</p>
              </div>

              {/* Primary Color */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Couleur Principale (Boutons majeurs, onglets actifs)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-slate-600">{theme.primaryColor}</span>
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIMARY_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      onClick={() => updateTheme({ primaryColor: p.hex })}
                      className="flex items-center gap-2 p-2 rounded-lg border text-left font-medium transition-all hover:border-slate-400 bg-white"
                      style={{
                        borderColor: theme.primaryColor.toLowerCase() === p.hex.toLowerCase() ? p.hex : '#e2e8f0',
                      }}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
                      <span className="truncate text-slate-700 text-[11px]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Accent */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    Couleur d'Accent Secondaire (Badges statut, alertes)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-slate-600">{theme.secondaryColor}</span>
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: BARS (SIDEBAR & HEADER) */}
          {activeSection === 'bars' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Barre Latérale & En-Tête Supérieur</h3>
                <p className="text-slate-500">Personnalisez indépendamment la barre de navigation et le bandeau supérieur.</p>
              </div>

              {/* Sidebar Background & Text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="font-bold text-slate-900 block">Barre Latérale (Menu)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Fond de la barre :</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-slate-500">{theme.sidebarBgColor}</span>
                      <input
                        type="color"
                        value={theme.sidebarBgColor}
                        onChange={(e) => updateTheme({ sidebarBgColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Texte de la barre :</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-slate-500">{theme.sidebarTextColor}</span>
                      <input
                        type="color"
                        value={theme.sidebarTextColor}
                        onChange={(e) => updateTheme({ sidebarTextColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets for Sidebar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { label: 'Carbone Sombre', bg: '#0f172a', text: '#f8fafc' },
                    { label: 'Noir Pur Ébène', bg: '#090d16', text: '#f1f5f9' },
                    { label: 'Bleu Nuit GT', bg: '#1e3a8a', text: '#ffffff' },
                    { label: 'Blanc Épuré', bg: '#ffffff', text: '#0f172a' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => updateTheme({ sidebarBgColor: s.bg, sidebarTextColor: s.text })}
                      className="px-2.5 py-1 rounded border text-[11px] font-medium bg-white hover:border-slate-400"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Header Background & Text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="font-bold text-slate-900 block">En-Tête Supérieur (Barre de Titre)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Fond de l'en-tête :</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-slate-500">{theme.headerBgColor}</span>
                      <input
                        type="color"
                        value={theme.headerBgColor}
                        onChange={(e) => updateTheme({ headerBgColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Texte de l'en-tête :</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-slate-500">{theme.headerTextColor}</span>
                      <input
                        type="color"
                        value={theme.headerTextColor}
                        onChange={(e) => updateTheme({ headerTextColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: CARDS & DOCUMENTS */}
          {activeSection === 'cards' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cartes, Tableaux & Documents Imprimables</h3>
                <p className="text-slate-500">Ajustez le fond des blocs de contenu et les bannières officielles de vos devis et factures.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card Background */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      Fond des Blocs & Cartes
                    </label>
                    <input
                      type="color"
                      value={theme.cardBgColor}
                      onChange={(e) => updateTheme({ cardBgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Fond des blocs du calendrier, tableau de caisse et fiches clients.
                  </p>
                </div>

                {/* Card Border */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      Bordures des Cartes
                    </label>
                    <input
                      type="color"
                      value={theme.cardBorderColor}
                      onChange={(e) => updateTheme({ cardBorderColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Liseré de séparation des conteneurs.
                  </p>
                </div>

                {/* Table Header Background */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      En-têtes de Tableaux
                    </label>
                    <input
                      type="color"
                      value={theme.tableHeaderBgColor}
                      onChange={(e) => updateTheme({ tableHeaderBgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ligne de titres des colonnes des tableaux d'atelier.
                  </p>
                </div>

                {/* Document Header Color */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      Documents Devis & Factures
                    </label>
                    <input
                      type="color"
                      value={theme.documentHeaderColor}
                      onChange={(e) => updateTheme({ documentHeaderColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bandeau officiel, liserés et totaux des documents PDF.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => updateTheme(DEFAULT_THEME)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rétablir le thème par défaut</span>
          </button>

          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
