import { useState, FormEvent } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Camera,
  QrCode,
  FileSpreadsheet,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  Download,
  Building,
  RefreshCw,
  PlusCircle,
  Settings,
  MessageSquareHeart,
  TrendingUp,
  Layers,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  MinusCircle,
  BookmarkCheck,
  HelpCircle
} from 'lucide-react';
import { Participant, EventItem, SyncConfig, FeedbackQuestion } from '../types';
import { exportToExcel, exportToCSV } from '../utils/googleSheets';
import { SEKOLAH_MITRA_LIST } from '../utils/storage';

interface PanitiaDashboardProps {
  participants: Participant[];
  events: EventItem[];
  activeEvent: EventItem;
  syncConfig: SyncConfig;
  onSelectActiveEvent: (eventId: string) => void;
  onOpenCreateEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenScanner: () => void;
  onOpenMasterCheckoutQr: () => void;
  onOpenSheetSync: () => void;
  onToggleCheckIn: (participantId: string) => void;
  onToggleCheckOut: (participantId: string) => void;
  onDeleteParticipant: (participantId: string) => void;
  onAddParticipant: (p: Partial<Participant>) => void;
  onUpdateEventInfo: (info: EventItem) => void;
}

export function PanitiaDashboard({
  participants,
  events,
  activeEvent,
  syncConfig,
  onSelectActiveEvent,
  onOpenCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onOpenScanner,
  onOpenMasterCheckoutQr,
  onOpenSheetSync,
  onToggleCheckIn,
  onToggleCheckOut,
  onDeleteParticipant,
  onAddParticipant,
  onUpdateEventInfo
}: PanitiaDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'attendance' | 'feedback' | 'settings'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checkedIn' | 'notCheckedIn' | 'checkedOut'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedParticipantForDetail, setSelectedParticipantForDetail] = useState<Participant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const [newParticipantForm, setNewParticipantForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    category: activeEvent.categories?.[0] || 'Umum',
    attendanceConfirmation: 'Hadir' as 'Hadir' | 'Tidak'
  });

  // Filter participants for the currently active event
  const currentEventParticipants = participants.filter((p) => p.eventId === activeEvent.id);

  // Statistics calculation for the active event
  const totalCount = currentEventParticipants.length;
  const checkedInCount = currentEventParticipants.filter((p) => p.isCheckedIn).length;
  const checkedOutCount = currentEventParticipants.filter((p) => p.isCheckedOut).length;
  const notCheckedInCount = totalCount - checkedInCount;

  const checkInRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;
  const checkOutRate = checkedInCount > 0 ? Math.round((checkedOutCount / checkedInCount) * 100) : 0;

  // Feedback statistics
  const feedbackParticipants = currentEventParticipants.filter((p) => p.feedback);
  const totalFeedbacks = feedbackParticipants.length;
  const avgOverallRating =
    totalFeedbacks > 0
      ? (
          feedbackParticipants.reduce((acc, p) => acc + (p.feedback?.overallRating || 0), 0) /
          totalFeedbacks
        ).toFixed(1)
      : '0.0';

  const avgSpeakerRating =
    totalFeedbacks > 0
      ? (
          feedbackParticipants.reduce((acc, p) => acc + (p.feedback?.speakerRating || 0), 0) /
          totalFeedbacks
        ).toFixed(1)
      : '0.0';

  const avgFacilityRating =
    totalFeedbacks > 0
      ? (
          feedbackParticipants.reduce((acc, p) => acc + (p.feedback?.facilityRating || 0), 0) /
          totalFeedbacks
        ).toFixed(1)
      : '0.0';

  // Filtered participants list
  const filteredParticipants = currentEventParticipants.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.organization.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'checkedIn'
        ? p.isCheckedIn && !p.isCheckedOut
        : statusFilter === 'notCheckedIn'
        ? !p.isCheckedIn
        : statusFilter === 'checkedOut'
        ? p.isCheckedOut
        : true;

    const matchesCategory = categoryFilter === 'all' ? true : p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateParticipant = (e: FormEvent) => {
    e.preventDefault();
    if (!newParticipantForm.name.trim()) return;

    onAddParticipant({
      ...newParticipantForm,
      eventId: activeEvent.id
    });

    setNewParticipantForm({
      name: '',
      email: '',
      phone: '',
      organization: '',
      category: activeEvent.categories?.[0] || 'Umum',
      attendanceConfirmation: 'Hadir'
    });
    setIsAddModalOpen(false);
  };

  const handleCopyEventLink = (eventId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?event=${eventId}`;
    navigator.clipboard.writeText(url);
    setCopiedEventId(eventId);
    setTimeout(() => setCopiedEventId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-600/80 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              Mitra Office Admin Hub
            </span>
            <span className="text-xs text-slate-400">
              Total {events.length} Event Terdaftar
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Dashboard Manajemen & Presensi Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Event Aktif Saat Ini:{' '}
            <strong className="text-blue-400 font-semibold">{activeEvent.title}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Event Baru</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Buka Scanner QR</span>
          </button>

          <button
            onClick={onOpenMasterCheckoutQr}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>1 Master QR Check-Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'events'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Daftar Semua Event ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'attendance'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Peserta & Presensi ({totalCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'feedback'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <MessageSquareHeart className="w-4 h-4 text-amber-400" />
          <span>Evaluasi & Feedback ({totalFeedbacks})</span>
        </button>

        <button
          onClick={onOpenSheetSync}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Excel & Google Sheets</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: DAFTAR SEMUA EVENT (EVENT MANAGEMENT HUB) */}
      {/* ========================================================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Kelola Event Mitra Office</h2>
              <p className="text-xs text-slate-500">
                Pilih event untuk mengaktifkan pemindaian presensi, pendaftaran, dan laporan data
              </p>
            </div>
            <button
              onClick={onOpenCreateEvent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Buat Event Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const count = participants.filter((p) => p.eventId === ev.id).length;
              const checkedIn = participants.filter((p) => p.eventId === ev.id && p.isCheckedIn).length;
              const isActive = ev.id === activeEvent.id;

              return (
                <div
                  key={ev.id}
                  className={`bg-white rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg'
                      : 'border-slate-200 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Event Photo - Portrait Format Showcase */}
                    <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {isActive && (
                          <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-md">
                            ★ Event Aktif
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-200 rounded-lg text-[10px] font-bold">
                          {ev.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg text-[10px] font-medium">
                          Potrait
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] text-blue-200 font-medium flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> {ev.organizer}
                        </p>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">
                        {ev.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{ev.date} ({ev.time})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="line-clamp-1">{ev.location}</span>
                        </div>
                      </div>

                      {/* Participant Progress Bar */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{count} Peserta Terdaftar</span>
                          <span className="text-emerald-600">{checkedIn} Hadir</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{
                              width: `${count > 0 ? (checkedIn / count) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectActiveEvent(ev.id);
                          setActiveSubTab('attendance');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Pilih & Kelola Event
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveSubTab('attendance')}
                        className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Buka Data Peserta
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyEventLink(ev.id)}
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                      title="Salin Tautan Registrasi Event"
                    >
                      {copiedEventId === ev.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onEditEvent(ev)}
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
                      title="Edit Detail & Foto Event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {events.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus event "${ev.title}"?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-600 transition-colors"
                        title="Hapus Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: ATTENDANCE & PARTICIPANTS TABLE */}
      {/* ========================================================= */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Key Metrics Cards for Active Event */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Terdaftar</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Kuota target: {activeEvent.quota || 200}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Sudah Check-In</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{checkedInCount}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                {checkInRate}% Tingkat Kehadiran
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Sudah Check-Out</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600">{checkedOutCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">{checkOutRate}% dari yang hadir</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Belum Hadir</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{notCheckedInCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">Menunggu kehadiran</p>
            </div>
          </div>

          {/* Search, Filters, & Table Actions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, ID tiket, email, atau instansi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="checkedIn">Sudah Check-In</option>
                  <option value="notCheckedIn">Belum Hadir</option>
                  <option value="checkedOut">Sudah Check-Out</option>
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tambah Peserta Manual</span>
                </button>
              </div>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">No & ID Tiket</th>
                    <th className="px-4 py-3.5">Nama & Kontak</th>
                    <th className="px-4 py-3.5">Instansi / Divisi</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5 text-center">Status Check-In</th>
                    <th className="px-4 py-3.5 text-center">Status Check-Out</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Tidak ada data peserta yang cocok untuk event ini.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-xs">{idx + 1}.</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold text-xs border border-slate-200">
                              {p.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {p.googlePicture ? (
                              <img
                                src={p.googlePicture}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 border border-slate-200">
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-slate-900">{p.name}</p>
                                {p.isGoogleVerified && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200" title="Akun Google Terverifikasi">
                                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                                    Google
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-500 text-xs">{p.email} • {p.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-medium">
                          {p.organization || '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold text-[11px]">
                              {p.category}
                            </span>
                            <div>
                              {p.attendanceConfirmation === 'Tidak' ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold">
                                  ✕ Konf: Tidak Hadir
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                  ✓ Konf: Hadir
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => onToggleCheckIn(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                              p.isCheckedIn
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {p.isCheckedIn ? '✓ Sudah Hadir' : '○ Belum Hadir'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => onToggleCheckOut(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                              p.isCheckedOut
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {p.isCheckedOut ? '✓ Checked Out' : '○ Belum Out'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedParticipantForDetail(p)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="Lihat Detail & Feedback"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus peserta ${p.name}?`)) {
                                  onDeleteParticipant(p.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Hapus Peserta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: EVALUATION & FEEDBACK */}
      {/* ========================================================= */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-6">
          {/* Summary Ratings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Satisfaction (Rata-rata)
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                <span className="text-4xl font-extrabold text-slate-900">{avgOverallRating}</span>
                <span className="text-slate-400 text-sm">/ 5.0</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Skala bintang 1-5 dari seluruh peserta</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Feedback Masuk
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <MessageSquareHeart className="w-8 h-8 text-teal-600" />
                <span className="text-4xl font-extrabold text-slate-900">{totalFeedbacks}</span>
                <span className="text-slate-400 text-sm">Responden</span>
              </div>
              <p className="text-[11px] text-teal-700 font-semibold mt-1">
                {checkedOutCount > 0 ? `${Math.round((totalFeedbacks / checkedOutCount) * 100)}% dari yang check-out` : '0%'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Metode Evaluasi Acara
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-extrabold text-indigo-950">MenDAKI</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Drop • Add • Keep • Improve</p>
            </div>
          </div>

          {/* Feedback Responses List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Ulasan & Masukan dari Peserta</h3>
              <span className="text-xs text-slate-500 font-medium">{feedbackParticipants.length} data feedback tersimpan</span>
            </div>
            {feedbackParticipants.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center">
                Belum ada feedback yang masuk untuk event ini. Peserta akan mengisi MenDAKI & Overall Satisfaction saat memindai 1 Master QR Check-Out.
              </p>
            ) : (
              <div className="space-y-4">
                {feedbackParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.organization || 'Umum'} • {p.id}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>Overall: {p.feedback?.overallRating || 5} / 5 Bintang</span>
                      </div>
                    </div>

                    {/* Reason Behind Rating */}
                    {(p.feedback?.ratingReason || p.feedback?.suggestions) && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                          Reason Behind Rating:
                        </p>
                        <p className="text-slate-800 italic">
                          "{p.feedback.ratingReason || p.feedback.suggestions}"
                        </p>
                      </div>
                    )}

                    {/* MenDAKI Framework Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Drop */}
                      {p.feedback?.drop && p.feedback.drop !== '-' && (
                        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3">
                          <p className="font-bold text-rose-900 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                            <MinusCircle className="w-3.5 h-3.5 text-rose-600" /> Drop (Dihilangkan/Dikurangi):
                          </p>
                          <p className="text-slate-800 text-[11px]">{p.feedback.drop}</p>
                        </div>
                      )}

                      {/* Add */}
                      {p.feedback?.add && p.feedback.add !== '-' && (
                        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                          <p className="font-bold text-blue-900 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                            <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> Add (Hal Baru Ditambahkan):
                          </p>
                          <p className="text-slate-800 text-[11px]">{p.feedback.add}</p>
                        </div>
                      )}

                      {/* Keep */}
                      {p.feedback?.keep && p.feedback.keep !== '-' && (
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                          <p className="font-bold text-emerald-900 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> Keep (Dipertahankan):
                          </p>
                          <p className="text-slate-800 text-[11px]">{p.feedback.keep}</p>
                        </div>
                      )}

                      {/* Improve */}
                      {p.feedback?.improve && p.feedback.improve !== '-' && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                          <p className="font-bold text-amber-900 flex items-center gap-1 text-[11px] uppercase tracking-wider mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Improve (Ditingkatkan):
                          </p>
                          <p className="text-slate-800 text-[11px]">{p.feedback.improve}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedParticipantForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Detail Peserta & Tiket</h3>
              <button
                onClick={() => setSelectedParticipantForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-700">
              <p><strong>Nama:</strong> {selectedParticipantForDetail.name}</p>
              <p><strong>ID Tiket:</strong> {selectedParticipantForDetail.id}</p>
              <p><strong>Email:</strong> {selectedParticipantForDetail.email}</p>
              <p><strong>No. WhatsApp:</strong> {selectedParticipantForDetail.phone}</p>
              <p><strong>Instansi:</strong> {selectedParticipantForDetail.organization}</p>
              <p><strong>Kategori:</strong> {selectedParticipantForDetail.category}</p>
              <p>
                <strong>Konfirmasi Kehadiran:</strong>{' '}
                <span className={`font-bold ${selectedParticipantForDetail.attendanceConfirmation === 'Tidak' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedParticipantForDetail.attendanceConfirmation === 'Tidak' ? 'Tidak Hadir' : 'Hadir'}
                </span>
              </p>
              <p>
                <strong>Status Check-In:</strong>{' '}
                {selectedParticipantForDetail.isCheckedIn
                  ? `Sudah (${new Date(selectedParticipantForDetail.checkInTime || '').toLocaleTimeString('id-ID')})`
                  : 'Belum Hadir'}
              </p>
              <p>
                <strong>Status Check-Out:</strong>{' '}
                {selectedParticipantForDetail.isCheckedOut
                  ? `Sudah (${new Date(selectedParticipantForDetail.checkOutTime || '').toLocaleTimeString('id-ID')})`
                  : 'Belum Check-Out'}
              </p>

              {selectedParticipantForDetail.feedback && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 space-y-2.5">
                  <p className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>Hasil Evaluasi & Feedback:</span>
                    <span className="text-amber-600 font-bold flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedParticipantForDetail.feedback.overallRating} / 5 Bintang
                    </span>
                  </p>
                  
                  {selectedParticipantForDetail.feedback.ratingReason && (
                    <div>
                      <p className="font-semibold text-slate-700 text-[11px]">Reason behind rating:</p>
                      <p className="italic text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                        "{selectedParticipantForDetail.feedback.ratingReason}"
                      </p>
                    </div>
                  )}

                  {selectedParticipantForDetail.feedback.drop && selectedParticipantForDetail.feedback.drop !== '-' && (
                    <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                      <p className="font-bold text-rose-800 text-[11px]">Drop (Dihilangkan/Dikurangi):</p>
                      <p className="text-slate-800">{selectedParticipantForDetail.feedback.drop}</p>
                    </div>
                  )}

                  {selectedParticipantForDetail.feedback.add && selectedParticipantForDetail.feedback.add !== '-' && (
                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                      <p className="font-bold text-blue-800 text-[11px]">Add (Hal Baru Ditambahkan):</p>
                      <p className="text-slate-800">{selectedParticipantForDetail.feedback.add}</p>
                    </div>
                  )}

                  {selectedParticipantForDetail.feedback.keep && selectedParticipantForDetail.feedback.keep !== '-' && (
                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      <p className="font-bold text-emerald-800 text-[11px]">Keep (Hal Bagus Dipertahankan):</p>
                      <p className="text-slate-800">{selectedParticipantForDetail.feedback.keep}</p>
                    </div>
                  )}

                  {selectedParticipantForDetail.feedback.improve && selectedParticipantForDetail.feedback.improve !== '-' && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <p className="font-bold text-amber-800 text-[11px]">Improve (Hal Perlu Ditingkatkan):</p>
                      <p className="text-slate-800">{selectedParticipantForDetail.feedback.improve}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedParticipantForDetail(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Participant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Tambah Peserta Manual</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateParticipant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-slate-400 font-normal">(tidak harus mencantumkan gelar)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newParticipantForm.name}
                  onChange={(e) =>
                    setNewParticipantForm({ ...newParticipantForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={newParticipantForm.email}
                  onChange={(e) =>
                    setNewParticipantForm({ ...newParticipantForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={newParticipantForm.phone}
                  onChange={(e) =>
                    setNewParticipantForm({ ...newParticipantForm, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instansi / Sekolah Mitra</label>
                <select
                  value={
                    SEKOLAH_MITRA_LIST.includes(newParticipantForm.organization)
                      ? newParticipantForm.organization
                      : newParticipantForm.organization ? 'Other' : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setNewParticipantForm({ ...newParticipantForm, organization: '' });
                    } else {
                      setNewParticipantForm({ ...newParticipantForm, organization: val });
                    }
                  }}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 mb-1.5"
                >
                  <option value="">-- Pilih Sekolah Mitra / Instansi --</option>
                  {SEKOLAH_MITRA_LIST.map((school) => (
                    <option key={school} value={school}>
                      {school === 'Other' ? 'Other (Instansi / Sekolah Lainnya)' : school}
                    </option>
                  ))}
                </select>
                {(!SEKOLAH_MITRA_LIST.filter(s => s !== 'Other').includes(newParticipantForm.organization)) && (
                  <input
                    type="text"
                    placeholder="Ketik nama instansi / sekolah lainnya..."
                    value={newParticipantForm.organization}
                    onChange={(e) =>
                      setNewParticipantForm({ ...newParticipantForm, organization: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-blue-300 rounded-xl text-xs bg-blue-50/20 focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={newParticipantForm.category}
                  onChange={(e) =>
                    setNewParticipantForm({ ...newParticipantForm, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {(activeEvent.categories || ['Umum', 'Mitra Kerja', 'VIP']).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Kehadiran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNewParticipantForm({ ...newParticipantForm, attendanceConfirmation: 'Hadir' })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newParticipantForm.attendanceConfirmation === 'Hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewParticipantForm({ ...newParticipantForm, attendanceConfirmation: 'Tidak' })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newParticipantForm.attendanceConfirmation === 'Tidak'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✕ Tidak
                  </button>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
