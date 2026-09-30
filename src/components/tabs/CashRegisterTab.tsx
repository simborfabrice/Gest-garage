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
  Settings,
  RotateCcw,
  Check,
  CheckCircle,
  Search,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import { CashTransaction, CashDayClose } from '../../types';
import { formatDate, formatDateLong, formatDateTime } from '../../utils/dateUtils';

export const CashRegisterTab: React.FC = () => {
  const {
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
    documents,
    updateDocument,
    garage,
    theme,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'today' | 'history'>('today');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<CashTransaction | null>(null);
  const [printedZClose, setPrintedZClose] = useState<CashDayClose | null>(null);

  // Search, Filter & Batch Selection for transactions journal
  const [searchTxQuery, setSearchTxQuery] = useState('');
  const [filterTxType, setFilterTxType] = useState<string>('all');
  const [txFeedback, setTxFeedback] = useState<string | null>(null);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Settings form states
  const [settingsOpeningBalance, setSettingsOpeningBalance] = useState<number>(
    cashSettings.initialOpeningBalance || 250
  );
  const [settingsCashier, setSettingsCashier] = useState<string>(
    cashSettings.defaultCashier || 'Fabrice (Gérant)'
  );
  const [settingsEnableLineDeletion, setSettingsEnableLineDeletion] = useState<boolean>(
    cashSettings.enableLineDeletion ?? true
  );
  const [settingsConfirmDelete, setSettingsConfirmDelete] = useState<boolean>(
    cashSettings.confirmBeforeDelete ?? true
  );

  // Synchroniser les paramètres du modal avec cashSettings
  React.useEffect(() => {
    setSettingsOpeningBalance(cashSettings.initialOpeningBalance || 250);
    setSettingsCashier(cashSettings.defaultCashier || 'Fabrice (Gérant)');
    setSettingsEnableLineDeletion(cashSettings.enableLineDeletion ?? true);
    setSettingsConfirmDelete(cashSettings.confirmBeforeDelete ?? true);
  }, [cashSettings, isSettingsModalOpen]);

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

  // Handlers for Rétablissement et Paramètres de la Caisse Journalière
  const handleRestoreSettingsOnly = () => {
    if (
      confirm(
        'Rétablir uniquement les paramètres de la caisse journalière ?\n\n• Fond de caisse initial : 250,00 €\n• Option de suppression de ligne : Activée\n• Demande de confirmation avant suppression : Activée\n• Responsable de caisse : Fabrice (Gérant)\n\n(Vos opérations déjà saisies aujourd\'hui sont conservées).'
      )
    ) {
      restoreCashSettings();
      setSettingsOpeningBalance(250);
      setSettingsCashier('Fabrice (Gérant)');
      setSettingsEnableLineDeletion(true);
      setSettingsConfirmDelete(true);
      setTxFeedback('Paramètres de la caisse journalière rétablis avec succès ! Fond : 250,00 € · Option suppression de ligne activée.');
      setTimeout(() => setTxFeedback(null), 4500);
    }
  };

  const handleQuickRestoreDefault = () => {
    if (
      confirm(
        'Rétablir tous les paramètres ET les opérations types de la caisse journalière ?\n\n• Fond de caisse d’ouverture (250,00 €) et opérations types réinitialisés\n• Option de suppression de ligne activée par défaut\n• Caisse remise à sa configuration de référence standard.'
      )
    ) {
      restoreDefaultCash();
      setSettingsOpeningBalance(250);
      setSettingsCashier('Fabrice (Gérant)');
      setSettingsEnableLineDeletion(true);
      setSettingsConfirmDelete(true);
      setTxFeedback('Paramètres et opérations de la caisse journalière rétablis avec succès ! Fond d’ouverture : 250,00 € · Option suppression activée.');
      setSelectedTxIds([]);
      setTimeout(() => setTxFeedback(null), 4500);
    }
  };

  const handleDeleteSingle = (tx: CashTransaction) => {
    if (cashSettings.enableLineDeletion === false) {
      alert("L'option de suppression de ligne est actuellement désactivée dans les paramètres de la caisse journalière.\n\nPour supprimer des opérations, activez l'Option de suppression de ligne dans les Paramètres de Caisse.");
      return;
    }
    if (cashSettings.confirmBeforeDelete ?? true) {
      const ok = confirm(
        `Confirmer la suppression de cette ligne d'opération de caisse ?\n\n• Libellé : « ${tx.label} »\n• Montant : ${tx.amount.toFixed(2)} € (${tx.paymentMethod})\n\nLe solde du tiroir-caisse et les recettes du jour seront automatiquement recalculés.`
      );
      if (!ok) return;
    }
    deleteCashTransaction(tx.id);
    setSelectedTxIds((prev) => prev.filter((id) => id !== tx.id));
    setTxFeedback(`Ligne « ${tx.label} » supprimée avec succès. Solde de caisse et totaux actualisés.`);
    setTimeout(() => setTxFeedback(null), 3500);
  };

  const handleDeleteSelected = () => {
    if (cashSettings.enableLineDeletion === false) {
      alert("L'option de suppression de ligne est actuellement désactivée dans les paramètres de la caisse journalière.");
      return;
    }
    if (selectedTxIds.length === 0) return;
    if (cashSettings.confirmBeforeDelete ?? true) {
      const ok = confirm(
        `Confirmer la suppression définitive des ${selectedTxIds.length} opération(s) de caisse sélectionnée(s) ?\n\nLe solde du tiroir-caisse sera mis à jour en conséquence.`
      );
      if (!ok) return;
    }
    deleteCashTransactionsBatch(selectedTxIds);
    setTxFeedback(`${selectedTxIds.length} ligne(s) d'opération supprimée(s). Solde de caisse actualisé.`);
    setSelectedTxIds([]);
    setTimeout(() => setTxFeedback(null), 3500);
  };

  const handleSaveCashSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newBal = Number(settingsOpeningBalance) || 250;
    updateCashSettings({
      initialOpeningBalance: newBal,
      defaultCashier: settingsCashier,
      enableLineDeletion: settingsEnableLineDeletion,
      confirmBeforeDelete: settingsConfirmDelete,
    });

    // Check if an opening transaction already exists for today
    const openingTx = todayTransactions.find(
      (tx) => tx.type === 'apport_caisse' && tx.label.toLowerCase().includes('ouverture')
    );
    if (openingTx) {
      deleteCashTransaction(openingTx.id);
    }
    // Add adjusted opening transaction
    addCashTransaction({
      type: 'apport_caisse',
      label: 'Fond de caisse initial (Ouverture)',
      amount: newBal,
      paymentMethod: 'especes',
      notes: 'Fond de caisse d’ouverture ajusté dans les paramètres',
    });

    setIsSettingsModalOpen(false);
    setTxFeedback(`Paramètres de caisse enregistrés. Fond : ${newBal.toFixed(2)} € | Suppression de ligne : ${settingsEnableLineDeletion ? 'Activée' : 'Désactivée'}.`);
    setTimeout(() => setTxFeedback(null), 3500);
  };

  const handleClearDay = () => {
    if (
      confirm(
        `Vider tout le journal des mouvements d'aujourd'hui ?\n\nLe fond de caisse initial d'ouverture (${settingsOpeningBalance} €) sera conservé pour démarrer une journée vierge.`
      )
    ) {
      clearDayTransactions(true);
      setIsSettingsModalOpen(false);
      setSelectedTxIds([]);
      setTxFeedback(`Journal du jour réinitialisé. Fond d’ouverture conservé : ${Number(settingsOpeningBalance).toFixed(2)} €.`);
      setTimeout(() => setTxFeedback(null), 4000);
    }
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
          {/* Bouton Paramètres de Caisse */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Configurer ou rétablir les paramètres de la caisse journalière (fond de caisse, option suppression de ligne)"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Paramètres de Caisse</span>
          </button>

          {/* Bouton Rétablir les Paramètres */}
          <button
            onClick={handleRestoreSettingsOnly}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs"
            title="Rétablir les paramètres d'origine de la caisse journalière (Fond 250 €, Option suppression active)"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Rétablir les Paramètres</span>
          </button>

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

      {/* Transactions Journal of the Day with Option de Suppression des Lignes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-600" />
              <span>Journal des Mouvements de Caisse d’Aujourd’hui</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Historique des opérations de la journée avec option de suppression de ligne et mise à jour en temps réel du solde.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {todayTransactions.length} opération(s)
            </span>

            {/* Badge état de l'Option suppression de ligne */}
            {cashSettings.enableLineDeletion !== false ? (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
                title="Option suppression de ligne activée. Cliquez pour configurer."
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Option suppression : Activée</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors"
                title="Option suppression de ligne désactivée. Cliquez pour l'activer dans les paramètres."
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Suppression désactivée (Activer)</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback alert after deletion or action */}
        {txFeedback && (
          <div className="mx-4 my-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fadeIn">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {txFeedback}
            </span>
            <button
              onClick={() => setTxFeedback(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Toolbar: Search, Filter & Batch Line Deletion */}
        <div className="p-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTxQuery}
                onChange={(e) => setSearchTxQuery(e.target.value)}
                placeholder="Rechercher une opération, libellé, montant..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {selectedTxIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-2xs text-xs whitespace-nowrap animate-fadeIn"
                title="Supprimer toutes les lignes sélectionnées"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer la sélection ({selectedTxIds.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Toutes les opérations' },
              { id: 'encaissement_facture', label: 'Factures' },
              { id: 'vente_directe', label: 'Ventes Comptoir' },
              { id: 'apport_caisse', label: 'Apports' },
              { id: 'retrait_caisse', label: 'Sorties / Décaissements' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterTxType(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  filterTxType === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {(() => {
            const filtered = todayTransactions.filter((tx) => {
              if (filterTxType !== 'all' && tx.type !== filterTxType) return false;
              if (!searchTxQuery) return true;
              const q = searchTxQuery.toLowerCase();
              return (
                tx.label.toLowerCase().includes(q) ||
                tx.paymentMethod.toLowerCase().includes(q) ||
                tx.amount.toString().includes(q) ||
                (tx.notes && tx.notes.toLowerCase().includes(q))
              );
            });

            const allSelected =
              filtered.length > 0 && filtered.every((tx) => selectedTxIds.includes(tx.id));

            const toggleSelectAll = () => {
              if (allSelected) {
                const filteredIds = new Set(filtered.map((t) => t.id));
                setSelectedTxIds(selectedTxIds.filter((id) => !filteredIds.has(id)));
              } else {
                const combined = new Set([...selectedTxIds, ...filtered.map((t) => t.id)]);
                setSelectedTxIds(Array.from(combined));
              }
            };

            return (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-slate-700"
                        title={allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                      >
                        {allSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="py-2.5 px-3">Date & Heure</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Libellé de l’opération</th>
                    <th className="py-2.5 px-4">Règlement</th>
                    <th className="py-2.5 px-4 text-right">Montant</th>
                    <th className="py-2.5 px-4 text-center">Option Suppression & Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Aucune opération de caisse trouvée pour ces critères.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx) => {
                      const isOut = tx.type === 'retrait_caisse';
                      const isSelected = selectedTxIds.includes(tx.id);

                      return (
                        <tr
                          key={tx.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-sky-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedTxIds(selectedTxIds.filter((id) => id !== tx.id));
                                } else {
                                  setSelectedTxIds([...selectedTxIds, tx.id]);
                                }
                              }}
                              className="text-slate-400 hover:text-slate-700"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-sky-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px] tabular-nums whitespace-nowrap">
                            <span className="block font-semibold text-slate-800">{formatDate(tx.date)}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(tx.date).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-semibold">
                            {tx.type === 'encaissement_facture' ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                                Facture
                              </span>
                            ) : tx.type === 'vente_directe' ? (
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                                Vente Comptoir
                              </span>
                            ) : tx.type === 'apport_caisse' ? (
                              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                                Apport Caisse
                              </span>
                            ) : (
                              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                                Sortie Caisse
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-800">
                            {tx.label}
                            {tx.notes && (
                              <span className="text-slate-400 text-[10px] block font-normal">
                                {tx.notes}
                              </span>
                            )}
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

                          <td
                            className={`py-3 px-4 text-right font-mono font-bold text-sm tabular-nums ${
                              isOut ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {isOut ? '-' : '+'}
                            {tx.amount.toFixed(2)} €
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Bouton d'impression reçu */}
                              <button
                                type="button"
                                onClick={() => setPrintedReceipt(tx)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Imprimer le ticket de caisse avec logo"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Option de suppression de la ligne */}
                              {cashSettings.enableLineDeletion !== false ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(tx)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 border border-rose-200 rounded-md transition-all shadow-2xs group"
                                  title="Supprimer cette ligne d'opération de caisse (recalcule le solde en temps réel)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110" />
                                  <span>Supprimer</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsSettingsModalOpen(true)}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-md hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                  title="Suppression désactivée dans les paramètres de la caisse journalière. Cliquez pour l'activer."
                                >
                                  <ShieldAlert className="w-3 h-3 text-slate-400" />
                                  <span>Verrouillé</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            );
          })()}
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
                  Clôture Z du {formatDate(close.date)}
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
                <img
                  src={garage.logoUrl}
                  alt={garage.name}
                  className="object-contain mx-auto bg-transparent"
                  style={{
                    height: `${Math.min(Math.max((garage.logoSize || 140) * 0.55, 56), 90)}px`,
                    maxWidth: '180px',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent',
                  }}
                />
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
                <p>Date : {formatDateTime(printedReceipt.date)}</p>
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
                  <img
                    src={garage.logoUrl}
                    alt={garage.name}
                    className="object-contain mx-auto mb-2 bg-transparent"
                    style={{
                      height: `${Math.min(Math.max((garage.logoSize || 140) * 0.55, 56), 90)}px`,
                      maxWidth: '180px',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      background: 'transparent',
                    }}
                  />
                )}
                <h3 className="font-black text-slate-900 text-base">{garage.name}</h3>
                <p className="text-[11px] text-slate-500">SIRET {garage.siret} · {garage.city}</p>
                <p className="font-bold text-sm text-slate-900 mt-2">CLÔTURE JOURNALIÈRE TICKET Z</p>
                <p className="text-[11px] text-slate-500">Date : {formatDate(printedZClose.date)} · Clôturé à {new Date(printedZClose.closedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
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

      {/* Modal Paramètres de la Caisse Journalière & Fond de Caisse */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Paramètres de la Caisse Journalière & Fond de Caisse
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCashSettings} className="p-6 space-y-5 text-xs">
              {/* Fond de caisse initial */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-900 block text-xs">
                  Fond de caisse initial d’ouverture (€)
                </label>
                <p className="text-[11px] text-slate-500">
                  Montant en espèces déposé chaque matin dans le tiroir-caisse pour assurer le rendu de monnaie aux clients.
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      required
                      value={settingsOpeningBalance}
                      onChange={(e) => setSettingsOpeningBalance(Number(e.target.value))}
                      className="w-full pl-3 pr-8 py-2 text-base font-black text-slate-900 border border-slate-300 rounded-lg tabular-nums bg-white"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400">€</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400">Paliers rapides :</span>
                  {[100, 150, 200, 250, 300, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettingsOpeningBalance(val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                        settingsOpeningBalance === val
                          ? 'bg-sky-50 border-sky-400 text-sky-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {val} €
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsable de caisse */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nom du responsable de caisse par défaut
                </label>
                <input
                  type="text"
                  required
                  value={settingsCashier}
                  onChange={(e) => setSettingsCashier(e.target.value)}
                  placeholder="ex: Fabrice (Gérant)"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              {/* Option de suppression de ligne dans les paramètres */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Option de suppression de ligne dans le journal
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsEnableLineDeletion}
                      onChange={(e) => setSettingsEnableLineDeletion(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-500">
                  Permet d’effacer des écritures erronées ou annulées (encaissement de facture, vente comptoir, apport ou retrait) directement depuis le journal de caisse journalier.
                </p>

                {settingsEnableLineDeletion ? (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsConfirmDelete}
                        onChange={(e) => setSettingsConfirmDelete(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">
                          Demander confirmation avant chaque suppression
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Affiche un message récapitulatif pour sécuriser la suppression et éviter les erreurs involontaires.
                        </span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>La suppression est actuellement verrouillée. Les boutons de suppression seront masqués ou désactivés dans le journal.</span>
                  </div>
                )}
              </div>

              {/* Rétablissement des paramètres de la caisse journalière */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rétablissement des Paramètres de Caisse Journalière</span>
                </span>
                <p className="text-[11px] text-amber-800/80">
                  Rétablissez instantanément la configuration standard (Fond de caisse : 250,00 €, Option suppression de ligne activée, confirmation sécurisée activée).
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleRestoreSettingsOnly();
                      setIsSettingsModalOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-lg transition-colors text-xs shadow-2xs"
                    title="Rétablir uniquement les paramètres (fond 250€, suppression activée) sans affecter les écritures déjà saisies"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Rétablir Paramètres par Défaut (250€)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleQuickRestoreDefault();
                      setIsSettingsModalOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors text-xs shadow-2xs"
                    title="Rétablir les paramètres par défaut et réinitialiser les opérations types de caisse"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rétablir Tout (Paramètres + Opérations)</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-amber-800">Démarrer une nouvelle journée vierge :</span>
                  <button
                    type="button"
                    onClick={handleClearDay}
                    className="text-rose-700 hover:text-rose-900 font-semibold underline"
                  >
                    Vider le journal du jour (garder fond de caisse)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer les Paramètres
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
