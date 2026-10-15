import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Check,
  Sparkles,
  BookmarkPlus,
  Calendar,
  User,
  Car,
  DollarSign,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { CatalogItem, DocumentItem, DocumentStatus, DocumentType, GarageDocument } from '../types';
import { recalculateDocumentTotals } from '../services/storage';
import { CatalogShortcutsModal } from './CatalogShortcutsModal';

export const DocumentEditorModal: React.FC = () => {
  const {
    editingDocument,
    setEditingDocument,
    updateDocument,
    viewingDocument,
    setViewingDocument,
    clients,
    vehicles,
    theme,
    catalogItems,
    addCatalogItem,
  } = useApp();

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [docType, setDocType] = useState<DocumentType>('devis');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('brouillon');
  const [mileageAtService, setMileageAtService] = useState<number | undefined>(undefined);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'carte' | 'cheque' | 'virement' | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([]);

  // Preload editingDocument data when modal opens
  useEffect(() => {
    if (editingDocument) {
      setDocType(editingDocument.type);
      setReferenceNumber(editingDocument.referenceNumber);
      setDate(editingDocument.date);
      setValidityDate(editingDocument.validityDate || '');
      setDueDate(editingDocument.dueDate || '');
      setClientId(editingDocument.clientId);
      setVehicleId(editingDocument.vehicleId);
      setStatus(editingDocument.status);
      setMileageAtService(editingDocument.mileageAtService);
      setAmountPaid(editingDocument.amountPaid || 0);
      setPaymentMethod(editingDocument.paymentMethod);
      setNotes(editingDocument.notes || '');
      setItems(
        editingDocument.items && editingDocument.items.length > 0
          ? editingDocument.items.map((it) => ({ ...it }))
          : [
              {
                id: `item-${Date.now()}-1`,
                type: 'main_oeuvre',
                reference: 'MO-T1',
                description: 'Prestation atelier',
                quantity: 1,
                unitPriceHT: 68.0,
                discountPercent: 0,
                tvaRate: 20,
              },
            ]
      );
    }
  }, [editingDocument]);

  if (!editingDocument) return null;

  const clientVehicles = vehicles.filter((v) => v.clientId === clientId);

  // Live calculation of totals
  const liveTotals = recalculateDocumentTotals(items);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddItem = () => {
    const newItem: DocumentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'piece',
      reference: '',
      description: '',
      quantity: 1,
      unitPriceHT: 0,
      discountPercent: 0,
      tvaRate: 20,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('Un document doit comporter au moins une ligne de prestation ou pièce.');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleInsertShortcut = (cat: CatalogItem) => {
    const newItem: DocumentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: cat.type,
      reference: cat.reference,
      description: cat.description,
      quantity: cat.defaultQuantity || 1,
      unitPriceHT: cat.unitPriceHT,
      discountPercent: 0,
      tvaRate: cat.tvaRate,
    };
    setItems([...items, newItem]);
    showNotification(`« ${cat.description} » inséré avec succès !`);
  };

  const handleSaveLineAsShortcut = (it: DocumentItem) => {
    if (!it.description.trim()) {
      alert('Veuillez renseigner une désignation avant de sauvegarder le raccourci.');
      return;
    }
    addCatalogItem({
      type: it.type,
      reference: it.reference?.trim() || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: it.description.trim(),
      unitPriceHT: it.unitPriceHT,
      tvaRate: it.tvaRate,
      defaultQuantity: it.quantity || 1,
      category: it.type === 'piece' ? 'Pièces détachées' : 'Atelier & Entretien',
    });
    showNotification(`« ${it.description} » a été ajouté à votre catalogue de raccourcis !`);
  };

  const handleSave = (openViewerAfter = false) => {
    if (!referenceNumber.trim()) {
      alert('Le numéro de référence du document est obligatoire.');
      return;
    }
    if (!clientId) {
      alert('Veuillez sélectionner un client.');
      return;
    }
    if (!vehicleId) {
      alert('Veuillez sélectionner un véhicule.');
      return;
    }
    if (items.length === 0) {
      alert('Le document doit comporter au moins une prestation ou pièce.');
      return;
    }

    const updatedData: Partial<GarageDocument> = {
      type: docType,
      referenceNumber: referenceNumber.trim(),
      date,
      validityDate: docType === 'devis' ? validityDate : undefined,
      dueDate: docType === 'facture' ? dueDate : undefined,
      clientId,
      vehicleId,
      status,
      mileageAtService: mileageAtService ? Number(mileageAtService) : undefined,
      amountPaid: status === 'paye' ? liveTotals.totalTTC : Number(amountPaid || 0),
      paymentMethod,
      notes: notes.trim() || undefined,
      items,
      ...liveTotals,
    };

    updateDocument(editingDocument.id, updatedData);

    const updatedDoc: GarageDocument = {
      ...editingDocument,
      ...updatedData,
    };

    setEditingDocument(null);

    if (openViewerAfter || viewingDocument?.id === editingDocument.id) {
      setViewingDocument(updatedDoc);
    }
  };

  const typeColor =
    docType === 'devis'
      ? 'bg-amber-500 text-white'
      : docType === 'bon_commande'
      ? 'bg-blue-600 text-white'
      : 'bg-emerald-600 text-white';

  const typeName =
    docType === 'devis'
      ? 'DEVIS'
      : docType === 'bon_commande'
      ? 'BON DE COMMANDE'
      : 'FACTURE';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase ${typeColor} shadow-xs`}>
              {typeName}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Modifier le Document :</span>
                <span className="font-mono text-sky-700 font-bold">{referenceNumber || editingDocument.referenceNumber}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ajustez les lignes facturées, pièces, main d'œuvre, tarifs, remises, client et mentions
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingDocument(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn shadow-xs shrink-0">
            <span className="font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Section 1: Type, Reference & Status */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Type de Document *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-bold text-slate-900"
                >
                  <option value="devis">Devis Chiffré</option>
                  <option value="bon_commande">Bon de Commande / Réparation</option>
                  <option value="facture">Facture Finale</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Numéro de Référence *
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="ex: DEV-2026-0042 ou FAC-2026-0156"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Statut du Document *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-semibold text-slate-900"
                >
                  <option value="brouillon">Brouillon (en préparation)</option>
                  <option value="envoye">Envoyé au client</option>
                  <option value="valide">Validé / Accepté</option>
                  <option value="paye">Payé / Réglé</option>
                  <option value="partiellement_paye">Partiellement payé</option>
                  <option value="refuse">Refusé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>

            {/* Dates & Mileage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Date d'émission *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  required
                />
              </div>

              {docType === 'devis' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date de validité (Devis)
                  </label>
                  <input
                    type="date"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  />
                </div>
              )}

              {docType === 'facture' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date d'échéance (Facture)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kilométrage du véhicule (km)
                </label>
                <input
                  type="number"
                  value={mileageAtService ?? ''}
                  onChange={(e) => setMileageAtService(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="ex: 124500"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs tabular-nums bg-white font-mono"
                />
              </div>
            </div>

            {/* Client & Vehicle Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Client destinataire *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    const newCId = e.target.value;
                    setClientId(newCId);
                    const matchingVehicles = vehicles.filter((v) => v.clientId === newCId);
                    if (matchingVehicles.length > 0) {
                      setVehicleId(matchingVehicles[0].id);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Véhicule concerné *
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  required
                >
                  {clientVehicles.length === 0 ? (
                    <option value="">(Aucun véhicule enregistré pour ce client)</option>
                  ) : (
                    clientVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} — {v.brand} {v.model}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Mode de règlement & Règlements */}
            <div className="pt-2 border-t border-slate-200/80 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mode de règlement
                  </label>
                  <select
                    value={paymentMethod || 'carte'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium"
                  >
                    <option value="carte">Carte Bancaire (CB)</option>
                    <option value="especes">Espèces (Liquide)</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>

                {docType === 'facture' || status === 'paye' || status === 'partiellement_paye' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Montant déjà réglé (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={status === 'paye' ? liveTotals.totalTTC : amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      disabled={status === 'paye'}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs tabular-nums bg-white font-mono font-bold"
                    />
                    {status === 'paye' && (
                      <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
                        Facture entièrement acquittée ({liveTotals.totalTTC.toFixed(2)} €)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-slate-500 sm:pt-4">
                    <span>Ce mode de règlement apparaîtra sur le document officiel.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Items / Prestations & Pièces Facturées */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>Prestations & Pièces Facturées</span>
                  <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {items.length} ligne(s)
                  </span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Modifiez les prix unitaires, quantités, libellés, remises et taux de TVA en toute liberté
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 transition-colors shadow-2xs"
                  title="Ouvrir la bibliothèque de forfaits et raccourcis d'atelier"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>⚡ Catalogue Raccourcis ({catalogItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>
            </div>

            {/* Quick shortcuts pills */}
            <div className="p-2 bg-slate-100/70 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Insérer en 1 clic :
                </span>
                {catalogItems.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleInsertShortcut(cat)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 hover:text-sky-800 transition-colors text-slate-700 font-medium shadow-2xs group"
                    title={`Insérer « ${cat.description} » (${cat.unitPriceHT} € HT)`}
                  >
                    <Plus className="w-3 h-3 text-sky-600 group-hover:scale-110" />
                    <span className="truncate max-w-[150px]">{cat.description}</span>
                    <span className="font-mono font-bold text-[10px] text-slate-500">
                      {cat.unitPriceHT.toFixed(0)}€
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table of items */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {items.map((it, idx) => {
                const lineDiscounted = it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100);

                return (
                  <div
                    key={it.id || idx}
                    className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      {/* Pick shortcut directly */}
                      <select
                        onChange={(e) => {
                          const found = catalogItems.find((c) => c.id === e.target.value);
                          if (found) {
                            const updated = [...items];
                            updated[idx] = {
                              ...updated[idx],
                              type: found.type,
                              reference: found.reference || '',
                              description: found.description,
                              quantity: found.defaultQuantity || 1,
                              unitPriceHT: found.unitPriceHT,
                              discountPercent: 0,
                              tvaRate: found.tvaRate,
                            };
                            setItems(updated);
                          }
                        }}
                        defaultValue=""
                        className="w-36 border border-sky-300 bg-sky-50/50 text-sky-900 rounded-lg p-1.5 text-[11px] font-semibold"
                        title="Remplir cette ligne avec un raccourci d'atelier"
                      >
                        <option value="">⚡ Raccourci...</option>
                        {catalogItems.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.reference ? `[${c.reference}] ` : ''}{c.description.slice(0, 28)} ({c.unitPriceHT}€)
                          </option>
                        ))}
                      </select>

                      {/* Type selector */}
                      <select
                        value={it.type}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].type = e.target.value as any;
                          setItems(updated);
                        }}
                        className="w-24 border border-slate-300 rounded-lg p-1.5 text-xs bg-white font-medium"
                      >
                        <option value="main_oeuvre">M.O</option>
                        <option value="piece">Pièce</option>
                        <option value="forfait">Forfait</option>
                        <option value="autre">Autre</option>
                      </select>

                      {/* Reference */}
                      <input
                        type="text"
                        placeholder="Réf"
                        value={it.reference}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].reference = e.target.value;
                          setItems(updated);
                        }}
                        className="w-24 border border-slate-300 rounded-lg p-1.5 text-xs font-mono bg-white"
                      />

                      {/* Description */}
                      <input
                        type="text"
                        placeholder="Désignation de la prestation ou de la pièce détachée"
                        value={it.description}
                        required
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        className="flex-1 min-w-[200px] border border-slate-300 rounded-lg p-1.5 text-xs font-medium bg-white text-slate-900"
                      />
                    </div>

                    {/* Quantity, Unit Price, Discount, TVA & Line Total */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">Qté :</span>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={it.quantity}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].quantity = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="w-16 border border-slate-300 rounded-lg p-1 text-xs text-right tabular-nums bg-white font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">P.U. HT :</span>
                          <input
                            type="number"
                            step="0.01"
                            value={it.unitPriceHT}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].unitPriceHT = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="w-24 border border-slate-300 rounded-lg p-1 text-xs text-right tabular-nums font-mono font-bold text-slate-900 bg-white"
                          />
                          <span className="text-[11px] text-slate-400">€</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">Remise :</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={it.discountPercent || 0}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].discountPercent = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="w-14 border border-slate-300 rounded-lg p-1 text-xs text-right tabular-nums bg-white font-mono"
                          />
                          <span className="text-[11px] text-slate-400">%</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">TVA :</span>
                          <select
                            value={it.tvaRate}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].tvaRate = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="w-20 border border-slate-300 rounded-lg p-1 text-xs bg-white font-medium"
                          >
                            <option value={20}>20%</option>
                            <option value={10}>10%</option>
                            <option value={5.5}>5.5%</option>
                            <option value={0}>0%</option>
                          </select>
                        </div>

                        <span className="text-[11px] font-mono text-slate-600 pl-1">
                          Total ligne : <strong className="text-slate-900">{lineDiscounted.toFixed(2)} € HT</strong>
                        </span>
                      </div>

                      {/* Line actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveLineAsShortcut(it)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          title="Enregistrer cette prestation dans le catalogue"
                        >
                          <BookmarkPlus className="w-3 h-3 text-amber-600" />
                          <span className="hidden sm:inline">Mémoriser</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Notes & Remarks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Remarques, Mentions & Consignes particulières
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Travaux réalisés selon préconisations constructeur, garantie pièces 1 an..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Section 4: Live Totals Summary Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Pièces HT
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {liveTotals.totalPartsHT.toFixed(2)} €
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Main d'œuvre HT
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {liveTotals.totalLaborHT.toFixed(2)} €
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Total Net HT
              </span>
              <span className="text-sm font-mono font-bold text-sky-300">
                {liveTotals.totalHT.toFixed(2)} €
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                TVA Totale
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                {liveTotals.totalTVA.toFixed(2)} €
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-700 pt-2 sm:pt-0 pl-0 sm:pl-3">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                Total TTC Net
              </span>
              <span className="text-base font-mono font-black text-emerald-400">
                {liveTotals.totalTTC.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setEditingDocument(null)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Enregistrer les modifications</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-5 py-2 text-white font-bold rounded-lg text-xs shadow-xs transition-opacity hover:opacity-95"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Eye className="w-4 h-4" />
              <span>Enregistrer & Ouvrir l'Aperçu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Shortcuts Modal */}
      <CatalogShortcutsModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectItem={(item) => {
          handleInsertShortcut(item);
          setIsCatalogModalOpen(false);
        }}
      />
    </div>
  );
};
