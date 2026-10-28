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
import { CatalogItem, DocumentItem, DocumentStatus, DocumentType, GarageDocument, Vehicle, Client } from '../types';
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
    updateClient,
    vehicles,
    theme,
    catalogItems,
    addCatalogItem,
    addClient,
    addVehicle,
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

  // Direct Client & Vehicle input states
  const [clientInputMode, setClientInputMode] = useState<'select' | 'direct'>('select');
  const [directClientType, setDirectClientType] = useState<'particulier' | 'professionnel'>('particulier');
  const [directClientLastName, setDirectClientLastName] = useState('');
  const [directClientFirstName, setDirectClientFirstName] = useState('');
  const [directClientCompany, setDirectClientCompany] = useState('');
  const [directClientSiren, setDirectClientSiren] = useState('');
  const [clientSiren, setClientSiren] = useState('');
  const [directClientPhone, setDirectClientPhone] = useState('');
  const [directClientEmail, setDirectClientEmail] = useState('');
  const [directClientAddress, setDirectClientAddress] = useState('');
  const [directClientPostalCode, setDirectClientPostalCode] = useState('');
  const [directClientCity, setDirectClientCity] = useState('');

  const [vehicleInputMode, setVehicleInputMode] = useState<'select' | 'direct'>('select');
  const [directVehiclePlate, setDirectVehiclePlate] = useState('');
  const [directVehicleBrand, setDirectVehicleBrand] = useState('');
  const [directVehicleModel, setDirectVehicleModel] = useState('');
  const [directVehicleYear, setDirectVehicleYear] = useState<number>(2020);
  const [directVehicleFuel, setDirectVehicleFuel] = useState<Vehicle['fuelType']>('diesel');

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
          : []
      );
      setClientInputMode('select');
      setVehicleInputMode('select');
      const docCli = clients.find((c) => c.id === editingDocument.clientId);
      if (docCli) {
        setClientSiren(docCli.siren || '');
      }
    }
  }, [editingDocument, clients]);

  if (!editingDocument) return null;

  const currentClient = clients.find((c) => c.id === clientId);
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
    addCatalogItem({
      type: it.type,
      reference: it.reference?.trim() || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: it.description?.trim() || 'Prestation atelier',
      unitPriceHT: it.unitPriceHT || 0,
      tvaRate: it.tvaRate || 20,
      defaultQuantity: it.quantity || 1,
      category: it.type === 'piece' ? 'Pièces détachées' : 'Atelier & Entretien',
    });
    showNotification(`« ${it.description || 'Prestation'} » a été ajouté à votre catalogue de raccourcis !`);
  };

  const handleSave = (openViewerAfter = false) => {
    let targetClientId = clientId;
    let targetVehicleId = vehicleId;

    if (clientInputMode === 'direct') {
      const createdCli = addClient({
        type: directClientType,
        lastName: directClientLastName.trim() || (directClientType === 'professionnel' ? (directClientCompany.trim() || 'Société') : 'Client'),
        firstName: directClientFirstName.trim(),
        companyName: directClientType === 'professionnel' ? directClientCompany.trim() : undefined,
        siren: directClientType === 'professionnel' ? directClientSiren.trim() : undefined,
        phone: directClientPhone.trim(),
        email: directClientEmail.trim(),
        address: directClientAddress.trim(),
        postalCode: directClientPostalCode.trim(),
        city: directClientCity.trim(),
      });
      targetClientId = createdCli.id;
    } else if (clientInputMode === 'select' && targetClientId) {
      const existingCli = clients.find((c) => c.id === targetClientId);
      if (existingCli && existingCli.type === 'professionnel') {
        updateClient(targetClientId, { siren: clientSiren.trim() });
      }
    } else if (!targetClientId && clients.length > 0) {
      targetClientId = clients[0].id;
    }

    if (vehicleInputMode === 'direct') {
      const createdVeh = addVehicle({
        clientId: targetClientId,
        licensePlate: directVehiclePlate.trim().toUpperCase() || 'SANS-PLAQUE',
        brand: directVehicleBrand.trim() || 'Véhicule',
        model: directVehicleModel.trim() || 'Atelier',
        year: Number(directVehicleYear) || 2020,
        fuelType: directVehicleFuel,
        mileage: Number(mileageAtService) || 0,
      });
      targetVehicleId = createdVeh.id;
    } else if (!targetVehicleId && vehicles.length > 0) {
      const foundClientVeh = vehicles.find((v) => v.clientId === targetClientId);
      targetVehicleId = foundClientVeh ? foundClientVeh.id : vehicles[0].id;
    }

    const safeItems: DocumentItem[] = items.map((it) => ({
      ...it,
      description: it.description?.trim() || 'Prestation / Pièce',
    }));

    const safeRef = referenceNumber.trim() || editingDocument.referenceNumber || `DOC-${Date.now().toString().slice(-4)}`;

    const updatedData: Partial<GarageDocument> = {
      type: docType,
      referenceNumber: safeRef,
      date: date || new Date().toISOString().split('T')[0],
      validityDate: docType === 'devis' ? validityDate : undefined,
      dueDate: docType === 'facture' ? dueDate : undefined,
      clientId: targetClientId,
      vehicleId: targetVehicleId,
      status,
      mileageAtService: mileageAtService ? Number(mileageAtService) : undefined,
      amountPaid: status === 'paye' ? liveTotals.totalTTC : Number(amountPaid || 0),
      paymentMethod,
      notes: notes.trim() || undefined,
      items: safeItems,
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
                  Numéro de Référence
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="ex: DEV-2026-0042 ou FAC-2026-0156"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Statut du Document
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
                  Date d'émission
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
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
            <div className="space-y-4 pt-2 border-t border-slate-200/80">
              {/* Client Section */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>Client destinataire</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px]">
                    <button
                      type="button"
                      onClick={() => setClientInputMode('select')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        clientInputMode === 'select' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sélectionner ({clients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientInputMode('direct')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        clientInputMode === 'direct' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Saisie directe
                    </button>
                  </div>
                </div>

                {clientInputMode === 'select' ? (
                  <div>
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
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.type === 'professionnel' ? `${c.companyName || c.lastName} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`} {c.phone ? `— ${c.phone}` : ''}
                        </option>
                      ))}
                    </select>

                    {currentClient?.type === 'professionnel' && (
                      <div className="mt-2.5 p-2.5 bg-sky-50/80 border border-sky-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-sky-950 text-xs flex items-center gap-1.5">
                            <span>Numéro SIREN (Société / Professionnel)</span>
                          </label>
                          <span className="text-[10px] text-sky-700 font-medium">Modifiable à volonté</span>
                        </div>
                        <input
                          type="text"
                          value={clientSiren}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClientSiren(val);
                            if (clientId) {
                              updateClient(clientId, { siren: val.trim() });
                            }
                          }}
                          placeholder="ex: 123 456 789"
                          className="w-full border border-sky-300 rounded-lg p-2 text-xs bg-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-4 text-xs pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="directClientTypeModal"
                          checked={directClientType === 'particulier'}
                          onChange={() => setDirectClientType('particulier')}
                        />
                        <span>Particulier</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="directClientTypeModal"
                          checked={directClientType === 'professionnel'}
                          onChange={() => setDirectClientType('professionnel')}
                        />
                        <span>Professionnel / Société</span>
                      </label>
                    </div>

                    {directClientType === 'professionnel' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Raison sociale / Société</label>
                          <input
                            type="text"
                            value={directClientCompany}
                            onChange={(e) => setDirectClientCompany(e.target.value)}
                            placeholder="ex: SARL Express Transports"
                            className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Numéro SIREN</label>
                          <input
                            type="text"
                            value={directClientSiren}
                            onChange={(e) => setDirectClientSiren(e.target.value)}
                            placeholder="ex: 123 456 789"
                            className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Nom</label>
                        <input
                          type="text"
                          value={directClientLastName}
                          onChange={(e) => setDirectClientLastName(e.target.value)}
                          placeholder="Dupont"
                          className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Prénom</label>
                        <input
                          type="text"
                          value={directClientFirstName}
                          onChange={(e) => setDirectClientFirstName(e.target.value)}
                          placeholder="Jean"
                          className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Téléphone</label>
                        <input
                          type="tel"
                          value={directClientPhone}
                          onChange={(e) => setDirectClientPhone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Ville</label>
                        <input
                          type="text"
                          value={directClientCity}
                          onChange={(e) => setDirectClientCity(e.target.value)}
                          placeholder="Lyon"
                          className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Section */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-600" />
                    <span>Véhicule concerné</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px]">
                    <button
                      type="button"
                      onClick={() => setVehicleInputMode('select')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        vehicleInputMode === 'select' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sélectionner ({clientVehicles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleInputMode('direct')}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        vehicleInputMode === 'direct' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Saisie directe
                    </button>
                  </div>
                </div>

                {vehicleInputMode === 'select' ? (
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  >
                    {clientVehicles.length === 0 ? (
                      <option value="">(Aucun véhicule enregistré — Basculez sur Saisie directe)</option>
                    ) : (
                      clientVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} — {v.brand} {v.model}
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Plaque</label>
                      <input
                        type="text"
                        value={directVehiclePlate}
                        onChange={(e) => setDirectVehiclePlate(e.target.value)}
                        placeholder="AB-123-CD"
                        className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono font-bold uppercase bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Marque</label>
                      <input
                        type="text"
                        value={directVehicleBrand}
                        onChange={(e) => setDirectVehicleBrand(e.target.value)}
                        placeholder="Peugeot"
                        className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Modèle</label>
                      <input
                        type="text"
                        value={directVehicleModel}
                        onChange={(e) => setDirectVehicleModel(e.target.value)}
                        placeholder="208"
                        className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Carburant</label>
                      <select
                        value={directVehicleFuel}
                        onChange={(e) => setDirectVehicleFuel(e.target.value as any)}
                        className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"
                      >
                        <option value="diesel">Diesel</option>
                        <option value="essence">Essence</option>
                        <option value="hybride">Hybride</option>
                        <option value="electrique">Électrique</option>
                        <option value="gpl">GPL</option>
                      </select>
                    </div>
                  </div>
                )}
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
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>
            </div>

            {/* Table of items */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="p-6 bg-slate-50/80 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                    <Plus className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Aucune prestation ni pièce sur ce document
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Cette section attend que vous ajoutiez une ligne. Cliquez ci-dessous pour insérer votre première prestation.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-colors shadow-2xs mt-1"
                  >
                    <Plus className="w-4 h-4 text-sky-600" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>
              ) : (
                items.map((it, idx) => {
                  const lineDiscounted = it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100);

                  return (
                  <div
                    key={it.id || idx}
                    className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <div className="w-28 sm:w-36 shrink-0">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Référence</label>
                        <input
                          type="text"
                          placeholder="Réf (ex: FILT-01)"
                          value={it.reference}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].reference = e.target.value;
                            setItems(updated);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono bg-white"
                        />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Désignation</label>
                        <input
                          type="text"
                          placeholder="Désignation de la prestation ou de la pièce détachée"
                          value={it.description}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].description = e.target.value;
                            setItems(updated);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium bg-white text-slate-900"
                        />
                      </div>
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
                          <span className="text-[11px] text-slate-500 font-semibold">P.U. HT :</span>
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
                          <span className="text-[11px] text-sky-800 font-semibold">P.U. TTC :</span>
                          <input
                            type="number"
                            step="0.01"
                            value={it.unitPriceHT ? Number((it.unitPriceHT * (1 + (it.tvaRate || 20) / 100)).toFixed(2)) : ''}
                            onChange={(e) => {
                              const ttc = Number(e.target.value);
                              const rate = it.tvaRate || 20;
                              const ht = ttc / (1 + rate / 100);
                              const updated = [...items];
                              updated[idx].unitPriceHT = Number(ht.toFixed(2));
                              setItems(updated);
                            }}
                            placeholder="0.00"
                            className="w-24 border border-sky-300 rounded-lg p-1 text-xs text-right tabular-nums font-mono font-bold text-sky-950 bg-sky-50/60"
                          />
                          <span className="text-[11px] text-sky-600">€</span>
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

                        <div className="flex items-center gap-1.5 pl-1 text-[11px] font-mono">
                          <span className="text-slate-600">
                            Total : <strong className="text-slate-900">{lineDiscounted.toFixed(2)} € HT</strong>
                          </span>
                          <span className="text-sky-900 font-bold bg-sky-50 px-1 py-0.5 rounded border border-sky-200">
                            {(lineDiscounted * (1 + (it.tvaRate || 20) / 100)).toFixed(2)} € TTC
                          </span>
                        </div>
                      </div>

                      {/* Line actions */}
                      <div className="flex items-center gap-1.5">
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
              }))}
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
