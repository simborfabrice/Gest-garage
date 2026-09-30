import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Wrench,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Phone,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Mechanic, WorkshopBay } from '../types';

interface WorkshopConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'mechanics' | 'bays';
}

export const WorkshopConfigModal: React.FC<WorkshopConfigModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'mechanics',
}) => {
  const {
    theme,
    mechanics,
    addMechanic,
    updateMechanic,
    deleteMechanic,
    workshopBays,
    addWorkshopBay,
    updateWorkshopBay,
    deleteWorkshopBay,
    appointments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'mechanics' | 'bays'>(initialTab);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Mechanic Form State
  const [newMechanicName, setNewMechanicName] = useState('');
  const [newMechanicRole, setNewMechanicRole] = useState("Mécanicien");
  const [newMechanicPhone, setNewMechanicPhone] = useState('');

  // New Bay Form State
  const [newBayName, setNewBayName] = useState('');
  const [newBayDescription, setNewBayDescription] = useState('');
  const [newBayDefaultMechanic, setNewBayDefaultMechanic] = useState(mechanics[0]?.name || '');

  // Editing items state (temporary local buffer for inline edits)
  const [editingMechanics, setEditingMechanics] = useState<Record<string, Partial<Mechanic>>>({});
  const [editingBays, setEditingBays] = useState<Record<string, Partial<WorkshopBay>>>({});

  if (!isOpen) return null;

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Add Mechanic
  const handleAddMechanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMechanicName.trim()) return;

    const created = addMechanic({
      name: newMechanicName.trim(),
      role: newMechanicRole.trim() || 'Mécanicien',
      phone: newMechanicPhone.trim() || undefined,
      active: true,
    });

    setNewMechanicName('');
    setNewMechanicPhone('');
    showNotification(`Mécanicien « ${created.name} » ajouté avec succès.`);
  };

  // Save Mechanic changes
  const handleSaveMechanic = (id: string) => {
    const changes = editingMechanics[id];
    if (!changes) return;

    const current = mechanics.find((m) => m.id === id);
    if (!current) return;

    const newName = changes.name !== undefined ? changes.name.trim() : current.name;
    if (!newName) {
      alert('Le nom du mécanicien ne peut pas être vide.');
      return;
    }

    const oldName = current.name;
    updateMechanic(id, { ...changes, name: newName }, true);

    // Clear local edit buffer for this id
    setEditingMechanics((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    if (oldName !== newName) {
      showNotification(`Mécanicien renommé de « ${oldName} » en « ${newName} ». Tous ses rendez-vous ont été mis à jour !`);
    } else {
      showNotification(`Informations de « ${newName} » mises à jour.`);
    }
  };

  // Add Workshop Bay
  const handleAddBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBayName.trim()) return;

    const created = addWorkshopBay({
      name: newBayName.trim(),
      description: newBayDescription.trim() || 'Emplacement atelier',
      defaultMechanic: newBayDefaultMechanic || undefined,
      active: true,
    });

    setNewBayName('');
    setNewBayDescription('');
    showNotification(`Emplacement « ${created.name} » ajouté avec succès.`);
  };

  // Save Bay changes
  const handleSaveBay = (id: string) => {
    const changes = editingBays[id];
    if (!changes) return;

    const current = workshopBays.find((b) => b.id === id);
    if (!current) return;

    const newName = changes.name !== undefined ? changes.name.trim() : current.name;
    if (!newName) {
      alert("Le nom de l'emplacement ne peut pas être vide.");
      return;
    }

    const oldName = current.name;
    updateWorkshopBay(id, { ...changes, name: newName }, true);

    setEditingBays((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    if (oldName !== newName) {
      showNotification(`Emplacement renommé de « ${oldName} » en « ${newName} ». Tous les rendez-vous assignés ont été mis à jour !`);
    } else {
      showNotification(`Emplacement « ${newName} » mis à jour.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Configuration de l'Atelier : Mécaniciens & Emplacements
              </h3>
              <p className="text-xs text-slate-500">
                Personnalisez les noms des mécaniciens assignés, ponts élévateurs et baies de travail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'mechanics'
                ? 'bg-white text-slate-900 border-slate-200 border-b-white -mb-px shadow-xs'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>Mécaniciens assignés</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-700 font-mono font-bold">
              {mechanics.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bays')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
              activeTab === 'bays'
                ? 'bg-white text-slate-900 border-slate-200 border-b-white -mb-px shadow-xs'
                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Emplacements & Baies de travail</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 font-mono font-bold">
              {workshopBays.length}
            </span>
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-500 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: MECHANICS */}
          {activeTab === 'mechanics' && (
            <div className="space-y-6">
              {/* Add Mechanic Form */}
              <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-sky-600" />
                    <span>Ajouter un nouveau mécanicien à l'atelier</span>
                  </h4>
                  <span className="text-[11px] text-sky-700">Apparaîtra aussitôt dans les menus de sélection</span>
                </div>

                <form onSubmit={handleAddMechanic} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nom ou Prénom du mécanicien *
                    </label>
                    <input
                      type="text"
                      value={newMechanicName}
                      onChange={(e) => setNewMechanicName(e.target.value)}
                      placeholder="ex: Alexandre, Stéphane B., Marc..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Rôle / Spécialité
                    </label>
                    <input
                      type="text"
                      value={newMechanicRole}
                      onChange={(e) => setNewMechanicRole(e.target.value)}
                      placeholder="ex: Chef d'atelier, Diag..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Téléphone mobile
                    </label>
                    <input
                      type="text"
                      value={newMechanicPhone}
                      onChange={(e) => setNewMechanicPhone(e.target.value)}
                      placeholder="ex: 06 12 34 56 78"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter ce mécanicien</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List of Mechanics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Liste des mécaniciens en service ({mechanics.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Vous pouvez renommer un mécanicien directement ci-dessous. Le changement sera automatiquement répercuté sur ses rendez-vous.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {mechanics.map((mec) => {
                    const localEdit = editingMechanics[mec.id] || {};
                    const currentName = localEdit.name !== undefined ? localEdit.name : mec.name;
                    const currentRole = localEdit.role !== undefined ? localEdit.role : (mec.role || '');
                    const currentPhone = localEdit.phone !== undefined ? localEdit.phone : (mec.phone || '');
                    const isDirty = localEdit.name !== undefined || localEdit.role !== undefined || localEdit.phone !== undefined;

                    const assignedCount = appointments.filter((a) => a.mechanic === mec.name).length;

                    return (
                      <div
                        key={mec.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isDirty ? 'bg-amber-50/50 border-amber-300 shadow-xs' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Mechanic Name */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Nom du mécanicien
                            </label>
                            <input
                              type="text"
                              value={currentName}
                              onChange={(e) =>
                                setEditingMechanics((prev) => ({
                                  ...prev,
                                  [mec.id]: { ...prev[mec.id], name: e.target.value },
                                }))
                              }
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          {/* Role / Specialty */}
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Rôle / Titre
                            </label>
                            <input
                              type="text"
                              value={currentRole}
                              onChange={(e) =>
                                setEditingMechanics((prev) => ({
                                  ...prev,
                                  [mec.id]: { ...prev[mec.id], role: e.target.value },
                                }))
                              }
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>

                          {/* Phone */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Téléphone
                            </label>
                            <input
                              type="text"
                              value={currentPhone}
                              onChange={(e) =>
                                setEditingMechanics((prev) => ({
                                  ...prev,
                                  [mec.id]: { ...prev[mec.id], phone: e.target.value },
                                }))
                              }
                              placeholder="06..."
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>

                          {/* Stats & Actions */}
                          <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                            <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                              {assignedCount} RDV assigné(s)
                            </span>

                            {isDirty && (
                              <button
                                type="button"
                                onClick={() => handleSaveMechanic(mec.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                                title="Enregistrer les modifications"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Sauver</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Supprimer le mécanicien « ${mec.name} » ?${
                                      assignedCount > 0
                                        ? ` Attention : ${assignedCount} rendez-vous lui sont actuellement assignés.`
                                        : ''
                                    }`
                                  )
                                ) {
                                  deleteMechanic(mec.id);
                                  showNotification(`Mécanicien « ${mec.name} » supprimé.`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer ce mécanicien"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKSHOP BAYS / EMPLACEMENTS */}
          {activeTab === 'bays' && (
            <div className="space-y-6">
              {/* Add Bay Form */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>Ajouter un nouvel emplacement ou baie de levage</span>
                  </h4>
                  <span className="text-[11px] text-amber-700">Pont élévateur, baie diag, banc géométrie...</span>
                </div>

                <form onSubmit={handleAddBay} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nom de l'emplacement / Baie *
                    </label>
                    <input
                      type="text"
                      value={newBayName}
                      onChange={(e) => setNewBayName(e.target.value)}
                      placeholder="ex: Pont 3, Pont Ciseaux, Baie Carrosserie..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Description & Équipement
                    </label>
                    <input
                      type="text"
                      value={newBayDescription}
                      onChange={(e) => setNewBayDescription(e.target.value)}
                      placeholder="ex: Pont 2 colonnes 4T, Banc Diag..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Mécanicien habituel
                    </label>
                    <select
                      value={newBayDefaultMechanic}
                      onChange={(e) => setNewBayDefaultMechanic(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">(Non spécifié)</option>
                      {mechanics.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role || 'Mécanicien'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter cet emplacement</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List of Bays */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Emplacements d'atelier configurés ({workshopBays.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Modifiez le nom d'un emplacement ou pont ci-dessous. Le changement sera automatiquement répercuté sur tous les rendez-vous associés.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {workshopBays.map((bay) => {
                    const localEdit = editingBays[bay.id] || {};
                    const currentName = localEdit.name !== undefined ? localEdit.name : bay.name;
                    const currentDesc = localEdit.description !== undefined ? localEdit.description : (bay.description || '');
                    const currentDefMec = localEdit.defaultMechanic !== undefined ? localEdit.defaultMechanic : (bay.defaultMechanic || '');
                    const isDirty = localEdit.name !== undefined || localEdit.description !== undefined || localEdit.defaultMechanic !== undefined;

                    const assignedCount = appointments.filter((a) => a.bay.includes(bay.name) || a.bay === bay.name).length;

                    return (
                      <div
                        key={bay.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isDirty ? 'bg-amber-50/50 border-amber-300 shadow-xs' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Bay Name */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Nom de l'emplacement / Pont
                            </label>
                            <input
                              type="text"
                              value={currentName}
                              onChange={(e) =>
                                setEditingBays((prev) => ({
                                  ...prev,
                                  [bay.id]: { ...prev[bay.id], name: e.target.value },
                                }))
                              }
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          {/* Description */}
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Description / Type de matériel
                            </label>
                            <input
                              type="text"
                              value={currentDesc}
                              onChange={(e) =>
                                setEditingBays((prev) => ({
                                  ...prev,
                                  [bay.id]: { ...prev[bay.id], description: e.target.value },
                                }))
                              }
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                            />
                          </div>

                          {/* Default Mechanic */}
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Opérateur habituel
                            </label>
                            <select
                              value={currentDefMec}
                              onChange={(e) =>
                                setEditingBays((prev) => ({
                                  ...prev,
                                  [bay.id]: { ...prev[bay.id], defaultMechanic: e.target.value },
                                }))
                              }
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                            >
                              <option value="">(Non défini)</option>
                              {mechanics.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Actions */}
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-4">
                            <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                              {assignedCount} RDV
                            </span>

                            {isDirty && (
                              <button
                                type="button"
                                onClick={() => handleSaveBay(bay.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                                title="Enregistrer les modifications"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Sauver</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Supprimer l'emplacement « ${bay.name} » ?${
                                      assignedCount > 0
                                        ? ` Attention : ${assignedCount} rendez-vous y sont associés.`
                                        : ''
                                    }`
                                  )
                                ) {
                                  deleteWorkshopBay(bay.id);
                                  showNotification(`Emplacement « ${bay.name} » supprimé.`);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer cet emplacement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Les modifications sont enregistrées et synchronisées instantanément avec vos rendez-vous.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-white font-semibold rounded-lg text-xs shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Terminer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
