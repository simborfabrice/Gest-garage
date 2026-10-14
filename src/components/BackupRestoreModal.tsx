import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  Upload,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Coins,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  FileCode,
  ArrowRight,
  Database,
} from 'lucide-react';
import { BackupSnapshot } from '../types';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    exportBackup,
    importBackup,
    snapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    garage,
    documents,
    clients,
    vehicles,
    appointments,
    cashTransactions,
    theme,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'snapshots'>('export');
  const [copied, setCopied] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshotCreatedNotice, setSnapshotCreatedNotice] = useState<string | null>(null);

  // Import state
  const [fileToImport, setFileToImport] = useState<{
    name: string;
    size: string;
    content: string;
    summary?: any;
    error?: string;
  } | null>(null);
  const [importText, setImportText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isBackupModalOpen) return null;

  // Documents stats
  const devisCount = documents.filter((d) => d.type === 'devis').length;
  const ordersCount = documents.filter((d) => d.type === 'bon_commande').length;
  const invoicesCount = documents.filter((d) => d.type === 'facture').length;
  const totalFactureTTC = documents
    .filter((d) => d.type === 'facture')
    .reduce((sum, d) => sum + (d.totalTTC || 0), 0);

  // Handler: Download JSON
  const handleDownloadBackup = () => {
    try {
      const json = exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
        now.getHours()
      )}h${pad(now.getMinutes())}`;
      const safeGarageName = garage.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');

      a.href = url;
      a.download = `sauvegarde_${safeGarageName}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading backup:', err);
      alert('Erreur lors du téléchargement de la sauvegarde.');
    }
  };

  // Handler: Copy to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const json = exportBackup();
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      alert('Impossible de copier dans le presse-papier.');
    }
  };

  // Handler: Create snapshot
  const handleCreateSnapshot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const snap = createSnapshot(snapshotLabel.trim() || undefined);
    setSnapshotLabel('');
    setSnapshotCreatedNotice(`Point de restauration créé avec succès : "${snap.label}"`);
    setTimeout(() => setSnapshotCreatedNotice(null), 3500);
  };

  // Handler: Process file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const payload = parsed.data || parsed;

        const summary = parsed.summary || {
          documentsCount: payload.documents?.length || 0,
          clientsCount: payload.clients?.length || 0,
          vehiclesCount: payload.vehicles?.length || 0,
          appointmentsCount: payload.appointments?.length || 0,
          transactionsCount: payload.cashTransactions?.length || 0,
          garageName: payload.garage?.name || 'Garage',
          exportedAt: parsed.exportedAt || null,
        };

        setFileToImport({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} Ko`,
          content: text,
          summary,
        });
        setImportStatus(null);
      } catch (err: any) {
        setFileToImport({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} Ko`,
          content: '',
          error: 'Le fichier sélectionné n’est pas un JSON valide.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Handler: Process manual text input
  const handleParseManualText = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      const payload = parsed.data || parsed;
      const summary = parsed.summary || {
        documentsCount: payload.documents?.length || 0,
        clientsCount: payload.clients?.length || 0,
        vehiclesCount: payload.vehicles?.length || 0,
        appointmentsCount: payload.appointments?.length || 0,
        transactionsCount: payload.cashTransactions?.length || 0,
        garageName: payload.garage?.name || 'Garage',
        exportedAt: parsed.exportedAt || null,
      };

      setFileToImport({
        name: 'Données collées manuellement',
        size: `${(new Blob([importText]).size / 1024).toFixed(1)} Ko`,
        content: importText,
        summary,
      });
      setImportStatus(null);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: 'Texte JSON non valide : vérifiez la syntaxe.',
      });
    }
  };

  // Handler: Confirm restore
  const handleExecuteRestore = () => {
    if (!fileToImport || !fileToImport.content) return;

    if (
      !confirm(
        'Attention : La restauration va remplacer l’ensemble de vos données actuelles (clients, devis, factures, caisse, etc.) par celles contenues dans la sauvegarde.\n\nUn point de sécurité préalable sera automatiquement créé. Souhaitez-vous continuer ?'
      )
    ) {
      return;
    }

    setIsRestoring(true);
    // 1. Create an auto safety snapshot of current data before overwriting
    try {
      createSnapshot('Point de sécurité automatique avant restauration');
    } catch (err) {
      console.warn('Could not create pre-restore snapshot', err);
    }

    // 2. Import
    setTimeout(() => {
      const res = importBackup(fileToImport.content);
      setIsRestoring(false);

      if (res.success) {
        setImportStatus({
          type: 'success',
          message: 'Toutes les données ont été restaurées avec succès !',
        });
        setFileToImport(null);
        setImportText('');
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'Erreur inconnue lors de la restauration.',
        });
      }
    }, 400);
  };

  // Handler: Restore a snapshot
  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (
      !confirm(
        `Confirmez-vous la restauration du point "${snap.label}" datant du ${new Date(
          snap.createdAt
        ).toLocaleString('fr-FR')} ?\n\nToutes les données actuelles seront remplacées.`
      )
    ) {
      return;
    }

    // Create safety snapshot before
    createSnapshot('Point de sécurité avant restauration de snapshot');

    const res = restoreSnapshot(snap.id);
    if (res.success) {
      alert(`Le point "${snap.label}" a été restauré avec succès !`);
    } else {
      alert(`Erreur : ${res.error || 'Impossible de restaurer ce point.'}`);
    }
  };

  // Handler: Download a snapshot
  const handleDownloadSnapshot = (snap: BackupSnapshot) => {
    const blob = new Blob([snap.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapshot_${snap.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <Database className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Sauvegarde & Restauration du Garage
              </h2>
              <p className="text-xs text-slate-300">
                Protégez vos documents, devis, factures, clients, plannings et écritures de caisse
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'export'
                ? 'bg-white text-sky-700 border-sky-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>1. Sauvegarder & Exporter</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'import'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>2. Restaurer & Importer</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'snapshots'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>3. Points de Restauration</span>
            {snapshots.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-indigo-100 text-indigo-800">
                {snapshots.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXPORT & BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Summary Stats Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contenu actuel de la base à sauvegarder
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    Garage : <strong className="text-slate-900">{garage.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Documents</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-900">
                      {documents.length}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {devisCount} devis · {ordersCount} cdes · {invoicesCount} fact.
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Clients & Parc</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-900">
                      {clients.length} <span className="text-xs font-normal text-slate-500">clients</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {vehicles.length} véhicules enregistrés
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Atelier</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-900">
                      {appointments.length} <span className="text-xs font-normal text-slate-500">RDV</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Planning & mécaniciens</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Caisse & Ventes</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-900">
                      {cashTransactions.length} <span className="text-xs font-normal text-slate-500">lignes</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold truncate">
                      {totalFactureTTC.toFixed(2)} € TTC facturés
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download JSON Button */}
                <div className="bg-gradient-to-br from-sky-50 to-indigo-50/40 border border-sky-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-xs">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Fichier de sauvegarde complet (.json)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Téléchargez un fichier autonome contenant l'intégralité de vos documents,
                      tarifs, clients, véhicules, pièces et réglages. Vous pourrez le conserver sur
                      clé USB ou disque dur.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBackup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger la sauvegarde</span>
                  </button>
                </div>

                {/* Instant Snapshot Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Point de restauration instantané
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Enregistrez un cliché immédiat dans ce navigateur pour pouvoir revenir en
                      arrière à tout moment en 1 clic avant une grosse modification.
                    </p>
                  </div>

                  <form onSubmit={handleCreateSnapshot} className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nom du point (ex: Avant clôture mensuelle)"
                      value={snapshotLabel}
                      onChange={(e) => setSnapshotLabel(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Créer le point de restauration</span>
                    </button>
                  </form>
                </div>
              </div>

              {snapshotCreatedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{snapshotCreatedNotice}</span>
                </div>
              )}

              {/* Copy to clipboard secondary action */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileCode className="w-4 h-4 text-slate-500" />
                  <span>Besoin de copier le contenu brut ?</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded-lg transition-colors text-xs shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copier le texte JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Alert notice */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold block text-sm mb-0.5">Restauration des données</strong>
                  L'importation d'une sauvegarde remplace les données actuelles de l'atelier pour
                  retrouver l'état exact archivé. Pour votre sécurité, un point de restauration
                  automatique de secours est créé juste avant l'opération.
                </div>
              </div>

              {/* Status Message */}
              {importStatus && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium flex items-start gap-3 ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {importStatus.type === 'success' ? 'Succès' : 'Erreur de restauration'}
                    </div>
                    <p className="mt-0.5">{importStatus.message}</p>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/30 transition-all rounded-2xl p-8 text-center cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
                <div className="w-12 h-12 bg-sky-100 group-hover:bg-sky-200 text-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Cliquez pour choisir un fichier de sauvegarde (.json)
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Glissez-déposez ou sélectionnez votre fichier de sauvegarde
                </p>
              </div>

              {/* Preview of selected file */}
              {fileToImport && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-sky-600" />
                      <span className="font-bold text-xs text-slate-900">{fileToImport.name}</span>
                      <span className="text-[11px] text-slate-400">({fileToImport.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileToImport(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Annuler
                    </button>
                  </div>

                  {fileToImport.error ? (
                    <div className="text-xs text-rose-600 font-semibold">{fileToImport.error}</div>
                  ) : (
                    <>
                      <div className="text-xs text-slate-600">
                        Données identifiées dans ce fichier :
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[10px] block">Garage</span>
                          <strong className="text-slate-800 truncate block">
                            {fileToImport.summary.garageName}
                          </strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[10px] block">Documents</span>
                          <strong className="text-slate-800">
                            {fileToImport.summary.documentsCount} documents
                          </strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[10px] block">Clients & Autos</span>
                          <strong className="text-slate-800">
                            {fileToImport.summary.clientsCount} clients · {fileToImport.summary.vehiclesCount} autos
                          </strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[10px] block">Caisse & RDV</span>
                          <strong className="text-slate-800">
                            {fileToImport.summary.transactionsCount} lignes · {fileToImport.summary.appointmentsCount} RDV
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isRestoring}
                        onClick={handleExecuteRestore}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        {isRestoring ? (
                          <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span>Restauration en cours...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmer et Restaurer cette Sauvegarde</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Paste Manual JSON alternative */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualPaste(!showManualPaste)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5"
                >
                  <span>{showManualPaste ? '− Masquer le mode collage' : '+ Coller directement du texte JSON'}</span>
                </button>

                {showManualPaste && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={5}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Collez ici le code JSON de votre sauvegarde..."
                      className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleParseManualText}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Analyser ce texte
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SNAPSHOTS (POINTS DE RESTAURATION LOCAUX) */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Points enregistrés dans ce navigateur</h4>
                  <p className="text-[11px] text-slate-500">
                    Permet de restaurer en 1 clic un état antérieur sans avoir besoin de fichier externe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateSnapshot()}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Nouveau point maintenant</span>
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    Aucun point de restauration local pour l'instant
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Créez-en un dès maintenant pour sécuriser vos travaux !
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="bg-white border border-slate-200 hover:border-indigo-300 p-3.5 rounded-xl transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{snap.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(snap.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        {snap.summary && (
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                            <span>
                              <strong>{snap.summary.documentsCount}</strong> doc(s)
                            </span>
                            <span>•</span>
                            <span>
                              <strong>{snap.summary.clientsCount}</strong> clients
                            </span>
                            <span>•</span>
                            <span>
                              <strong>{snap.summary.vehiclesCount}</strong> autos
                            </span>
                            <span>•</span>
                            <span>
                              <strong>{snap.summary.transactionsCount}</strong> caisse
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDownloadSnapshot(snap)}
                          title="Télécharger ce point en fichier .json"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSnapshot(snap.id)}
                          title="Supprimer ce point"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(snap)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Toutes les données restent 100% locales et confidentielles à votre atelier.</span>
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(false)}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-700 rounded-xl shadow-2xs transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
