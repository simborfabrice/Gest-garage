import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Upload, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_GARAGE } from '../services/storage';

const PRESET_LOGOS = [
  {
    name: 'Logo Écusson MécaPro',
    url: '/src/assets/images/garage_logo_emblem_1790760547751.jpg',
  },
  {
    name: 'Logo Clé & Piston Moderne (SVG)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%230f172a"/><path d="M50 15 L78 30 L78 70 L50 85 L22 70 L22 30 Z" stroke="%2338bdf8" stroke-width="4" fill="none"/><path d="M38 42 L62 62 M62 42 L38 62" stroke="%23f59e0b" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="52" r="8" fill="%2338bdf8"/></svg>',
  },
  {
    name: 'Logo Turbo Performance (SVG)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%231e293b" stroke="%23dc2626" stroke-width="4"/><path d="M50 24 A26 26 0 1 1 24 50 L34 50 A16 16 0 1 0 50 34 Z" fill="%23dc2626"/><circle cx="50" cy="50" r="8" fill="%23ffffff"/></svg>',
  },
  {
    name: 'Logo Monogramme GT (SVG)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230284c7"/><text x="50" y="62" font-family="sans-serif" font-size="34" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-1">AUTO</text><path d="M25 72 L75 72" stroke="%23fbbf24" stroke-width="4" stroke-linecap="round"/></svg>',
  },
];

export const GarageSettingsModal: React.FC = () => {
  const { garage, updateGarage, isGarageModalOpen, setIsGarageModalOpen, theme } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(garage);
  const [logoPreview, setLogoPreview] = useState(garage.logoUrl);

  if (!isGarageModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('L’image ne doit pas dépasser 2 Mo pour un affichage optimal.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateGarage({ ...formData, logoUrl: logoPreview });
    setIsGarageModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Identité du Garage & Logo des Documents
            </h2>
          </div>
          <button
            onClick={() => setIsGarageModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Logo Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  Logo Officiel de l’Établissement
                </label>
                <p className="text-xs text-slate-500">
                  Affiché sans contour ni couleur de fond sur vos devis, factures, barre latérale et reçus de caisse (seul votre visuel détouré apparaît).
                </p>
              </div>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview('');
                    setFormData((prev) => ({ ...prev, logoUrl: '' }));
                  }}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Logo Box avec taille dynamique et aperçu en temps réel sans contour ni fond */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative transition-all"
                  style={{
                    width: `${Math.min(Math.max(formData.logoSize || 140, 100), 220)}px`,
                    height: `${Math.min(Math.max(formData.logoSize || 140, 100), 220)}px`,
                    background: 'repeating-conic-gradient(#f8fafc 0% 25%, #ffffff 0% 50%) 50% / 16px 16px',
                  }}
                  title="Aperçu du logo (fond transparent, aucun contour appliqué)"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo garage"
                      className="w-full h-full object-contain p-1"
                      style={{
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        background: 'transparent',
                      }}
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                      <span className="text-[10px] block">Aucun logo</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span>✓</span>
                  <span>Sans contour ni fond</span>
                </span>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Téléverser votre logo (PNG, JPG, SVG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(DEFAULT_GARAGE.logoUrl);
                      setFormData((prev) => ({ ...prev, logoUrl: DEFAULT_GARAGE.logoUrl }));
                    }}
                    className="px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Logo Standard
                  </button>
                </div>

                {/* Logo Resizer Slider & Numeric Input (Plus gros et redimensionnable à volonté) */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Taille du logo :</span>
                      <span className="font-mono text-sky-700 text-sm font-black">
                        {formData.logoSize || 140} px
                      </span>
                    </span>
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] text-slate-500">Précis :</label>
                      <input
                        type="number"
                        min="50"
                        max="320"
                        step="5"
                        value={formData.logoSize || 140}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            logoSize: Math.max(50, Math.min(320, Number(e.target.value) || 140)),
                          })
                        }
                        className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono text-xs tabular-nums"
                      />
                      <span className="text-[11px] text-slate-400">px</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="320"
                    step="5"
                    value={formData.logoSize || 140}
                    onChange={(e) => setFormData({ ...formData, logoSize: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-sky-600"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {[
                      { label: 'Normal (100px)', size: 100 },
                      { label: 'Grand (140px)', size: 140 },
                      { label: 'Très Grand (180px)', size: 180 },
                      { label: 'XXL (220px)', size: 220 },
                      { label: 'Bannière Max (280px)', size: 280 },
                    ].map((sz) => (
                      <button
                        key={sz.size}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoSize: sz.size })}
                        className={`px-2.5 py-1 text-[10px] rounded font-medium border transition-colors ${
                          (formData.logoSize || 140) === sz.size
                            ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                    Ou choisir un blason automobile prédéfini :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_LOGOS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setLogoPreview(p.url);
                          setFormData((prev) => ({ ...prev, logoUrl: p.url }));
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition-all bg-white ${
                          logoPreview === p.url ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-7 h-7 object-contain rounded" />
                        <span className="truncate text-slate-700 font-medium">{p.name.replace('Logo ', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nom du Garage / Enseigne commerciale *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
                placeholder="ex: Garage Central Mécanique"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Slogan / Spécialités
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
                placeholder="ex: Entretien toutes marques · Diagnostic électronique · Climatisation"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Téléphone de contact *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email professionnel *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Adresse postale de l'atelier *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Code Postal *
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Numéro SIRET (14 chiffres)
              </label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Numéro TVA Intracommunautaire
              </label>
              <input
                type="text"
                value={formData.tvaNumber}
                onChange={(e) => setFormData({ ...formData, tvaNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Code NAF / APE
              </label>
              <input
                type="text"
                value={formData.nafCode}
                onChange={(e) => setFormData({ ...formData, nafCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Site Web
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Coordonnées Bancaires (IBAN) pour virement
              </label>
              <input
                type="text"
                value={formData.bankIban}
                onChange={(e) => setFormData({ ...formData, bankIban: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:border-sky-500 focus:outline-hidden"
                placeholder="FR76 ...."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mentions Légales & Conditions de règlement (Pied de facture)
              </label>
              <textarea
                rows={2}
                value={formData.legalNotes}
                onChange={(e) => setFormData({ ...formData, legalNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setFormData(DEFAULT_GARAGE);
              setLogoPreview(DEFAULT_GARAGE.logoUrl);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Réinitialiser les coordonnées
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsGarageModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
