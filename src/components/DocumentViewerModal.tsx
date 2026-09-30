import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { GarageDocument } from '../types';
import { formatDate } from '../utils/dateUtils';

export const DocumentViewerModal: React.FC = () => {
  const {
    viewingDocument,
    setViewingDocument,
    garage,
    updateGarage,
    theme,
    clients,
    vehicles,
    convertQuoteToOrder,
    convertOrderToInvoice,
    setActiveTab,
  } = useApp();

  if (!viewingDocument) return null;

  const doc = viewingDocument;
  const client = clients.find((c) => c.id === doc.clientId);
  const vehicle = vehicles.find((v) => v.id === doc.vehicleId);

  const isQuote = doc.type === 'devis';
  const isOrder = doc.type === 'bon_commande';
  const isInvoice = doc.type === 'facture';

  const typeLabel = isQuote ? 'DEVIS' : isOrder ? 'BON DE COMMANDE' : 'FACTURE';

  const handlePrint = () => {
    window.print();
  };

  const handleConvertToOrder = () => {
    const newDoc = convertQuoteToOrder(doc.id);
    if (newDoc) {
      setViewingDocument(newDoc);
    }
  };

  const handleConvertToInvoice = () => {
    const newDoc = convertOrderToInvoice(doc.id);
    if (newDoc) {
      setViewingDocument(newDoc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Never printed) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-100 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded text-white"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {typeLabel} #{doc.referenceNumber}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Client : {client ? (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Workflow transformation buttons */}
            {isQuote && doc.status !== 'refuse' && (
              <button
                type="button"
                onClick={handleConvertToOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Transformer ce devis en bon de commande officiel"
              >
                <span>Convertir en Bon de Commande</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isOrder && (
              <button
                type="button"
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Émettre la facture finale à partir de ce bon"
              >
                <span>Générer la Facture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isInvoice && doc.status !== 'paye' && (
              <button
                type="button"
                onClick={() => {
                  setViewingDocument(null);
                  setActiveTab('cash');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <span>Encaisser en Caisse</span>
              </button>
            )}

            {/* Redimensionnement direct du logo sur le document */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium text-[11px]">Taille logo :</span>
              <button
                type="button"
                onClick={() => updateGarage({ logoSize: Math.max((garage.logoSize || 140) - 15, 50) })}
                className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 shadow-2xs"
                title="Diminuer la taille du logo"
              >
                -
              </button>
              <span className="font-mono font-bold text-slate-800 text-[11px] w-12 text-center tabular-nums">
                {garage.logoSize || 140}px
              </span>
              <button
                type="button"
                onClick={() => updateGarage({ logoSize: Math.min((garage.logoSize || 140) + 15, 320) })}
                className="w-6 h-6 flex items-center justify-center bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 shadow-2xs"
                title="Agrandir la taille du logo"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setViewingDocument(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50">
          <div
            id="printable-document"
            className="w-full max-w-[210mm] mx-auto bg-white p-8 sm:p-10 shadow-lg border border-slate-200 rounded-sm text-slate-800 text-xs sm:text-sm"
          >
            {/* Header: Garage Logo & Details vs Document Type Box */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2" style={{ borderColor: theme.documentHeaderColor }}>
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
                    <p>{garage.address}, {garage.postalCode} {garage.city}</p>
                    <p>Tél : <span className="font-semibold text-slate-700">{garage.phone}</span> · Email : {garage.email}</p>
                    <p>SIRET : {garage.siret} · N° TVA : {garage.tvaNumber}</p>
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
                  <span className="text-[10px] tracking-widest font-semibold block uppercase opacity-80">
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
                  <p>Date d'émission : <span className="font-semibold text-slate-900">{formatDate(doc.date)}</span></p>
                  {isQuote && doc.validityDate && (
                    <p>Validité jusqu'au : <span className="font-semibold text-slate-900">{formatDate(doc.validityDate)}</span></p>
                  )}
                  {isInvoice && doc.dueDate && (
                    <p>Date d'échéance : <span className="font-semibold text-slate-900">{formatDate(doc.dueDate)}</span></p>
                  )}
                  {doc.relatedQuoteId && <p className="text-[11px] text-slate-400">Réf devis associé</p>}
                </div>
              </div>
            </div>

            {/* Recipient Client & Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-2">
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
                    <p className="text-slate-600">{client.postalCode} {client.city}</p>
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
                      <p>Année : <span className="font-semibold text-slate-800">{vehicle.year}</span></p>
                      <p>Énergie : <span className="font-semibold text-slate-800 uppercase">{vehicle.fuelType}</span></p>
                      <p className="col-span-2">VIN : <span className="font-mono text-[11px] text-slate-700">{vehicle.vin}</span></p>
                      <p className="col-span-2">
                        Kilométrage relevé :{' '}
                        <span className="font-bold text-slate-900">
                          {(doc.mileageAtService || vehicle.mileage).toLocaleString('fr-FR')} km
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
            <div className="overflow-x-auto my-6">
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
                    const lineHT = it.quantity * it.unitPriceHT * (1 - (it.discountPercent || 0) / 100);
                    return (
                      <tr key={it.id || idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {it.reference || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {it.description}
                          <span className="text-[10px] text-slate-400 ml-2">
                            {it.type === 'piece' ? '(Pièce)' : it.type === 'main_oeuvre' ? '(M.O)' : it.type === 'forfait' ? '(Forfait)' : ''}
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
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-slate-200">
              {/* Payment details & notes */}
              <div className="w-full sm:w-1/2 space-y-3 text-xs">
                {doc.notes && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-950">
                    <span className="font-semibold block mb-0.5">Remarques Atelier :</span>
                    <p>{doc.notes}</p>
                  </div>
                )}

                <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-800">Modalités de règlement :</p>
                  <p>Moyens acceptés : Espèces, Carte Bancaire, Virement bancaire, Chèque.</p>
                  {garage.bankIban && (
                    <p className="font-mono text-[11px] bg-slate-100 p-2 rounded border border-slate-200 text-slate-800">
                      IBAN : {garage.bankIban}<br />
                      BIC : {garage.bankBic}
                    </p>
                  )}
                </div>
              </div>

              {/* Totals Summary Box */}
              <div className="w-full sm:w-72 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Pièces HT :</span>
                  <span className="font-mono font-medium tabular-nums">{doc.totalPartsHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Main d'œuvre HT :</span>
                  <span className="font-mono font-medium tabular-nums">{doc.totalLaborHT.toFixed(2)} €</span>
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
                  <span className="font-mono text-base tabular-nums">{doc.totalTTC.toFixed(2)} €</span>
                </div>

                {doc.amountPaid > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Acompte / Déjà réglé :</span>
                      <span className="font-mono tabular-nums">-{doc.amountPaid.toFixed(2)} €</span>
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

            {/* Legal Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-relaxed">
              <p>{garage.legalNotes}</p>
              <p className="mt-1 font-semibold text-slate-600">
                {garage.name} · SIRET {garage.siret} · TVA {garage.tvaNumber} · {garage.address}, {garage.postalCode} {garage.city}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
