import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Building,
  Upload,
  Image as ImageIcon,
  Check,
  Layers,
  Users,
  AlertCircle
} from 'lucide-react';
import { EventItem } from '../types';
import { EVENT_PHOTO_PRESETS, generateEventId } from '../utils/storage';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: EventItem) => void;
  initialEvent?: EventItem | null;
}

export function EventCreationModal({
  isOpen,
  onClose,
  onSaveEvent,
  initialEvent
}: EventCreationModalProps) {
  const isEditing = !!initialEvent;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<EventItem>>(() => {
    if (initialEvent) {
      return { ...initialEvent };
    }
    return {
      title: '',
      imageUrl: EVENT_PHOTO_PRESETS[0].url,
      organizer: 'Mitra Office Event Management',
      date: 'Sabtu, 15 Agustus 2026',
      time: '08:30 - 16:00 WIB',
      location: 'Mitra Office Tower, Auditorium Lt. 8, Jakarta',
      description: '',
      quota: 200,
      categories: ['Umum', 'Mitra Kerja', 'Karyawan', 'VIP', 'Undangan'],
      status: 'active'
    };
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [photoMode, setPhotoMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [urlInput, setUrlInput] = useState(formData.imageUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Ukuran foto maksimal 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, imageUrl: result }));
        setUrlInput(result);
        setErrors((prev) => ({ ...prev, image: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setUrlInput(url);
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleAddCategory = () => {
    if (!categoryInput.trim()) return;
    const cats = formData.categories || [];
    if (!cats.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...cats, categoryInput.trim()]
      }));
    }
    setCategoryInput('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: (prev.categories || []).filter((c) => c !== catToRemove)
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) errs.title = 'Nama event wajib diisi';
    if (!formData.imageUrl?.trim()) errs.image = 'Foto event wajib dipilih atau diunggah';
    if (!formData.date?.trim()) errs.date = 'Tanggal event wajib diisi';
    if (!formData.location?.trim()) errs.location = 'Lokasi event wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const eventToSave: EventItem = {
      id: initialEvent?.id || generateEventId(),
      title: formData.title!.trim(),
      imageUrl: formData.imageUrl!.trim(),
      organizer: formData.organizer?.trim() || 'Mitra Office',
      date: formData.date!.trim(),
      time: formData.time?.trim() || '09:00 - Selesai WIB',
      location: formData.location!.trim(),
      description: formData.description?.trim() || 'Acara resmi diselenggarakan oleh Mitra Office.',
      quota: Number(formData.quota) || 150,
      categories:
        formData.categories && formData.categories.length > 0
          ? formData.categories
          : ['Umum', 'Mitra Kerja', 'VIP'],
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
      status: (formData.status as EventItem['status']) || 'active',
      bannerColor: 'from-blue-700 via-indigo-700 to-cyan-600'
    };

    onSaveEvent(eventToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-scale-in my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Event Mitra Office' : 'Buat Event Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Masukkan nama event, foto banner, jadwal, dan lokasi untuk membuka pendaftaran peserta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Nama Event & Penyelenggara */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Nama Event / Judul Acara <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Contoh: Mitra Office Tech Summit 2026: Smart Workspace & AI"
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                } text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Penyelenggara / Unit
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Mitra Office Event Management"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Event
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as EventItem['status'] })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Aktif (Pendaftaran Buka)</option>
                  <option value="upcoming">Segera Datang</option>
                  <option value="completed">Selesai</option>
                  <option value="draft">Draft (Disembunyikan)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Foto Event Format Portrait */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Foto Event / Poster Visual (Format Potrait) <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Rasio portrait vertikal 3:4 atau 4:5 untuk tampilan poster event resmi
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPhotoMode('preset')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    photoMode === 'preset'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Template Poster
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    photoMode === 'upload'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File Foto
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    photoMode === 'url'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* Live Portrait Image Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 max-w-[200px] mx-auto sm:mx-0 w-full">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-900 border-2 border-slate-300 shadow-md group">
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Event Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent flex items-end p-3">
                        <div className="text-white">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-600 rounded-full">
                            Poster Potrait
                          </span>
                          <p className="font-bold text-xs line-clamp-2 mt-1">
                            {formData.title || 'Nama Event Anda'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[11px]">Belum ada foto poster potrait</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-3">
                {/* Photo Mode 1: Presets */}
                {photoMode === 'preset' && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      Pilih template foto poster portrait bertema Mitra Office:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {EVENT_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 transition-all group cursor-pointer ${
                            formData.imageUrl === preset.url
                              ? 'border-blue-600 ring-2 ring-blue-400 scale-[1.02]'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                          title={preset.name}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-1.5">
                            <span className="text-[9px] text-white font-medium truncate">
                              {preset.tag || preset.name}
                            </span>
                          </div>
                          {formData.imageUrl === preset.url && (
                            <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Mode 2: Upload File */}
                {photoMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-white transition-colors"
                    >
                      <Upload className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk upload foto poster portrait dari perangkat
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Direkomendasikan foto format vertikal/potrait (Rasio 3:4 atau 4:5, Maks. 5MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Photo Mode 3: Direct URL */}
                {photoMode === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setFormData({ ...formData, imageUrl: e.target.value });
                      }}
                      placeholder="https://images.unsplash.com/photo-... atau link poster gambar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <p className="text-[11px] text-slate-500">
                      Masukkan tautan URL foto potrait langsung dari web.
                    </p>
                  </div>
                )}

                {errors.image && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Waktu, Tanggal & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) setErrors({ ...errors, date: '' });
                  }}
                  placeholder="Contoh: Sabtu, 28 Maret 2026"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                    errors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  } text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Waktu Pelaksanaan
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="08:30 - 16:00 WIB"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lokasi / Ruang Pertemuan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                placeholder="Auditorium Mitra Tower Lt. 12, Jl. Gatot Subroto No. 45"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
          </div>

          {/* Section 4: Deskripsi & Kuota */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat Event
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan topik materi, manfaat acara, dan informasi penting bagi peserta..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Kuota Peserta (Orang)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Peserta
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Ketik lalu klik tambah..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  + Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(formData.categories || []).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-medium"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="hover:text-rose-600 text-slate-400 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Simpan Perubahan Event' : 'Terbitkan & Buka Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
