import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  ArrowRight,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  X,
  CreditCard,
  Sparkles,
  BookmarkPlus,
  Wrench,
  Database,
  Printer,
  User,
  Car,
} from 'lucide-react';
import { CatalogItem, DocumentItem, DocumentType, GarageDocument, Vehicle, Client } from '../../types';
import { CatalogShortcutsModal } from '../CatalogShortcutsModal';
import { formatDate } from '../../utils/dateUtils';

export const DocumentsTab: React.FC = () => {
  const {
    documents,
    addDocument,
    updateDocument,
    deleteDocument,
    convertQuoteToOrder,
    convertOrderToInvoice,
    setViewingDocument,
    setEditingDocument,
    setIsBackupModalOpen,
    clients,
    addClient,
    updateClient,
    vehicles,
    addVehicle,
    theme,
    setActiveTab,
    catalogItems,
    addCatalogItem,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'devis' | 'bon_commande' | 'facture'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSelectedDocId, setQuickSelectedDocId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogNotification, setCatalogNotification] = useState<string | null>(null);

  // New Document Form
  const [newDocType, setNewDocType] = useState<DocumentType>('devis');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');

  // Direct client and vehicle entry modes
  const [clientInputMode, setClientInputMode] = useState<'select' | 'direct'>('select');
  const [directClientType, setDirectClientType] = useState<'particulier' | 'professionnel'>('particulier');
  const [directClientLastName, setDirectClientLastName] = useState('');
  const [directClientFirstName, setDirectClientFirstName] = useState('');
  const [directClientCompany, setDirectClientCompany] = useState('');
  const [directClientSiren, setDirectClientSiren] = useState('');
  const [selectedClientSiren, setSelectedClientSiren] = useState('');
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

  // Helpers for dynamic current date & +30 days
  const getTodayIso = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFutureIso = (daysAhead: number = 30) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [newDate, setNewDate] = useState<string>(() => getTodayIso());
  const [newValidityDate, setNewValidityDate] = useState<string>(() => getFutureIso(30));
  const [newDueDate, setNewDueDate] = useState<string>(() => getFutureIso(30));
  const [newNotes, setNewNotes] = useState('');
  const [newMileage, setNewMileage] = useState<number>(100000);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'especes' | 'carte' | 'cheque' | 'virement'>('carte');

  const [items, setItems] = useState<Omit<DocumentItem, 'id'>[]>([]);

  const currentSelectedClient = clients.find((c) => c.id === newClientId);

  React.useEffect(() => {
    if (currentSelectedClient) {
      setSelectedClientSiren(currentSelectedClient.siren || '');
    }
  }, [newClientId, currentSelectedClient?.siren]);

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
    setItems((prev) => [
      ...prev,
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
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertShortcut = (item: CatalogItem) => {
    setItems((prev) => [
      ...prev,
      {
        type: item.type,
        reference: item.reference,
        description: item.description,
        quantity: item.defaultQuantity || 1,
        unitPriceHT: item.unitPriceHT,
        discountPercent: 0,
        tvaRate: item.tvaRate,
      },
    ]);
    setCatalogNotification(`Ajouté au document : « ${item.description} » (${item.unitPriceHT.toFixed(2)} € HT)`);
    setTimeout(() => setCatalogNotification(null), 3500);
  };

  const handleSaveLineAsShortcut = (it: Omit<DocumentItem, 'id'>) => {
    addCatalogItem({
      type: it.type,
      reference: it.reference || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
      description: it.description?.trim() || 'Prestation d’atelier',
      defaultQuantity: it.quantity || 1,
      unitPriceHT: it.unitPriceHT || 0,
      tvaRate: it.tvaRate || 20,
      category:
        it.type === 'main_oeuvre'
          ? 'Main d’œuvre'
          : it.type === 'forfait'
          ? 'Entretien & Vidange'
          : 'Pièces d’usure',
    });
    setCatalogNotification(`Prestation enregistrée dans les raccourcis du catalogue !`);
    setTimeout(() => setCatalogNotification(null), 3500);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();

    let targetClientId = newClientId;
    let targetVehicleId = newVehicleId;

    // Direct client creation or fallback
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
        updateClient(targetClientId, { siren: selectedClientSiren.trim() });
      }
    } else if (!targetClientId && clients.length > 0) {
      targetClientId = clients[0].id;
    } else if (!targetClientId) {
      const fallbackCli = addClient({
        type: 'particulier',
        firstName: 'Client',
        lastName: 'Atelier',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
      });
      targetClientId = fallbackCli.id;
    }

    // Direct vehicle creation or fallback
    if (vehicleInputMode === 'direct') {
      const createdVeh = addVehicle({
        clientId: targetClientId,
        licensePlate: directVehiclePlate.trim().toUpperCase() || 'SANS-PLAQUE',
        brand: directVehicleBrand.trim() || 'Véhicule',
        model: directVehicleModel.trim() || 'Atelier',
        year: Number(directVehicleYear) || 2020,
        fuelType: directVehicleFuel,
        mileage: Number(newMileage) || 0,
      });
      targetVehicleId = createdVeh.id;
    } else if (!targetVehicleId && vehicles.length > 0) {
      const foundClientVeh = vehicles.find((v) => v.clientId === targetClientId);
      targetVehicleId = foundClientVeh ? foundClientVeh.id : vehicles[0].id;
    } else if (!targetVehicleId) {
      const fallbackVeh = addVehicle({
        clientId: targetClientId,
        licensePlate: 'ATELIER',
        brand: 'Véhicule',
        model: 'Client',
        year: 2020,
        fuelType: 'diesel',
        mileage: Number(newMileage) || 0,
      });
      targetVehicleId = fallbackVeh.id;
    }

    const prefix = newDocType === 'devis' ? 'DEV' : newDocType === 'bon_commande' ? 'BC' : 'FAC';
    const year = new Date().getFullYear();
    const count = documents.filter((d) => d.type === newDocType).length + 1;
    const ref = `${prefix}-${year}-${String(count).padStart(4, '0')}`;

    const formattedItems: DocumentItem[] = items.map((it, idx) => ({
      ...it,
      description: it.description?.trim() || 'Prestation / Pièce',
      id: `it-${Date.now()}-${idx}`,
    }));

    const newDoc = addDocument({
      type: newDocType,
      referenceNumber: ref,
      date: newDate || getTodayIso(),
      validityDate: newDocType === 'devis' ? newValidityDate : undefined,
      dueDate: newDocType === 'facture' ? newDueDate : undefined,
      clientId: targetClientId,
      vehicleId: targetVehicleId,
      status: newDocType === 'devis' ? 'envoye' : newDocType === 'bon_commande' ? 'valide' : 'brouillon',
      items: formattedItems,
      totalPartsHT: 0,
      totalLaborHT: 0,
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0,
      amountPaid: 0,
      paymentMethod: newPaymentMethod,
      notes: newNotes,
      mileageAtService: newMileage,
    });

    setItems([]);
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
            title="Sauvegarder ou restaurer l'ensemble des documents, devis, factures et données de l'atelier"
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Sauvegarder / Restaurer</span>
          </button>

          <button
            onClick={() => {
              setNewDocType('devis');
              setItems([]);
              setDirectClientSiren('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Document</span>
          </button>
        </div>
      </div>

      {/* Quick Document Opener & Modifier Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/50 p-4 rounded-xl border border-sky-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Accès direct : Ouvrir ou Modifier un Document existant</span>
              <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                {documents.length} document(s)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Sélectionnez n'importe quel devis, bon de commande ou facture pour l'ouvrir immédiatement ou modifier son contenu
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-80 min-w-[240px]">
            <select
              value={quickSelectedDocId}
              onChange={(e) => setQuickSelectedDocId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden truncate"
            >
              <option value="">Choisir un document à ouvrir / modifier...</option>
              <optgroup label="Devis chiffrés">
                {documents
                  .filter((d) => d.type === 'devis')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : 'N/A';
                    return (
                      <option key={d.id} value={d.id}>
                        Devis {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="Bons de commande">
                {documents
                  .filter((d) => d.type === 'bon_commande')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : 'N/A';
                    return (
                      <option key={d.id} value={d.id}>
                        Bon de Cde {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="Factures d'atelier">
                {documents
                  .filter((d) => d.type === 'facture')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : 'N/A';
                    return (
                      <option key={d.id} value={d.id}>
                        Facture {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
            </select>
          </div>

          <button
            type="button"
            disabled={!quickSelectedDocId}
            onClick={() => {
              const target = documents.find((d) => d.id === quickSelectedDocId);
              if (target) setViewingDocument(target);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
              quickSelectedDocId
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Apercevoir directement la feuille de facturation A4 et pouvoir l'imprimer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Apercevoir & Imprimer</span>
          </button>

          <button
            type="button"
            disabled={!quickSelectedDocId}
            onClick={() => {
              const target = documents.find((d) => d.id === quickSelectedDocId);
              if (target) setEditingDocument(target);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
              quickSelectedDocId
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Modifier directement ce document (lignes de pièces, main d'œuvre, tarifs, client, mentions)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
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

      {/* Helper banner: click any document to preview and print */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-sky-50/80 border border-sky-200 px-4 py-2 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-800">
            Cliquez sur un document dans le tableau ci-dessous pour voir la feuille et pouvoir l'imprimer.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
          <Printer className="w-3.5 h-3.5 text-emerald-600" />
          <span>Format Facturation Type A4 Prêt à Imprimer</span>
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
                    <tr
                      key={doc.id}
                      onClick={() => setViewingDocument(doc)}
                      className="hover:bg-sky-50/80 cursor-pointer transition-colors group"
                      title={`Cliquer sur ce document pour ouvrir l'aperçu format type A4 et pouvoir l'imprimer (#${doc.referenceNumber})`}
                    >
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
                        <div className="flex items-center gap-1.5 group-hover:text-sky-600 transition-colors">
                          <span className="font-mono font-bold">{doc.referenceNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                        {formatDate(doc.date)}
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

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* BOUTON APERÇU ET IMPRESSION DIRECTE */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDocument(doc);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                            title="Apercevoir la feuille de facturation A4 et l'imprimer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aperçu & Imprimer</span>
                          </button>

                          {/* MODIFIER LE DOCUMENT EXISTANT */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDocument(doc);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                            title="Modifier ce document (prestations, pièces, main d'œuvre, tarifs, client, mentions)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                            <span>Modifier</span>
                          </button>

                          {/* Quick Workflow Action */}
                          {doc.type === 'devis' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                convertQuoteToOrder(doc.id);
                              }}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Transformer ce devis en bon de commande"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {doc.type === 'bon_commande' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                convertOrderToInvoice(doc.id);
                              }}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Émettre la facture finale"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {doc.type === 'facture' && doc.status !== 'paye' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDocument(doc.id, { status: 'paye', amountPaid: doc.totalTTC });
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Marquer comme payé"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Supprimer le document ${doc.referenceNumber} ?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition-colors"
                            title="Supprimer ce document"
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
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setItems([]);
                }}
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

              {/* Section Client avec choix : Sélectionner dans la liste ou Saisie directe libre */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-700" />
                    <span>Client Destinataire</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setClientInputMode('select')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        clientInputMode === 'select'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Choisir dans la liste ({clients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientInputMode('direct')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        clientInputMode === 'direct'
                          ? 'bg-sky-600 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Saisie directe nouveau client
                    </button>
                  </div>
                </div>

                {clientInputMode === 'select' ? (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sélectionner un client existant</label>
                    <select
                      value={newClientId}
                      onChange={(e) => {
                        setNewClientId(e.target.value);
                        const fv = vehicles.find((v) => v.clientId === e.target.value);
                        if (fv) setNewVehicleId(fv.id);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.type === 'professionnel' ? `${c.companyName || c.lastName} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`} {c.phone ? `— ${c.phone}` : ''}
                        </option>
                      ))}
                    </select>

                    {currentSelectedClient?.type === 'professionnel' && (
                      <div className="mt-2.5 p-2.5 bg-sky-50/80 border border-sky-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-sky-950 text-xs flex items-center gap-1.5">
                            <span>Numéro SIREN (Société / Professionnel)</span>
                          </label>
                          <span className="text-[10px] text-sky-700 font-medium">Modifiable à volonté</span>
                        </div>
                        <input
                          type="text"
                          value={selectedClientSiren}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedClientSiren(val);
                            if (newClientId) {
                              updateClient(newClientId, { siren: val.trim() });
                            }
                          }}
                          placeholder="ex: 123 456 789"
                          className="w-full border border-sky-300 rounded-lg p-2 text-xs bg-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="directClientTypeRadio"
                          checked={directClientType === 'particulier'}
                          onChange={() => setDirectClientType('particulier')}
                        />
                        <span>Particulier</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="directClientTypeRadio"
                          checked={directClientType === 'professionnel'}
                          onChange={() => setDirectClientType('professionnel')}
                        />
                        <span>Professionnel / Société</span>
                      </label>
                    </div>

                    {directClientType === 'professionnel' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Raison sociale / Société</label>
                          <input
                            type="text"
                            value={directClientCompany}
                            onChange={(e) => setDirectClientCompany(e.target.value)}
                            placeholder="ex: SARL Express Transports"
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700 block">Numéro SIREN</label>
                            <span className="text-[10px] text-slate-400">9 chiffres</span>
                          </div>
                          <input
                            type="text"
                            value={directClientSiren}
                            onChange={(e) => setDirectClientSiren(e.target.value)}
                            placeholder="ex: 123 456 789"
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Prénom</label>
                        <input
                          type="text"
                          value={directClientFirstName}
                          onChange={(e) => setDirectClientFirstName(e.target.value)}
                          placeholder="ex: Jean"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Nom</label>
                        <input
                          type="text"
                          value={directClientLastName}
                          onChange={(e) => setDirectClientLastName(e.target.value)}
                          placeholder="ex: Dupont"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={directClientPhone}
                          onChange={(e) => setDirectClientPhone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Email</label>
                        <input
                          type="email"
                          value={directClientEmail}
                          onChange={(e) => setDirectClientEmail(e.target.value)}
                          placeholder="client@domaine.fr"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="font-semibold text-slate-700 block mb-1">Adresse</label>
                        <input
                          type="text"
                          value={directClientAddress}
                          onChange={(e) => setDirectClientAddress(e.target.value)}
                          placeholder="12 rue de la Paix"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Code Postal</label>
                        <input
                          type="text"
                          value={directClientPostalCode}
                          onChange={(e) => setDirectClientPostalCode(e.target.value)}
                          placeholder="69000"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Ville</label>
                        <input
                          type="text"
                          value={directClientCity}
                          onChange={(e) => setDirectClientCity(e.target.value)}
                          placeholder="Lyon"
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Véhicule avec choix : Sélectionner existant ou Saisie directe libre */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-slate-700" />
                    <span>Véhicule Confié</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setVehicleInputMode('select')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        vehicleInputMode === 'select'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Véhicule enregistré ({clientVehicles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleInputMode('direct')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        vehicleInputMode === 'direct'
                          ? 'bg-sky-600 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Saisie directe véhicule
                    </button>
                  </div>
                </div>

                {vehicleInputMode === 'select' ? (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sélectionner un véhicule du client</label>
                    <select
                      value={newVehicleId}
                      onChange={(e) => setNewVehicleId(e.target.value)}
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
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Immatriculation</label>
                      <input
                        type="text"
                        value={directVehiclePlate}
                        onChange={(e) => setDirectVehiclePlate(e.target.value)}
                        placeholder="ex: AB-123-CD"
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold uppercase bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Marque</label>
                      <input
                        type="text"
                        value={directVehicleBrand}
                        onChange={(e) => setDirectVehicleBrand(e.target.value)}
                        placeholder="Peugeot, Renault..."
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Modèle</label>
                      <input
                        type="text"
                        value={directVehicleModel}
                        onChange={(e) => setDirectVehicleModel(e.target.value)}
                        placeholder="208, Clio, C3..."
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Carburant</label>
                      <select
                        value={directVehicleFuel}
                        onChange={(e) => setDirectVehicleFuel(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
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

              {/* Date, Kilométrage, Mode de règlement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date d'émission</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kilométrage actuel (km)</label>
                  <input
                    type="number"
                    value={newMileage}
                    onChange={(e) => setNewMileage(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs tabular-nums bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mode de règlement</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium"
                  >
                    <option value="carte">Carte Bancaire (CB)</option>
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                </div>
              </div>

              {/* Items List - Prestations & Pièces Facturées avec Raccourcis et Tarifs */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>Prestations & Pièces Facturées</span>
                      <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {items.length} ligne(s)
                      </span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Ajoutez les pièces et prestations de ce document.
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
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="p-6 bg-slate-50/80 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                        <Plus className="w-5 h-5 text-slate-500" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Aucune prestation ni pièce ajoutée pour le moment
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Cette section attend que vous ajoutiez une ligne. Cliquez sur le bouton ci-dessous pour commencer.
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
                    items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
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
                              placeholder="Désignation de la pièce ou intervention"
                              value={it.description}
                              onChange={(e) => {
                                const updated = [...items];
                                updated[idx].description = e.target.value;
                                setItems(updated);
                              }}
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">Qté :</span>
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
                                className="w-14 border border-slate-300 rounded p-1 text-xs text-right tabular-nums bg-white"
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
                                className="w-20 border border-slate-300 rounded p-1 text-xs text-right tabular-nums font-mono font-bold text-slate-900 bg-white"
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
                                className="w-20 border border-sky-300 rounded p-1 text-xs text-right tabular-nums font-mono font-bold text-sky-950 bg-sky-50/60"
                              />
                              <span className="text-[11px] text-sky-600">€</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">TVA :</span>
                              <select
                                value={it.tvaRate}
                                onChange={(e) => {
                                  const updated = [...items];
                                  updated[idx].tvaRate = Number(e.target.value);
                                  setItems(updated);
                                }}
                                className="w-16 border border-slate-300 rounded p-1 text-xs bg-white"
                              >
                                <option value={20}>20%</option>
                                <option value={10}>10%</option>
                                <option value={5.5}>5.5%</option>
                                <option value={0}>0%</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 pl-2 text-[11px] font-mono">
                              <span className="text-slate-600">
                                Total HT : <strong className="text-slate-900">{(it.quantity * it.unitPriceHT).toFixed(2)} €</strong>
                              </span>
                              <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                                Total TTC : {((it.quantity * it.unitPriceHT) * (1 + (it.tvaRate || 20) / 100)).toFixed(2)} €
                              </span>
                            </div>
                          </div>

                          {/* Actions for this row: Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Supprimer cette ligne"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-600 font-medium">
                      Récapitulatif document ({items.length} ligne{items.length > 1 ? 's' : ''})
                    </span>
                    <div className="flex flex-wrap items-center gap-4 font-mono">
                      <div>
                        <span className="text-slate-500 text-[11px]">Total HT : </span>
                        <strong className="text-slate-900 text-xs">
                          {items.reduce((s, it) => s + it.quantity * it.unitPriceHT, 0).toFixed(2)} €
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">TVA : </span>
                        <span className="text-slate-700 text-xs">
                          {items.reduce((s, it) => s + (it.quantity * it.unitPriceHT * ((it.tvaRate || 20) / 100)), 0).toFixed(2)} €
                        </span>
                      </div>
                      <div className="px-2.5 py-1 bg-white rounded border border-slate-300 shadow-2xs">
                        <span className="text-slate-700 text-[11px] font-bold">TOTAL TTC : </span>
                        <strong className="text-emerald-700 text-sm font-black">
                          {items.reduce((s, it) => s + (it.quantity * it.unitPriceHT * (1 + (it.tvaRate || 20) / 100)), 0).toFixed(2)} €
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setItems([]);
                  }}
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

      {/* Modal complète de gestion des raccourcis & forfaits catalogue */}
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
