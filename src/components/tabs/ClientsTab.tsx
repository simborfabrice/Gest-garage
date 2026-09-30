import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  X,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { Client, Vehicle } from '../../types';
import { formatDate, formatDateLong } from '../../utils/dateUtils';

export const ClientsTab: React.FC = () => {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    vehicles,
    addVehicle,
    deleteVehicle,
    documents,
    theme,
    setViewingDocument,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'particulier' | 'professionnel'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);

  // Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  // Client form
  const [clientForm, setClientForm] = useState({
    type: 'particulier' as 'particulier' | 'professionnel',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    notes: '',
  });

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: 2020,
    fuelType: 'diesel' as Vehicle['fuelType'],
    vin: '',
    mileage: 50000,
    lastInspectionDate: '2025-06-01',
  });

  const filteredClients = clients.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = (c.companyName || '').toLowerCase();
    const email = c.email.toLowerCase();
    const phone = c.phone.toLowerCase();

    // Also check if any associated vehicle matches plate or model
    const clientVehs = vehicles.filter((v) => v.clientId === c.id);
    const matchesVehicle = clientVehs.some(
      (v) =>
        v.licensePlate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );

    return fullName.includes(q) || company.includes(q) || email.includes(q) || phone.includes(q) || matchesVehicle;
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newCli = addClient({
      type: clientForm.type,
      firstName: clientForm.firstName,
      lastName: clientForm.lastName,
      companyName: clientForm.type === 'professionnel' ? clientForm.companyName : undefined,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      postalCode: clientForm.postalCode,
      city: clientForm.city,
      notes: clientForm.notes,
    });
    setSelectedClient(newCli);
    setIsAddClientModalOpen(false);
    setClientForm({
      type: 'particulier',
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      notes: '',
    });
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    addVehicle({
      clientId: selectedClient.id,
      licensePlate: vehicleForm.licensePlate.toUpperCase(),
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      year: Number(vehicleForm.year),
      fuelType: vehicleForm.fuelType,
      vin: vehicleForm.vin.toUpperCase(),
      mileage: Number(vehicleForm.mileage),
      lastInspectionDate: vehicleForm.lastInspectionDate,
    });

    setIsAddVehicleModalOpen(false);
    setVehicleForm({
      licensePlate: '',
      brand: '',
      model: '',
      year: 2020,
      fuelType: 'diesel',
      vin: '',
      mileage: 50000,
      lastInspectionDate: '2025-06-01',
    });
  };

  const selectedClientVehicles = selectedClient ? vehicles.filter((v) => v.clientId === selectedClient.id) : [];
  const selectedClientDocuments = selectedClient ? documents.filter((d) => d.clientId === selectedClient.id) : [];
  const totalSpentByClient = selectedClientDocuments
    .filter((d) => d.type === 'facture' && d.status === 'paye')
    .reduce((sum, d) => sum + d.totalTTC, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <span>Fichier Clients & Carte Grise Véhicules</span>
          </h2>
          <p className="text-xs text-slate-500">
            Historique complet des véhicules, coordonnées, carnet d'entretien et devis/factures.
          </p>
        </div>

        <button
          onClick={() => setIsAddClientModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Two Column Layout: Client List & Client Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, plaque, tél, ville..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tous ({clients.length})
              </button>
              <button
                onClick={() => setTypeFilter('particulier')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'particulier' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Particuliers
              </button>
              <button
                onClick={() => setTypeFilter('professionnel')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  typeFilter === 'professionnel' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pros / Flottes
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="bg-white p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-200">
                Aucun client ne correspond à votre recherche.
              </div>
            ) : (
              filteredClients.map((client) => {
                const clientVehs = vehicles.filter((v) => v.clientId === client.id);
                const isSelected = selectedClient?.id === client.id;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-sky-50/50 border-sky-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {client.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {client.type === 'professionnel' && client.companyName
                              ? client.companyName
                              : `${client.firstName} ${client.lastName}`}
                          </p>
                          <p className="text-[11px] text-slate-500">{client.city}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
                        {client.type === 'professionnel' ? 'Pro' : 'Particulier'}
                      </span>
                    </div>

                    {/* Vehicles tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {clientVehs.map((veh) => (
                        <span
                          key={veh.id}
                          className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono text-[10px] font-bold"
                        >
                          {veh.licensePlate}
                        </span>
                      ))}
                      {clientVehs.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">Aucun véhicule</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Client Detail Sheet (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedClient ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Header Profile */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {selectedClient.firstName[0]}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {selectedClient.type === 'professionnel' && selectedClient.companyName
                        ? selectedClient.companyName
                        : `${selectedClient.firstName} ${selectedClient.lastName}`}
                    </h3>
                    {selectedClient.type === 'professionnel' && (
                      <p className="text-xs text-slate-500">
                        Contact : {selectedClient.firstName} {selectedClient.lastName}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Client enregistré le {formatDate(selectedClient.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer définitivement le client ${selectedClient.firstName} ${selectedClient.lastName} ?`)) {
                        deleteClient(selectedClient.id);
                        setSelectedClient(clients.find((c) => c.id !== selectedClient.id) || null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Supprimer ce client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Téléphone</span>
                    <span className="font-semibold text-slate-800">{selectedClient.phone || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <span className="font-semibold text-slate-800 truncate block max-w-44">{selectedClient.email || 'Non renseigné'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Adresse de facturation</span>
                    <span className="font-semibold text-slate-800">
                      {selectedClient.address}, {selectedClient.postalCode} {selectedClient.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicles section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-700" />
                    <span>Véhicules rattachés ({selectedClientVehicles.length})</span>
                  </h4>
                  <button
                    onClick={() => setIsAddVehicleModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white rounded-lg shadow-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un véhicule</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedClientVehicles.map((veh) => (
                    <div
                      key={veh.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-xs tracking-wider">
                          {veh.licensePlate}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le véhicule ${veh.licensePlate} ?`)) {
                              deleteVehicle(veh.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {veh.brand} {veh.model}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Année {veh.year} · Carburant : <span className="uppercase font-semibold">{veh.fuelType}</span>
                        </p>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Kilométrage : <strong className="text-slate-900">{veh.mileage.toLocaleString('fr-FR')} km</strong></span>
                        <span>CT : {formatDate(veh.lastInspectionDate)}</span>
                      </div>
                    </div>
                  ))}

                  {selectedClientVehicles.length === 0 && (
                    <div className="sm:col-span-2 p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                      Aucun véhicule enregistré. Cliquez sur "Ajouter un véhicule".
                    </div>
                  )}
                </div>
              </div>

              {/* Invoices and Quotes History */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <span>Historique Devis & Factures</span>
                  </h4>
                  <span className="text-xs font-semibold text-emerald-700">
                    Total Facturé Réglé : {totalSpentByClient.toFixed(2)} € TTC
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedClientDocuments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucun document pour ce client.</p>
                  ) : (
                    selectedClientDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {doc.referenceNumber}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-500">
                            {doc.type}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{formatDate(doc.date)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-900">
                            {doc.totalTTC.toFixed(2)} € TTC
                          </span>
                          <button
                            onClick={() => setViewingDocument(doc)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                            title="Visualiser et imprimer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              Sélectionnez un client dans la liste pour voir sa fiche complète.
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <span>Nouveau Client</span>
              </h3>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type de client *</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientForm.type === 'particulier'}
                      onChange={() => setClientForm({ ...clientForm, type: 'particulier' })}
                    />
                    <span>Particulier</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientForm.type === 'professionnel'}
                      onChange={() => setClientForm({ ...clientForm, type: 'professionnel' })}
                    />
                    <span>Professionnel / Société</span>
                  </label>
                </div>
              </div>

              {clientForm.type === 'professionnel' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Raison sociale / Société *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.companyName}
                    onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    placeholder="ex: SARL Express Transports"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.firstName}
                    onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.lastName}
                    onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="client@domaine.fr"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adresse</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={clientForm.postalCode}
                    onChange={(e) => setClientForm({ ...clientForm, postalCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ville</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Créer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-700" />
                <span>Ajouter un Véhicule pour {selectedClient.firstName} {selectedClient.lastName}</span>
              </h3>
              <button
                onClick={() => setIsAddVehicleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Immatriculation (Plaque) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.licensePlate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                    placeholder="ex: AB-123-CD"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Année *</label>
                  <input
                    type="number"
                    required
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                    placeholder="ex: Peugeot, Renault..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modèle / Finition *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="ex: 208 1.2 PureTech 100ch"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Énergie / Carburant</label>
                  <select
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="essence">Essence</option>
                    <option value="hybride">Hybride</option>
                    <option value="electrique">Électrique</option>
                    <option value="gpl">GPL</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kilométrage actuel (km) *</label>
                  <input
                    type="number"
                    required
                    value={vehicleForm.mileage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Numéro de série VIN (17 car.)</label>
                <input
                  type="text"
                  value={vehicleForm.vin}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                  placeholder="VF3..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date dernier Contrôle Technique</label>
                <input
                  type="date"
                  value={vehicleForm.lastInspectionDate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, lastInspectionDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer le Véhicule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
