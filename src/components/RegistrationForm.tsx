import { useState, useEffect, FormEvent } from 'react';
import {
  UserPlus,
  Sparkles,
  Building,
  Mail,
  Phone,
  User,
  Award,
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  X,
  CheckCircle2,
  School,
  GraduationCap,
  QrCode,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventItem, GoogleUserProfile } from '../types';
import { generateTicketId, saveMyTicketId, SEKOLAH_MITRA_LIST } from '../utils/storage';
import { GoogleAuthButton } from './GoogleAuthButton';

interface RegistrationFormProps {
  eventInfo: EventItem;
  onRegisterSuccess: (participant: Participant) => void;
  onOpenEventDirectory?: () => void;
  registeredCount?: number;
  googleUser: GoogleUserProfile | null;
  onGoogleLoginSuccess: (user: GoogleUserProfile) => void;
  onGoogleLogout: () => void;
}

export function RegistrationForm({
  eventInfo,
  onRegisterSuccess,
  onOpenEventDirectory,
  registeredCount = 0,
  googleUser,
  onGoogleLoginSuccess,
  onGoogleLogout
}: RegistrationFormProps) {
  const [selectedOrgOption, setSelectedOrgOption] = useState<string>('');
  const [customOrgText, setCustomOrgText] = useState<string>('');

  const [formData, setFormData] = useState({
    name: googleUser?.name || '',
    email: googleUser?.email || '',
    phone: '',
    organization: '',
    category: eventInfo.categories?.[0] || 'Umum',
    attendanceConfirmation: 'Hadir' as 'Hadir' | 'Tidak'
  });

  // When googleUser changes, update form data
  useEffect(() => {
    if (googleUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || googleUser.name,
        email: googleUser.email
      }));
    }
  }, [googleUser]);

  const handleOrgOptionChange = (option: string) => {
    setSelectedOrgOption(option);
    if (option === 'Other') {
      setFormData((prev) => ({ ...prev, organization: customOrgText }));
    } else {
      setFormData((prev) => ({ ...prev, organization: option }));
    }
  };

  const handleCustomOrgChange = (text: string) => {
    setCustomOrgText(text);
    setFormData((prev) => ({ ...prev, organization: text }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      errs.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Nomor WhatsApp/HP wajib diisi';
    } else if (formData.phone.replace(/\D/g, '').length < 9) {
      errs.phone = 'Nomor telepon minimal 9 digit';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const newParticipant: Participant = {
      id: generateTicketId(),
      eventId: eventInfo.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      organization: formData.organization.trim() || '-',
      category: formData.category,
      attendanceConfirmation: formData.attendanceConfirmation,
      registeredAt: new Date().toISOString(),
      isGoogleVerified: !!googleUser,
      googleAvatarUrl: googleUser?.picture,
      googleId: googleUser?.id,
      isCheckedIn: false,
      isCheckedOut: false
    };

    setTimeout(() => {
      saveMyTicketId(newParticipant.id);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }

      onRegisterSuccess(newParticipant);
      setIsSubmitting(false);
    }, 350);
  };

  const categories =
    eventInfo.categories && eventInfo.categories.length > 0
      ? eventInfo.categories
      : ['Umum', 'Mitra Kerja', 'VIP', 'Karyawan', 'Undangan'];

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4">
      {/* Top Banner Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-2xl mb-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Pendaftaran Dibuka
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-300">
            {eventInfo.organizer}
          </span>
        </div>

        {onOpenEventDirectory && (
          <button
            type="button"
            onClick={onOpenEventDirectory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Pilih Event Lain</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Grid: Left side Portrait Event Poster, Right side Google Sign-in + Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Portrait Event Poster & Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Portrait Poster Card */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group relative">
            {/* Portrait Image (aspect-[3/4]) */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
              <img
                src={eventInfo.imageUrl}
                alt={eventInfo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-slate-900/10" />

              {/* Portrait Format Tag */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                  Foto Potrait 3:4
                </span>
              </div>

              {/* Zoom Poster Button */}
              <button
                type="button"
                onClick={() => setIsPosterModalOpen(true)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-xl backdrop-blur-md transition-all shadow-md cursor-pointer group-hover:opacity-100"
                title="Lihat Poster Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Title & Organizer Overlay on Bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] text-blue-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {eventInfo.organizer}
                </p>
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight leading-snug text-white drop-shadow-md">
                  {eventInfo.title}
                </h1>
              </div>
            </div>

            {/* Event Key Info Grid */}
            <div className="p-4 sm:p-5 bg-slate-900 text-slate-300 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Tanggal Pelaksanaan</p>
                  <p className="font-bold text-white text-sm">{eventInfo.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Waktu Acara</p>
                  <p className="font-bold text-white">{eventInfo.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Lokasi Tempat</p>
                  <p className="font-semibold text-white leading-relaxed">{eventInfo.location}</p>
                </div>
              </div>

              {eventInfo.description && (
                <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                  <p className="leading-relaxed text-slate-300 line-clamp-3">{eventInfo.description}</p>
                </div>
              )}

              {/* Speakers Badge */}
              {eventInfo.speakers && eventInfo.speakers.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 font-medium mb-1.5">Narasumber / Guest:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {eventInfo.speakers.map((spk) => (
                      <span
                        key={spk}
                        className="px-2.5 py-0.5 bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded-lg text-[11px]"
                      >
                        {spk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Google Sign-in & Registration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Akses Khusus Peserta dengan Google */}
          <GoogleAuthButton
            currentUser={googleUser}
            onLoginSuccess={onGoogleLoginSuccess}
            onLogout={onGoogleLogout}
          />

          {/* 2. Registration Form Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Formulir Registrasi Peserta
                  </h2>
                  <p className="text-xs text-slate-500">
                    {googleUser
                      ? 'Data akun Google terhubung otomatis. Lengkapi nomor HP untuk tiket QR.'
                      : 'Isi data untuk menerbitkan E-Tiket QR Code resmi acara'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
              {/* Nama Lengkap */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  {googleUser && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Terverifikasi Google
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="reg-input-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                    } text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nama lengkap peserta (tidak harus mencantumkan gelar).
                </p>
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="reg-input-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="nama@email.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                      } text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="reg-input-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="08123456789"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-slate-50/50'
                      } text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Instansi / Sekolah Mitra */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Instansi / Sekolah Mitra
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <School className="w-3.5 h-3.5" /> Sekolah Mitra Lazuardi
                  </span>
                </div>

                {/* Dropdown Selection */}
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    id="reg-select-school"
                    value={selectedOrgOption}
                    onChange={(e) => handleOrgOptionChange(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Sekolah Mitra / Instansi --</option>
                    {SEKOLAH_MITRA_LIST.map((school) => (
                      <option key={school} value={school}>
                        {school === 'Other' ? 'Other (Instansi / Sekolah Lainnya)' : school}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>

                {/* Input Teks Tambahan jika memilih 'Other' atau jika ingin ketik instansi kustom */}
                {(selectedOrgOption === 'Other' || (!selectedOrgOption && formData.organization && !SEKOLAH_MITRA_LIST.includes(formData.organization))) && (
                  <div className="pt-1.5 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Ketik Nama Instansi / Sekolah Lainnya:
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        id="reg-input-custom-org"
                        type="text"
                        value={customOrgText || (selectedOrgOption === 'Other' ? formData.organization : '')}
                        onChange={(e) => handleCustomOrgChange(e.target.value)}
                        placeholder="Contoh: Yayasan Pendidikan / Instansi Mitra / Umum"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50/20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kategori Peserta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kategori Peserta
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.category === cat
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Konfirmasi Kehadiran (Hadir / Tidak) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Konfirmasi Kehadiran <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Pilih salah satu status kehadiran</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hadir */}
                  <button
                    id="reg-btn-confirm-hadir"
                    type="button"
                    onClick={() => setFormData({ ...formData, attendanceConfirmation: 'Hadir' })}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      formData.attendanceConfirmation === 'Hadir'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          formData.attendanceConfirmation === 'Hadir'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm leading-tight text-slate-900">Hadir</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Akan hadir di acara</p>
                      </div>
                    </div>
                    {formData.attendanceConfirmation === 'Hadir' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 shadow-xs" />
                    )}
                  </button>

                  {/* Tidak Hadir */}
                  <button
                    id="reg-btn-confirm-tidak"
                    type="button"
                    onClick={() => setFormData({ ...formData, attendanceConfirmation: 'Tidak' })}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                      formData.attendanceConfirmation === 'Tidak'
                        ? 'border-rose-400 bg-rose-50/70 text-rose-950 shadow-xs ring-2 ring-rose-400/20'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          formData.attendanceConfirmation === 'Tidak'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <UserX className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm leading-tight text-slate-900">Tidak</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Berhalangan hadir</p>
                      </div>
                    </div>
                    {formData.attendanceConfirmation === 'Tidak' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-xs" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 space-y-2.5">
                <button
                  id="reg-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm sm:text-base transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menerbitkan QR Code...</span>
                    </div>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 text-white" />
                      <span>Daftar Sekarang</span>
                    </>
                  )}
                </button>

                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                    Daftar sekarang, dan langsung dapat QR Code
                  </p>
                  <p className="text-[11px] text-slate-500">
                    E-Tiket dengan QR Code unik akan langsung aktif untuk akses dan presensi acara.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Poster Fullview (Lightbox) */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-scale-in">
            <button
              onClick={() => setIsPosterModalOpen(false)}
              className="absolute top-3 right-3 p-2 bg-slate-950/80 text-white rounded-full hover:bg-rose-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[3/4] w-full bg-black">
              <img
                src={eventInfo.imageUrl}
                alt={eventInfo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white text-center">
              <p className="text-xs text-blue-300 font-semibold">{eventInfo.organizer}</p>
              <h3 className="font-bold text-sm sm:text-base mt-0.5">{eventInfo.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

