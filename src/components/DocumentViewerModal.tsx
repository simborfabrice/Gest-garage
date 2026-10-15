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
  Wrench,
  CheckSquare,
  ShieldCheck,
  FileCheck,
  Download,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { printElement, downloadPrintableHtml } from '../utils/printUtils';

type ViewLayoutMode = 'official' | 'workshop_card' | 'handover';

export const DocumentViewerModal: React.FC = () => {
  const {
    viewingDocument,
    setViewingDocument,
    viewingSupplierOrder,
    setViewingSupplierOrder,
    setEditingDocument,
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

  const [layoutMode, setLayoutMode] = useState<ViewLayoutMode>('official');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showMarginGuide, setShowMarginGuide] = useState<boolean>(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  // If neither a garage document nor a supplier order is active, return null
  if (!viewingDocument && !viewingSupplierOrder) return null;

  const isSupplierOrder = !!viewingSupplierOrder && !viewingDocument;

  // Handles for Garage Document
  const doc = viewingDocument;
  const client = doc ? clients.find((c) => c.id === doc.clientId) : undefined;
  const vehicle = doc ? vehicles.find((v) => v.id === doc.vehicleId) : undefined;

  const isQuote = doc?.type === 'devis';
  const isOrder = doc?.type === 'bon_commande';
  const isInvoice = doc?.type === 'facture';

  const typeLabel = isQuote ? 'DEVIS' : isOrder ? 'BON DE COMMANDE' : 'FACTURE';

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
        "Ordre d'impression envoyé. Si votre navigateur bloque la fenêtre popup, utilisez le bouton « Télécharger la feuille »."
    );
    setTimeout(() => setPrintFeedback(null), 8000);
  };

  const handleDownloadHtml = () => {
    const ok = downloadPrintableHtml(
      'printable-document',
      currentDocFilename,
      currentDocTitle
    );
    if (ok) {
      setPrintFeedback(
        "Fichier de la feuille téléchargé ! Vous pouvez l'ouvrir directement dans votre navigateur pour l'imprimer sans aucune restriction."
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xs p-1 sm:p-3 overflow-y-auto no-print">
      <div className="relative w-full max-w-6xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-2 flex flex-col max-h-[98vh]">
        {/* Top Control Bar (Never printed) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900 text-white shrink-0 no-print">
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

            {/* A4 Format Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aperçu Feuille A4 (210 × 297 mm)</span>
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
            {/* View Layout Mode (Official / Workshop Card / Handover) */}
            {!isSupplierOrder && doc && (
              <div className="hidden lg:flex items-center gap-0.5 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLayoutMode('official')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    layoutMode === 'official'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Document officiel pour le client avec tarifs et mentions"
                >
                  Officiel
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('workshop_card')}
                  className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
                    layoutMode === 'workshop_card'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Fiche technique pour les mécaniciens avec checklist de contrôle"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>Fiche Atelier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('handover')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    layoutMode === 'handover'
                      ? 'bg-slate-700 text-white shadow-2xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bon de restitution du véhicule et des clés"
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
                title="Modifier les lignes, prix ou informations de ce document"
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

            {/* Download Standalone HTML/PDF Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors"
              title="Télécharger la feuille au format prêt à imprimer (ouvre directement l'impression dans votre navigateur)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Télécharger la Feuille</span>
            </button>

            {/* Primary Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              title="Lancer l'impression directe de la feuille A4"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
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
            <button
              onClick={() => setPrintFeedback(null)}
              className="text-emerald-300 hover:text-white text-[11px] underline"
            >
              Masquer
            </button>
          </div>
        )}

        {/* Realistic Paper Desk Workspace */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-slate-300/80 flex flex-col items-center justify-start">
          {/* Header of the physical sheet */}
          <div className="w-full max-w-[210mm] flex items-center justify-between text-xs text-slate-600 mb-2 px-1 no-print">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Feuille A4 prête pour l'impression (210 × 297 mm)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Échelle : {zoomLevel}%</span>
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
              className={`w-full min-h-[297mm] mx-auto bg-white shadow-2xl ring-1 ring-slate-900/15 text-slate-900 text-xs sm:text-[13px] relative flex flex-col justify-between rounded-xs ${
                showMarginGuide ? 'outline-2 outline-dashed outline-emerald-500' : ''
              }`}
              style={{
                padding: '16mm 18mm',
                boxSizing: 'border-box',
              }}
            >
              {/* Optional Visual Margin Guide Helper Banner */}
              {showMarginGuide && (
                <div className="print-guide-margin absolute top-1 left-2 text-[9px] font-mono text-emerald-600 font-bold opacity-75">
                  [Guide de marge A4 : zone d’impression standard 15 mm]
                </div>
              )}

              {/* -------------------- 1. GARAGE DOCUMENT (OFFICIAL) -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'official' && (
                <div className="space-y-6">
                  {/* Header: Garage Logo & Details vs Document Type Box */}
                  <div
                    className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2"
                    style={{ borderColor: theme.documentHeaderColor }}
                  >
                    {/* Left: Logo & Garage identity */}
                    <div className="flex items-start gap-4">
                      {garage.logoUrl ? (
                        <img
                          src={garage.logoUrl}
                          alt={garage.name}
                          className="object-contain shrink-0 bg-transparent"
                          style={{
                            width: `${garage.logoSize || 140}px`,
                            maxHeight: `${Math.round((garage.logoSize || 140) * 1.15)}px`,
                            height: 'auto',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            background: 'transparent',
                          }}
                        />
                      ) : (
                        <div
                          className="bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 shrink-0"
                          style={{
                            width: `${garage.logoSize || 140}px`,
                            height: `${Math.min(garage.logoSize || 140, 140)}px`,
                          }}
                        >
                          <FileText className="w-10 h-10" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {garage.name}
                        </h1>
                        {garage.slogan && (
                          <p className="text-xs font-medium text-slate-600 mt-0.5">
                            {garage.slogan}
                          </p>
                        )}
                        <div className="text-xs text-slate-500 mt-2 space-y-0.5 leading-relaxed">
                          <p>
                            {garage.address}, {garage.postalCode} {garage.city}
                          </p>
                          <p>
                            Tél :{' '}
                            <span className="font-semibold text-slate-700">
                              {garage.phone}
                            </span>{' '}
                            · Email : {garage.email}
                          </p>
                          <p>
                            SIRET : {garage.siret} · N° TVA : {garage.tvaNumber}
                          </p>
                          {garage.nafCode && <p>Code NAF : {garage.nafCode}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Right: Document Identity Banner */}
                    <div className="sm:text-right shrink-0 w-full sm:w-auto">
                      <div
                        className="px-4 py-2 rounded text-white inline-block text-left sm:text-right mb-2 shadow-xs"
                        style={{ backgroundColor: theme.documentHeaderColor }}
                      >
                        <span className="text-[10px] tracking-widest font-semibold block uppercase opacity-85">
                          DOCUMENT OFFICIEL
                        </span>
                        <span className="text-xl sm:text-2xl font-black tracking-tight">
                          {typeLabel}
                        </span>
                      </div>
                      <p className="text-base font-bold font-mono text-slate-900">
                        N° {doc.referenceNumber}
                      </p>
                      <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                        <p>
                          Date d'émission :{' '}
                          <span className="font-semibold text-slate-900">
                            {formatDate(doc.date)}
                          </span>
                        </p>
                        {isQuote && doc.validityDate && (
                          <p>
                            Validité jusqu'au :{' '}
                            <span className="font-semibold text-slate-900">
                              {formatDate(doc.validityDate)}
                            </span>
                          </p>
                        )}
                        {isInvoice && doc.dueDate && (
                          <p>
                            Date d'échéance :{' '}
                            <span className="font-semibold text-slate-900">
                              {formatDate(doc.dueDate)}
                            </span>
                          </p>
                        )}
                        {doc.relatedQuoteId && (
                          <p className="text-[11px] text-slate-400">
                            Réf devis associé
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recipient Client & Vehicle Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    {/* Client Box */}
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        CLIENT DESTINATAIRE
                      </span>
                      {client ? (
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className="font-bold text-slate-900 text-base">
                            {client.type === 'professionnel' && client.companyName ? (
                              <>
                                {client.companyName}
                                <span className="text-xs font-normal text-slate-500 block">
                                  Attn: {client.firstName} {client.lastName}
                                </span>
                              </>
                            ) : (
                              `${client.firstName} ${client.lastName}`
                            )}
                          </p>
                          <p className="text-slate-600">{client.address}</p>
                          <p className="text-slate-600">
                            {client.postalCode} {client.city}
                          </p>
                          <p className="text-slate-600">Tél : {client.phone}</p>
                          <p className="text-slate-600">Email : {client.email}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Client non renseigné</p>
                      )}
                    </div>

                    {/* Vehicle Box */}
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        VÉHICULE CONCERNÉ
                      </span>
                      {vehicle ? (
                        <div className="text-xs sm:text-sm space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white tracking-widest border border-slate-700">
                              {vehicle.licensePlate}
                            </span>
                            <span className="font-semibold text-slate-900 text-sm">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                            <p>
                              Année :{' '}
                              <span className="font-semibold text-slate-800">
                                {vehicle.year}
                              </span>
                            </p>
                            <p>
                              Énergie :{' '}
                              <span className="font-semibold text-slate-800 uppercase">
                                {vehicle.fuelType}
                              </span>
                            </p>
                            <p className="col-span-2">
                              VIN :{' '}
                              <span className="font-mono text-[11px] text-slate-700">
                                {vehicle.vin}
                              </span>
                            </p>
                            <p className="col-span-2">
                              Kilométrage relevé :{' '}
                              <span className="font-bold text-slate-900">
                                {(doc.mileageAtService || vehicle.mileage).toLocaleString('fr-FR')}{' '}
                                km
                              </span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Aucun véhicule rattaché</p>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr
                          className="text-white text-[11px] font-semibold uppercase tracking-wider"
                          style={{ backgroundColor: theme.documentHeaderColor }}
                        >
                          <th className="py-2.5 px-3 rounded-l">Réf.</th>
                          <th className="py-2.5 px-3">Désignation des Prestations & Pièces</th>
                          <th className="py-2.5 px-3 text-right">Qté</th>
                          <th className="py-2.5 px-3 text-right">P.U. HT</th>
                          <th className="py-2.5 px-3 text-right">Rem.</th>
                          <th className="py-2.5 px-3 text-right">TVA</th>
                          <th className="py-2.5 px-3 text-right rounded-r">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {doc.items.map((it, idx) => {
                          const lineHT =
                            it.quantity *
                            it.unitPriceHT *
                            (1 - (it.discountPercent || 0) / 100);
                          return (
                            <tr
                              key={it.id || idx}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                            >
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                {it.reference || '—'}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {it.description}
                                <span className="text-[10px] text-slate-400 ml-2">
                                  {it.type === 'piece'
                                    ? '(Pièce)'
                                    : it.type === 'main_oeuvre'
                                    ? '(M.O)'
                                    : it.type === 'forfait'
                                    ? '(Forfait)'
                                    : ''}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                                {it.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                                {it.unitPriceHT.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                                {it.discountPercent ? `${it.discountPercent}%` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                                {it.tvaRate}%
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                                {lineHT.toFixed(2)} €
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals & Breakdown */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-3 border-t border-slate-200 avoid-break">
                    {/* Payment details & notes */}
                    <div className="w-full sm:w-1/2 space-y-3 text-xs">
                      {doc.notes && (
                        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
                          <span className="font-semibold block mb-0.5">Remarques Atelier :</span>
                          <p>{doc.notes}</p>
                        </div>
                      )}

                      <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                        <p className="font-semibold text-slate-800">Modalités de règlement :</p>
                        <p>Moyens acceptés : Espèces, Carte Bancaire, Virement bancaire, Chèque.</p>
                        {garage.bankIban && (
                          <p className="font-mono text-[11px] bg-slate-100 p-2 rounded border border-slate-200 text-slate-800">
                            IBAN : {garage.bankIban}
                            <br />
                            BIC : {garage.bankBic}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Totals Summary Box */}
                    <div className="w-full sm:w-72 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Total Pièces HT :</span>
                        <span className="font-mono font-medium tabular-nums">
                          {doc.totalPartsHT.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Total Main d'œuvre HT :</span>
                        <span className="font-mono font-medium tabular-nums">
                          {doc.totalLaborHT.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-900 pt-1 border-t border-slate-200">
                        <span>TOTAL HT :</span>
                        <span className="font-mono tabular-nums">{doc.totalHT.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>TVA (20.0%) :</span>
                        <span className="font-mono tabular-nums">{doc.totalTVA.toFixed(2)} €</span>
                      </div>
                      <div
                        className="flex justify-between items-center text-white p-2.5 rounded font-bold text-sm tracking-tight shadow-xs"
                        style={{ backgroundColor: theme.documentHeaderColor }}
                      >
                        <span>TOTAL TTC :</span>
                        <span className="font-mono text-base tabular-nums">
                          {doc.totalTTC.toFixed(2)} €
                        </span>
                      </div>

                      {doc.amountPaid > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Acompte / Déjà réglé :</span>
                            <span className="font-mono tabular-nums">
                              -{doc.amountPaid.toFixed(2)} €
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-900 text-xs">
                            <span>RESTE À PAYER :</span>
                            <span className="font-mono tabular-nums">
                              {Math.max(0, doc.totalTTC - doc.amountPaid).toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client & Garage Signature Zone */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs avoid-break">
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-col justify-between h-24">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {isQuote
                          ? 'Pour le Client — Mention manuscrite « Bon pour accord »'
                          : 'Pour le Client — Reçu conforme & Signature'}
                      </p>
                      <p className="text-[10px] text-slate-400">Date : ____________</p>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-col justify-between h-24 text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Pour l'Établissement — Cachet & Signature
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {garage.name} · Responsable d'atelier
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 2. FICHE D'ATELIER / ORDRE DE RÉPARATION (OR) -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'workshop_card' && (
                <div className="space-y-6">
                  {/* Header: Garage + Workshop Card Title */}
                  <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      {garage.logoUrl && (
                        <img
                          src={garage.logoUrl}
                          alt={garage.name}
                          className="object-contain"
                          style={{
                            height: '50px',
                            maxWidth: '140px',
                          }}
                        />
                      )}
                      <div>
                        <h1 className="text-lg font-black text-slate-900">{garage.name}</h1>
                        <p className="text-xs text-slate-500">Service Technique & Atelier Mécanique</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-3 py-1 bg-slate-900 text-white rounded font-black text-sm tracking-wide uppercase inline-block">
                        ORDRE DE RÉPARATION (OR)
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                        OR N° {doc.referenceNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">Date : {formatDate(doc.date)}</p>
                    </div>
                  </div>

                  {/* Vehicle & Customer Identity */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Véhicule Pris en Charge
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-sm">
                          {vehicle?.licensePlate || 'N/A'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {vehicle?.brand} {vehicle?.model}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Compteur relevé :{' '}
                        <strong className="text-slate-900">
                          {(doc.mileageAtService || vehicle?.mileage || 0).toLocaleString('fr-FR')}{' '}
                          km
                        </strong>
                      </p>
                      <p className="text-slate-500 text-[11px]">VIN : {vehicle?.vin || '—'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Client Propriétaire
                      </span>
                      <p className="font-bold text-slate-900 mt-1">
                        {client
                          ? client.type === 'professionnel'
                            ? client.companyName
                            : `${client.firstName} ${client.lastName}`
                          : 'Client inconnu'}
                      </p>
                      <p className="text-slate-600">Tél : {client?.phone || '—'}</p>
                      <p className="text-slate-500 text-[11px]">
                        Adresse : {client?.address}, {client?.city}
                      </p>
                    </div>
                  </div>

                  {/* Checklist Points de Sécurité Obligatoires */}
                  <div className="p-4 border border-slate-300 rounded-lg bg-amber-50/40">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Checklist Points de Contrôle Sécurité & Réception Atelier
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Contrôle freinage AV/AR</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Pression & Usure pneus</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Niveau huile moteur</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Liquide refroidissement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Éclairage & Signalisation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Test batterie & charge</span>
                      </div>
                    </div>
                  </div>

                  {/* Table of operations to perform */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                      <span>Travaux & Opérations Demandées</span>
                    </h3>
                    <table className="w-full text-left border border-slate-200 text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3 w-12 text-center">Fait</th>
                          <th className="py-2 px-3">Réf</th>
                          <th className="py-2 px-3">Opération / Pièce à poser</th>
                          <th className="py-2 px-3 text-right">Qté</th>
                          <th className="py-2 px-3 w-32">Visa Mécano</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {doc.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-block w-4 h-4 border border-slate-400 rounded-sm" />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              {it.reference || '—'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {it.description}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{it.quantity}</td>
                            <td className="py-2.5 px-3 border-l border-slate-200" />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Workshop observations and customer consent */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
                    <div className="p-3 border border-slate-300 rounded-lg space-y-1">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Remarques & Diagnostic Mécanicien :
                      </span>
                      <p className="text-slate-600 text-xs italic">
                        {doc.notes ||
                          'Véhicule réceptionné propre. Déposer les pièces remplacées dans le bac consigne.'}
                      </p>
                    </div>

                    <div className="p-3 border border-slate-300 rounded-lg flex flex-col justify-between h-28">
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">
                          Autorisation de Réparation & Décharge :
                        </span>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          J'autorise le garage à effectuer les travaux décrits et à procéder aux
                          essais sur route nécessaires.
                        </p>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                        <span>Date : ____________</span>
                        <span>Signature client :</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 3. BON DE LIVRAISON / RESTITUTION VÉHICULE -------------------- */}
              {!isSupplierOrder && doc && layoutMode === 'handover' && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between pb-4 border-b-2 border-emerald-600">
                    <div>
                      <h1 className="text-xl font-black text-slate-900">{garage.name}</h1>
                      <p className="text-xs text-slate-500">
                        {garage.address}, {garage.postalCode} {garage.city}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tél : {garage.phone} · SIRET : {garage.siret}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-emerald-700 text-white rounded font-black text-sm tracking-wide uppercase inline-block">
                        BON DE RESTITUTION VÉHICULE
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                        Réf {doc.referenceNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">Date : {formatDate(doc.date)}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs space-y-2">
                    <p className="text-emerald-950 font-bold text-sm">
                      Procès-Verbal de Réception Conforme des Travaux
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      Le garage <strong>{garage.name}</strong> certifie la bonne exécution des
                      travaux d’entretien et réparations mécaniques convenus sur le véhicule{' '}
                      <strong>
                        {vehicle?.brand} {vehicle?.model} (immatriculé {vehicle?.licensePlate})
                      </strong>
                      , pour le compte de{' '}
                      <strong>
                        {client
                          ? client.type === 'professionnel'
                            ? client.companyName
                            : `${client.firstName} ${client.lastName}`
                          : 'Client'}
                      </strong>
                      .
                    </p>
                  </div>

                  {/* Summary of services performed */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs uppercase mb-2">
                      Synthèse des Prestations & Pièces Remplacées
                    </h3>
                    <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
                      {doc.items.map((it, idx) => (
                        <li
                          key={idx}
                          className="p-2.5 flex items-center justify-between hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-medium text-slate-800">{it.description}</span>
                          </div>
                          <span className="text-slate-500 text-[11px]">
                            Quantité : <strong>{it.quantity}</strong>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Old parts handover */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <span>
                      Restitution des anciennes pièces usagées au client :{' '}
                      <strong>Effectuée / Déchetterie agréée</strong>
                    </span>
                    <span className="font-mono text-slate-600">
                      Kilométrage sortie :{' '}
                      <strong>
                        {(doc.mileageAtService || vehicle?.mileage || 0).toLocaleString('fr-FR')} km
                      </strong>
                    </span>
                  </div>

                  {/* Double signature */}
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                    <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between h-32">
                      <p className="font-bold text-slate-800">
                        Signature du Client « Reçu véhicule & clés en bon état » :
                      </p>
                      <p className="text-[10px] text-slate-400">Date et Signature :</p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between h-32 text-right">
                      <p className="font-bold text-slate-800">
                        Cachet de l'Atelier & Visa Restitution :
                      </p>
                      <p className="text-[10px] text-slate-400">{garage.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- 4. SUPPLIER PURCHASE ORDER A4 -------------------- */}
              {isSupplierOrder && supOrder && (
                <div className="space-y-6">
                  {/* Header: Garage Logo & Supplier Order Title */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-sky-600">
                    <div className="flex items-start gap-4">
                      {garage.logoUrl && (
                        <img
                          src={garage.logoUrl}
                          alt={garage.name}
                          className="object-contain"
                          style={{
                            width: `${garage.logoSize || 140}px`,
                            maxHeight: `${Math.round((garage.logoSize || 140) * 1.15)}px`,
                            height: 'auto',
                          }}
                        />
                      )}
                      <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {garage.name}
                        </h1>
                        <p className="text-xs font-medium text-slate-600">
                          {garage.address}, {garage.postalCode} {garage.city}
                        </p>
                        <p className="text-xs text-slate-500">
                          Tél : {garage.phone} · Email : {garage.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          SIRET : {garage.siret} · TVA : {garage.tvaNumber}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="px-4 py-2 rounded bg-sky-700 text-white inline-block text-left sm:text-right mb-2 shadow-xs">
                        <span className="text-[10px] tracking-widest font-semibold block uppercase opacity-85">
                          APPROVISIONNEMENT PIÈCES
                        </span>
                        <span className="text-xl sm:text-2xl font-black tracking-tight">
                          BON DE COMMANDE
                        </span>
                      </div>
                      <p className="text-base font-bold font-mono text-slate-900">
                        N° {supOrder.orderNumber}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Date de commande :{' '}
                        <strong className="text-slate-900">{formatDate(supOrder.orderDate)}</strong>
                      </p>
                      {supOrder.deliveryDate && (
                        <p className="text-xs text-slate-600">
                          Livraison souhaitée :{' '}
                          <strong className="text-slate-900">
                            {formatDate(supOrder.deliveryDate)}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Supplier & Delivery Address Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                    <div className="p-4 rounded-lg bg-sky-50/60 border border-sky-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                        FOURNISSEUR DESTINATAIRE
                      </span>
                      {supplier ? (
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className="font-bold text-slate-900 text-base">{supplier.name}</p>
                          <p className="text-slate-600">{supplier.address}</p>
                          <p className="text-slate-600">Tél : {supplier.phone}</p>
                          <p className="text-slate-600">Email : {supplier.email}</p>
                          <p className="text-slate-500 text-[11px] pt-1">
                            Conditions de règlement : {supplier.paymentTerms}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Fournisseur non spécifié</p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        ADRESSE DE LIVRAISON ATELIER
                      </span>
                      <div className="text-xs sm:text-sm space-y-1">
                        <p className="font-bold text-slate-900 text-base">{garage.name}</p>
                        <p className="text-slate-600">{garage.address}</p>
                        <p className="text-slate-600">
                          {garage.postalCode} {garage.city}
                        </p>
                        <p className="text-slate-600">
                          Réception atelier : Tél {garage.phone}
                        </p>
                        <p className="text-slate-500 text-[11px] pt-1">
                          Horaires livraison : Lundi au Vendredi 08h00 - 18h30
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Ordered Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-sky-700 text-white text-[11px] font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3 rounded-l">Réf Fournisseur</th>
                          <th className="py-2.5 px-3">Désignation Pièce / Consommable</th>
                          <th className="py-2.5 px-3 text-right">Qté</th>
                          <th className="py-2.5 px-3 text-right">P.U. Achat HT</th>
                          <th className="py-2.5 px-3 text-right">TVA</th>
                          <th className="py-2.5 px-3 text-right rounded-r">Total HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {supOrder.items.map((it, idx) => {
                          const lineHT = it.quantity * it.unitCostHT;
                          return (
                            <tr key={it.id || idx} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-700">
                                {it.reference}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {it.description}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-800 font-bold">
                                {it.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                                {it.unitCostHT.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                                {it.tvaRate}%
                              </td>
                              <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                                {lineHT.toFixed(2)} €
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-3 border-t border-slate-200">
                    <div className="w-full sm:w-1/2 space-y-2 text-xs">
                      {supOrder.notes && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950">
                          <span className="font-semibold block mb-0.5">Instructions :</span>
                          <p>{supOrder.notes}</p>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 italic">
                        Commande ferme soumise à nos conditions générales d'achat atelier.
                      </p>
                    </div>

                    <div className="w-full sm:w-72 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Total Achat HT :</span>
                        <span className="font-mono font-bold tabular-nums">
                          {supOrder.totalHT.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>TVA Récupérable (20%) :</span>
                        <span className="font-mono tabular-nums">
                          {supOrder.totalTVA.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-white p-2.5 rounded font-bold text-sm bg-sky-700 shadow-xs">
                        <span>TOTAL TTC :</span>
                        <span className="font-mono text-base tabular-nums">
                          {supOrder.totalTTC.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                    <div>
                      <p className="text-slate-500 text-[11px]">
                        Bon émis par le Responsable des Pièces & Approvisionnement
                      </p>
                      <p className="font-semibold text-slate-800">{garage.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="border-b border-slate-300 pb-8 w-48 text-[11px] text-slate-400">
                        Signature autorisée :
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory Legal Footer for All Documents */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-[9.5px] text-slate-500 text-center leading-relaxed avoid-break">
                <p>
                  {garage.legalNotes ||
                    'En cas de retard de paiement, une indemnité forfaitaire pour frais de recouvrement de 40 € sera due (art. D. 441-5 du Code de commerce).'}
                </p>
                <p className="mt-1 font-semibold text-slate-600">
                  {garage.name} · SIRET {garage.siret} · TVA {garage.tvaNumber} · {garage.address},{' '}
                  {garage.postalCode} {garage.city} · Tél {garage.phone}
                </p>
                <div className="flex justify-between items-center text-[8.5px] text-slate-400 mt-2 border-t border-slate-100 pt-1">
                  <span>Format Standard A4 Portrait (210 × 297 mm)</span>
                  <span>Page 1 / 1</span>
                  <span>Édité le {new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
