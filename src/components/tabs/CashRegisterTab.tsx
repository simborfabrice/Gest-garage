import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coins,
  CreditCard,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  FileCheck,
  Printer,
  Trash2,
  Calendar,
  X,
  Receipt,
  AlertCircle,
  Building,
} from 'lucide-react';
import { CashTransaction, CashDayClose } from '../../types';

export const CashRegisterTab: React.FC = () => {
  const {
    cashTransactions,
    addCashTransaction,
    dayCloses,
    addDayClose,
    documents,
    updateDocument,
    garage,
    theme,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'today' | 'history'>('today');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<CashTransaction | null>(null);
  const [printedZClose, setPrintedZClose] = useState<CashDayClose | null>(null);

  // Quick Sale / Checkout Form
  const [checkoutType, setCheckoutType] = useState<'facture' | 'directe'>('facture');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [directLabel, setDirectLabel] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'carte' | 'cheque' | 'virement'>('carte');
  const [cashGiven, setCashGiven] = useState<number>(50);

  // Cash Movement Form (Apport / Retrait)
  const [movementType, setMovementType] = useState<'apport_caisse' | 'retrait_caisse'>('retrait_caisse');
  const [movementLabel, setMovementLabel] = useState('');
  const [movementAmount, setMovementAmount] = useState<number>(20);

  // Day Close Form
  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [closedByName, setClosedByName] = useState('Fabrice (Gérant)');
  const [closeNotes, setCloseNotes] = useState('');

  // Unpaid invoices that can be checked out
  const unpaidInvoices = documents.filter(
    (d) => d.type === 'facture' && d.status !== 'paye'
  );

  // Today's transactions
  const todayDateStr = '2026-09-30';
  const todayTransactions = cashTransactions.filter((tx) =>
    tx.date.startsWith(todayDateStr)
  );

  // Calculations for today
  const totalCashIn = todayTransactions
    .filter((tx) => tx.type !== 'retrait_caisse' && tx.paymentMethod === 'especes')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCashOut = todayTransactions
    .filter((tx) => tx.type === 'retrait_caisse')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentCashInDrawer = totalCashIn - totalCashOut;

  const totalCardToday = todayTransactions
    .filter((tx) => tx.paymentMethod === 'carte')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalChequeToday = todayTransactions
    .filter((tx) => tx.paymentMethod === 'cheque')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTransferToday = todayTransactions
    .filter((tx) => tx.paymentMethod === 'virement')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSalesTTC = todayTransactions
    .filter((tx) => tx.type === 'encaissement_facture' || tx.type === 'vente_directe')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const cashChangeToReturn = Math.max(0, cashGiven - checkoutAmount);

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    let label = directLabel;
    let docId: string | undefined = undefined;
    let clientName: string | undefined = undefined;

    if (checkoutType === 'facture') {
      const invoice = documents.find((d) => d.id === selectedInvoiceId);
      if (!invoice) {
        alert('Veuillez sélectionner une facture.');
        return;
      }
      label = `Règlement Facture ${invoice.referenceNumber}`;
      docId = invoice.id;
      // Mark invoice as paid
      updateDocument(invoice.id, {
        status: 'paye',
        amountPaid: invoice.totalTTC,
        paymentMethod: paymentMethod,
      });
    }

    const newTx = addCashTransaction({
      type: checkoutType === 'facture' ? 'encaissement_facture' : 'vente_directe',
      label,
      amount: Number(checkoutAmount),
      paymentMethod,
      documentId: docId,
      clientName,
      cashReceived: paymentMethod === 'especes' ? Number(cashGiven) : undefined,
      cashChange: paymentMethod === 'especes' ? cashChangeToReturn : undefined,
    });

    setIsCheckoutModalOpen(false);
    setPrintedReceipt(newTx);
  };

  const handleProcessMovement = (e: React.FormEvent) => {
    e.preventDefault();
    addCashTransaction({
      type: movementType,
      label: movementLabel || (movementType === 'apport_caisse' ? 'Apport de caisse' : 'Retrait d’espèces'),
      amount: Number(movementAmount),
      paymentMethod: 'especes',
    });
    setIsMovementModalOpen(false);
    setMovementLabel('');
    setMovementAmount(20);
  };

  const handleProcessDayClose = (e: React.FormEvent) => {
    e.preventDefault();
    const discrepancy = actualCashCounted - currentCashInDrawer;

    const newClose = addDayClose({
      date: todayDateStr,
      openingBalance: 250.0,
      totalCash: totalCashIn,
      totalCard: totalCardToday,
      totalCheque: totalChequeToday,
      totalTransfer: totalTransferToday,
      totalSalesTTC,
      theoreticalCashInDrawer: currentCashInDrawer,
      actualCashCounted: Number(actualCashCounted),
      discrepancy,
      closedBy: closedByName,
      notes: closeNotes,
    });

    setIsCloseDayModalOpen(false);
    setPrintedZClose(newClose);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-slate-700" />
            <span>Gestion de Caisse Journalière & Encaissements</span>
          </h2>
          <p className="text-xs text-slate-500">
            Encaissement direct des factures d'atelier, ventes comptoir, gestion du tiroir-caisse et clôture Z.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Encaissement</span>
          </button>

          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Entrée / Sortie d'Espèces</span>
          </button>

          <button
            onClick={() => {
              setActualCashCounted(currentCashInDrawer);
              setIsCloseDayModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>Clôture Z de Caisse</span>
          </button>
        </div>
      </div>

      {/* Cash Registers KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Espèces en tiroir */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Espèces en Tiroir Caisse
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {currentCashInDrawer.toFixed(2)} €
          </p>
          <span className="text-[10px] text-slate-400 block">
            Entrées : +{totalCashIn.toFixed(2)} € · Sorties : -{totalCashOut.toFixed(2)} €
          </span>
        </div>

        {/* CB / TPE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Carte Bancaire (TPE)
          </span>
          <p className="text-2xl font-black text-blue-600 tabular-nums">
            {totalCardToday.toFixed(2)} €
          </p>
          <span className="text-[10px] text-slate-400 block">Télécollecte bancaire auto</span>
        </div>

        {/* Chèques */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Chèques Reçus
          </span>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {totalChequeToday.toFixed(2)} €
          </p>
          <span className="text-[10px] text-slate-400 block">À déposer en banque</span>
        </div>

        {/* Virements */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Virements Bancaires
          </span>
          <p className="text-2xl font-black text-purple-600 tabular-nums">
            {totalTransferToday.toFixed(2)} €
          </p>
          <span className="text-[10px] text-slate-400 block">Comptes professionnels</span>
        </div>

        {/* Chiffre du jour */}
        <div
          className="p-4 rounded-xl text-white shadow-xs space-y-1"
          style={{ backgroundColor: theme.documentHeaderColor }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-80">
            Total Recettes Jour TTC
          </span>
          <p className="text-2xl font-black tabular-nums">
            {totalSalesTTC.toFixed(2)} €
          </p>
          <span className="text-[10px] opacity-75 block">30 Septembre 2026</span>
        </div>
      </div>

      {/* Transactions Journal of the Day */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600" />
            <span>Journal des Mouvements de Caisse d’Aujourd’hui</span>
          </h3>
          <span className="text-xs text-slate-500">
            {todayTransactions.length} opération(s) enregistrée(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Heure</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Libellé de l’opération</th>
                <th className="py-2.5 px-4">Règlement</th>
                <th className="py-2.5 px-4 text-right">Montant</th>
                <th className="py-2.5 px-4 text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Aucun encaissement pour l’instant aujourd’hui.
                  </td>
                </tr>
              ) : (
                todayTransactions.map((tx) => {
                  const isOut = tx.type === 'retrait_caisse';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] tabular-nums">
                        {new Date(tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 font-semibold">
                        {tx.type === 'encaissement_facture' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Facture</span>
                        ) : tx.type === 'vente_directe' ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">Vente Comptoir</span>
                        ) : tx.type === 'apport_caisse' ? (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px]">Apport Caisse</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px]">Sortie Caisse</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {tx.label}
                        {tx.notes && <span className="text-slate-400 text-[10px] block font-normal">{tx.notes}</span>}
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-600 font-medium">
                          {tx.paymentMethod === 'especes'
                            ? 'Espèces'
                            : tx.paymentMethod === 'carte'
                            ? 'Carte Bancaire'
                            : tx.paymentMethod === 'cheque'
                            ? 'Chèque'
                            : 'Virement'}
                        </span>
                      </td>

                      <td className={`py-3 px-4 text-right font-mono font-bold text-sm tabular-nums ${isOut ? 'text-rose-600' : 'text-slate-900'}`}>
                        {isOut ? '-' : '+'}{tx.amount.toFixed(2)} €
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPrintedReceipt(tx)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Imprimer le ticket de caisse avec logo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Day Closes Z */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          <span>Historique des Clôtures Z de Caisse</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dayCloses.map((close) => (
            <div
              key={close.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">
                  Clôture Z du {close.date}
                </span>
                <button
                  onClick={() => setPrintedZClose(close)}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le rapport Z</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <p>Chiffre d’affaires TTC : <strong className="text-slate-900">{close.totalSalesTTC.toFixed(2)} €</strong></p>
                <p>Espèces en caisse : <strong className="text-slate-900">{close.actualCashCounted.toFixed(2)} €</strong></p>
                <p>Cartes bancaires : <strong>{close.totalCard.toFixed(2)} €</strong></p>
                <p>Écart de caisse : <strong className={close.discrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'}>{close.discrepancy.toFixed(2)} €</strong></p>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Clôturé par {close.closedBy}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-slate-700" />
                <span>Nouvel Encaissement en Caisse</span>
              </h3>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessCheckout} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Origine du paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutType('facture');
                      if (unpaidInvoices[0]) {
                        setSelectedInvoiceId(unpaidInvoices[0].id);
                        setCheckoutAmount(unpaidInvoices[0].totalTTC - unpaidInvoices[0].amountPaid);
                        setCashGiven(unpaidInvoices[0].totalTTC - unpaidInvoices[0].amountPaid);
                      }
                    }}
                    className={`p-2.5 rounded-lg border font-semibold text-xs ${
                      checkoutType === 'facture' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20' : 'border-slate-200'
                    }`}
                  >
                    Règlement d'une Facture d'Atelier
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutType('directe');
                      setCheckoutAmount(35);
                      setCashGiven(40);
                    }}
                    className={`p-2.5 rounded-lg border font-semibold text-xs ${
                      checkoutType === 'directe' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20' : 'border-slate-200'
                    }`}
                  >
                    Vente Comptoir Rapide
                  </button>
                </div>
              </div>

              {checkoutType === 'facture' ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sélectionner la facture à régler *
                  </label>
                  {unpaidInvoices.length === 0 ? (
                    <div className="p-3 bg-amber-50 text-amber-800 rounded border border-amber-200 text-xs">
                      Toutes les factures sont actuellement soldées.
                    </div>
                  ) : (
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => {
                        setSelectedInvoiceId(e.target.value);
                        const inv = unpaidInvoices.find((d) => d.id === e.target.value);
                        if (inv) {
                          const due = inv.totalTTC - inv.amountPaid;
                          setCheckoutAmount(due);
                          setCashGiven(due);
                        }
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      required
                    >
                      {unpaidInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.referenceNumber} — Reste à régler : {(inv.totalTTC - inv.amountPaid).toFixed(2)} € TTC
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Description de la vente comptoir *
                  </label>
                  <input
                    type="text"
                    required
                    value={directLabel}
                    onChange={(e) => setDirectLabel(e.target.value)}
                    placeholder="ex: 1x Bidon Huile 5W30 5L + 1x Lave-glace hiver"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Montant à encaisser (€ TTC) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={checkoutAmount}
                  onChange={(e) => setCheckoutAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-base font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Moyen de paiement *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'carte', label: 'Carte CB' },
                    { id: 'especes', label: 'Espèces' },
                    { id: 'cheque', label: 'Chèque' },
                    { id: 'virement', label: 'Virement' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-lg border font-semibold text-xs ${
                        paymentMethod === m.id ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20' : 'border-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rendu de monnaie si espèces */}
              {paymentMethod === 'especes' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-950">Espèces reçues du client (€) :</span>
                    <input
                      type="number"
                      step="0.01"
                      min={checkoutAmount}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-24 border border-emerald-300 rounded p-1 text-right font-bold text-emerald-950 bg-white tabular-nums"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                    <span>Monnaie à rendre :</span>
                    <span className="font-mono text-base tabular-nums">
                      {cashChangeToReturn.toFixed(2)} €
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Valider l'Encaissement & Imprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal (Apport / Sortie) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Entrée / Sortie d'Espèces dans le Tiroir
              </h3>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type d'opération *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('retrait_caisse')}
                    className={`p-2.5 rounded-lg border font-semibold ${
                      movementType === 'retrait_caisse' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200'
                    }`}
                  >
                    Sortie d'espèces (Achat, Dépôt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('apport_caisse')}
                    className={`p-2.5 rounded-lg border font-semibold ${
                      movementType === 'apport_caisse' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200'
                    }`}
                  >
                    Apport d'espèces (Monnaie)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Montant (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motif / Justificatif *</label>
                <input
                  type="text"
                  required
                  value={movementLabel}
                  onChange={(e) => setMovementLabel(e.target.value)}
                  placeholder="ex: Achat ampoules quincaillerie, dépôt banque..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clôture Z Modal */}
      {isCloseDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-700" />
                <span>Clôture Journalière (Rapport Z de Caisse)</span>
              </h3>
              <button
                onClick={() => setIsCloseDayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessDayClose} className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Solde théorique en caisse (Espèces) :</span>
                  <span className="font-mono font-bold text-slate-900">{currentCashInDrawer.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Cartes Bancaires (TPE) :</span>
                  <span className="font-mono font-bold text-blue-700">{totalCardToday.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Chiffre d’affaires TTC du jour :</span>
                  <span className="font-mono font-bold text-slate-900">{totalSalesTTC.toFixed(2)} €</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Espèces réellement comptées dans le tiroir (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-base font-black text-slate-900 tabular-nums"
                />
              </div>

              {actualCashCounted !== currentCashInDrawer && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Écart de caisse détecté :{' '}
                    <strong className="font-mono">
                      {(actualCashCounted - currentCashInDrawer).toFixed(2)} €
                    </strong>
                  </span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Responsable de caisse</label>
                <input
                  type="text"
                  required
                  value={closedByName}
                  onChange={(e) => setClosedByName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observations / Remarques</label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCloseDayModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Clôturer & Imprimer le Rapport Z
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Cash Receipt Modal */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 text-center text-xs space-y-4">
            <div className="flex justify-end no-print">
              <button onClick={() => setPrintedReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-receipt" className="space-y-3">
              {garage.logoUrl && (
                <img src={garage.logoUrl} alt={garage.name} className="w-16 h-16 object-contain mx-auto" />
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{garage.name}</h4>
                <p className="text-[11px] text-slate-500">{garage.address}, {garage.city}</p>
                <p className="text-[11px] text-slate-500">Tél : {garage.phone}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">SIRET : {garage.siret}</p>
              </div>

              <hr className="border-dashed border-slate-300" />

              <div className="text-left space-y-1 text-slate-700">
                <p className="font-semibold text-slate-900">REÇU DE CAISSE</p>
                <p>Date : {new Date(printedReceipt.date).toLocaleString('fr-FR')}</p>
                <p>Libellé : {printedReceipt.label}</p>
                <p>Mode : <span className="uppercase font-semibold">{printedReceipt.paymentMethod}</span></p>
              </div>

              <div className="py-2 bg-slate-100 rounded text-center">
                <span className="text-[11px] text-slate-500 block">TOTAL PAYÉ</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {printedReceipt.amount.toFixed(2)} € TTC
                </span>
              </div>

              {printedReceipt.cashReceived && (
                <div className="text-left text-[11px] text-slate-600 space-y-0.5">
                  <p>Espèces remises : {printedReceipt.cashReceived.toFixed(2)} €</p>
                  <p>Monnaie rendue : {(printedReceipt.cashChange || 0).toFixed(2)} €</p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 pt-2">
                Merci de votre visite et bonne route !
              </p>
            </div>

            <div className="flex gap-2 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Z Close Modal */}
      {printedZClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 text-xs space-y-4">
            <div className="flex justify-between items-center no-print">
              <h4 className="font-bold text-slate-900">Rapport Z de Clôture</h4>
              <button onClick={() => setPrintedZClose(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-z" className="space-y-4 text-slate-800">
              <div className="text-center pb-3 border-b border-slate-200">
                {garage.logoUrl && (
                  <img src={garage.logoUrl} alt={garage.name} className="w-16 h-16 object-contain mx-auto mb-2" />
                )}
                <h3 className="font-black text-slate-900 text-base">{garage.name}</h3>
                <p className="text-[11px] text-slate-500">SIRET {garage.siret} · {garage.city}</p>
                <p className="font-bold text-sm text-slate-900 mt-2">CLÔTURE JOURNALIÈRE TICKET Z</p>
                <p className="text-[11px] text-slate-500">Date : {printedZClose.date} · Clôturé le {new Date(printedZClose.closedAt).toLocaleTimeString('fr-FR')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>CHIFFRE D’AFFAIRES TOTAL :</span>
                  <span className="font-mono tabular-nums">{printedZClose.totalSalesTTC.toFixed(2)} € TTC</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Cartes Bancaires :</span>
                  <span className="font-mono tabular-nums">{printedZClose.totalCard.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Espèces encaissées :</span>
                  <span className="font-mono tabular-nums">{printedZClose.totalCash.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Chèques :</span>
                  <span className="font-mono tabular-nums">{printedZClose.totalCheque.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Virements :</span>
                  <span className="font-mono tabular-nums">{printedZClose.totalTransfer.toFixed(2)} €</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Espèces théoriques en caisse :</span>
                  <span className="font-mono tabular-nums">{printedZClose.theoreticalCashInDrawer.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Espèces réelles comptées :</span>
                  <span className="font-mono tabular-nums">{printedZClose.actualCashCounted.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                  <span>Écart de caisse :</span>
                  <span className={`font-mono tabular-nums ${printedZClose.discrepancy === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {printedZClose.discrepancy >= 0 ? '+' : ''}{printedZClose.discrepancy.toFixed(2)} €
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  <p>Clôturé par : <strong>{printedZClose.closedBy}</strong></p>
                </div>
                <div className="text-right">
                  <p className="border-b border-slate-300 pb-4 w-32">Signature responsable :</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le rapport Z</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
