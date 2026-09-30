import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Download,
  DollarSign,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const AccountingTab: React.FC = () => {
  const {
    documents,
    supplierOrders,
    cashTransactions,
    clients,
    theme,
    setViewingDocument,
  } = useApp();

  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  // Filter invoices for sales
  const invoices = documents.filter((d) => d.type === 'facture');

  const totalSalesHT = invoices.reduce((sum, d) => sum + d.totalHT, 0);
  const totalSalesTTC = invoices.reduce((sum, d) => sum + d.totalTTC, 0);
  const totalLaborHT = invoices.reduce((sum, d) => sum + d.totalLaborHT, 0);
  const totalPartsHT = invoices.reduce((sum, d) => sum + d.totalPartsHT, 0);
  const totalVatCollected = invoices.reduce((sum, d) => sum + d.totalTVA, 0);

  // Supplier purchases
  const totalPurchasesHT = supplierOrders.reduce((sum, o) => sum + o.totalHT, 0);
  const totalPurchasesTTC = supplierOrders.reduce((sum, o) => sum + o.totalTTC, 0);
  const totalVatDeductible = supplierOrders.reduce((sum, o) => sum + o.totalTVA, 0);

  // Gross Margin & Net VAT
  const grossMargin = totalSalesHT - totalPurchasesHT;
  const grossMarginRate = totalSalesHT > 0 ? (grossMargin / totalSalesHT) * 100 : 0;
  const netVatPayable = Math.max(0, totalVatCollected - totalVatDeductible);

  // Unpaid invoices (créances)
  const pendingInvoices = invoices.filter((d) => d.status !== 'paye');
  const totalPendingAmount = pendingInvoices.reduce(
    (sum, d) => sum + (d.totalTTC - d.amountPaid),
    0
  );

  // Monthly breakdown mock data for visualization
  const monthlyData = [
    { month: 'Mai', sales: 6400, purchases: 2900 },
    { month: 'Juin', sales: 7850, purchases: 3400 },
    { month: 'Juil', sales: 9100, purchases: 4100 },
    { month: 'Août', sales: 5200, purchases: 2200 },
    { month: 'Sept', sales: 8450, purchases: 3650 },
    { month: 'Oct (est.)', sales: 8800, purchases: 3900 },
  ];

  // Export Sales Journal to CSV
  const handleExportSalesCSV = () => {
    const headers = [
      'Date',
      'N° Facture',
      'Client',
      'Total HT (€)',
      'TVA 20% (€)',
      'Total TTC (€)',
      'Statut',
      'Moyen Règlement',
    ];

    const rows = invoices.map((inv) => {
      const client = clients.find((c) => c.id === inv.clientId);
      const clientName = client ? (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'Client';
      return [
        inv.date,
        inv.referenceNumber,
        `"${clientName}"`,
        inv.totalHT.toFixed(2),
        inv.totalTVA.toFixed(2),
        inv.totalTTC.toFixed(2),
        inv.status,
        inv.paymentMethod || 'Non spécifié',
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Journal_Ventes_AutoPro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Purchases Journal to CSV
  const handleExportPurchasesCSV = () => {
    const headers = [
      'Date',
      'N° Commande',
      'Fournisseur ID',
      'Total HT (€)',
      'TVA Déductible (€)',
      'Total TTC (€)',
      'Statut',
    ];

    const rows = supplierOrders.map((ord) => [
      ord.orderDate,
      ord.orderNumber,
      ord.supplierId,
      ord.totalHT.toFixed(2),
      ord.totalTVA.toFixed(2),
      ord.totalTTC.toFixed(2),
      ord.status,
    ].join(';'));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Journal_Achats_Fournisseurs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <span>Comptabilité & Rapprochement Financier</span>
          </h2>
          <p className="text-xs text-slate-500">
            Chiffre d'affaires HT/TTC, marge brute atelier, balance TVA et exports pour expert-comptable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSalesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Journal Ventes (CSV)</span>
          </button>
          <button
            onClick={handleExportPurchasesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Journal Achats</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires HT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Chiffre d'Affaires Atelier (HT)
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {totalSalesHT.toFixed(2)} €
          </p>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Total Facturé TTC :</span>
            <strong className="text-slate-800">{totalSalesTTC.toFixed(2)} €</strong>
          </div>
        </div>

        {/* Marge Brute Atelier */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Marge Brute Globale
          </span>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {grossMargin.toFixed(2)} €
          </p>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Taux de marge :</span>
            <strong className="text-emerald-700">{grossMarginRate.toFixed(1)}%</strong>
          </div>
        </div>

        {/* TVA Nette à reverser */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            TVA Nette à Reverser
          </span>
          <p className="text-2xl font-black text-blue-600 tabular-nums">
            {netVatPayable.toFixed(2)} €
          </p>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Collectée : {totalVatCollected.toFixed(2)} €</span>
            <span>Déductible : {totalVatDeductible.toFixed(2)} €</span>
          </div>
        </div>

        {/* Créances en cours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Créances Clients en Attente
          </span>
          <p className={`text-2xl font-black tabular-nums ${totalPendingAmount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {totalPendingAmount.toFixed(2)} €
          </p>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>{pendingInvoices.length} facture(s) non soldée(s)</span>
            <span className="text-amber-700 font-semibold">À relancer</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Sales breakdown & Monthly Evolution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CA Breakdown (Pièces vs Main d'oeuvre) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ventilation du Chiffre d'Affaires (HT)
            </h3>
            <p className="text-xs text-slate-500">
              Répartition entre la main d'œuvre atelier et la vente de pièces.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Main d'œuvre */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Main d'œuvre Qualifiée & Forfaits :</span>
                <span className="font-mono tabular-nums font-bold">{totalLaborHT.toFixed(2)} €</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${totalSalesHT > 0 ? (totalLaborHT / totalSalesHT) * 100 : 50}%`,
                    backgroundColor: theme.primaryColor,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {totalSalesHT > 0 ? ((totalLaborHT / totalSalesHT) * 100).toFixed(1) : 0}% du CA total
              </span>
            </div>

            {/* Pièces détachées */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>Ventes de Pièces & Consommables :</span>
                <span className="font-mono tabular-nums font-bold">{totalPartsHT.toFixed(2)} €</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${totalSalesHT > 0 ? (totalPartsHT / totalSalesHT) * 100 : 50}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {totalSalesHT > 0 ? ((totalPartsHT / totalSalesHT) * 100).toFixed(1) : 0}% du CA total
              </span>
            </div>

            {/* Achats pièces fournisseurs */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Dépenses Fournisseurs engagées :</span>
              <p className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {totalPurchasesHT.toFixed(2)} € HT ({totalPurchasesTTC.toFixed(2)} € TTC)
              </p>
              <p className="text-[11px] text-slate-500">
                Commandes passées auprès de AD, Michelin, Castrol et Würth.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Monthly Performance Chart (SVG) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Évolution Mensuelle : Chiffre d'Affaires vs Achats
              </h3>
              <p className="text-xs text-slate-500">
                Comparatif des encaissements facturés et dépenses de pièces sur les 6 derniers mois.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.primaryColor }} />
                <span className="text-slate-600">CA Ventes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-300" />
                <span className="text-slate-600">Achats</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-200">
            {monthlyData.map((d, idx) => {
              const maxVal = 10000;
              const salesHeight = (d.sales / maxVal) * 100;
              const purchHeight = (d.purchases / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Sales Bar */}
                    <div
                      className="w-1/2 rounded-t transition-all group-hover:opacity-90 relative"
                      style={{
                        height: `${salesHeight}%`,
                        backgroundColor: theme.primaryColor,
                      }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                        {d.sales} €
                      </span>
                    </div>

                    {/* Purchases Bar */}
                    <div
                      className="w-1/2 rounded-t bg-slate-300 transition-all group-hover:bg-slate-400 relative"
                      style={{ height: `${purchHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                        {d.purchases} €
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-600 truncate block text-center">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Invoices / Receivables Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Factures en Attente de Règlement & Relances Clients
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {pendingInvoices.length} facture(s) à surveiller
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Facture</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Date Émission</th>
                <th className="py-2.5 px-4">Échéance</th>
                <th className="py-2.5 px-4 text-right">Montant Total TTC</th>
                <th className="py-2.5 px-4 text-right">Reste Dû</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Toutes les factures d'atelier sont réglées. Aucune relance en cours.
                  </td>
                </tr>
              ) : (
                pendingInvoices.map((inv) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  const remaining = inv.totalTTC - inv.amountPaid;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.referenceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {client ? (client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`) : 'Client inconnu'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums">
                        {formatDate(inv.date)}
                      </td>
                      <td className="py-3 px-4 text-amber-700 font-medium tabular-nums">
                        {inv.dueDate ? formatDate(inv.dueDate) : 'À réception'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {inv.totalTTC.toFixed(2)} €
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums text-sm">
                        {remaining.toFixed(2)} €
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingDocument(inv)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] transition-colors"
                        >
                          Voir facture
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
    </div>
  );
};
