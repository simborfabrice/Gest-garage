import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Calculator,
  Trash2,
  X,
  FileCheck,
} from 'lucide-react';
import { Supplier, SupplierOrder, SupplierOrderItem } from '../../types';
import { formatDate } from '../../utils/dateUtils';

export const SuppliersTab: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    deleteSupplier,
    supplierOrders,
    addSupplierOrder,
    updateSupplierOrder,
    deleteSupplierOrder,
    theme,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'suppliers' | 'marginCalc'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    category: 'pieces' as Supplier['category'],
    contactName: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: 'Fin de mois 30 jours',
    notes: '',
  });

  // Supplier Order Form
  const [orderSupplierId, setOrderSupplierId] = useState(suppliers[0]?.id || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('2026-09-30');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderItems, setOrderItems] = useState<Omit<SupplierOrderItem, 'id'>[]>([
    { reference: '', description: '', quantity: 1, unitCostHT: 0, tvaRate: 20 },
  ]);

  // Margin Calculator State
  const [calcCostHT, setCalcCostHT] = useState(50);
  const [calcCoefficient, setCalcCoefficient] = useState(1.75); // Standard garage coefficient: 1.6 to 2.0
  const suggestedSaleHT = calcCostHT * calcCoefficient;
  const suggestedMarginHT = suggestedSaleHT - calcCostHT;
  const marginPercent = suggestedSaleHT > 0 ? (suggestedMarginHT / suggestedSaleHT) * 100 : 0;
  const suggestedSaleTTC = suggestedSaleHT * 1.2;

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(supplierForm);
    setIsAddSupplierModalOpen(false);
    setSupplierForm({
      name: '',
      category: 'pieces',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: 'Fin de mois 30 jours',
      notes: '',
    });
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSupplierId) return;

    let totalHT = 0;
    let totalTVA = 0;

    const formattedItems: SupplierOrderItem[] = orderItems.map((item, idx) => {
      const lineHT = item.quantity * item.unitCostHT;
      const lineTVA = lineHT * (item.tvaRate / 100);
      totalHT += lineHT;
      totalTVA += lineTVA;
      return {
        ...item,
        id: `soi-${Date.now()}-${idx}`,
      };
    });

    const totalTTC = totalHT + totalTVA;

    addSupplierOrder({
      supplierId: orderSupplierId,
      orderNumber: orderNumber || `CMD-${Date.now().toString().slice(-4)}`,
      orderDate,
      status: 'recu',
      items: formattedItems,
      totalHT: Math.round(totalHT * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      notes: orderNotes,
    });

    setIsAddOrderModalOpen(false);
    setOrderItems([{ reference: '', description: '', quantity: 1, unitCostHT: 0, tvaRate: 20 }]);
    setOrderNumber('');
    setOrderNotes('');
  };

  const addOrderItemRow = () => {
    setOrderItems([...orderItems, { reference: '', description: '', quantity: 1, unitCostHT: 0, tvaRate: 20 }]);
  };

  const removeOrderItemRow = (idx: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-700" />
            <span>Gestion Fournisseurs & Commandes de Pièces</span>
          </h2>
          <p className="text-xs text-slate-500">
            Suivi des approvisionnements, livraisons, factures d'achat et marges brutes de pièces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Commande de Pièces</span>
          </button>
          <button
            onClick={() => setIsAddSupplierModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Nouveau Fournisseur
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'orders'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeSubTab === 'orders' ? theme.primaryColor : 'transparent', color: activeSubTab === 'orders' ? theme.primaryColor : undefined }}
        >
          <Package className="w-4 h-4" />
          <span>Bons de Réception & Factures Fournisseurs ({supplierOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'suppliers'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeSubTab === 'suppliers' ? theme.primaryColor : 'transparent', color: activeSubTab === 'suppliers' ? theme.primaryColor : undefined }}
        >
          <Truck className="w-4 h-4" />
          <span>Annuaire des Fournisseurs ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('marginCalc')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'marginCalc'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          style={{ borderColor: activeSubTab === 'marginCalc' ? theme.primaryColor : 'transparent', color: activeSubTab === 'marginCalc' ? theme.primaryColor : undefined }}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulateur Coeff & Marge Pièces</span>
        </button>
      </div>

      {/* Subtab 1: Orders / Invoices from suppliers */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">Total Dépenses Pièces (HT)</span>
              <p className="text-xl font-black text-slate-900 mt-1 tabular-nums">
                {supplierOrders.reduce((sum, o) => sum + o.totalHT, 0).toFixed(2)} €
              </p>
              <span className="text-[11px] text-slate-400">Totalité des commandes passées</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">TVA Déductible Fournisseurs</span>
              <p className="text-xl font-black text-emerald-600 mt-1 tabular-nums">
                {supplierOrders.reduce((sum, o) => sum + o.totalTVA, 0).toFixed(2)} €
              </p>
              <span className="text-[11px] text-slate-400">À récupérer sur déclaration TVA</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500">Commandes Reçues</span>
              <p className="text-xl font-black text-blue-600 mt-1 tabular-nums">
                {supplierOrders.filter((o) => o.status === 'recu' || o.status === 'paye').length} / {supplierOrders.length}
              </p>
              <span className="text-[11px] text-slate-400">Taux de conformité 100%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">N° Commande</th>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Articles commandés</th>
                    <th className="py-3 px-4 text-right">Total HT</th>
                    <th className="py-3 px-4 text-right">Total TTC</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplierOrders.map((order) => {
                    const supplier = suppliers.find((s) => s.id === order.supplierId);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {supplier?.name || 'Fournisseur inconnu'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 tabular-nums">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {order.items.map((it) => `${it.quantity}x ${it.description}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                          {order.totalHT.toFixed(2)} €
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {order.totalTTC.toFixed(2)} €
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateSupplierOrder(order.id, { status: e.target.value as any })}
                            className="text-[11px] border border-slate-300 rounded px-2 py-1 bg-white font-medium"
                          >
                            <option value="en_attente">En attente de livraison</option>
                            <option value="recu">Reçu en atelier</option>
                            <option value="paye">Payé</option>
                            <option value="annule">Annulé</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cette commande fournisseur ?')) {
                                deleteSupplierOrder(order.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Suppliers Directory */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase tracking-wider">
                    {sup.category.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Supprimer le fournisseur ${sup.name} ?`)) {
                      deleteSupplier(sup.id);
                    }
                  }}
                  className="text-slate-300 group-hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Contact :</span>
                  <strong className="text-slate-800">{sup.contactName}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.address}</span>
                </p>
              </div>

              {sup.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-100">
                  {sup.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Margin & Parts Coefficient Calculator */}
      {activeSubTab === 'marginCalc' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <Calculator className="w-6 h-6 text-sky-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Simulateur de Marge & Prix de Vente Client
              </h3>
              <p className="text-xs text-slate-500">
                Appliquez les coefficients standards de la profession automobile pour tarifer vos pièces détachées.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Prix d'Achat Fournisseur HT (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={calcCostHT}
                  onChange={(e) => setCalcCostHT(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-base font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Coefficient Multiplicateur Garage : {calcCoefficient}x
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.05"
                  value={calcCoefficient}
                  onChange={(e) => setCalcCoefficient(Number(e.target.value))}
                  className="w-full cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1.2x (Gros volume)</span>
                  <span>1.75x (Standard atelier)</span>
                  <span>2.5x+ (Petite visserie)</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TARIF CLIENT SUGGÉRÉ
              </span>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Prix de vente conseillé HT :</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {suggestedSaleHT.toFixed(2)} € HT
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Prix avec TVA 20% (TTC) :</span>
                  <span className="font-mono font-bold text-sky-700 text-base tabular-nums">
                    {suggestedSaleTTC.toFixed(2)} € TTC
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                    <span>Marge brute en euros :</span>
                    <span className="font-mono tabular-nums">+{suggestedMarginHT.toFixed(2)} € HT</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-semibold mt-1">
                    <span>Taux de marge brute :</span>
                    <span className="font-mono tabular-nums">{marginPercent.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-700" />
                <span>Nouveau Fournisseur de Pièces</span>
              </h3>
              <button
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom de l'enseigne *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="ex: Autodistribution AD, Bosch..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catégorie *</label>
                <select
                  value={supplierForm.category}
                  onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="pieces">Pièces détachées mécaniques</option>
                  <option value="pneumatiques">Pneumatiques</option>
                  <option value="huiles_fluides">Huiles, lubrifiants & fluides</option>
                  <option value="outillage">Outillage & consommables</option>
                  <option value="peinture">Carrosserie & peinture</option>
                  <option value="autre">Autre spécialité</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nom du contact</label>
                  <input
                    type="text"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Téléphone commandes</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email commandes</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adresse dépôt</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Modalités de paiement</label>
                <input
                  type="text"
                  value={supplierForm.paymentTerms}
                  onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer le Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Order Modal */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-700" />
                <span>Enregistrer une Commande / Facture d'Achat Fournisseur</span>
              </h3>
              <button
                onClick={() => setIsAddOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fournisseur *</label>
                  <select
                    value={orderSupplierId}
                    onChange={(e) => setOrderSupplierId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">N° Bon / Facture</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="ex: CMD-AD-9012"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Pièces / Articles commandés</span>
                  <button
                    type="button"
                    onClick={addOrderItemRow}
                    className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Réf pièce"
                        value={item.reference}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx].reference = e.target.value;
                          setOrderItems(updated);
                        }}
                        className="w-24 border border-slate-300 rounded p-1.5 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Désignation (ex: Kit distribution...)"
                        value={item.description}
                        required
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx].description = e.target.value;
                          setOrderItems(updated);
                        }}
                        className="flex-1 border border-slate-300 rounded p-1.5 text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[idx].quantity = Number(e.target.value);
                          setOrderItems(updated);
                        }}
                        className="w-14 border border-slate-300 rounded p-1.5 text-xs text-right tabular-nums"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="P.U. HT"
                          value={item.unitCostHT}
                          onChange={(e) => {
                            const updated = [...orderItems];
                            updated[idx].unitCostHT = Number(e.target.value);
                            setOrderItems(updated);
                          }}
                          className="w-20 border border-slate-300 rounded p-1.5 text-xs text-right tabular-nums font-mono"
                        />
                        <span className="text-[11px] text-slate-400">€ HT</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOrderItemRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Bon de livraison</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Pièces réceptionnées le matin..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer l'Achat Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
