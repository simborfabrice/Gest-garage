import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ThemeConfig,
  GarageSettings,
  Client,
  Vehicle,
  Supplier,
  SupplierOrder,
  Appointment,
  GarageDocument,
  CashTransaction,
  CashDayClose,
  CatalogItem,
  CashRegisterSettings,
  Mechanic,
  WorkshopBay,
} from '../types';
import { storageService, recalculateDocumentTotals } from '../services/storage';

interface AppContextType {
  // Theme & Garage
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  garage: GarageSettings;
  updateGarage: (newGarage: Partial<GarageSettings>) => void;

  // Active Tab
  activeTab: 'calendar' | 'clients' | 'suppliers' | 'documents' | 'cash' | 'accounting';
  setActiveTab: (tab: 'calendar' | 'clients' | 'suppliers' | 'documents' | 'cash' | 'accounting') => void;

  // Modals
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  isGarageModalOpen: boolean;
  setIsGarageModalOpen: (open: boolean) => void;

  // Print Document preview
  viewingDocument: GarageDocument | null;
  setViewingDocument: (doc: GarageDocument | null) => void;

  // Clients & Vehicles
  clients: Client[];
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  vehicles: Vehicle[];
  addVehicle: (data: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Suppliers & Orders
  suppliers: Supplier[];
  addSupplier: (data: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  supplierOrders: SupplierOrder[];
  addSupplierOrder: (data: Omit<SupplierOrder, 'id'>) => SupplierOrder;
  updateSupplierOrder: (id: string, data: Partial<SupplierOrder>) => void;
  deleteSupplierOrder: (id: string) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (data: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Workshop mechanics & bays
  mechanics: Mechanic[];
  addMechanic: (data: Omit<Mechanic, 'id'>) => Mechanic;
  updateMechanic: (id: string, data: Partial<Mechanic>, syncAppointments?: boolean) => void;
  deleteMechanic: (id: string) => void;

  workshopBays: WorkshopBay[];
  addWorkshopBay: (data: Omit<WorkshopBay, 'id'>) => WorkshopBay;
  updateWorkshopBay: (id: string, data: Partial<WorkshopBay>, syncAppointments?: boolean) => void;
  deleteWorkshopBay: (id: string) => void;

  // Documents
  documents: GarageDocument[];
  addDocument: (data: Omit<GarageDocument, 'id'>) => GarageDocument;
  updateDocument: (id: string, data: Partial<GarageDocument>) => void;
  deleteDocument: (id: string) => void;
  convertQuoteToOrder: (quoteId: string) => GarageDocument | null;
  convertOrderToInvoice: (orderId: string) => GarageDocument | null;

  // Catalog Shortcuts & Prestations
  catalogItems: CatalogItem[];
  addCatalogItem: (data: Omit<CatalogItem, 'id'>) => CatalogItem;
  updateCatalogItem: (id: string, data: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;

  // Cash & Settings
  cashTransactions: CashTransaction[];
  addCashTransaction: (data: Omit<CashTransaction, 'id' | 'date'>) => CashTransaction;
  deleteCashTransaction: (id: string) => void;
  deleteCashTransactionsBatch: (ids: string[]) => void;
  restoreDefaultCash: () => void;
  restoreCashSettings: () => void;
  clearDayTransactions: (preserveOpeningBalance?: boolean) => void;
  cashSettings: CashRegisterSettings;
  updateCashSettings: (settings: Partial<CashRegisterSettings>) => void;
  dayCloses: CashDayClose[];
  addDayClose: (data: Omit<CashDayClose, 'id' | 'closedAt'>) => CashDayClose;

  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => storageService.getTheme());
  const [garage, setGarage] = useState<GarageSettings>(() => storageService.getGarage());
  const [activeTab, setActiveTab] = useState<'calendar' | 'clients' | 'suppliers' | 'documents' | 'cash' | 'accounting'>('calendar');

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<GarageDocument | null>(null);

  const [clients, setClients] = useState<Client[]>(() => storageService.getClients());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storageService.getVehicles());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => storageService.getSuppliers());
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => storageService.getSupplierOrders());
  const [appointments, setAppointments] = useState<Appointment[]>(() => storageService.getAppointments());
  const [documents, setDocuments] = useState<GarageDocument[]>(() => storageService.getDocuments());
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => storageService.getCashTransactions());
  const [dayCloses, setDayCloses] = useState<CashDayClose[]>(() => storageService.getDayCloses());
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => storageService.getCatalogItems());
  const [cashSettings, setCashSettings] = useState<CashRegisterSettings>(() => storageService.getCashSettings());
  const [mechanics, setMechanics] = useState<Mechanic[]>(() => storageService.getMechanics());
  const [workshopBays, setWorkshopBays] = useState<WorkshopBay[]>(() => storageService.getWorkshopBays());

  // Dynamically update CSS root variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--app-bg', theme.appBackgroundColor || '#f8fafc');
    root.style.setProperty('--sidebar-bg', theme.sidebarBgColor || '#0f172a');
    root.style.setProperty('--sidebar-text', theme.sidebarTextColor || '#f8fafc');
    root.style.setProperty('--header-bg', theme.headerBgColor || '#ffffff');
    root.style.setProperty('--header-text', theme.headerTextColor || '#0f172a');
    root.style.setProperty('--card-bg', theme.cardBgColor || '#ffffff');
    root.style.setProperty('--card-border', theme.cardBorderColor || '#e2e8f0');
    root.style.setProperty('--text-primary', theme.textPrimaryColor || '#0f172a');
    root.style.setProperty('--table-header-bg', theme.tableHeaderBgColor || '#f1f5f9');
    root.style.setProperty('--document-color', theme.documentHeaderColor || '#0f172a');
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      storageService.saveTheme(updated);
      return updated;
    });
  };

  const updateGarage = (newGarage: Partial<GarageSettings>) => {
    setGarage((prev) => {
      const updated = { ...prev, ...newGarage };
      storageService.saveGarage(updated);
      return updated;
    });
  };

  // Client operations
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    storageService.saveClients(updated);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, ...data } : c));
    setClients(updated);
    storageService.saveClients(updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    storageService.saveClients(updated);
  };

  // Vehicle operations
  const addVehicle = (data: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...data,
      id: `veh-${Date.now()}`,
    };
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    storageService.saveVehicles(updated);
    return newVehicle;
  };

  const updateVehicle = (id: string, data: Partial<Vehicle>) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, ...data } : v));
    setVehicles(updated);
    storageService.saveVehicles(updated);
  };

  const deleteVehicle = (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    storageService.saveVehicles(updated);
  };

  // Supplier operations
  const addSupplier = (data: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
    };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    storageService.saveSuppliers(updated);
    return newSup;
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    const updated = suppliers.map((s) => (s.id === id ? { ...s, ...data } : s));
    setSuppliers(updated);
    storageService.saveSuppliers(updated);
  };

  const deleteSupplier = (id: string) => {
    const updated = suppliers.filter((s) => s.id !== id);
    setSuppliers(updated);
    storageService.saveSuppliers(updated);
  };

  // Supplier orders
  const addSupplierOrder = (data: Omit<SupplierOrder, 'id'>): SupplierOrder => {
    const newOrder: SupplierOrder = {
      ...data,
      id: `so-${Date.now()}`,
    };
    const updated = [newOrder, ...supplierOrders];
    setSupplierOrders(updated);
    storageService.saveSupplierOrders(updated);
    return newOrder;
  };

  const updateSupplierOrder = (id: string, data: Partial<SupplierOrder>) => {
    const updated = supplierOrders.map((o) => (o.id === id ? { ...o, ...data } : o));
    setSupplierOrders(updated);
    storageService.saveSupplierOrders(updated);
  };

  const deleteSupplierOrder = (id: string) => {
    const updated = supplierOrders.filter((o) => o.id !== id);
    setSupplierOrders(updated);
    storageService.saveSupplierOrders(updated);
  };

  // Appointment operations
  const addAppointment = (data: Omit<Appointment, 'id'>): Appointment => {
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
    };
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    storageService.saveAppointments(updated);
    return newApt;
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, ...data } : a));
    setAppointments(updated);
    storageService.saveAppointments(updated);
  };

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    storageService.saveAppointments(updated);
  };

  // Workshop mechanics operations
  const addMechanic = (data: Omit<Mechanic, 'id'>): Mechanic => {
    const newMechanic: Mechanic = {
      ...data,
      id: `mec-${Date.now()}`,
      active: data.active ?? true,
    };
    const updated = [...mechanics, newMechanic];
    setMechanics(updated);
    storageService.saveMechanics(updated);
    return newMechanic;
  };

  const updateMechanic = (id: string, data: Partial<Mechanic>, syncAppointments = true) => {
    const existing = mechanics.find((m) => m.id === id);
    const updated = mechanics.map((m) => (m.id === id ? { ...m, ...data } : m));
    setMechanics(updated);
    storageService.saveMechanics(updated);

    // If the mechanic name changed and syncAppointments is true, update assigned appointments
    if (existing && data.name && data.name.trim() !== existing.name && syncAppointments) {
      const oldName = existing.name;
      const newName = data.name.trim();
      const updatedApts = appointments.map((apt) =>
        apt.mechanic === oldName ? { ...apt, mechanic: newName } : apt
      );
      setAppointments(updatedApts);
      storageService.saveAppointments(updatedApts);
    }
  };

  const deleteMechanic = (id: string) => {
    const updated = mechanics.filter((m) => m.id !== id);
    setMechanics(updated);
    storageService.saveMechanics(updated);
  };

  // Workshop bays operations
  const addWorkshopBay = (data: Omit<WorkshopBay, 'id'>): WorkshopBay => {
    const newBay: WorkshopBay = {
      ...data,
      id: `bay-${Date.now()}`,
      active: data.active ?? true,
    };
    const updated = [...workshopBays, newBay];
    setWorkshopBays(updated);
    storageService.saveWorkshopBays(updated);
    return newBay;
  };

  const updateWorkshopBay = (id: string, data: Partial<WorkshopBay>, syncAppointments = true) => {
    const existing = workshopBays.find((b) => b.id === id);
    const updated = workshopBays.map((b) => (b.id === id ? { ...b, ...data } : b));
    setWorkshopBays(updated);
    storageService.saveWorkshopBays(updated);

    // If the bay name changed and syncAppointments is true, update assigned appointments
    if (existing && data.name && data.name.trim() !== existing.name && syncAppointments) {
      const oldName = existing.name;
      const newName = data.name.trim();
      const updatedApts = appointments.map((apt) =>
        apt.bay === oldName ? { ...apt, bay: newName } : apt
      );
      setAppointments(updatedApts);
      storageService.saveAppointments(updatedApts);
    }
  };

  const deleteWorkshopBay = (id: string) => {
    const updated = workshopBays.filter((b) => b.id !== id);
    setWorkshopBays(updated);
    storageService.saveWorkshopBays(updated);
  };

  // Document operations
  const addDocument = (data: Omit<GarageDocument, 'id'>): GarageDocument => {
    const totals = recalculateDocumentTotals(data.items);
    const newDoc: GarageDocument = {
      ...data,
      ...totals,
      id: `doc-${Date.now()}`,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);
    return newDoc;
  };

  const updateDocument = (id: string, data: Partial<GarageDocument>) => {
    const updated = documents.map((d) => {
      if (d.id !== id) return d;
      const combined = { ...d, ...data };
      if (data.items) {
        const totals = recalculateDocumentTotals(combined.items);
        return { ...combined, ...totals };
      }
      return combined;
    });
    setDocuments(updated);
    storageService.saveDocuments(updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    storageService.saveDocuments(updated);
  };

  // 1-Click Convert Quote (Devis) -> Purchase/Work Order (Bon de commande)
  const convertQuoteToOrder = (quoteId: string): GarageDocument | null => {
    const quote = documents.find((d) => d.id === quoteId);
    if (!quote) return null;

    const count = documents.filter((d) => d.type === 'bon_commande').length + 1;
    const year = new Date().getFullYear();
    const ref = `BC-${year}-${String(count).padStart(4, '0')}`;

    const newOrder: GarageDocument = {
      ...quote,
      id: `doc-${Date.now()}`,
      type: 'bon_commande',
      referenceNumber: ref,
      date: new Date().toISOString().split('T')[0],
      status: 'valide',
      relatedQuoteId: quote.id,
      notes: `Établi suite au devis ${quote.referenceNumber}. Travaux approuvés par le client.`,
    };

    // Update quote status to valide
    updateDocument(quote.id, { status: 'valide' });

    const updated = [newOrder, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);
    return newOrder;
  };

  // 1-Click Convert Order (Bon de commande) -> Invoice (Facture)
  const convertOrderToInvoice = (orderId: string): GarageDocument | null => {
    const order = documents.find((d) => d.id === orderId);
    if (!order) return null;

    const count = documents.filter((d) => d.type === 'facture').length + 1;
    const year = new Date().getFullYear();
    const ref = `FAC-${year}-${String(count).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice: GarageDocument = {
      ...order,
      id: `doc-${Date.now()}`,
      type: 'facture',
      referenceNumber: ref,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: order.amountPaid >= order.totalTTC ? 'paye' : order.amountPaid > 0 ? 'partiellement_paye' : 'envoye',
      relatedOrderId: order.id,
      notes: `Facturation finale relative au bon de commande ${order.referenceNumber}. Travaux réalisés avec succès.`,
    };

    const updated = [newInvoice, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);
    return newInvoice;
  };

  // Cash operations
  const addCashTransaction = (data: Omit<CashTransaction, 'id' | 'date'>): CashTransaction => {
    const newTx: CashTransaction = {
      ...data,
      id: `csh-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const updated = [newTx, ...cashTransactions];
    setCashTransactions(updated);
    storageService.saveCashTransactions(updated);
    return newTx;
  };

  const deleteCashTransaction = (id: string) => {
    const updated = cashTransactions.filter((tx) => tx.id !== id);
    setCashTransactions(updated);
    storageService.saveCashTransactions(updated);
  };

  const deleteCashTransactionsBatch = (ids: string[]) => {
    const idsSet = new Set(ids);
    const updated = cashTransactions.filter((tx) => !idsSet.has(tx.id));
    setCashTransactions(updated);
    storageService.saveCashTransactions(updated);
  };

  const updateCashSettings = (data: Partial<CashRegisterSettings>) => {
    const updated = { ...cashSettings, ...data };
    setCashSettings(updated);
    storageService.saveCashSettings(updated);
  };

  const restoreDefaultCash = () => {
    const restored = storageService.restoreDefaultCash();
    setCashTransactions(restored.transactions);
    setCashSettings(restored.settings);
  };

  const restoreCashSettings = () => {
    const restored = storageService.restoreCashSettings();
    setCashSettings(restored);
  };

  const clearDayTransactions = (preserveOpeningBalance: boolean = true) => {
    const today = '2026-09-30';
    let updated: CashTransaction[];
    if (preserveOpeningBalance) {
      const openingTx = cashTransactions.find(
        (tx) => tx.date.startsWith(today) && tx.label.toLowerCase().includes('ouverture')
      ) || {
        id: `csh-${Date.now()}`,
        date: `${today}T08:00:00Z`,
        type: 'apport_caisse',
        label: 'Fond de caisse initial (Ouverture)',
        amount: cashSettings.initialOpeningBalance || 250.0,
        paymentMethod: 'especes',
        notes: 'Fond de caisse d’ouverture réinitialisé',
      };
      updated = [openingTx, ...cashTransactions.filter((tx) => !tx.date.startsWith(today))];
    } else {
      updated = cashTransactions.filter((tx) => !tx.date.startsWith(today));
    }
    setCashTransactions(updated);
    storageService.saveCashTransactions(updated);
  };

  const addDayClose = (data: Omit<CashDayClose, 'id' | 'closedAt'>): CashDayClose => {
    const newClose: CashDayClose = {
      ...data,
      id: `close-${Date.now()}`,
      closedAt: new Date().toISOString(),
    };
    const updated = [newClose, ...dayCloses];
    setDayCloses(updated);
    storageService.saveDayCloses(updated);
    return newClose;
  };

  // Catalog item operations
  const addCatalogItem = (data: Omit<CatalogItem, 'id'>): CatalogItem => {
    const newItem: CatalogItem = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    const updated = [...catalogItems, newItem];
    setCatalogItems(updated);
    storageService.saveCatalogItems(updated);
    return newItem;
  };

  const updateCatalogItem = (id: string, data: Partial<CatalogItem>) => {
    const updated = catalogItems.map((c) => (c.id === id ? { ...c, ...data } : c));
    setCatalogItems(updated);
    storageService.saveCatalogItems(updated);
  };

  const deleteCatalogItem = (id: string) => {
    const updated = catalogItems.filter((c) => c.id !== id);
    setCatalogItems(updated);
    storageService.saveCatalogItems(updated);
  };

  const resetAllData = () => {
    storageService.resetAll();
    setTheme(storageService.getTheme());
    setGarage(storageService.getGarage());
    setClients(storageService.getClients());
    setVehicles(storageService.getVehicles());
    setSuppliers(storageService.getSuppliers());
    setSupplierOrders(storageService.getSupplierOrders());
    setAppointments(storageService.getAppointments());
    setDocuments(storageService.getDocuments());
    setCashTransactions(storageService.getCashTransactions());
    setDayCloses(storageService.getDayCloses());
    setCatalogItems(storageService.getCatalogItems());
    setCashSettings(storageService.getCashSettings());
    setMechanics(storageService.getMechanics());
    setWorkshopBays(storageService.getWorkshopBays());
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        updateTheme,
        garage,
        updateGarage,
        activeTab,
        setActiveTab,
        isThemeModalOpen,
        setIsThemeModalOpen,
        isGarageModalOpen,
        setIsGarageModalOpen,
        viewingDocument,
        setViewingDocument,
        clients,
        addClient,
        updateClient,
        deleteClient,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        supplierOrders,
        addSupplierOrder,
        updateSupplierOrder,
        deleteSupplierOrder,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        mechanics,
        addMechanic,
        updateMechanic,
        deleteMechanic,
        workshopBays,
        addWorkshopBay,
        updateWorkshopBay,
        deleteWorkshopBay,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        convertQuoteToOrder,
        convertOrderToInvoice,
        catalogItems,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        cashTransactions,
        addCashTransaction,
        deleteCashTransaction,
        deleteCashTransactionsBatch,
        restoreDefaultCash,
        restoreCashSettings,
        clearDayTransactions,
        cashSettings,
        updateCashSettings,
        dayCloses,
        addDayClose,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
