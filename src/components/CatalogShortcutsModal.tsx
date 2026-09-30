import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CatalogItem } from '../types';

interface CatalogShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: CatalogItem) => void;
}

export const CatalogShortcutsModal: React.FC<CatalogShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const { catalogItems, addCatalogItem, updateCatalogItem, deleteCatalogItem, theme } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    type: 'piece' as CatalogItem['type'],
    reference: '',
    description: '',
    defaultQuantity: 1,
    unitPriceHT: 50,
    tvaRate: 20,
    category: 'Entretien & Vidange',
  });

  if (!isOpen) return null;

  // Categories present in catalog + 'all'
  const categories = ['all', ...Array.from(new Set(catalogItems.map((c) => c.category)))];

  const filteredItems = catalogItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.description.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleStartAdd = () => {
    setEditingItem(null);
    setFormData({
      type: 'forfait',
      reference: '',
      description: '',
      defaultQuantity: 1,
      unitPriceHT: 60,
      tvaRate: 20,
      category: 'Entretien & Vidange',
    });
    setIsAddingNew(true);
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      reference: item.reference,
      description: item.description,
      defaultQuantity: item.defaultQuantity,
      unitPriceHT: item.unitPriceHT,
      tvaRate: item.tvaRate,
      category: item.category,
    });
    setIsAddingNew(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Veuillez renseigner une désignation.');
      return;
    }

    if (editingItem) {
      updateCatalogItem(editingItem.id, formData);
    } else {
      addCatalogItem(formData);
    }

    setIsAddingNew(false);
    setEditingItem(null);
  };

  const getTypeBadge = (type: CatalogItem['type']) => {
    switch (type) {
      case 'forfait':
        return <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Forfait</span>;
      case 'main_oeuvre':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">M.O</span>;
      case 'piece':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Pièce</span>;
      case 'autre':
      default:
        return <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Autre</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bibliothèque des Prestations & Pièces Facturées
              </h2>
              <p className="text-[11px] text-slate-500">
                Raccourcis rapides à insérer d'un clic dans vos devis et factures. Modifiez ou ajoutez vos propres tarifs d'atelier.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Category filters & Add button */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par libellé, référence, catégorie..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500 bg-white"
              />
            </div>

            {/* Add New Button */}
            <button
              onClick={handleStartAdd}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs whitespace-nowrap"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Rajouter une Prestation / Article</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'Toutes les catégories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Add/Edit Form OR Catalog List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
          {isAddingNew ? (
            /* Add / Edit Form */
            <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">
                  {editingItem ? 'Modifier la Prestation / Pièce' : 'Rajouter une Nouvelle Prestation ou Pièce'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Annuler
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type d'élément *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="forfait">Forfait Révision / Entretien complet</option>
                    <option value="main_oeuvre">Main d'œuvre atelier (M.O)</option>
                    <option value="piece">Pièce de rechange détachée</option>
                    <option value="autre">Autre (Ingrédients, Recyclage, Frais)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: Freinage, M.O, Climatisation..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Référence abrégée</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="ex: MO-T1, FORF-CLIM..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantité par défaut</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.defaultQuantity}
                    onChange={(e) => setFormData({ ...formData, defaultQuantity: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Désignation complète de la prestation / pièce *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ex: Remplacement disques et plaquettes avant + purge liquide DOT4"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prix Unitaire HT (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unitPriceHT}
                    onChange={(e) => setFormData({ ...formData, unitPriceHT: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-bold text-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Taux de TVA *</label>
                  <select
                    value={formData.tvaRate}
                    onChange={(e) => setFormData({ ...formData, tvaRate: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value={20}>20% (Taux normal standard)</option>
                    <option value={10}>10% (Taux intermédiaire)</option>
                    <option value={5.5}>5.5% (Taux réduit)</option>
                    <option value={0}>0% (Exonéré de TVA)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-slate-500 text-[11px]">
                  Prix TTC calculé : <strong className="text-slate-900 font-mono">{(formData.unitPriceHT * (1 + formData.tvaRate / 100)).toFixed(2)} € TTC</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-white font-semibold shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {editingItem ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Items List Table */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>{filteredItems.length} prestation(s) et pièce(s) trouvée(s)</span>
                {onSelectItem && (
                  <span className="text-sky-700 font-semibold">
                    Cliquez sur « Insérer » pour ajouter la ligne à votre devis / facture
                  </span>
                )}
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    Aucun raccourci ne correspond à votre recherche.
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const priceTTC = item.unitPriceHT * (1 + item.tvaRate / 100);

                    return (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(item.type)}
                            {item.reference && (
                              <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.reference}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {item.category}
                            </span>
                          </div>

                          <p className="font-bold text-slate-800 text-xs sm:text-sm">
                            {item.description}
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-900 text-sm tabular-nums block">
                              {item.unitPriceHT.toFixed(2)} € HT
                            </span>
                            <span className="text-[10px] text-slate-500 tabular-nums">
                              {priceTTC.toFixed(2)} € TTC (TVA {item.tvaRate}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Insert into Document Button (if picker) */}
                            {onSelectItem && (
                              <button
                                onClick={() => {
                                  onSelectItem(item);
                                }}
                                className="px-3 py-1.5 text-white font-semibold rounded-lg shadow-xs text-xs flex items-center gap-1 transition-opacity hover:opacity-95"
                                style={{ backgroundColor: theme.primaryColor }}
                                title="Insérer cette ligne directement dans le document"
                              >
                                <span>Insérer</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Modifier cette prestation / tarif"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer le raccourci « ${item.description} » ?`)) {
                                  deleteCatalogItem(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Supprimer ce raccourci"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0 text-xs">
          <span className="text-slate-500">
            {catalogItems.length} prestations et pièces enregistrées au total
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
