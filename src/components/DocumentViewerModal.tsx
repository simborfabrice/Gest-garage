import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Printer,
  FileText,
  ArrowRight,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Wrench,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  Download,
  CheckCircle2,
  Building,
  Car,
  Receipt,
  Stamp,
  Award,
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { printElement, downloadPrintableHtml } from '../utils/printUtils';

type ViewLayoutMode = 'official_standard' | 'official_compact' | 'workshop_card' | 'handover';

export const formatPaymentMethod = (method?: string): string => {
  switch (method) {
    case 'carte':
      return 'Carte Bancaire';
    case 'especes':
      return 'Espèces';
    case 'cheque':
      return 'Chèque';
    case 'virement':
      return 'Virement bancaire';
    default:
      return 'Carte Bancaire';
  }
};

export const DocumentViewerModal: React.FC = () => {
  const {
    viewingDocument,
    setViewingDocument,
    viewingSupplierOrder,
    setViewingSupplierOrder,
    setEditingDocument,
    updateDocument,
    documents,
    supplierOrders,
    suppliers,
    garage,
    updateGarage,
    theme,
    clients,
    vehicles,
    convertQuoteToOrder,
    convertOrderToInvoice,
    setActiveTab,
  } = useApp();

  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('official_standard');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showMarginGuide, setShowMarginGuide] = useState<boolean>(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const isSupplierOrder = !!viewingSupplierOrder && !viewingDocument;

  // Handles for Garage Document
  const doc = viewingDocument;
  const client = doc ? clients.find((c) => c.id === doc.clientId) : undefined;
  const vehicle = doc ? vehicles.find((v) => v.id === doc.vehicleId) : undefined;

  const isQuote = doc?.type === 'devis';
  const isOrder = doc?.type === 'bon_commande';
  const isInvoice = doc?.type === 'facture';

  const typeLabel = isQuote ? 'DEVIS' : isOrder ? 'BON DE COMMANDE' : 'FACTURE';
  const docCode = isQuote ? 'DEV' : isOrder ? 'BC' : 'FAC';

  // Handles for Supplier Order
  const supOrder = viewingSupplierOrder;
  const supplier = supOrder ? suppliers.find((s) => s.id === supOrder.supplierId) : undefined;

  // Flatten all documents for unified navigation
  type NavItem =
    | { kind: 'garage'; doc: typeof doc }
    | { kind: 'supplier'; order: typeof supOrder };

  const allNavItems: NavItem[] = [
    ...documents.map((d) => ({ kind: 'garage' as const, doc: d })),
    ...supplierOrders.map((o) => ({ kind: 'supplier' as const, order: o })),
  ];

  const currentNavIndex = isSupplierOrder
    ? allNavItems.findIndex(
        (it) => it.kind === 'supplier' && it.order?.id === supOrder?.id
      )
    : allNavItems.findIndex(
        (it) => it.kind === 'garage' && it.doc?.id === doc?.id
      );

  const handlePrevDoc = () => {
    if (allNavItems.length === 0) return;
    const nextIdx =
      currentNavIndex > 0 ? currentNavIndex - 1 : allNavItems.length - 1;
    const target = allNavItems[nextIdx];
    if (target.kind === 'garage' && target.doc) {
      setViewingSupplierOrder(null);
      setViewingDocument(target.doc);
    } else if (target.kind === 'supplier' && target.order) {
      setViewingDocument(null);
      setViewingSupplierOrder(target.order);
    }
  };

  const handleNextDoc = () => {
    if (allNavItems.length === 0) return;
    const nextIdx =
      currentNavIndex < allNavItems.length - 1 ? currentNavIndex + 1 : 0;
    const target = allNavItems[nextIdx];
    if (target.kind === 'garage' && target.doc) {
      setViewingSupplierOrder(null);
      setViewingDocument(target.doc);
    } else if (target.kind === 'supplier' && target.order) {
      setViewingDocument(null);
      setViewingSupplierOrder(target.order);
    }
  };

  const handleSelectDocument = (value: string) => {
    if (value.startsWith('sup_')) {
      const supId = value.replace('sup_', '');
      const target = supplierOrders.find((o) => o.id === supId);
      if (target) {
        setViewingDocument(null);
        setViewingSupplierOrder(target);
      }
    } else {
      const target = documents.find((d) => d.id === value);
      if (target) {
        setViewingSupplierOrder(null);
        setViewingDocument(target);
      }
    }
  };

  const handleClose = () => {
    setViewingDocument(null);
    setViewingSupplierOrder(null);
  };

  const currentDocTitle = isSupplierOrder
    ? `Commande Fournisseur ${supOrder?.orderNumber}`
    : `${typeLabel} ${doc?.referenceNumber}`;

  const currentDocFilename = isSupplierOrder
    ? `Commande_Fournisseur_${supOrder?.orderNumber || 'SO'}`
    : `${typeLabel}_${doc?.referenceNumber || 'DOC'}`;

  const handlePrint = () => {
    const result = printElement('printable-document', currentDocTitle);
    setPrintFeedback(
      result.message ||
        "Ordre d'impression envoyé. Si votre navigateur bloque la boîte d'impression, utilisez le bouton « Télécharger la feuille »."
    );
    setTimeout(() => setPrintFeedback(null), 10000);
  };

  React.useEffect(() => {
    if (!viewingDocument && !viewingSupplierOrder) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowLeft' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        handlePrevDoc();
      } else if (e.key === 'ArrowRight' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        handleNextDoc();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingDocument, viewingSupplierOrder, isFullScreen, currentNavIndex, allNavItems]);

  const handleDownloadHtml = () => {
    const ok = downloadPrintableHtml(
      'printable-document',
      currentDocFilename,
      currentDocTitle
    );
    if (ok) {
      setPrintFeedback(
        "Fichier de la feuille de facturation téléchargé ! Vous pouvez l'ouvrir dans votre navigateur pour l'imprimer sans blocage."
      );
      setTimeout(() => setPrintFeedback(null), 8000);
    }
  };

  const handleConvertToOrder = () => {
    if (!doc) return;
    const newDoc = convertQuoteToOrder(doc.id);
    if (newDoc) {
      setViewingDocument(newDoc);
    }
  };

  const handleConvertToInvoice = () => {
    if (!doc) return;
    const newDoc = convertOrderToInvoice(doc.id);
    if (newDoc) {
      setViewingDocument(newDoc);
    }
  };

  // If neither a garage document nor a supplier order is active, return null (after all Hooks)
  if (!viewingDocument && !viewingSupplierOrder) return null;

  // Group line items by VAT rate for official tax breakdown
  const vatBreakdown: { [rate: number]: { baseHT: number; amountTVA: number } } = {};
  if (doc) {
    doc.items.forEach((it) => {
      const lineHT =
        it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100);
      const rate = it.tvaRate || 20;
      if (!vatBreakdown[rate]) {
        vatBreakdown[rate] = { baseHT: 0, amountTVA: 0 };
      }
      vatBreakdown[rate].baseHT += lineHT;
      vatBreakdown[rate].amountTVA += lineHT * (rate / 100);
    });
  }

  // Calculate separate labor and parts subtotals
  const partsSubtotalHT = doc
    ? doc.items
        .filter((it) => it.type === 'piece')
        .reduce(
          (sum, it) =>
            sum +
            it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100),
          0
        )
    : 0;

  const laborSubtotalHT = doc
    ? doc.items
        .filter((it) => it.type === 'main_oeuvre')
        .reduce(
          (sum, it) =>
            sum +
            it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100),
          0
        )
    : 0;

  const otherSubtotalHT = doc
    ? doc.items
        .filter((it) => it.type === 'forfait' || it.type === 'autre')
        .reduce(
          (sum, it) =>
            sum +
            it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100),
          0
        )
    : 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto document-modal-wrapper ${
        isFullScreen
          ? 'p-0 bg-slate-200'
          : 'bg-slate-900/90 backdrop-blur-xs p-1 sm:p-3'
      }`}
    >
      <div
        className={`relative flex flex-col document-modal-card ${
          isFullScreen
            ? 'w-full h-full min-h-screen bg-slate-200 rounded-none border-0 shadow-none my-0 max-h-none'
            : 'w-full max-w-6xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-2 max-h-[98vh]'
        }`}
      >
        {/* Top Control Bar (Never printed) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900 text-white shrink-0 sticky top-0 z-20 no-print">
          {/* Left: Document Badge and Title */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded text-white shadow-xs"
              style={{
                backgroundColor: isSupplierOrder
                  ? '#0284c7'
                  : isQuote
                  ? '#475569'
                  : isOrder
                  ? '#0284c7'
                  : '#059669',
              }}
            >
              {isSupplierOrder
                ? `CMD FOURNISSEUR #${supOrder?.orderNumber}`
                : `${typeLabel} #${doc?.referenceNumber}`}
            </span>

            {/* Standard Format Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Format Facturation Type A4 (210 × 297 mm)</span>
            </span>

            {/* Sub-label */}
            <span className="text-xs text-slate-400 hidden xl:inline truncate max-w-[200px]">
              {isSupplierOrder
                ? `Fournisseur : ${supplier?.name || 'N/A'}`
                : `Client : ${
                    client
                      ? client.type === 'professionnel'
                        ? client.companyName
                        : `${client.firstName} ${client.lastName}`
                      : 'N/A'
                  }`}
            </span>
          </div>

          {/* Center: Switch between ALL Documents */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={handlePrevDoc}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Document précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={isSupplierOrder ? `sup_${supOrder?.id}` : doc?.id || ''}
              onChange={(e) => handleSelectDocument(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-slate-100 focus:outline-hidden py-1 px-1 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
              title="Ouvrir un autre document (Devis, Commandes, Factures, Fournisseurs)"
            >
              <optgroup label="Devis Chiffrés Atelier">
                {documents
                  .filter((d) => d.type === 'devis')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : '';
                    return (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        Devis {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="Bons de Commande Atelier">
                {documents
                  .filter((d) => d.type === 'bon_commande')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : '';
                    return (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        Commande {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="Factures d'Atelier">
                {documents
                  .filter((d) => d.type === 'facture')
                  .map((d) => {
                    const cl = clients.find((c) => c.id === d.clientId);
                    const clName = cl
                      ? cl.type === 'professionnel'
                        ? cl.companyName
                        : `${cl.firstName} ${cl.lastName}`
                      : '';
                    return (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        Facture {d.referenceNumber} — {clName} ({d.totalTTC.toFixed(2)} €)
                      </option>
                    );
                  })}
              </optgroup>
              <optgroup label="Commandes Fournisseurs">
                {supplierOrders.map((o) => {
                  const sup = suppliers.find((s) => s.id === o.supplierId);
                  return (
                    <option key={o.id} value={`sup_${o.id}`} className="bg-slate-900 text-white">
                      Cmd Fournisseur {o.orderNumber} — {sup?.name || 'Inconnu'} ({o.totalTTC.toFixed(2)} €)
                    </option>
                  );
                })}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={handleNextDoc}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Document suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Actions, Layout, Zoom, and Print */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* View Layout Mode (Standard Automotive / Compact / Workshop Card / Handover) */}
            {!isSupplierOrder && doc && (
              <div className="hidden lg:flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLayoutMode('official_standard')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    layoutMode === 'official_standard'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Facturation type standard française conforme (DGFiP, Code de commerce, ventilation TVA, cartouche véhicule)"
                >
                  Format Type
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('workshop_card')}
                  className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                    layoutMode === 'workshop_card'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fiche technique atelier avec checklist de sécurité"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>Fiche Atelier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('handover')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    layoutMode === 'handover'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bon de restitution du véhicule et PV de conformité"
                >
                  Restitution
                </button>
              </div>
            )}

            {/* Edit button */}
            {!isSupplierOrder && doc && (
              <button
                type="button"
                onClick={() => setEditingDocument(doc)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Modifier les pièces, tarifs ou informations de ce document"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
            )}

            {/* Workflow conversions */}
            {!isSupplierOrder && doc && isQuote && doc.status !== 'refuse' && (
              <button
                type="button"
                onClick={handleConvertToOrder}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Convertir ce devis en bon de commande officiel"
              >
                <span className="hidden sm:inline">En Bon Cde</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {!isSupplierOrder && doc && isOrder && (
              <button
                type="button"
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Générer la facture finale"
              >
                <span className="hidden sm:inline">Facturer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {!isSupplierOrder && doc && isInvoice && doc.status !== 'paye' && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setActiveTab('cash');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Encaisser cette facture en caisse"
              >
                <span>Encaisser</span>
              </button>
            )}

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(prev - 15, 65))}
                className="hover:text-white p-0.5"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="tabular-nums font-mono text-[11px] w-9 text-center font-bold">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(prev + 15, 125))}
                className="hover:text-white p-0.5"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Margin Guides Toggle */}
            <button
              type="button"
              onClick={() => setShowMarginGuide(!showMarginGuide)}
              className={`hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showMarginGuide
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Afficher les repères de marges d'impression A4 standard (15 mm)"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Marges A4</span>
            </button>

            {/* Full Screen View Toggle */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isFullScreen
                  ? 'bg-sky-600 border-sky-400 text-white shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
              }`}
              title={isFullScreen ? "Quitter le plein écran" : "Voir la feuille en plein écran (maximiser sur l'écran)"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quitter Plein Écran</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Plein Écran</span>
                </>
              )}
            </button>

            {/* Download Standalone HTML/PDF Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors"
              title="Télécharger la feuille au format prêt à imprimer (ouvre l'impression directe dans votre navigateur)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Télécharger Feuille</span>
            </button>

            {/* Primary Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              title="Lancer l'impression directe de la feuille A4 (Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer A4</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Fermer l'aperçu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback / Instructions banner if print is clicked */}
        {printFeedback && (
          <div className="bg-emerald-900/90 border-b border-emerald-700 text-emerald-100 text-xs px-4 py-2.5 flex items-center justify-between gap-3 animate-fade-in no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{printFeedback}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold border border-emerald-600"
              >
                Télécharger la feuille
              </button>
              <button
                onClick={() => setPrintFeedback(null)}
                className="text-emerald-300 hover:text-white text-[11px] underline ml-1"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Realistic Paper Desk Workspace */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-slate-200 flex flex-col items-center justify-start document-modal-body">
          {/* Header of the physical sheet */}
          <div className="w-full max-w-[210mm] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 mb-2 px-1 no-print">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Format de Facturation Type A4 (210 × 297 mm) — Prêt pour impression officielle</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className={`px-1.5 py-0.5 rounded border ${
                  zoomLevel === 100
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
                title="Taille réelle 100%"
              >
                100% Réel
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(85)}
                className={`px-1.5 py-0.5 rounded border ${
                  zoomLevel === 85
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
                title="Ajuster à l'écran"
              >
                Ajuster
              </button>
              <span className="text-slate-400">·</span>
              <span>Échelle : {zoomLevel}%</span>
              <span>·</span>
              <span>1 Page · Portrait</span>
            </div>
          </div>

          <div
            style={{
              transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-[210mm] transition-all"
          >
            {/* The Real A4 Sheet of Paper with drop shadow and crisp white look */}
            <div
              id="printable-document"
              className={`w-full min-h-[297mm] mx-auto bg-white shadow-2xl ring-1 ring-slate-900/15 text-slate-900 text-xs sm:text-[12px] relative flex flex-col justify-between rounded-xs ${
                showMarginGuide ? 'outline-2 outline-dashed outline-emerald-500' : ''
              }`}
              style={{
                padding: '14mm 16mm',
                boxSizing: 'border-box',
              }}
            >
              {/* Optional Visual Margin Guide Helper Banner */}
              {showMarginGuide && (
                <div className="print-guide-margin absolute top-1 left-2 text-[9px] font-mono text-emerald-600 font-bold opacity-75">
                  [Guide de marge A4 : zone d’impression standard 15 mm]
                </div>
              )}

              {/* -------------------- 1. FORMAT DE FACTURATION TYPE OFFICIEL -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'official_standard' && (
                <div className="space-y-4">
                  {/* TOP HEADER: Émetteur (Garage) & Destinataire (Client) - Norme AFNOR */}
                  <div className="grid grid-cols-12 gap-6 items-start pb-4 border-b border-slate-300">
                    {/* ÉMETTEUR (GARAGE) - Col 7 */}
                    <div className="col-span-7 space-y-1.5">
                      <div className="flex items-start gap-3">
                        {garage.logoUrl && (
                          <img
                            src={garage.logoUrl}
                            alt={garage.name}
                            className="object-contain shrink-0 bg-transparent"
                            style={{
                              width: `${garage.logoSize || 130}px`,
                              maxHeight: `${Math.round((garage.logoSize || 130) * 1.1)}px`,
                              height: 'auto',
                            }}
                          />
                        )}
                        <div>
                          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                            {garage.name}
                          </h1>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {garage.legalForm || 'Société de Mécanique Automobile'}
                          </p>
                          {garage.slogan && (
                            <p className="text-[10.5px] italic text-slate-500">
                              {garage.slogan}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-[10.5px] text-slate-600 space-y-0.5 pt-1 leading-relaxed">
                        <p>{garage.address}, {garage.postalCode} {garage.city}</p>
                        <p>
                          Tél : <span className="font-semibold text-slate-800">{garage.phone}</span>
                          {' · '}Email : {garage.email}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600">
                          SIRET : {garage.siret} · Code NAF : {garage.nafCode}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600">
                          {garage.rcsNumber ? `${garage.rcsNumber} · ` : ''}N° TVA : {garage.tvaNumber}
                        </p>
                        {garage.insuranceName && (
                          <p className="text-[9.5px] text-slate-500">
                            Assurance : {garage.insuranceName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DESTINATAIRE (CLIENT) - Col 5 (Encadré pour enveloppe à fenêtre) */}
                    <div className="col-span-5 p-3.5 rounded-lg border-2 border-slate-300 bg-slate-50/70 space-y-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block">
                        {isQuote ? 'Devis établi pour :' : 'Facturé à :'}
                      </span>
                      {client ? (
                        <div className="text-[11.5px] space-y-0.5">
                          <p className="font-bold text-slate-950 text-sm">
                            {client.type === 'professionnel' && client.companyName ? (
                              <>
                                {client.companyName}
                                <span className="text-[11px] font-normal text-slate-600 block">
                                  À l'attention de : {client.firstName} {client.lastName}
                                </span>
                              </>
                            ) : (
                              `${client.firstName} ${client.lastName}`
                            )}
                          </p>
                          <p className="text-slate-700">{client.address}</p>
                          <p className="text-slate-700 font-medium">
                            {client.postalCode} {client.city}
                          </p>
                          <p className="text-slate-600 text-[10.5px]">Tél : {client.phone}</p>
                          <p className="text-slate-600 text-[10.5px]">Email : {client.email}</p>
                          <p className="text-[9.5px] font-mono text-slate-500 pt-0.5">
                            Réf Client : CLI-{client.id.replace('cli-', '').padStart(4, '0')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Client non spécifié</p>
                      )}
                    </div>
                  </div>

                  {/* BANDEAU D'IDENTIFICATION DU DOCUMENT TYPE */}
                  <div
                    className="p-3 rounded-lg text-white flex flex-wrap items-center justify-between gap-3 shadow-xs"
                    style={{ backgroundColor: theme.documentHeaderColor }}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest block opacity-85">
                        DOCUMENT OFFICIEL DE FACTURATION TYPE
                      </span>
                      <h2 className="text-lg sm:text-xl font-black tracking-tight">
                        {typeLabel} N° {doc.referenceNumber}
                      </h2>
                    </div>

                    <div className="text-right text-[11px] space-y-0.5">
                      <p>
                        Date d'émission : <strong className="text-white">{formatDate(doc.date)}</strong>
                      </p>
                      <p>
                        Date de prestation : <strong className="text-white">{formatDate(doc.date)}</strong>
                      </p>
                      <p>
                        Mode de règlement :{' '}
                        <strong className="text-amber-300 font-bold">
                          {formatPaymentMethod(doc.paymentMethod)}
                        </strong>
                      </p>
                      {isQuote && doc.validityDate && (
                        <p>
                          Offre valable jusqu'au :{' '}
                          <strong className="text-amber-300">{formatDate(doc.validityDate)}</strong>
                        </p>
                      )}
                      {isInvoice && doc.dueDate && (
                        <p>
                          Date d'échéance :{' '}
                          <strong className="text-amber-300">{formatDate(doc.dueDate)}</strong>
                        </p>
                      )}
                      {doc.relatedQuoteId && (
                        <p className="text-[10px] text-slate-300">Réf devis d'origine associé</p>
                      )}
                    </div>
                  </div>

                  {/* CARTOUCHE TECHNIQUE VÉHICULE ATELIER (Norme Automobile) */}
                  <div className="p-2.5 rounded-lg bg-slate-100/90 border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-700">
                          {vehicle?.licensePlate || 'IMMATRICULATION'}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule Atelier'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500">Compteur : </span>
                        <strong className="text-slate-950 font-mono">
                          {(doc.mileageAtService || vehicle?.mileage || 0).toLocaleString('fr-FR')} km
                        </strong>
                      </div>
                      {vehicle?.fuelType && (
                        <div>
                          <span className="text-slate-500">Énergie : </span>
                          <strong className="uppercase">{vehicle.fuelType}</strong>
                        </div>
                      )}
                      {vehicle?.year && (
                        <div>
                          <span className="text-slate-500">Année : </span>
                          <strong>{vehicle.year}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TABLEAU DES LIGNES DE FACTURATION TYPE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11.5px] border border-slate-300">
                      <thead>
                        <tr
                          className="text-white text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: theme.documentHeaderColor }}
                        >
                          <th className="py-2 px-2.5 border-r border-slate-700">Réf.</th>
                          <th className="py-2 px-2.5 border-r border-slate-700">Désignation des Prestations & Fournitures</th>
                          <th className="py-2 px-2 text-right border-r border-slate-700 w-12">Qté</th>
                          <th className="py-2 px-2 text-right border-r border-slate-700 w-20">P.U. HT</th>
                          <th className="py-2 px-1.5 text-right border-r border-slate-700 w-12">Rem.</th>
                          <th className="py-2 px-2 text-right border-r border-slate-700 w-20">Total HT</th>
                          <th className="py-2 px-1.5 text-right border-r border-slate-700 w-12">TVA</th>
                          <th className="py-2 px-2.5 text-right w-24">Total TTC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {doc.items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-6 px-4 text-center text-slate-400 italic font-medium bg-white"
                            >
                              Aucune prestation ni pièce facturée sur ce document.
                            </td>
                          </tr>
                        ) : (
                          doc.items.map((it, idx) => {
                            const discount = it.discountPercent || 0;
                            const lineHT = it.quantity * it.unitPriceHT * (1 - discount / 100);
                            const rate = it.tvaRate || 20;
                            const lineTTC = lineHT * (1 + rate / 100);

                            return (
                            <tr
                              key={it.id || idx}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                            >
                              <td className="py-2 px-2.5 font-mono text-[10px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                                {it.reference || '—'}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 font-medium text-slate-800">
                                <span>{it.description}</span>
                                <span className="text-[9.5px] font-semibold text-slate-400 ml-1.5">
                                  {it.type === 'piece'
                                    ? '[Pièce]'
                                    : it.type === 'main_oeuvre'
                                    ? '[M.O]'
                                    : it.type === 'forfait'
                                    ? '[Forfait]'
                                    : ''}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-slate-800 tabular-nums">
                                {it.quantity.toLocaleString('fr-FR', {
                                  minimumFractionDigits: Number.isInteger(it.quantity) ? 0 : 2,
                                })}
                              </td>
                              <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-slate-700 tabular-nums">
                                {it.unitPriceHT.toFixed(2)} €
                              </td>
                              <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-slate-500 tabular-nums">
                                {discount > 0 ? `${discount}%` : '—'}
                              </td>
                              <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-semibold text-slate-900 tabular-nums">
                                {lineHT.toFixed(2)} €
                              </td>
                              <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-slate-600 tabular-nums text-[10.5px]">
                                {rate.toFixed(1)}%
                              </td>
                              <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                                {lineTTC.toFixed(2)} €
                              </td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </table>
                  </div>

                  {/* SOUS-TOTAUX & MODE DE RÈGLEMENT */}
                  <div className="grid grid-cols-12 gap-4 items-start pt-1 avoid-break">
                    {/* GAUCHE (Col 7) : Sous-totaux par nature + Mode de Règlement */}
                    <div className="col-span-7 space-y-3">
                      {/* Sous-totaux par nature de travail */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-slate-500 block">Total Pièces HT :</span>
                          <strong className="font-mono text-slate-800 text-[11px]">
                            {partsSubtotalHT.toFixed(2)} €
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total Main d'œuvre HT :</span>
                          <strong className="font-mono text-slate-800 text-[11px]">
                            {laborSubtotalHT.toFixed(2)} €
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Forfaits / Autre HT :</span>
                          <strong className="font-mono text-slate-800 text-[11px]">
                            {otherSubtotalHT.toFixed(2)} €
                          </strong>
                        </div>
                      </div>

                      {/* Mode de règlement */}
                      <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-300 text-xs space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                            Mode de règlement :
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white rounded-md border border-slate-300 font-bold text-slate-950 text-xs shadow-2xs">
                              {formatPaymentMethod(doc.paymentMethod)}
                            </span>
                            <select
                              value={doc.paymentMethod || 'carte'}
                              onChange={(e) => {
                                updateDocument(doc.id, {
                                  paymentMethod: e.target.value as any,
                                });
                              }}
                              className="no-print text-[11px] border border-slate-300 rounded px-2 py-0.5 bg-white text-slate-700 cursor-pointer hover:border-sky-500 focus:outline-hidden"
                              title="Modifier le mode de règlement de ce document"
                            >
                              <option value="carte">Carte Bancaire (CB)</option>
                              <option value="especes">Espèces</option>
                              <option value="cheque">Chèque</option>
                              <option value="virement">Virement bancaire</option>
                            </select>
                          </div>
                        </div>
                        {doc.notes && (
                          <div className="pt-2 border-t border-slate-200 text-[10.5px] text-slate-600">
                            <span className="font-semibold text-slate-700">Remarques atelier : </span>
                            <span className="italic">{doc.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DROITE (Col 5) : Grand Total TTC, Acompte & Reste à Payer */}
                    <div className="col-span-5 space-y-2">
                      <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-700">
                          <span>TOTAL GÉNÉRAL HT :</span>
                          <span className="font-mono font-bold tabular-nums">
                            {doc.totalHT.toFixed(2)} €
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>TOTAL TVA (20.0%) :</span>
                          <span className="font-mono tabular-nums">
                            {doc.totalTVA.toFixed(2)} €
                          </span>
                        </div>

                        {/* Grand Total TTC */}
                        <div
                          className="flex justify-between items-center text-white p-2.5 rounded font-black text-sm tracking-tight shadow-xs"
                          style={{ backgroundColor: theme.documentHeaderColor }}
                        >
                          <span>TOTAL TTC EN EUROS :</span>
                          <span className="font-mono text-base tabular-nums">
                            {doc.totalTTC.toFixed(2)} €
                          </span>
                        </div>

                        {/* Acomptes & Solde Reste à Payer */}
                        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                          {doc.amountPaid > 0 ? (
                            <>
                              <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                                <span>Acompte déjà versé :</span>
                                <span className="font-mono tabular-nums">
                                  -{doc.amountPaid.toFixed(2)} €
                                </span>
                              </div>
                              <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-300">
                                <span>NET À PAYER :</span>
                                <span className="font-mono text-base tabular-nums text-slate-950">
                                  {Math.max(0, doc.totalTTC - doc.amountPaid).toFixed(2)} €
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between font-black text-slate-900 text-sm">
                              <span>NET À PAYER :</span>
                              <span className="font-mono text-base tabular-nums">
                                {doc.totalTTC.toFixed(2)} €
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Mode de règlement */}
                        <div className="flex justify-between items-center text-slate-700 text-xs pt-1.5 border-t border-slate-200">
                          <span className="font-semibold text-slate-600 text-[11px]">Mode de règlement :</span>
                          <span className="font-bold text-slate-900 font-sans text-xs">
                            {formatPaymentMethod(doc.paymentMethod)}
                          </span>
                        </div>

                        {/* Tampon facture acquittée si payée */}
                        {isInvoice && doc.status === 'paye' && (
                          <div className="mt-2 p-1.5 text-center border-2 border-dashed border-emerald-600 rounded bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                            ✓ FACTURE ACQUITTÉE
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CADRES DE SIGNATURE ET BON POUR ACCORD TYPE */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300 text-[10px] avoid-break">
                    {/* Cadre Client */}
                    <div className="p-2.5 border border-slate-300 rounded bg-slate-50/50 flex flex-col justify-between h-20">
                      <p className="font-bold text-slate-800 uppercase text-[9px]">
                        {isQuote
                          ? 'Mention manuscrite « Bon pour accord et exécution des travaux » :'
                          : isOrder
                          ? 'Signature du Client valant bon de commande ferme :'
                          : 'Pour le Client — Réception conforme & Visa :'}
                      </p>
                      <div className="flex justify-between text-slate-400 text-[9px] pt-2 border-t border-slate-200">
                        <span>Date : ___________________</span>
                        <span>Signature :</span>
                      </div>
                    </div>

                    {/* Cadre Garage */}
                    <div className="p-2.5 border border-slate-300 rounded bg-slate-50/50 flex flex-col justify-between h-20 text-right">
                      <p className="font-bold text-slate-800 uppercase text-[9px]">
                        Pour l'Établissement — Cachet Commercial & Signature :
                      </p>
                      <div className="flex justify-between text-slate-400 text-[9px] pt-2 border-t border-slate-200">
                        <span>{garage.city}, le {new Date().toLocaleDateString('fr-FR')}</span>
                        <span>{garage.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 2. FICHE TECHNIQUE D'ATELIER (OR) -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'workshop_card' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      {garage.logoUrl && (
                        <img
                          src={garage.logoUrl}
                          alt={garage.name}
                          className="object-contain"
                          style={{ height: '48px', maxWidth: '130px' }}
                        />
                      )}
                      <div>
                        <h1 className="text-base font-black text-slate-900 uppercase">{garage.name}</h1>
                        <p className="text-[11px] text-slate-600">Atelier de Réparations Mécaniques & Électronique</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-3 py-1 bg-slate-900 text-white rounded font-black text-xs uppercase tracking-wider inline-block">
                        ORDRE DE RÉPARATION & FICHE ATELIER
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                        OR N° {doc.referenceNumber}
                      </p>
                      <p className="text-[10px] text-slate-500">Date : {formatDate(doc.date)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-100 rounded border border-slate-300 text-xs">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">
                        Véhicule Confié à l'Atelier
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-xs">
                          {vehicle?.licensePlate || 'N/A'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {vehicle?.brand} {vehicle?.model}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] mt-1">
                        Kilométrage relevé :{' '}
                        <strong>
                          {(doc.mileageAtService || vehicle?.mileage || 0).toLocaleString('fr-FR')} km
                        </strong>
                      </p>
                    </div>

                    <div>
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase block">
                        Client Propriétaire
                      </span>
                      <p className="font-bold text-slate-900 mt-1">
                        {client
                          ? client.type === 'professionnel'
                            ? client.companyName
                            : `${client.firstName} ${client.lastName}`
                          : 'Client inconnu'}
                      </p>
                      <p className="text-slate-700 text-[11px]">Tél : {client?.phone || '—'}</p>
                      <p className="text-slate-500 text-[10px]">{client?.address}, {client?.city}</p>
                    </div>
                  </div>

                  {/* Checklist des Contrôles de Sécurité */}
                  <div className="p-3 border border-amber-300 rounded bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Points de Contrôle Sécurité & Réception Atelier
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Plaquettes & Disques freins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Pression & État pneus</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Niveau huile moteur</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Liquide refroidissement</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Éclairage & Phares</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Test batterie & charge</span>
                      </div>
                    </div>
                  </div>

                  {/* Tableau des Prestations à Effectuer */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                      <span>Opérations Demandées & Pièces à Poser</span>
                    </h3>
                    <table className="w-full text-left border border-slate-300 text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-1.5 px-2.5 w-12 text-center">Fait</th>
                          <th className="py-1.5 px-2.5">Réf.</th>
                          <th className="py-1.5 px-2.5">Opération / Pièce</th>
                          <th className="py-1.5 px-2 text-right">Qté</th>
                          <th className="py-1.5 px-2.5 w-32">Visa Mécano</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {doc.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 px-2.5 text-center text-slate-400 italic">
                              Aucune opération ni pièce enregistrée.
                            </td>
                          </tr>
                        ) : (
                          doc.items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-2.5 text-center">
                                <span className="inline-block w-3.5 h-3.5 border border-slate-400 rounded-xs" />
                              </td>
                              <td className="py-2 px-2.5 font-mono text-[10.5px] text-slate-500">
                                {it.reference || '—'}
                              </td>
                              <td className="py-2 px-2.5 font-semibold text-slate-800">
                                {it.description}
                              </td>
                              <td className="py-2 px-2 text-right font-mono">{it.quantity}</td>
                              <td className="py-2 px-2.5 border-l border-slate-200" />
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300 text-xs">
                    <div className="p-2.5 border border-slate-300 rounded text-[10.5px]">
                      <span className="font-bold text-slate-800 block mb-0.5">Remarques Atelier :</span>
                      <p className="text-slate-600 italic">
                        {doc.notes || 'Consigner les pièces usagées au bac recyclage.'}
                      </p>
                    </div>
                    <div className="p-2.5 border border-slate-300 rounded flex flex-col justify-between h-20 text-[10px]">
                      <span className="font-bold text-slate-800">Autorisation de Réparation & Essais sur Route :</span>
                      <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-200">
                        <span>Date : _________</span>
                        <span>Signature client :</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 3. BON DE LIVRAISON / RESTITUTION VÉHICULE -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'handover' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b-2 border-emerald-600">
                    <div>
                      <h1 className="text-lg font-black text-slate-900 uppercase">{garage.name}</h1>
                      <p className="text-[11px] text-slate-600">{garage.address}, {garage.postalCode} {garage.city}</p>
                      <p className="text-[10px] text-slate-500">Tél : {garage.phone} · SIRET : {garage.siret}</p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-emerald-700 text-white rounded font-black text-xs uppercase tracking-wide inline-block">
                        BON DE RESTITUTION VÉHICULE
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                        Réf {doc.referenceNumber}
                      </p>
                      <p className="text-[10px] text-slate-500">Date : {formatDate(doc.date)}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-1">
                    <p className="text-emerald-950 font-bold">
                      Procès-Verbal de Réception Conforme des Travaux
                    </p>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      Le garage <strong>{garage.name}</strong> certifie la bonne exécution des travaux d’entretien et réparations mécaniques convenus sur le véhicule{' '}
                      <strong>{vehicle?.brand} {vehicle?.model} ({vehicle?.licensePlate})</strong>, pour le compte de{' '}
                      <strong>{client ? (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'Client'}</strong>.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase mb-1.5">
                      Synthèse des Prestations & Pièces Remplacées
                    </h3>
                    <ul className="divide-y divide-slate-200 border border-slate-300 rounded text-xs">
                      {doc.items.map((it, idx) => (
                        <li key={idx} className="p-2 flex items-center justify-between hover:bg-slate-50">
                          <span className="font-medium text-slate-800">{it.description}</span>
                          <span className="text-slate-500 font-mono text-[11px]">Qté : {it.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between">
                    <span>Restitution des anciennes pièces usagées : <strong>Déposées / Recyclage agréé</strong></span>
                    <span className="font-mono text-slate-700">
                      Kilométrage sortie : <strong>{(doc.mileageAtService || vehicle?.mileage || 0).toLocaleString('fr-FR')} km</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-300 text-xs">
                    <div className="p-3 border border-slate-300 rounded flex flex-col justify-between h-24 text-[10px]">
                      <p className="font-bold text-slate-800">Signature du Client « Reçu véhicule & clés en bon état » :</p>
                      <p className="text-slate-400">Date et Signature :</p>
                    </div>
                    <div className="p-3 border border-slate-300 rounded flex flex-col justify-between h-24 text-right text-[10px]">
                      <p className="font-bold text-slate-800">Cachet de l'Atelier & Visa Restitution :</p>
                      <p className="text-slate-400">{garage.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 4. COMMANDE FOURNISSEUR TYPE A4 -------------------- */}
              {isSupplierOrder && supOrder && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-4 border-b-2 border-sky-600">
                    <div className="flex items-start gap-4">
                      {garage.logoUrl && (
                        <img
                          src={garage.logoUrl}
                          alt={garage.name}
                          className="object-contain"
                          style={{ width: `${garage.logoSize || 130}px`, height: 'auto' }}
                        />
                      )}
                      <div>
                        <h1 className="text-lg font-black text-slate-900 uppercase">{garage.name}</h1>
                        <p className="text-xs text-slate-600">{garage.address}, {garage.postalCode} {garage.city}</p>
                        <p className="text-xs text-slate-500">Tél : {garage.phone} · SIRET : {garage.siret}</p>
                        <p className="text-[10px] text-slate-500">N° TVA : {garage.tvaNumber}</p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="px-3 py-1.5 rounded bg-sky-700 text-white inline-block text-left sm:text-right mb-1">
                        <span className="text-[9px] tracking-widest font-semibold block uppercase opacity-85">
                          APPROVISIONNEMENT PIÈCES
                        </span>
                        <span className="text-lg font-black tracking-tight">
                          BON DE COMMANDE FOURNISSEUR
                        </span>
                      </div>
                      <p className="text-sm font-bold font-mono text-slate-900">
                        N° {supOrder.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Date de commande : <strong>{formatDate(supOrder.orderDate)}</strong>
                      </p>
                      {supOrder.deliveryDate && (
                        <p className="text-[11px] text-slate-600">
                          Livraison souhaitée : <strong>{formatDate(supOrder.deliveryDate)}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded bg-sky-50 border border-sky-200">
                      <span className="text-[9.5px] font-bold uppercase text-sky-800 block mb-1">
                        Fournisseur Destinataire :
                      </span>
                      {supplier ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm">{supplier.name}</p>
                          <p className="text-slate-600">{supplier.address}</p>
                          <p className="text-slate-600">Tél : {supplier.phone} · Email : {supplier.email}</p>
                          <p className="text-[10px] text-slate-500 pt-0.5">Conditions : {supplier.paymentTerms}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Fournisseur inconnu</p>
                      )}
                    </div>

                    <div className="p-3 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[9.5px] font-bold uppercase text-slate-500 block mb-1">
                        Adresse de Livraison Atelier :
                      </span>
                      <p className="font-bold text-slate-900">{garage.name}</p>
                      <p className="text-slate-600">{garage.address}, {garage.postalCode} {garage.city}</p>
                      <p className="text-slate-600">Réception atelier : Tél {garage.phone}</p>
                      <p className="text-[10px] text-slate-500">Horaires : 08h00 - 18h30</p>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-sky-700 text-white text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2 px-2.5">Réf Fournisseur</th>
                        <th className="py-2 px-2.5">Désignation Pièce / Consommable</th>
                        <th className="py-2 px-2 text-right">Qté</th>
                        <th className="py-2 px-2 text-right">P.U. Achat HT</th>
                        <th className="py-2 px-2 text-right">TVA</th>
                        <th className="py-2 px-2.5 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {supOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-mono text-[10.5px] font-bold text-slate-700">
                            {it.reference}
                          </td>
                          <td className="py-2 px-2.5 font-medium text-slate-800">{it.description}</td>
                          <td className="py-2 px-2 text-right font-bold text-slate-900">{it.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-700">{it.unitCostHT.toFixed(2)} €</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{it.tvaRate}%</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            {(it.quantity * it.unitCostHT).toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-between items-start pt-2 border-t border-slate-300 text-xs">
                    <div className="w-1/2 text-[10.5px] text-slate-500 italic">
                      {supOrder.notes || 'Commande d’approvisionnement soumise à nos conditions générales d’achat.'}
                    </div>
                    <div className="w-64 p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Total Achat HT :</span>
                        <span className="font-mono font-bold">{supOrder.totalHT.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>TVA Déductible (20%) :</span>
                        <span className="font-mono">{supOrder.totalTVA.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center bg-sky-700 text-white p-2 rounded font-black text-sm">
                        <span>TOTAL TTC :</span>
                        <span className="font-mono">{supOrder.totalTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10.5px]">
                    <div>
                      <p className="text-slate-500">Service Approvisionnement & Pièces :</p>
                      <p className="font-bold text-slate-800">{garage.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="border-b border-slate-300 pb-6 w-44 text-slate-400">Signature autorisée :</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FIN DU CONTENU DOCUMENT */}
            </div>
          </div>

          {/* Bottom Action Bar on Desk for easy access */}
          <div className="w-full max-w-[210mm] mt-4 mb-8 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/95 backdrop-blur-xs rounded-xl border border-slate-300 shadow-md no-print">
            <div className="text-xs text-slate-700 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Feuille prête pour l'impression A4 :</span>{' '}
                <span className="text-slate-600">Cliquez sur « Imprimer » ou utilisez <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-800">Ctrl + P</kbd></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                title="Télécharger la feuille A4 pour l'imprimer sans contrainte de navigateur"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Télécharger la Feuille</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
                title="Lancer l'impression directe de cette feuille A4"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer cette Feuille A4</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
