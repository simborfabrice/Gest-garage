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

export const DEFAULT_CASH_SETTINGS: CashRegisterSettings = {
  initialOpeningBalance: 250.0,
  defaultCashier: 'Fabrice (Gérant)',
  enableLineDeletion: true,
  confirmBeforeDelete: true,
};

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#0284c7', // Sky / Bleu Atelier Pro
  secondaryColor: '#f59e0b', // Amber
  appBackgroundColor: '#f8fafc', // Fond d'écran global de l'application
  appBackgroundType: 'solid',
  sidebarBgColor: '#0f172a', // Fond de la barre latérale
  sidebarTextColor: '#f8fafc',
  headerBgColor: '#ffffff', // Fond de l'en-tête
  headerTextColor: '#0f172a',
  cardBgColor: '#ffffff', // Fond des cartes & conteneurs
  cardBorderColor: '#e2e8f0', // Bordures
  textPrimaryColor: '#0f172a', // Couleur du texte
  tableHeaderBgColor: '#f1f5f9', // En-têtes de tableau
  documentHeaderColor: '#0f172a', // Deep slate
};

export const DEFAULT_GARAGE: GarageSettings = {
  name: 'Garage MécaPro & Performance',
  slogan: 'Entretien Toutes Marques · Diagnostic Électronique · Carrosserie & Climatisation',
  logoUrl: '/src/assets/images/garage_logo_emblem_1790760547751.jpg',
  logoSize: 140, // Taille par défaut généreuse et redimensionnable à volonté (50px à 320px)
  address: '14 Rue des Métiers de l’Automobile',
  postalCode: '69007',
  city: 'Lyon',
  phone: '04 78 45 12 90',
  email: 'contact@garage-mecapro-lyon.fr',
  website: 'www.garage-mecapro-lyon.fr',
  siret: '849 321 456 00018',
  tvaNumber: 'FR 42 849321456',
  nafCode: '4520A - Entretien et réparation de véhicules automobiles légers',
  bankIban: 'FR76 3000 4001 2345 6789 0123 456',
  bankBic: 'BNPAFR2X',
  legalNotes:
    'Règlement à réception de facture. Tout retard de paiement donne lieu de plein droit à une indemnité forfaitaire pour frais de recouvrement de 40 € et à des pénalités au taux légal en vigueur. Pièces garanties 1 an selon conditions constructeur.',
};

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    type: 'particulier',
    firstName: 'Jean-Marc',
    lastName: 'Dubois',
    email: 'jm.dubois@gmail.com',
    phone: '06 12 34 56 78',
    address: '28 Avenue Berthelot',
    postalCode: '69007',
    city: 'Lyon',
    notes: 'Client fidèle depuis 2021. Très soigneux de son véhicule.',
    createdAt: '2023-04-12',
  },
  {
    id: 'cli-2',
    type: 'professionnel',
    firstName: 'Sophie',
    lastName: 'Laurent',
    companyName: 'Express Coursier SARL',
    email: 'contact@expresscoursier.fr',
    phone: '04 72 80 90 10',
    address: '5 Rue Garibaldi',
    postalCode: '69003',
    city: 'Lyon',
    notes: 'Flotte de 4 utilitaires. Facturation mensuelle demandée.',
    createdAt: '2023-08-20',
  },
  {
    id: 'cli-3',
    type: 'particulier',
    firstName: 'Émilie',
    lastName: 'Rousseau',
    email: 'emilie.rousseau69@orange.fr',
    phone: '06 98 76 54 32',
    address: '12 Impasse des Jonquilles',
    postalCode: '69100',
    city: 'Villeurbanne',
    notes: 'Alerte courroie de distribution à prévoir.',
    createdAt: '2024-01-15',
  },
  {
    id: 'cli-4',
    type: 'particulier',
    firstName: 'Alexandre',
    lastName: 'Moreau',
    email: 'alex.moreau@outlook.com',
    phone: '07 65 43 21 09',
    address: '8 Boulevard des Belges',
    postalCode: '69006',
    city: 'Lyon',
    notes: 'Amateur de belles mécaniques BMW.',
    createdAt: '2024-03-02',
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    clientId: 'cli-1',
    licensePlate: 'EK-742-ZX',
    brand: 'Peugeot',
    model: '308 II 1.6 BlueHDi 120ch',
    year: 2018,
    fuelType: 'diesel',
    vin: 'VF3LCBHZHJS124598',
    mileage: 124500,
    lastInspectionDate: '2025-05-14',
  },
  {
    id: 'veh-2',
    clientId: 'cli-2',
    licensePlate: 'GF-318-QM',
    brand: 'Renault',
    model: 'Master III 2.3 dCi 135ch L2H2',
    year: 2021,
    fuelType: 'diesel',
    vin: 'VF1MAF4Y642190831',
    mileage: 89400,
    lastInspectionDate: '2025-11-20',
  },
  {
    id: 'veh-3',
    clientId: 'cli-3',
    licensePlate: 'DD-802-KV',
    brand: 'Volkswagen',
    model: 'Golf 7 1.4 TSI 125ch Lounge',
    year: 2017,
    fuelType: 'essence',
    vin: 'WVWZZZAUZHP291048',
    mileage: 104200,
    lastInspectionDate: '2024-09-18',
  },
  {
    id: 'veh-4',
    clientId: 'cli-4',
    licensePlate: 'HH-554-PL',
    brand: 'BMW',
    model: 'Série 3 320d xDrive 190ch',
    year: 2020,
    fuelType: 'diesel',
    vin: 'WBA5V71090FM38410',
    mileage: 72300,
    lastInspectionDate: '2026-02-10',
  },
  {
    id: 'veh-5',
    clientId: 'cli-2',
    licensePlate: 'CJ-920-WW',
    brand: 'Renault',
    model: 'Kangoo Rapid 1.5 dCi',
    year: 2019,
    fuelType: 'diesel',
    vin: 'VF1FW580551093412',
    mileage: 145000,
    lastInspectionDate: '2025-08-01',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Autodistribution (AD FIPA Lyon)',
    category: 'pieces',
    contactName: 'Marc Vignal',
    phone: '04 78 72 00 22',
    email: 'commandes@ad-lyon.fr',
    address: 'ZI Les Andrés, 69200 Vénissieux',
    paymentTerms: 'Fin de mois 30 jours',
    notes: 'Livraison 2 fois par jour (10h et 14h30). Remise pro 35% sur filtration.',
  },
  {
    id: 'sup-2',
    name: 'Michelin / Pneumac Distribution',
    category: 'pneumatiques',
    contactName: 'Éric Chantal',
    phone: '04 73 32 20 00',
    email: 'pro-pneus@pneumac.com',
    address: 'Plateforme Logistique Sud, 69800 Saint-Priest',
    paymentTerms: 'Prélèvement 30 jours',
    notes: 'Stock important tourisme, 4x4 et utilitaires.',
  },
  {
    id: 'sup-3',
    name: 'Castrol France & Lubrifiants Pro',
    category: 'huiles_fluides',
    contactName: 'Nathalie Meyer',
    phone: '01 41 40 80 00',
    email: 'commandes@castrol-france.fr',
    address: 'Parc des Nations, 93420 Villepinte',
    paymentTerms: 'Virement à 45 jours',
    notes: 'Fûts de 208L 5W30 Edge & 0W20 Eco.',
  },
  {
    id: 'sup-4',
    name: 'Würth France Outillage & Consommables',
    category: 'outillage',
    contactName: 'David Legrand',
    phone: '03 88 64 50 00',
    email: 'commercial.lyon@wurth.fr',
    address: 'Agence Lyon Sud, 69700 Givors',
    paymentTerms: 'Prélèvement 30 jours',
    notes: 'Visserie, colliers, nettoyant freins et outillage garanti à vie.',
  },
];

const INITIAL_SUPPLIER_ORDERS: SupplierOrder[] = [
  {
    id: 'so-1',
    supplierId: 'sup-1',
    orderNumber: 'CMD-AD-8941',
    orderDate: '2026-09-28',
    deliveryDate: '2026-09-29',
    status: 'recu',
    items: [
      {
        id: 'soi-1',
        reference: 'BOSCH-0986479381',
        description: 'Jeu de 2 disques de frein avant ventilés',
        quantity: 1,
        unitCostHT: 82.5,
        tvaRate: 20,
      },
      {
        id: 'soi-2',
        reference: 'FERODO-FDB4248',
        description: 'Jeu de 4 plaquettes de frein avant',
        quantity: 1,
        unitCostHT: 34.0,
        tvaRate: 20,
      },
      {
        id: 'soi-3',
        reference: 'MANN-HU711/51Z',
        description: 'Filtre à huile écologique',
        quantity: 3,
        unitCostHT: 6.8,
        tvaRate: 20,
      },
    ],
    totalHT: 136.9,
    totalTVA: 27.38,
    totalTTC: 164.28,
    notes: 'Pièces reçues conformes le 29/09 matin.',
  },
  {
    id: 'so-2',
    supplierId: 'sup-2',
    orderNumber: 'CMD-PNEU-5520',
    orderDate: '2026-09-27',
    deliveryDate: '2026-09-28',
    status: 'paye',
    items: [
      {
        id: 'soi-4',
        reference: 'MICH-2055516-PS4',
        description: 'Pneu Michelin Pilot Sport 4 205/55 R16 91V',
        quantity: 2,
        unitCostHT: 74.0,
        tvaRate: 20,
      },
      {
        id: 'soi-5',
        reference: 'VALV-TR414',
        description: 'Valves tubeless caoutchouc sachet x50',
        quantity: 1,
        unitCostHT: 15.0,
        tvaRate: 20,
      },
    ],
    totalHT: 163.0,
    totalTVA: 32.6,
    totalTTC: 195.6,
    notes: 'Payé par carte pro.',
  },
  {
    id: 'so-3',
    supplierId: 'sup-3',
    orderNumber: 'CMD-CAS-1049',
    orderDate: '2026-09-25',
    deliveryDate: '2026-09-27',
    status: 'recu',
    items: [
      {
        id: 'soi-6',
        reference: 'CAS-5W30-FUT60',
        description: 'Tonnelet 60L Castrol Magnatec 5W30 C3',
        quantity: 1,
        unitCostHT: 260.0,
        tvaRate: 20,
      },
    ],
    totalHT: 260.0,
    totalTVA: 52.0,
    totalTTC: 312.0,
    notes: 'Facture en attente de règlement au 30/10.',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    date: '2026-09-30',
    startTime: '08:30',
    durationMinutes: 120,
    serviceType: 'Freinage & Disques + Vidange Moteur',
    mechanic: 'Fabrice',
    bay: 'Pont 1',
    status: 'en_cours',
    mileageEstimated: 124500,
    notes: 'Vérifier bruit léger au freinage appuyé.',
  },
  {
    id: 'apt-2',
    clientId: 'cli-3',
    vehicleId: 'veh-3',
    date: '2026-09-30',
    startTime: '10:45',
    durationMinutes: 90,
    serviceType: 'Entretien Annuel & Recharge Climatisation R134a',
    mechanic: 'Thomas',
    bay: 'Baie Diagnostic',
    status: 'planifie',
    mileageEstimated: 104200,
    notes: 'Client attend sur place si possible.',
  },
  {
    id: 'apt-3',
    clientId: 'cli-4',
    vehicleId: 'veh-4',
    date: '2026-09-30',
    startTime: '14:00',
    durationMinutes: 180,
    serviceType: 'Géométrie 4 Roues + 2 Pneus Arrière',
    mechanic: 'Fabrice',
    bay: 'Pont 2 (Géométrie)',
    status: 'planifie',
    mileageEstimated: 72300,
    notes: 'Contrôler usure dissymétrique pneu AR droit.',
  },
  {
    id: 'apt-4',
    clientId: 'cli-2',
    vehicleId: 'veh-2',
    date: '2026-10-01',
    startTime: '09:00',
    durationMinutes: 240,
    serviceType: 'Kit de Distribution & Pompe à Eau',
    mechanic: 'Julien',
    bay: 'Pont 1',
    status: 'planifie',
    mileageEstimated: 89400,
    notes: 'Véhicule de tournée, impératif restitution avant 17h.',
  },
  {
    id: 'apt-5',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    date: '2026-09-24',
    startTime: '14:30',
    durationMinutes: 60,
    serviceType: 'Pré-contrôle technique & Diagnostic Valise',
    mechanic: 'Thomas',
    bay: 'Baie Diagnostic',
    status: 'termine',
    mileageEstimated: 124100,
    notes: 'Contrôle OK. Remplacement disques planifié.',
  },
  {
    id: 'apt-6',
    clientId: 'cli-3',
    vehicleId: 'veh-3',
    date: '2026-09-12',
    startTime: '09:15',
    durationMinutes: 60,
    serviceType: 'Vidange huile moteur & remplacement filtre habitacle',
    mechanic: 'Julien',
    bay: 'Atelier Général',
    status: 'termine',
    mileageEstimated: 103800,
  },
  {
    id: 'apt-7',
    clientId: 'cli-4',
    vehicleId: 'veh-4',
    date: '2026-09-18',
    startTime: '11:00',
    durationMinutes: 90,
    serviceType: 'Purge freinage haute pression & liquide DOT4',
    mechanic: 'Fabrice',
    bay: 'Pont 1',
    status: 'termine',
    mileageEstimated: 71900,
  },
  {
    id: 'apt-8',
    clientId: 'cli-2',
    vehicleId: 'veh-5',
    date: '2026-10-05',
    startTime: '13:30',
    durationMinutes: 120,
    serviceType: 'Amortisseurs avant & coupelles de suspension',
    mechanic: 'Thomas',
    bay: 'Pont 2',
    status: 'planifie',
    mileageEstimated: 145500,
  },
  {
    id: 'apt-9',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    date: '2026-10-12',
    startTime: '10:00',
    durationMinutes: 60,
    serviceType: 'Contrôle antipollution & décalaminage moteur hydrogène',
    mechanic: 'Julien',
    bay: 'Baie Diagnostic',
    status: 'planifie',
    mileageEstimated: 125000,
  },
  {
    id: 'apt-10',
    clientId: 'cli-3',
    vehicleId: 'veh-3',
    date: '2026-10-18',
    startTime: '15:00',
    durationMinutes: 45,
    serviceType: 'Permutation pneus hiver & équilibrage roues',
    mechanic: 'Thomas',
    bay: 'Pont 2',
    status: 'planifie',
    mileageEstimated: 104500,
  },
];

export const INITIAL_MECHANICS: Mechanic[] = [
  { id: 'mec-1', name: 'Fabrice', role: "Chef d'atelier", phone: '06 12 34 56 78', active: true },
  { id: 'mec-2', name: 'Thomas', role: 'Mécanicien confirmé', phone: '06 23 45 67 89', active: true },
  { id: 'mec-3', name: 'Julien', role: 'Apprenti mécanicien', phone: '06 34 56 78 90', active: true },
];

export const INITIAL_WORKSHOP_BAYS: WorkshopBay[] = [
  { id: 'bay-1', name: 'Pont 1', description: 'Mécanique lourde (Pont 4T)', defaultMechanic: 'Fabrice', color: '#0284c7', active: true },
  { id: 'bay-2', name: 'Pont 2', description: 'Géométrie & Pneumatiques', defaultMechanic: 'Thomas', color: '#0ea5e9', active: true },
  { id: 'bay-3', name: 'Baie Diagnostic', description: 'Diagnostic OBD & Électronique', defaultMechanic: 'Julien', color: '#8b5cf6', active: true },
  { id: 'bay-4', name: 'Atelier Général', description: 'Entretien rapide & Préparation', defaultMechanic: 'Fabrice', color: '#10b981', active: true },
];

const INITIAL_DOCUMENTS: GarageDocument[] = [
  {
    id: 'doc-1',
    type: 'facture',
    referenceNumber: 'FAC-2026-0089',
    date: '2026-09-24',
    dueDate: '2026-10-24',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    status: 'paye',
    items: [
      {
        id: 'it-1',
        type: 'forfait',
        reference: 'FORF-DIAG',
        description: 'Forfait diagnostic électronique valise multimarque',
        quantity: 1,
        unitPriceHT: 49.17,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-2',
        type: 'main_oeuvre',
        reference: 'MO-T1',
        description: 'Main d’œuvre T1 - Contrôle points de sécurité & éclairage',
        quantity: 0.75,
        unitPriceHT: 65.0,
        discountPercent: 0,
        tvaRate: 20,
      },
    ],
    totalPartsHT: 0,
    totalLaborHT: 97.92,
    totalHT: 97.92,
    totalTVA: 19.58,
    totalTTC: 117.5,
    amountPaid: 117.5,
    paymentMethod: 'carte',
    notes: 'Règlement par CB au comptoir. Véhicule conforme.',
    mileageAtService: 124100,
  },
  {
    id: 'doc-2',
    type: 'bon_commande',
    referenceNumber: 'BC-2026-0034',
    date: '2026-09-29',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    status: 'valide',
    items: [
      {
        id: 'it-3',
        type: 'piece',
        reference: 'BOSCH-0986479381',
        description: 'Jeu de 2 disques de frein avant ventilés haute performance',
        quantity: 1,
        unitPriceHT: 125.0,
        discountPercent: 10,
        tvaRate: 20,
      },
      {
        id: 'it-4',
        type: 'piece',
        reference: 'FERODO-FDB4248',
        description: 'Jeu de plaquettes de frein avant avec témoins d’usure',
        quantity: 1,
        unitPriceHT: 58.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-5',
        type: 'main_oeuvre',
        reference: 'MO-T2',
        description: 'Pose disques et plaquettes avant + purge liquide DOT4',
        quantity: 1.5,
        unitPriceHT: 72.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-6',
        type: 'autre',
        reference: 'RECYC-DECHETS',
        description: 'Participation traitement et recyclage déchets polluants',
        quantity: 1,
        unitPriceHT: 4.5,
        discountPercent: 0,
        tvaRate: 20,
      },
    ],
    totalPartsHT: 170.5,
    totalLaborHT: 108.0,
    totalHT: 283.0,
    totalTVA: 56.6,
    totalTTC: 339.6,
    amountPaid: 100.0,
    paymentMethod: 'especes',
    notes: 'Acompte de 100 € versé à la commande. Travaux prévus ce 30/09.',
    mileageAtService: 124500,
  },
  {
    id: 'doc-3',
    type: 'devis',
    referenceNumber: 'DEV-2026-0052',
    date: '2026-09-28',
    validityDate: '2026-10-28',
    clientId: 'cli-2',
    vehicleId: 'veh-2',
    status: 'envoye',
    items: [
      {
        id: 'it-7',
        type: 'piece',
        reference: 'GATES-KP15655XS',
        description: 'Kit de distribution complet + Pompe à eau renforcée',
        quantity: 1,
        unitPriceHT: 215.0,
        discountPercent: 5,
        tvaRate: 20,
      },
      {
        id: 'it-8',
        type: 'piece',
        reference: 'LIQ-REFROID-D',
        description: 'Liquide de refroidissement longue durée Type D (5 Litres)',
        quantity: 2,
        unitPriceHT: 18.5,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-9',
        type: 'piece',
        reference: 'COURR-ACC-6PK',
        description: 'Courroie d’accessoires & galet tendeur',
        quantity: 1,
        unitPriceHT: 45.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-10',
        type: 'main_oeuvre',
        reference: 'MO-T3',
        description: 'Main d’œuvre qualifiée remplacement distribution et calage',
        quantity: 4.0,
        unitPriceHT: 78.0,
        discountPercent: 0,
        tvaRate: 20,
      },
    ],
    totalPartsHT: 286.25,
    totalLaborHT: 312.0,
    totalHT: 598.25,
    totalTVA: 119.65,
    totalTTC: 717.9,
    amountPaid: 0,
    notes: 'Devis transmis par email pour validation de la direction Express Coursier.',
    mileageAtService: 89400,
  },
  {
    id: 'doc-4',
    type: 'facture',
    referenceNumber: 'FAC-2026-0090',
    date: '2026-09-26',
    dueDate: '2026-10-10',
    clientId: 'cli-4',
    vehicleId: 'veh-4',
    status: 'paye',
    items: [
      {
        id: 'it-11',
        type: 'piece',
        reference: 'CAS-EDGE-5W30',
        description: 'Huile moteur synthétique Castrol Edge 5W30 LL (5L)',
        quantity: 1.2,
        unitPriceHT: 68.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-12',
        type: 'piece',
        reference: 'MANN-HU6004X',
        description: 'Filtre à huile origine BMW',
        quantity: 1,
        unitPriceHT: 16.5,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-13',
        type: 'piece',
        reference: 'MANN-CUK25001',
        description: 'Filtre d’habitacle au charbon actif anti-allergène',
        quantity: 1,
        unitPriceHT: 32.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-14',
        type: 'main_oeuvre',
        reference: 'MO-T1',
        description: 'Vidange moteur, remplacement filtres et réinitialisation OBD',
        quantity: 1.2,
        unitPriceHT: 65.0,
        discountPercent: 0,
        tvaRate: 20,
      },
    ],
    totalPartsHT: 130.1,
    totalLaborHT: 78.0,
    totalHT: 208.1,
    totalTVA: 41.62,
    totalTTC: 249.72,
    amountPaid: 249.72,
    paymentMethod: 'carte',
    notes: 'Révision annuelle effectuée avec succès.',
    mileageAtService: 72150,
  },
  {
    id: 'doc-5',
    type: 'facture',
    referenceNumber: 'FAC-2026-0091',
    date: '2026-09-28',
    dueDate: '2026-10-15',
    clientId: 'cli-2',
    vehicleId: 'veh-5',
    status: 'partiellement_paye',
    items: [
      {
        id: 'it-15',
        type: 'forfait',
        reference: 'FORF-REV-UTIL',
        description: 'Forfait entretien utilitaire complet vidange + 4 filtres',
        quantity: 1,
        unitPriceHT: 220.0,
        discountPercent: 0,
        tvaRate: 20,
      },
      {
        id: 'it-16',
        type: 'piece',
        reference: 'VALEO-BALAIS',
        description: 'Paire de balais d’essuie-glace Silence Pro',
        quantity: 1,
        unitPriceHT: 38.0,
        discountPercent: 10,
        tvaRate: 20,
      },
    ],
    totalPartsHT: 34.2,
    totalLaborHT: 220.0,
    totalHT: 254.2,
    totalTVA: 50.84,
    totalTTC: 305.04,
    amountPaid: 150.0,
    paymentMethod: 'virement',
    notes: 'Acompte viré, solde de 155.04 € attendu sous quinzaine.',
    mileageAtService: 145000,
  },
];

const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'csh-1',
    date: '2026-09-30T08:00:00Z',
    type: 'apport_caisse',
    label: 'Fond de caisse initial ouverture du jour',
    amount: 250.0,
    paymentMethod: 'especes',
    notes: 'Pièces et billets d’ouverture de caisse',
  },
  {
    id: 'csh-2',
    date: '2026-09-30T08:45:00Z',
    type: 'vente_directe',
    label: 'Vente directe : Bidon Huile 5L 5W30 C3 + Entonnoir',
    amount: 48.0,
    paymentMethod: 'especes',
    clientName: 'Client Comptoir M. Bernard',
    cashReceived: 50.0,
    cashChange: 2.0,
    notes: 'Rendu 2 €',
  },
  {
    id: 'csh-3',
    date: '2026-09-30T09:15:00Z',
    type: 'encaissement_facture',
    label: 'Acompte Bon de commande BC-2026-0034 (Freins Dubois)',
    amount: 100.0,
    paymentMethod: 'especes',
    documentId: 'doc-2',
    clientName: 'Jean-Marc Dubois',
    cashReceived: 100.0,
    cashChange: 0,
    notes: 'Reçu en espèces',
  },
  {
    id: 'csh-4',
    date: '2026-09-30T10:10:00Z',
    type: 'encaissement_facture',
    label: 'Règlement Facture FAC-2026-0089',
    amount: 117.5,
    paymentMethod: 'carte',
    documentId: 'doc-1',
    clientName: 'Jean-Marc Dubois',
    notes: 'TPE Carte Bancaire sans contact',
  },
  {
    id: 'csh-5',
    date: '2026-09-30T11:30:00Z',
    type: 'vente_directe',
    label: 'Vente directe : Lot ampoules H7 Philips + Lave-glace hiver',
    amount: 24.5,
    paymentMethod: 'carte',
    clientName: 'Mme Girard',
    notes: 'CB Ticket n°0492',
  },
  {
    id: 'csh-6',
    date: '2026-09-30T12:00:00Z',
    type: 'retrait_caisse',
    label: 'Dépannage visserie inox quincaillerie locale',
    amount: 16.5,
    paymentMethod: 'especes',
    notes: 'Ticket conservé dans le tiroir caisse',
  },
];

const INITIAL_DAY_CLOSES: CashDayClose[] = [
  {
    id: 'close-1',
    date: '2026-09-29',
    openingBalance: 250.0,
    totalCash: 184.0,
    totalCard: 489.5,
    totalCheque: 0,
    totalTransfer: 250.0,
    totalSalesTTC: 923.5,
    theoreticalCashInDrawer: 434.0, // 250 + 184
    actualCashCounted: 434.0,
    discrepancy: 0,
    closedBy: 'Fabrice (Gérant)',
    closedAt: '2026-09-29T18:45:00Z',
    notes: 'Caisse exacte, aucun écart.',
  },
];

const INITIAL_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cat-1',
    type: 'forfait',
    reference: 'FORF-VID-5W30',
    description: 'Forfait Vidange Synthèse 5W30 C3 + Remplacement Filtre à Huile + Mise à niveau fluides',
    defaultQuantity: 1,
    unitPriceHT: 129.0,
    tvaRate: 20,
    category: 'Entretien & Vidange',
  },
  {
    id: 'cat-2',
    type: 'main_oeuvre',
    reference: 'MO-T1',
    description: 'Main d’œuvre T1 - Entretien courant, révision & vidange',
    defaultQuantity: 1,
    unitPriceHT: 65.0,
    tvaRate: 20,
    category: 'Main d’œuvre',
  },
  {
    id: 'cat-3',
    type: 'main_oeuvre',
    reference: 'MO-T2',
    description: 'Main d’œuvre T2 - Freinage, liaisons au sol, amortisseurs, échappement',
    defaultQuantity: 1,
    unitPriceHT: 72.0,
    tvaRate: 20,
    category: 'Main d’œuvre',
  },
  {
    id: 'cat-4',
    type: 'main_oeuvre',
    reference: 'MO-T3',
    description: 'Main d’œuvre T3 - Distribution, embrayage, boîte & diagnostic complexe',
    defaultQuantity: 1,
    unitPriceHT: 79.0,
    tvaRate: 20,
    category: 'Main d’œuvre',
  },
  {
    id: 'cat-5',
    type: 'piece',
    reference: 'FREIN-DISQ-AV',
    description: 'Jeu de 2 disques de frein avant ventilés haute performance',
    defaultQuantity: 1,
    unitPriceHT: 115.0,
    tvaRate: 20,
    category: 'Freinage',
  },
  {
    id: 'cat-6',
    type: 'piece',
    reference: 'FREIN-PLAQ-AV',
    description: 'Jeu de 4 plaquettes de frein avant avec accessoires de montage',
    defaultQuantity: 1,
    unitPriceHT: 55.0,
    tvaRate: 20,
    category: 'Freinage',
  },
  {
    id: 'cat-7',
    type: 'forfait',
    reference: 'FORF-DIAG-OBD',
    description: 'Forfait diagnostic électronique valise multimarque & lecture codes défaut',
    defaultQuantity: 1,
    unitPriceHT: 49.0,
    tvaRate: 20,
    category: 'Diagnostic',
  },
  {
    id: 'cat-8',
    type: 'forfait',
    reference: 'FORF-CLIM-R134',
    description: 'Forfait recharge climatisation Gaz R134a + Huile compresseur + Traitement antibactérien',
    defaultQuantity: 1,
    unitPriceHT: 89.0,
    tvaRate: 20,
    category: 'Climatisation',
  },
  {
    id: 'cat-9',
    type: 'forfait',
    reference: 'FORF-GEOM-AV',
    description: 'Contrôle et réglage géométrie parallélisme train avant banc laser',
    defaultQuantity: 1,
    unitPriceHT: 69.0,
    tvaRate: 20,
    category: 'Pneumatiques',
  },
  {
    id: 'cat-10',
    type: 'piece',
    reference: 'DISTRIB-KIT-POMPE',
    description: 'Kit de courroie de distribution renforcée + Pompe à eau + Galets',
    defaultQuantity: 1,
    unitPriceHT: 195.0,
    tvaRate: 20,
    category: 'Distribution',
  },
  {
    id: 'cat-11',
    type: 'piece',
    reference: 'HUILE-5W30-1L',
    description: 'Huile moteur 100% synthèse Castrol Edge 5W30 LL (Bidon 1L)',
    defaultQuantity: 1,
    unitPriceHT: 16.5,
    tvaRate: 20,
    category: 'Entretien & Vidange',
  },
  {
    id: 'cat-12',
    type: 'autre',
    reference: 'RECYC-DECHETS',
    description: 'Participation traitement et recyclage éco-responsable des déchets d’atelier',
    defaultQuantity: 1,
    unitPriceHT: 4.5,
    tvaRate: 20,
    category: 'Environnement',
  },
];

// LocalStorage Keys
const KEYS = {
  THEME: 'autopro_theme_v1',
  GARAGE: 'autopro_garage_v1',
  CLIENTS: 'autopro_clients_v1',
  VEHICLES: 'autopro_vehicles_v1',
  SUPPLIERS: 'autopro_suppliers_v1',
  SUPPLIER_ORDERS: 'autopro_supplier_orders_v1',
  APPOINTMENTS: 'autopro_appointments_v1',
  DOCUMENTS: 'autopro_documents_v1',
  CASH_TRANSACTIONS: 'autopro_cash_transactions_v1',
  DAY_CLOSES: 'autopro_day_closes_v1',
  CATALOG_ITEMS: 'autopro_catalog_items_v1',
  CASH_SETTINGS: 'autopro_cash_settings_v1',
  MECHANICS: 'autopro_mechanics_v1',
  WORKSHOP_BAYS: 'autopro_workshop_bays_v1',
};

// Generic storage accessors
function loadItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function saveItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Storage API
export const storageService = {
  getTheme: (): ThemeConfig => ({
    ...DEFAULT_THEME,
    ...loadItem<ThemeConfig>(KEYS.THEME, DEFAULT_THEME),
  }),
  saveTheme: (theme: ThemeConfig) => saveItem(KEYS.THEME, theme),

  getGarage: (): GarageSettings => ({
    ...DEFAULT_GARAGE,
    ...loadItem<GarageSettings>(KEYS.GARAGE, DEFAULT_GARAGE),
  }),
  saveGarage: (garage: GarageSettings) => saveItem(KEYS.GARAGE, garage),

  getCatalogItems: (): CatalogItem[] =>
    loadItem<CatalogItem[]>(KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS),
  saveCatalogItems: (items: CatalogItem[]) => saveItem(KEYS.CATALOG_ITEMS, items),

  getClients: (): Client[] => loadItem<Client[]>(KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (clients: Client[]) => saveItem(KEYS.CLIENTS, clients),

  getVehicles: (): Vehicle[] => loadItem<Vehicle[]>(KEYS.VEHICLES, INITIAL_VEHICLES),
  saveVehicles: (vehicles: Vehicle[]) => saveItem(KEYS.VEHICLES, vehicles),

  getSuppliers: (): Supplier[] => loadItem<Supplier[]>(KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
  saveSuppliers: (suppliers: Supplier[]) => saveItem(KEYS.SUPPLIERS, suppliers),

  getSupplierOrders: (): SupplierOrder[] =>
    loadItem<SupplierOrder[]>(KEYS.SUPPLIER_ORDERS, INITIAL_SUPPLIER_ORDERS),
  saveSupplierOrders: (orders: SupplierOrder[]) => saveItem(KEYS.SUPPLIER_ORDERS, orders),

  getAppointments: (): Appointment[] =>
    loadItem<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  saveAppointments: (apts: Appointment[]) => saveItem(KEYS.APPOINTMENTS, apts),

  getDocuments: (): GarageDocument[] =>
    loadItem<GarageDocument[]>(KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
  saveDocuments: (docs: GarageDocument[]) => saveItem(KEYS.DOCUMENTS, docs),

  getCashTransactions: (): CashTransaction[] =>
    loadItem<CashTransaction[]>(KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS),
  saveCashTransactions: (transactions: CashTransaction[]) =>
    saveItem(KEYS.CASH_TRANSACTIONS, transactions),

  getDayCloses: (): CashDayClose[] =>
    loadItem<CashDayClose[]>(KEYS.DAY_CLOSES, INITIAL_DAY_CLOSES),
  saveDayCloses: (closes: CashDayClose[]) => saveItem(KEYS.DAY_CLOSES, closes),

  getCashSettings: (): CashRegisterSettings => ({
    ...DEFAULT_CASH_SETTINGS,
    ...loadItem<CashRegisterSettings>(KEYS.CASH_SETTINGS, DEFAULT_CASH_SETTINGS),
  }),
  saveCashSettings: (settings: CashRegisterSettings) =>
    saveItem(KEYS.CASH_SETTINGS, settings),

  restoreDefaultCash: (): { transactions: CashTransaction[]; settings: CashRegisterSettings } => {
    saveItem(KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS);
    saveItem(KEYS.CASH_SETTINGS, DEFAULT_CASH_SETTINGS);
    return {
      transactions: INITIAL_CASH_TRANSACTIONS,
      settings: DEFAULT_CASH_SETTINGS,
    };
  },

  restoreCashSettings: (): CashRegisterSettings => {
    saveItem(KEYS.CASH_SETTINGS, DEFAULT_CASH_SETTINGS);
    return DEFAULT_CASH_SETTINGS;
  },

  getMechanics: (): Mechanic[] =>
    loadItem<Mechanic[]>(KEYS.MECHANICS, INITIAL_MECHANICS),
  saveMechanics: (mechanics: Mechanic[]) => saveItem(KEYS.MECHANICS, mechanics),

  getWorkshopBays: (): WorkshopBay[] =>
    loadItem<WorkshopBay[]>(KEYS.WORKSHOP_BAYS, INITIAL_WORKSHOP_BAYS),
  saveWorkshopBays: (bays: WorkshopBay[]) => saveItem(KEYS.WORKSHOP_BAYS, bays),

  // Reset to demo data
  resetAll: () => {
    saveItem(KEYS.THEME, DEFAULT_THEME);
    saveItem(KEYS.GARAGE, DEFAULT_GARAGE);
    saveItem(KEYS.CLIENTS, INITIAL_CLIENTS);
    saveItem(KEYS.VEHICLES, INITIAL_VEHICLES);
    saveItem(KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    saveItem(KEYS.SUPPLIER_ORDERS, INITIAL_SUPPLIER_ORDERS);
    saveItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveItem(KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    saveItem(KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS);
    saveItem(KEYS.DAY_CLOSES, INITIAL_DAY_CLOSES);
    saveItem(KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS);
    saveItem(KEYS.MECHANICS, INITIAL_MECHANICS);
    saveItem(KEYS.WORKSHOP_BAYS, INITIAL_WORKSHOP_BAYS);
  },

  // Export full backup
  exportBackup: () => {
    return JSON.stringify({
      theme: loadItem(KEYS.THEME, DEFAULT_THEME),
      garage: loadItem(KEYS.GARAGE, DEFAULT_GARAGE),
      clients: loadItem(KEYS.CLIENTS, INITIAL_CLIENTS),
      vehicles: loadItem(KEYS.VEHICLES, INITIAL_VEHICLES),
      suppliers: loadItem(KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
      supplierOrders: loadItem(KEYS.SUPPLIER_ORDERS, INITIAL_SUPPLIER_ORDERS),
      appointments: loadItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
      documents: loadItem(KEYS.DOCUMENTS, INITIAL_DOCUMENTS),
      cashTransactions: loadItem(KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS),
      dayCloses: loadItem(KEYS.DAY_CLOSES, INITIAL_DAY_CLOSES),
      catalogItems: loadItem(KEYS.CATALOG_ITEMS, INITIAL_CATALOG_ITEMS),
      mechanics: loadItem(KEYS.MECHANICS, INITIAL_MECHANICS),
      workshopBays: loadItem(KEYS.WORKSHOP_BAYS, INITIAL_WORKSHOP_BAYS),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  // Import backup
  importBackup: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.theme) saveItem(KEYS.THEME, data.theme);
      if (data.garage) saveItem(KEYS.GARAGE, data.garage);
      if (data.clients) saveItem(KEYS.CLIENTS, data.clients);
      if (data.vehicles) saveItem(KEYS.VEHICLES, data.vehicles);
      if (data.suppliers) saveItem(KEYS.SUPPLIERS, data.suppliers);
      if (data.supplierOrders) saveItem(KEYS.SUPPLIER_ORDERS, data.supplierOrders);
      if (data.appointments) saveItem(KEYS.APPOINTMENTS, data.appointments);
      if (data.documents) saveItem(KEYS.DOCUMENTS, data.documents);
      if (data.cashTransactions) saveItem(KEYS.CASH_TRANSACTIONS, data.cashTransactions);
      if (data.dayCloses) saveItem(KEYS.DAY_CLOSES, data.dayCloses);
      if (data.catalogItems) saveItem(KEYS.CATALOG_ITEMS, data.catalogItems);
      if (data.mechanics) saveItem(KEYS.MECHANICS, data.mechanics);
      if (data.workshopBays) saveItem(KEYS.WORKSHOP_BAYS, data.workshopBays);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
};

// Document calculation helper
export function recalculateDocumentTotals(
  items: GarageDocument['items']
): {
  totalPartsHT: number;
  totalLaborHT: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
} {
  let totalPartsHT = 0;
  let totalLaborHT = 0;
  let totalHT = 0;
  let totalTVA = 0;

  for (const item of items) {
    const rawLine = item.quantity * item.unitPriceHT;
    const discountedLine = rawLine * (1 - (item.discountPercent || 0) / 100);
    const lineTVA = discountedLine * ((item.tvaRate || 20) / 100);

    totalHT += discountedLine;
    totalTVA += lineTVA;

    if (item.type === 'piece') {
      totalPartsHT += discountedLine;
    } else if (item.type === 'main_oeuvre') {
      totalLaborHT += discountedLine;
    }
  }

  const totalTTC = totalHT + totalTVA;

  return {
    totalPartsHT: Math.round(totalPartsHT * 100) / 100,
    totalLaborHT: Math.round(totalLaborHT * 100) / 100,
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
  };
}
