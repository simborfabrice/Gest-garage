import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  X,
  CreditCard,
} from 'lucide-react';
import { DocumentItem, DocumentType, GarageDocument } from '../../types';

export const DocumentsTab: React.FC = () => {
  const {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    convertQuoteToOrder,
    convertOrderToInvoice,
    setViewingDocument,
    clients,
    vehicles,
    theme,
    setActiveTab,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'devis' | 'bon_commande' | 'facture'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Document Form
  const [newDocType, setNewDocType] = useState<DocumentType>('devis');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-09-30');
  const [newValidityDate, setNewValidityDate] = useState('2026-10-30');
  const [newDueDate, setNewDueDate] = useState('2026-10-30');
  const [newNotes, setNewNotes] = useState('');
  const [newMileage, setNewMileage] = useState<number>(100000);

  const [items, setItems] = useState<Omit<DocumentItem, 'id'>[]>([
    {
      type: 'main_oeuvre',
      reference: 'MO-T1',
      description: 'Main d’œuvre entretien mécanique T1',
      quantity: 1.5,
      unitPriceHT: 68.0,
      discountPercent: 0,
      tvaRate: 20,
    },
    {
      type: 'piece',
      reference: 'FILT-HUILE',
      description: 'Filtre à huile moteur purflux',
      quantity: 1,
      unitPriceHT: 14.5,
      discountPercent: 0,
      tvaRate: 20,
    },
  ]);

  const clientVehicles = vehicles.filter((v) => v.clientId === newClientId);

  const filteredDocuments = documents.filter((doc) => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    const client = clients.find((c) => c.id === doc.clientId);
    const vehicle = vehicles.find((v) => v.id === doc.vehicleId);

    const clientName = client ? `${client.firstName} ${client.lastName} ${client.companyName || ''}`.toLowerCase() : '';
    const plate = vehicle ? vehicle.licensePlate.toLowerCase() : '';

    return doc.referenceNumber.toLowerCase().includes(q) || clientName.includes(q) || plate.includes(q);
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        type: 'piece',
        reference: '',
        description: '',
        quantity: 1,
        unitPriceHT: 0,
        discountPercent: 0,
        tvaRate: 20,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newVehicleId) {
      alert('Veuillez sélectionner un client et un véhicule.');
      return;
    }

    const prefix = newDocType === 'devis' ? 'DEV' : newDocType === 'bon_commande' ? 'BC' : 'FAC';
    const year = new Date().getFullYear();
    const count = documents.filter((d) => d.type === newDocType).length + 1;
    const ref = `${prefix}-${year}-${String(count).padStart(4, '0')}`;

    const formattedItems: DocumentItem[] = items.map((it, idx) => ({
      ...it,
      id: `it-${Date.now()}-${idx}`,
    }));

    const newDoc = addDocument({
      type: newDocType,
      referenceNumber: ref,
      date: newDate,
      validityDate: newDocType === 'devis' ? newValidityDate : undefined,
      dueDate: newDocType === 'facture' ? newDueDate : undefined,
      clientId: newClientId,
      vehicleId: newVehicleId,
      status: newDocType === 'devis' ? 'envoye' : newDocType === 'bon_commande' ? 'valide' : 'brouillon',
      items: formattedItems,
      totalPartsHT: 0,
      totalLaborHT: 0,
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0,
      amountPaid: 0,
      notes: newNotes,
      mileageAtService: newMileage,
    });

    setIsCreateModalOpen(false);
    setViewingDocument(newDoc);
  };

  const getStatusBadge = (doc: GarageDocument) => {
    switch (doc.status) {
      case 'paye':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Payé intégralement</span>;
      case 'partiellement_paye':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Partiellement réglé</span>;
      case 'valide':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Validé / Signé</span>;
      case 'envoye':
        return <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">Transmis au client</span>;
      case 'brouillon':
        return <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">Brouillon</span>;
      case 'refuse':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Refusé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <span>Devis · Bons de Commande · Facturation</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cycle complet d'atelier : création de devis chiffré, transformation en bon de commande et émission de facture.
          </p>
        </div>

        <button
          onClick={() => {
            setNewDocType('devis');
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Document</span>
        </button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tous les documents ({documents.length})
          </button>
          <button
            onClick={() => setFilterType('devis')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'devis' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Devis ({documents.filter((d) => d.type === 'devis').length})
          </button>
          <button
            onClick={() => setFilterType('bon_commande')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'bon_commande' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bons de Commande ({documents.filter((d) => d.type === 'bon_commande').length})
          </button>
          <button
            onClick={() => setFilterType('facture')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === 'facture' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Factures ({documents.filter((d) => d.type === 'facture').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Recherche réf, client, immatriculation..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4 text-right">Total HT</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Aucun document trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const client = clients.find((c) => c.id === doc.clientId);
                  const vehicle = vehicles.find((v) => v.id === doc.vehicleId);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold uppercase text-[10px]">
                        <span
                          className="px-2 py-0.5 rounded text-white tracking-wider"
                          style={{
                            backgroundColor:
                              doc.type === 'devis'
                                ? '#475569'
                                : doc.type === 'bon_commande'
                                ? '#0284c7'
                                : '#059669',
                          }}
                        >
                          {doc.type === 'devis' ? 'Devis' : doc.type === 'bon_commande' ? 'Bon Cde' : 'Facture'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {doc.referenceNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                        {doc.date}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {client ? (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'Client inconnu'}
                      </td>

                      <td className="py-3.5 px-4">
                        {vehicle ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-[10px]">
                              {vehicle.licensePlate}
                            </span>
                            <span className="text-slate-600 truncate max-w-28 text-[11px]">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {doc.totalHT.toFixed(2)} €
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                        {doc.totalTTC.toFixed(2)} €
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(doc)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visualiser / Imprimer */}
                          <button
                            onClick={() => setViewingDocument(doc)}
                            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded transition-colors"
                            title="Ouvrir le document officiel avec logo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Workflow Action */}
                          {doc.type === 'devis' && (
                            <button
                              onClick={() => convertQuoteToOrder(doc.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Transformer ce devis en bon de commande"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {doc.type === 'bon_commande' && (
                            <button
                              onClick={() => convertOrderToInvoice(doc.id)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Émettre la facture finale"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {doc.type === 'facture' && doc.status !== 'paye' && (
                            <button
                              onClick={() => {
                                updateDocument(doc.id, { status: 'paye', amountPaid: doc.totalTTC });
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Marquer comme payé"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le document ${doc.referenceNumber} ?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <span>Nouveau Document Atelier (Devis / Commande / Facture)</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Type selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Type de document à créer *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'devis', label: '1. Devis Chiffré' },
                    { type: 'bon_commande', label: '2. Bon de Commande' },
                    { type: 'facture', label: '3. Facture Finale' },
                  ].map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewDocType(t.type as any)}
                      className={`p-2.5 rounded-lg border font-bold text-xs transition-all ${
                        newDocType === t.type
                          ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client & Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Client *</label>
                  <select
                    value={newClientId}
                    onChange={(e) => {
                      setNewClientId(e.target.value);
                      const fv = vehicles.find((v) => v.clientId === e.target.value);
                      if (fv) setNewVehicleId(fv.id);
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.type === 'professionnel' ? `${c.companyName} (${c.lastName})` : `${c.firstName} ${c.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Véhicule rattaché *</label>
                  <select
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  >
                    {clientVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} — {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date d'émission *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kilométrage actuel (km)</label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs tabular-nums"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Prestations & Pièces Facturées</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <select
                        value={it.type}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].type = e.target.value as any;
                          setItems(updated);
                        }}
                        className="w-24 border border-slate-300 rounded p-1.5 text-xs bg-white"
                      >
                        <option value="main_oeuvre">M.O</option>
                        <option value="piece">Pièce</option>
                        <option value="forfait">Forfait</option>
                        <option value="autre">Autre</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Réf"
                        value={it.reference}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].reference = e.target.value;
                          setItems(updated);
                        }}
                        className="w-20 border border-slate-300 rounded p-1.5 text-xs font-mono"
                      />

                      <input
                        type="text"
                        placeholder="Désignation de la pièce ou intervention"
                        value={it.description}
                        required
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        className="flex-1 min-w-[160px] border border-slate-300 rounded p-1.5 text-xs"
                      />

                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        placeholder="Qté"
                        value={it.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-14 border border-slate-300 rounded p-1.5 text-xs text-right tabular-nums"
                      />

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="P.U. HT"
                          value={it.unitPriceHT}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].unitPriceHT = Number(e.target.value);
                            setItems(updated);
                          }}
                          className="w-18 border border-slate-300 rounded p-1.5 text-xs text-right tabular-nums font-mono"
                        />
                        <span className="text-[11px] text-slate-400">€</span>
                      </div>

                      <select
                        value={it.tvaRate}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].tvaRate = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-16 border border-slate-300 rounded p-1.5 text-xs bg-white"
                      >
                        <option value={20}>20%</option>
                        <option value={10}>10%</option>
                        <option value={5.5}>5.5%</option>
                        <option value={0}>0%</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarques & Mentions atelier</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ex: Véhicule contrôlé selon plan d'entretien constructeur..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Générer le Document Officiel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
