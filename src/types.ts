export interface ThemeConfig {
  primaryColor: string; // Couleur principale (actions, boutons, sélection)
  secondaryColor: string; // Couleur d'accent (badges, alertes)
  appBackgroundColor: string; // Fond d'écran global de l'application
  appBackgroundType: 'solid' | 'carbon_pattern' | 'dots_pattern' | 'subtle_grid' | 'gradient_radial';
  sidebarBgColor: string; // Fond de la barre latérale
  sidebarTextColor: string; // Couleur de texte de la barre latérale
  headerBgColor: string; // Fond de l'en-tête supérieur
  headerTextColor: string; // Couleur de texte de l'en-tête
  cardBgColor: string; // Fond des blocs, cartes et conteneurs
  cardBorderColor: string; // Couleur des bordures des blocs
  textPrimaryColor: string; // Couleur du texte principal
  tableHeaderBgColor: string; // Couleur de fond des en-têtes de tableau
  documentHeaderColor: string; // Couleur des devis, factures et documents officiels
}

export interface GarageSettings {
  name: string;
  slogan: string;
  logoUrl: string;
  logoSize: number; // Taille personnalisable du logo en pixels (ex: 50px à 220px, défaut 110px)
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  siret: string;
  tvaNumber: string;
  nafCode: string;
  bankIban: string;
  bankBic: string;
  legalNotes: string;
}

export interface CatalogItem {
  id: string;
  type: 'piece' | 'main_oeuvre' | 'forfait' | 'autre';
  reference: string;
  description: string;
  defaultQuantity: number;
  unitPriceHT: number;
  tvaRate: number; // 20, 10, 5.5, 0
  category: string; // e.g. "Freinage", "Entretien & Vidange", "Main d'œuvre", "Distribution", "Pneumatiques", "Diagnostic"
}

export interface Vehicle {
  id: string;
  clientId: string;
  licensePlate: string; // e.g. "AB-123-CD"
  brand: string;
  model: string;
  year: number;
  fuelType: 'essence' | 'diesel' | 'hybride' | 'electrique' | 'gpl';
  vin: string;
  mileage: number;
  lastInspectionDate: string;
}

export interface Client {
  id: string;
  type: 'particulier' | 'professionnel';
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'pieces' | 'pneumatiques' | 'huiles_fluides' | 'outillage' | 'peinture' | 'autre';
  contactName: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  notes?: string;
}

export interface SupplierOrderItem {
  id: string;
  reference: string;
  description: string;
  quantity: number;
  unitCostHT: number;
  tvaRate: number; // usually 20
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'en_attente' | 'recu' | 'paye' | 'annule';
  items: SupplierOrderItem[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  serviceType: string;
  mechanic: string;
  bay: string; // e.g. "Pont 1", "Pont 2", "Baie Diagnostic", "Atelier Général"
  status: 'planifie' | 'en_cours' | 'termine' | 'facture' | 'annule';
  mileageEstimated?: number;
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  active?: boolean;
}

export interface WorkshopBay {
  id: string;
  name: string;
  description?: string;
  defaultMechanic?: string;
  color?: string;
  active?: boolean;
}

export type DocumentType = 'devis' | 'bon_commande' | 'facture';

export type DocumentStatus =
  | 'brouillon'
  | 'envoye'
  | 'valide'
  | 'refuse'
  | 'paye'
  | 'partiellement_paye'
  | 'annule';

export interface DocumentItem {
  id: string;
  type: 'piece' | 'main_oeuvre' | 'forfait' | 'autre';
  reference: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  discountPercent: number;
  tvaRate: number; // 20, 10, 5.5, 0
}

export interface GarageDocument {
  id: string;
  type: DocumentType;
  referenceNumber: string; // e.g. DEV-2026-0042, BC-2026-0018, FAC-2026-0156
  date: string;
  validityDate?: string; // For quotes (devis)
  dueDate?: string; // For invoices
  clientId: string;
  vehicleId: string;
  status: DocumentStatus;
  items: DocumentItem[];
  totalPartsHT: number;
  totalLaborHT: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  amountPaid: number;
  paymentMethod?: 'especes' | 'carte' | 'cheque' | 'virement';
  relatedQuoteId?: string;
  relatedOrderId?: string;
  notes?: string;
  mileageAtService?: number;
}

export interface CashTransaction {
  id: string;
  date: string; // ISO string
  type: 'encaissement_facture' | 'vente_directe' | 'apport_caisse' | 'retrait_caisse';
  label: string;
  amount: number;
  paymentMethod: 'especes' | 'carte' | 'cheque' | 'virement';
  documentId?: string;
  clientName?: string;
  cashReceived?: number;
  cashChange?: number;
  notes?: string;
}

export interface CashDayClose {
  id: string;
  date: string;
  openingBalance: number;
  totalCash: number;
  totalCard: number;
  totalCheque: number;
  totalTransfer: number;
  totalSalesTTC: number;
  theoreticalCashInDrawer: number;
  actualCashCounted: number;
  discrepancy: number; // actual - theoretical
  closedBy: string;
  closedAt: string;
  notes?: string;
}

export interface CashRegisterSettings {
  initialOpeningBalance: number; // Fond de caisse d'ouverture par défaut (ex: 250 €)
  defaultCashier: string; // Nom du caissier / responsable (ex: 'Fabrice (Gérant)')
  enableLineDeletion: boolean; // Option suppression de ligne activée
  confirmBeforeDelete: boolean; // Demander confirmation avant suppression
}
