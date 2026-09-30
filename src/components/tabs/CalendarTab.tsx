import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FilePlus2,
  Trash2,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Table as TableIcon,
  LayoutGrid,
  List,
  Edit3,
  Users,
  Check,
  Settings,
} from 'lucide-react';
import { Appointment } from '../../types';
import { formatDate, formatDateLong, formatDateFull } from '../../utils/dateUtils';
import { WorkshopConfigModal } from '../WorkshopConfigModal';

export const CalendarTab: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    mechanics,
    workshopBays,
    clients,
    vehicles,
    theme,
    addDocument,
    setViewingDocument,
    setActiveTab,
  } = useApp();

  // Active view: 'grid31' (monthly table grid) | 'table31' (31-day rows table) | 'dayDetail' (selected day list)
  const [calendarView, setCalendarView] = useState<'grid31' | 'table31' | 'dayDetail'>('grid31');

  // Month navigation: year and month (0-indexed: 8 = Septembre 2026, 9 = Octobre 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = Septembre

  // Selected day for dayDetail view
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-09-30');

  // Filters
  const [mechanicFilter, setMechanicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Workshop config modal (Mechanics & Bays manager)
  const [isWorkshopConfigModalOpen, setIsWorkshopConfigModalOpen] = useState(false);
  const [workshopConfigTab, setWorkshopConfigTab] = useState<'mechanics' | 'bays'>('mechanics');

  // Edit existing appointment modal state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Modal for new appointment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New appointment form state
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-09-30');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState(60);
  const [newServiceType, setNewServiceType] = useState('Révision générale & Vidange');
  const [newMechanic, setNewMechanic] = useState(mechanics[0]?.name || 'Fabrice');
  const [newBay, setNewBay] = useState(workshopBays[0]?.name || 'Pont 1');
  const [newNotes, setNewNotes] = useState('');

  const clientVehicles = vehicles.filter((v) => v.clientId === newClientId);

  const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Days count in current month (e.g. 30 or 31)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // First day of month day-of-week (1 = Monday, ..., 0/7 = Sunday)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday = 0, Sunday = 6
  const startingDayOffset = (firstDayOfWeek + 6) % 7;

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper to format date string YYYY-MM-DD
  const formatDayDate = (dayNumber: number): string => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNumber).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  // Filter appointments for current month and active filters
  const getAppointmentsForDay = (dateStr: string): Appointment[] => {
    return appointments.filter((apt) => {
      if (apt.date !== dateStr) return false;
      if (mechanicFilter !== 'all' && apt.mechanic !== mechanicFilter) return false;
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
      return true;
    });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newVehicleId) {
      alert('Veuillez sélectionner un client et un véhicule.');
      return;
    }

    addAppointment({
      clientId: newClientId,
      vehicleId: newVehicleId,
      date: newDate,
      startTime: newStartTime,
      durationMinutes: Number(newDuration),
      serviceType: newServiceType,
      mechanic: newMechanic,
      bay: newBay,
      status: 'planifie',
      notes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewNotes('');
  };

  const handleGenerateDocument = (apt: Appointment, type: 'devis' | 'facture') => {
    const client = clients.find((c) => c.id === apt.clientId);
    const vehicle = vehicles.find((v) => v.id === apt.vehicleId);

    const prefix = type === 'devis' ? 'DEV' : 'FAC';
    const year = new Date().getFullYear();
    const ref = `${prefix}-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDoc = addDocument({
      type,
      referenceNumber: ref,
      date: apt.date,
      validityDate: type === 'devis' ? '2026-10-30' : undefined,
      dueDate: type === 'facture' ? '2026-10-30' : undefined,
      clientId: apt.clientId,
      vehicleId: apt.vehicleId,
      status: type === 'devis' ? 'envoye' : 'brouillon',
      items: [
        {
          id: `item-${Date.now()}-1`,
          type: 'main_oeuvre',
          reference: 'MO-ATELIER',
          description: `Intervention : ${apt.serviceType} (${apt.durationMinutes} min)`,
          quantity: Math.max(0.5, apt.durationMinutes / 60),
          unitPriceHT: 68.0,
          discountPercent: 0,
          tvaRate: 20,
        },
        {
          id: `item-${Date.now()}-2`,
          type: 'piece',
          reference: 'CONSOMMABLES',
          description: 'Fournitures d’atelier, lubrifiants et ingrédients',
          quantity: 1,
          unitPriceHT: 25.0,
          discountPercent: 0,
          tvaRate: 20,
        },
      ],
      totalPartsHT: 25,
      totalLaborHT: 68 * (apt.durationMinutes / 60),
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0,
      amountPaid: 0,
      notes: `Établi depuis le rendez-vous atelier du ${formatDate(apt.date)}. Mécanicien : ${apt.mechanic}.`,
      mileageAtService: vehicle?.mileage,
    });

    if (type === 'facture') {
      updateAppointment(apt.id, { status: 'facture' });
    }

    setViewingDocument(newDoc);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'planifie':
        return <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">Planifié</span>;
      case 'en_cours':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">En atelier</span>;
      case 'termine':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Terminé</span>;
      case 'facture':
        return <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">Facturé</span>;
      case 'annule':
        return <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">Annulé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div
        className="p-4 rounded-xl border shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors"
        style={{
          backgroundColor: theme.cardBgColor || '#ffffff',
          borderColor: theme.cardBorderColor || '#e2e8f0',
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Planning & Tableau d'Atelier sur 31 Jours
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Visuel complet sous forme de tableau mensuel de 31 jours avec suivi des ponts, baies et mécaniciens.
          </p>
        </div>

        {/* View Switcher & Month Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setCalendarView('grid31')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                calendarView === 'grid31' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grille 31 Jours</span>
            </button>

            <button
              onClick={() => setCalendarView('table31')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                calendarView === 'table31' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tableau Lignes 1 à 31</span>
            </button>

            <button
              onClick={() => setCalendarView('dayDetail')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                calendarView === 'dayDetail' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Journée ({selectedDayDate.slice(-2)})</span>
            </button>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded text-slate-700 transition-colors"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-900 px-2 min-w-36 text-center">
              {MONTH_NAMES[currentMonth]} {currentYear} ({daysInMonth} jours)
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded text-slate-700 transition-colors"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Workshop Config (Mechanics & Bays) Button */}
          <button
            onClick={() => {
              setWorkshopConfigTab('mechanics');
              setIsWorkshopConfigModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg shadow-xs transition-colors"
            title="Gérer les mécaniciens et les emplacements de l'atelier"
          >
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            <span>Gérer Baies & Mécaniciens</span>
          </button>

          {/* New Appointment Button */}
          <button
            onClick={() => {
              setNewDate(selectedDayDate);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-95 shadow-xs"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* Workshop Bays / Mechanics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {workshopBays.map((bay) => {
          const appointmentsMonth = appointments.filter(
            (a) =>
              (a.bay === bay.name || a.bay.includes(bay.name)) &&
              a.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)
          ).length;
          const assignedMechanic = bay.defaultMechanic || 'Équipe';

          return (
            <div
              key={bay.id}
              className="p-3.5 rounded-xl border shadow-xs space-y-1.5 transition-all hover:border-slate-300"
              style={{
                backgroundColor: theme.cardBgColor || '#ffffff',
                borderColor: theme.cardBorderColor || '#e2e8f0',
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 truncate" title={bay.name}>
                  {bay.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setWorkshopConfigTab('bays');
                      setIsWorkshopConfigModalOpen(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Modifier cet emplacement"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {bay.description || 'Emplacement atelier'}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  Opérateur : <strong className="text-slate-700">{assignedMechanic}</strong>
                </span>
                <span className="font-mono font-bold text-sky-700">
                  {appointmentsMonth} RDV ce mois
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium">Filtrer mécanicien :</span>
          <select
            value={mechanicFilter}
            onChange={(e) => setMechanicFilter(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-700 text-xs"
          >
            <option value="all">Tous les mécaniciens ({mechanics.length})</option>
            {mechanics.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.role || 'Mécanicien'})
              </option>
            ))}
          </select>

          <span className="text-slate-500 font-medium ml-2">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
          >
            <option value="all">Tous statuts</option>
            <option value="planifie">Planifiés</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminés</option>
            <option value="facture">Facturés</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Mois de <strong>{MONTH_NAMES[currentMonth]} {currentYear}</strong> : <strong className="font-mono text-slate-900">{daysInMonth} jours</strong> affichés
        </div>
      </div>

      {/* VIEW 1: 31-DAY MONTHLY CALENDAR GRID TABLE */}
      {calendarView === 'grid31' && (
        <div
          className="rounded-xl border shadow-xs overflow-hidden transition-colors"
          style={{
            backgroundColor: theme.cardBgColor || '#ffffff',
            borderColor: theme.cardBorderColor || '#e2e8f0',
          }}
        >
          {/* Weekday Table Header */}
          <div
            className="grid grid-cols-7 border-b text-center font-bold text-xs py-2.5 transition-colors"
            style={{
              backgroundColor: theme.tableHeaderBgColor || '#f1f5f9',
              borderColor: theme.cardBorderColor || '#e2e8f0',
              color: theme.textPrimaryColor || '#0f172a',
            }}
          >
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={`${i >= 5 ? 'text-rose-500' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 31-Day Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/80 bg-slate-200/40">
            {/* Blank offset cells for starting day */}
            {Array.from({ length: startingDayOffset }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-28 p-1.5 bg-slate-50/60 opacity-40 select-none"
              />
            ))}

            {/* All days from 1 to 31 (or 28-31) */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = formatDayDate(dayNum);
              const dayApts = getAppointmentsForDay(dateStr);
              const isToday = dateStr === '2026-09-30';
              const isSelected = dateStr === selectedDayDate;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDayDate(dateStr);
                  }}
                  className={`min-h-32 p-2 flex flex-col justify-between transition-all group relative cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/70 ring-2 ring-sky-500/40 z-10'
                      : isToday
                      ? 'bg-amber-50/30'
                      : 'bg-white hover:bg-slate-50/80'
                  }`}
                >
                  {/* Day cell header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs tabular-nums ${
                        isToday
                          ? 'bg-slate-900 text-white'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>

                    <div className="flex items-center gap-1">
                      {dayApts.length > 0 && (
                        <span
                          className="px-1.5 py-0.2 rounded font-bold text-[10px] text-white shadow-2xs"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {dayApts.length} RDV
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDate(dateStr);
                          setNewDate(dateStr);
                          setIsAddModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-500 transition-opacity"
                        title={`Ajouter un rendez-vous le ${dayNum}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Appointments inside cell */}
                  <div className="space-y-1.5 flex-1 overflow-hidden">
                    {dayApts.slice(0, 2).map((apt) => {
                      const client = clients.find((c) => c.id === apt.clientId);
                      const vehicle = vehicles.find((v) => v.id === apt.vehicleId);

                      return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayDate(dateStr);
                            setCalendarView('dayDetail');
                          }}
                          className="p-1.5 rounded-lg border border-slate-200/90 bg-white hover:border-slate-400 text-[10px] space-y-0.5 shadow-2xs transition-colors"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span className="tabular-nums font-mono text-[9px] bg-slate-100 px-1 rounded">
                              {apt.startTime}
                            </span>
                            <span className="text-slate-500 font-medium text-[9px] truncate max-w-16">
                              {apt.mechanic}
                            </span>
                          </div>

                          <div className="font-semibold text-slate-800 truncate">
                            {apt.serviceType}
                          </div>

                          {vehicle && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-500">
                              <span className="font-mono font-bold text-slate-900">{vehicle.licensePlate}</span>
                              <span className="truncate">{vehicle.brand}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {dayApts.length > 2 && (
                      <div className="text-[10px] text-slate-500 text-center font-semibold pt-0.5">
                        +{dayApts.length - 2} autre(s) RDV...
                      </div>
                    )}
                  </div>

                  {/* Bottom Day Indicator */}
                  <div className="pt-1 text-[9px] text-slate-400 flex items-center justify-between">
                    <span>Jour {dayNum}/31</span>
                    {dayApts.length === 0 && <span className="text-slate-300">Libre</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 31-DAY LINEAR WORKSHOP TABLE */}
      {calendarView === 'table31' && (
        <div
          className="rounded-xl border shadow-xs overflow-hidden transition-colors"
          style={{
            backgroundColor: theme.cardBgColor || '#ffffff',
            borderColor: theme.cardBorderColor || '#e2e8f0',
          }}
        >
          <div className="p-4 border-b border-inherit flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Tableau Linéaire d'Atelier : Du 1er au {daysInMonth} {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <span className="text-xs text-slate-500">
              Suivi détaillé de l'occupation quotidienne des ponts et baies
            </span>
          </div>

          <div className="overflow-x-auto max-h-[650px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead
                className="sticky top-0 z-10 border-b uppercase text-[11px] font-semibold"
                style={{
                  backgroundColor: theme.tableHeaderBgColor || '#f1f5f9',
                  borderColor: theme.cardBorderColor || '#e2e8f0',
                  color: theme.textPrimaryColor || '#0f172a',
                }}
              >
                <tr>
                  <th className="py-2.5 px-4 w-36">Jour / Date</th>
                  <th className="py-2.5 px-4 w-28">Charge Atelier</th>
                  {workshopBays.slice(0, 3).map((bay) => (
                    <th key={bay.id} className="py-2.5 px-4 truncate max-w-44">
                      {bay.name}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = formatDayDate(dayNum);
                  const dayApts = getAppointmentsForDay(dateStr);
                  const isToday = dateStr === '2026-09-30';

                  return (
                    <tr
                      key={dateStr}
                      onClick={() => setSelectedDayDate(dateStr)}
                      className={`hover:bg-slate-50/80 cursor-pointer ${isToday ? 'bg-amber-50/40 font-medium' : ''}`}
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs tabular-nums ${
                              isToday ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {dayNum}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {dayNum} {MONTH_NAMES[currentMonth].slice(0, 4)}.
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Jour {dayNum} sur 31
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        {dayApts.length === 0 ? (
                          <span className="text-[11px] font-medium text-slate-400">Atelier libre</span>
                        ) : dayApts.length >= 3 ? (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Complet ({dayApts.length})
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {dayApts.length} RDV planifié(s)
                          </span>
                        )}
                      </td>

                      {/* Dynamic Bays Columns */}
                      {workshopBays.slice(0, 3).map((bay) => {
                        const bayApts = dayApts.filter(
                          (a) => a.bay === bay.name || a.bay.includes(bay.name)
                        );
                        return (
                          <td key={bay.id} className="py-2.5 px-4">
                            {bayApts.length === 0 ? (
                              <span className="text-slate-300 text-[11px]">—</span>
                            ) : (
                              <div className="space-y-1">
                                {bayApts.map((a) => (
                                  <div key={a.id} className="text-[11px]">
                                    <strong className="text-slate-800">{a.startTime}</strong> : {a.serviceType} ({a.mechanic})
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayDate(dateStr);
                              setNewDate(dateStr);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                            title="Ajouter un RDV ce jour"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayDate(dateStr);
                              setCalendarView('dayDetail');
                            }}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                            title="Voir la journée en détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SELECTED DAY DETAILED VIEW */}
      {calendarView === 'dayDetail' && (
        <div
          className="rounded-xl border shadow-xs p-6 space-y-6 transition-colors"
          style={{
            backgroundColor: theme.cardBgColor || '#ffffff',
            borderColor: theme.cardBorderColor || '#e2e8f0',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <span>Rendez-vous du {formatDateFull(selectedDayDate)}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Liste complète des interventions prévues, mécaniciens affectés et émission directe de devis / factures.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewDate(selectedDayDate);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un RDV ({formatDate(selectedDayDate)})</span>
              </button>

              <button
                onClick={() => setCalendarView('grid31')}
                className="px-3 py-1.5 border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100"
              >
                Retour au tableau 31 jours
              </button>
            </div>
          </div>

          {/* List of day appointments */}
          <div className="space-y-3">
            {getAppointmentsForDay(selectedDayDate).length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-xl space-y-3">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                <p>Aucun rendez-vous planifié pour le {formatDateLong(selectedDayDate)}.</p>
                <button
                  onClick={() => {
                    setNewDate(selectedDayDate);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 text-white font-semibold rounded-lg text-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Planifier une intervention ce jour
                </button>
              </div>
            ) : (
              getAppointmentsForDay(selectedDayDate).map((apt) => {
                const client = clients.find((c) => c.id === apt.clientId);
                const vehicle = vehicles.find((v) => v.id === apt.vehicleId);

                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-center min-w-20">
                        <span className="font-black text-sm text-slate-900 block font-mono">
                          {apt.startTime}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {apt.durationMinutes} min
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {apt.serviceType}
                          </span>
                          {getStatusBadge(apt.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                          {/* Quick Bay Selector */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs hover:border-slate-300">
                            <span className="text-slate-400 font-medium">Emplacement :</span>
                            <select
                              value={apt.bay}
                              onChange={(e) => updateAppointment(apt.id, { bay: e.target.value })}
                              className="bg-transparent font-bold text-slate-800 hover:text-sky-600 focus:outline-hidden cursor-pointer"
                              title="Changer rapidement d'emplacement / baie"
                            >
                              {workshopBays.map((b) => (
                                <option key={b.id} value={b.name}>
                                  {b.name}
                                </option>
                              ))}
                              {!workshopBays.some((b) => b.name === apt.bay) && (
                                <option value={apt.bay}>{apt.bay}</option>
                              )}
                            </select>
                          </div>

                          {/* Quick Mechanic Selector */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs hover:border-slate-300">
                            <span className="text-slate-400 font-medium">Mécanicien :</span>
                            <select
                              value={apt.mechanic}
                              onChange={(e) => updateAppointment(apt.id, { mechanic: e.target.value })}
                              className="bg-transparent font-bold text-slate-800 hover:text-sky-600 focus:outline-hidden cursor-pointer"
                              title="Changer rapidement de mécanicien assigné"
                            >
                              {mechanics.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                              {!mechanics.some((m) => m.name === apt.mechanic) && (
                                <option value={apt.mechanic}>{apt.mechanic}</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {client && (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {client.type === 'professionnel' ? client.companyName : `${client.firstName} ${client.lastName}`}
                          </p>
                          <p className="text-slate-500 text-[11px]">{client.phone}</p>
                        </div>
                      )}

                      {vehicle && (
                        <div className="border-l border-slate-200 pl-4">
                          <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-mono font-bold text-[10px]">
                            {vehicle.licensePlate}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">{vehicle.brand} {vehicle.model}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAppointment(apt)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-semibold text-[11px] transition-colors"
                        title="Modifier tous les détails du rendez-vous"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleGenerateDocument(apt, 'devis')}
                        className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-100 rounded font-semibold text-[11px]"
                      >
                        Créer Devis
                      </button>

                      <button
                        onClick={() => handleGenerateDocument(apt, 'facture')}
                        className="px-2.5 py-1.5 text-white rounded font-semibold text-[11px] shadow-xs"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Facturer
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Supprimer ce rendez-vous ?')) {
                            deleteAppointment(apt.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-700" />
                <span>Nouveau Rendez-vous Atelier</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Client *
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => {
                      setNewClientId(e.target.value);
                      const firstVeh = vehicles.find((v) => v.clientId === e.target.value);
                      if (firstVeh) setNewVehicleId(firstVeh.id);
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.type === 'professionnel' ? `${c.companyName} (${c.lastName})` : `${c.firstName} ${c.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Véhicule du client *
                  </label>
                  <select
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  >
                    {clientVehicles.length === 0 ? (
                      <option value="">Aucun véhicule enregistré pour ce client</option>
                    ) : (
                      clientVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} — {v.brand} {v.model}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Heure de début *</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Prestation demandée / Motif *
                  </label>
                  <input
                    type="text"
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value)}
                    placeholder="ex: Remplacement plaquettes et disques avant + purge"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Durée estimée (minutes)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={30}>30 min (Express / Contrôle)</option>
                    <option value={60}>1 heure (Vidange / Filtres)</option>
                    <option value={90}>1h30 (Freinage / Climatisation)</option>
                    <option value={120}>2 heures (Pneus + Révision)</option>
                    <option value={240}>4 heures (Distribution / Embrayage)</option>
                    <option value={480}>Journée complète (Moteur / Boîte)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Mécanicien assigné</label>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkshopConfigTab('mechanics');
                        setIsWorkshopConfigModalOpen(true);
                      }}
                      className="text-[11px] text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Gérer l'équipe</span>
                    </button>
                  </div>
                  <select
                    value={newMechanic}
                    onChange={(e) => setNewMechanic(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role || 'Mécanicien'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Emplacement / Baie</label>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkshopConfigTab('bays');
                        setIsWorkshopConfigModalOpen(true);
                      }}
                      className="text-[11px] text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-0.5"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Gérer les baies</span>
                    </button>
                  </div>
                  <select
                    value={newBay}
                    onChange={(e) => setNewBay(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {workshopBays.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.description || 'Atelier'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Notes & Consignes particulières</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="ex: Client attend sur place, récupérer ancien filtre..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white font-semibold rounded-lg shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Enregistrer le Rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>Modifier le Rendez-vous Atelier</span>
              </h3>
              <button
                onClick={() => setEditingAppointment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateAppointment(editingAppointment.id, {
                  serviceType: editingAppointment.serviceType,
                  date: editingAppointment.date,
                  startTime: editingAppointment.startTime,
                  durationMinutes: Number(editingAppointment.durationMinutes),
                  mechanic: editingAppointment.mechanic,
                  bay: editingAppointment.bay,
                  status: editingAppointment.status,
                  notes: editingAppointment.notes,
                });
                setEditingAppointment(null);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Prestation demandée / Motif *
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.serviceType}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, serviceType: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date d'intervention *</label>
                  <input
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, date: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Heure de début *</label>
                  <input
                    type="time"
                    value={editingAppointment.startTime}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, startTime: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Durée estimée (minutes)</label>
                  <select
                    value={editingAppointment.durationMinutes}
                    onChange={(e) =>
                      setEditingAppointment({
                        ...editingAppointment,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={30}>30 min (Express / Contrôle)</option>
                    <option value={60}>1 heure (Vidange / Filtres)</option>
                    <option value={90}>1h30 (Freinage / Climatisation)</option>
                    <option value={120}>2 heures (Pneus + Révision)</option>
                    <option value={240}>4 heures (Distribution / Embrayage)</option>
                    <option value={480}>Journée complète (Moteur / Boîte)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Statut de l'intervention</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) =>
                      setEditingAppointment({
                        ...editingAppointment,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours (sur le pont)</option>
                    <option value="termine">Terminé (prêt à facturer)</option>
                    <option value="facture">Facturé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>

                {/* MODIFIER LE MÉCANICIEN ASSIGNÉ */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Mécanicien assigné</label>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkshopConfigTab('mechanics');
                        setIsWorkshopConfigModalOpen(true);
                      }}
                      className="text-[11px] text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Gérer l'équipe</span>
                    </button>
                  </div>
                  <select
                    value={editingAppointment.mechanic}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, mechanic: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium"
                  >
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role || 'Mécanicien'})
                      </option>
                    ))}
                    {!mechanics.some((m) => m.name === editingAppointment.mechanic) && (
                      <option value={editingAppointment.mechanic}>
                        {editingAppointment.mechanic}
                      </option>
                    )}
                  </select>
                </div>

                {/* MODIFIER L'EMPLACEMENT ET LA BAIE */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Emplacement / Baie</label>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkshopConfigTab('bays');
                        setIsWorkshopConfigModalOpen(true);
                      }}
                      className="text-[11px] text-amber-600 hover:text-amber-800 hover:underline flex items-center gap-0.5"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Gérer les baies</span>
                    </button>
                  </div>
                  <select
                    value={editingAppointment.bay}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, bay: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-medium"
                  >
                    {workshopBays.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.description || 'Atelier'})
                      </option>
                    ))}
                    {!workshopBays.some((b) => b.name === editingAppointment.bay) && (
                      <option value={editingAppointment.bay}>
                        {editingAppointment.bay}
                      </option>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Notes & Consignes particulières</label>
                  <textarea
                    rows={2}
                    value={editingAppointment.notes || ''}
                    onChange={(e) =>
                      setEditingAppointment({ ...editingAppointment, notes: e.target.value })
                    }
                    placeholder="Instructions mécanicien, client sur place..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-white font-semibold rounded-lg text-xs shadow-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workshop Configuration Modal (Manage Mechanics & Bays) */}
      <WorkshopConfigModal
        isOpen={isWorkshopConfigModalOpen}
        onClose={() => setIsWorkshopConfigModalOpen(false)}
        initialTab={workshopConfigTab}
      />
    </div>
  );
};
