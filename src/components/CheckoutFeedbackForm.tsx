import { useState, useEffect, FormEvent } from 'react';
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  Search,
  Award,
  HeartHandshake,
  ArrowRight,
  RotateCcw,
  MinusCircle,
  PlusCircle,
  BookmarkCheck,
  TrendingUp,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, EventInfo, FeedbackQuestion } from '../types';
import { getMySavedTicketId } from '../utils/storage';

interface CheckoutFeedbackFormProps {
  participants: Participant[];
  eventInfo: EventInfo;
  questions?: FeedbackQuestion[];
  preSelectedParticipantId?: string | null;
  onSubmitFeedback: (participantId: string, feedbackData: NonNullable<Participant['feedback']>) => void;
}

export function CheckoutFeedbackForm({
  participants,
  eventInfo,
  preSelectedParticipantId,
  onSubmitFeedback
}: CheckoutFeedbackFormProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  // Form states as requested:
  // 1. Overall Satisfaction (1-5 star)
  // 2. We'd love to know the reason behind your rating
  // 3. Drop
  // 4. Add
  // 5. Keep
  // 6. Improve
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingReason, setRatingReason] = useState<string>('');
  const [dropFeedback, setDropFeedback] = useState<string>('');
  const [addFeedback, setAddFeedback] = useState<string>('');
  const [keepFeedback, setKeepFeedback] = useState<string>('');
  const [improveFeedback, setImproveFeedback] = useState<string>('');

  // Auto-detect participant on mount
  useEffect(() => {
    // 1. Check prop
    if (preSelectedParticipantId) {
      const found = participants.find((p) => p.id === preSelectedParticipantId);
      if (found) {
        setSelectedParticipant(found);
        return;
      }
    }

    // 2. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const ticketParam = params.get('ticket') || params.get('id') || params.get('tkt');
    if (ticketParam) {
      const found = participants.find((p) => p.id.toLowerCase() === ticketParam.toLowerCase());
      if (found) {
        setSelectedParticipant(found);
        return;
      }
    }

    // 3. Check local saved ticket
    const savedTicket = getMySavedTicketId();
    if (savedTicket) {
      const found = participants.find((p) => p.id === savedTicket);
      if (found) {
        setSelectedParticipant(found);
        return;
      }
    }
  }, [preSelectedParticipantId, participants]);

  // Search filtered
  const searchResults = searchQuery.trim()
    ? participants.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      )
    : [];

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Sangat Puas (5/5) ⭐⭐⭐⭐⭐';
      case 4:
        return 'Puas (4/5) ⭐⭐⭐⭐';
      case 3:
        return 'Cukup (3/5) ⭐⭐⭐';
      case 2:
        return 'Kurang Puas (2/5) ⭐⭐';
      case 1:
        return 'Tidak Puas (1/5) ⭐';
      default:
        return `${score} Bintang`;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    const feedbackPayload: NonNullable<Participant['feedback']> = {
      overallRating,
      ratingReason: ratingReason.trim() || '-',
      drop: dropFeedback.trim() || '-',
      add: addFeedback.trim() || '-',
      keep: keepFeedback.trim() || '-',
      improve: improveFeedback.trim() || '-',
      suggestions: [
        ratingReason.trim() ? `Alasan: ${ratingReason}` : '',
        dropFeedback.trim() ? `[Drop] ${dropFeedback}` : '',
        addFeedback.trim() ? `[Add] ${addFeedback}` : '',
        keepFeedback.trim() ? `[Keep] ${keepFeedback}` : '',
        improveFeedback.trim() ? `[Improve] ${improveFeedback}` : ''
      ].filter(Boolean).join(' | ') || '-',
      submittedAt: new Date().toISOString()
    };

    onSubmitFeedback(selectedParticipant.id, feedbackPayload);
    setIsSuccessSubmitted(true);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-300" />
            Check-Out & Evaluasi Acara
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
            {eventInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1">
            Terima kasih atas kehadiran Anda! Silakan lengkapi evaluasi singkat di bawah untuk menyelesaikan presensi check-out.
          </p>
        </div>
      </div>

      {/* Success State Screen */}
      {isSuccessSubmitted && selectedParticipant ? (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase">
              Check-Out Berhasil
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Terima Kasih, {selectedParticipant.name}!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              Presensi check-out dan evaluasi feedback (MenDAKI & Overall Satisfaction) Anda telah berhasil tersimpan dan disinkronkan.
            </p>
          </div>

          {/* Proof Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Bukti Check-Out Presensi</span>
              <span className="font-mono font-bold text-slate-800">{selectedParticipant.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <p className="text-[11px] text-slate-400">Nama Peserta</p>
                <p className="font-semibold">{selectedParticipant.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Instansi</p>
                <p className="font-semibold">{selectedParticipant.organization || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Overall Satisfaction</p>
                <p className="font-semibold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {overallRating} / 5 Bintang
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Waktu Check-Out</p>
                <p className="font-semibold text-blue-700">
                  {new Date().toLocaleTimeString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Simpan Bukti Presensi / Cetak</span>
            </button>
            <button
              onClick={() => {
                setIsSuccessSubmitted(false);
                setSelectedParticipant(null);
                setOverallRating(5);
                setRatingReason('');
                setDropFeedback('');
                setAddFeedback('');
                setKeepFeedback('');
                setImproveFeedback('');
              }}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Isi Untuk Peserta Lain</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Step 1: Participant Identity Section */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Identitas Peserta
              </span>
              {selectedParticipant && (
                <button
                  type="button"
                  onClick={() => setSelectedParticipant(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Ganti Peserta Lain
                </button>
              )}
            </div>

            {selectedParticipant ? (
              /* Detected Participant Card */
              <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex items-start justify-between gap-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {selectedParticipant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {selectedParticipant.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-teal-200/60 text-teal-800 rounded-md text-[10px] font-bold">
                        {selectedParticipant.category || 'Umum'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedParticipant.email} • {selectedParticipant.organization || 'Umum'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      <span className="text-slate-500">Status Kedatangan:</span>
                      {selectedParticipant.isCheckedIn ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Hadir (Checked-In)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Belum Check-In di awal (akan otomatis dicatat hadir & check-out)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-block font-mono text-xs font-bold text-teal-900 bg-teal-100/80 px-2.5 py-1 rounded-lg">
                  {selectedParticipant.id}
                </span>
              </div>
            ) : (
              /* Participant Search / Selector */
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-600">
                  Ketik nama, email, atau nomor HP Anda di bawah untuk mendeteksi data kehadiran:
                </p>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari Nama Lengkap / Email / No HP Anda..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Search result list */}
                {searchQuery.trim() && (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-md">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Nama tidak ditemukan. Pastikan Anda sudah terdaftar di form Registrasi terlebih dahulu.
                      </div>
                    ) : (
                      searchResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedParticipant(p);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-3 hover:bg-teal-50 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-700">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {p.email} • {p.organization || 'Umum'} • {p.id}
                            </p>
                          </div>
                          <span className="text-xs text-teal-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Pilih <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Feedback Questions (MenDAKI: Drop, Add, Keep, Improve, followed by Overall Satisfaction & Reason) */}
          {selectedParticipant ? (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. Kuesioner Evaluasi & Feedback Acara
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> MenDAKI
                </span>
              </div>

              {/* MenDAKI Section */}
              <div className="space-y-4">
                <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    MenDAKI
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-950">
                      Evaluasi MenDAKI (Drop • Add • Keep • Improve)
                    </p>
                    <p className="text-[11px] text-teal-700">
                      Bantu kami menyempurnakan penyelenggaraan acara berikutnya dengan masukan spesifik Anda.
                    </p>
                  </div>
                </div>

                {/* 1. DROP */}
                <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                      <MinusCircle className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs sm:text-sm font-bold text-rose-950 uppercase tracking-wide">
                      Drop <span className="font-normal text-xs text-rose-700 capitalize">(Hal yang perlu dihilangkan / dikurangi)</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={dropFeedback}
                    onChange={(e) => setDropFeedback(e.target.value)}
                    placeholder="Apa bagian acara, sesi, atau proses yang sebaiknya dihilangkan atau dipersingkat?"
                    className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* 2. ADD */}
                <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <PlusCircle className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs sm:text-sm font-bold text-blue-950 uppercase tracking-wide">
                      Add <span className="font-normal text-xs text-blue-700 capitalize">(Hal baru yang perlu ditambahkan)</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={addFeedback}
                    onChange={(e) => setAddFeedback(e.target.value)}
                    placeholder="Apa ide, topik, aktivitas, atau fasilitas baru yang ingin Anda temui di acara berikutnya?"
                    className="w-full p-3 bg-white border border-blue-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 3. KEEP */}
                <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wide">
                      Keep <span className="font-normal text-xs text-emerald-700 capitalize">(Hal yang sudah bagus & perlu dipertahankan)</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={keepFeedback}
                    onChange={(e) => setKeepFeedback(e.target.value)}
                    placeholder="Apa hal yang sudah berjalan sangat baik dan harus dipertahankan untuk event berikutnya?"
                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 4. IMPROVE */}
                <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                      Improve <span className="font-normal text-xs text-amber-700 capitalize">(Hal yang perlu ditingkatkan / disempurnakan)</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={improveFeedback}
                    onChange={(e) => setImproveFeedback(e.target.value)}
                    placeholder="Apa aspek yang masih bisa ditingkatkan kualitasnya (misal: waktu, sound, konsumsi, dll)?"
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Overall Satisfaction & Reason Section (Di Akhir) */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {/* 5. Overall Satisfaction (1-5 Star) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold text-slate-900">
                      Overall Satisfaction <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-amber-600">
                      {getRatingLabel(hoverRating ?? overallRating)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Bagaimana tingkat kepuasan Anda secara keseluruhan terhadap acara ini?
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeScore = hoverRating ?? overallRating;
                      const isFilled = star <= activeScore;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setOverallRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 sm:p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                          title={`${star} Bintang`}
                        >
                          <Star
                            className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-slate-300 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. We'd love to know the reason behind your rating */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    We’d love to know the reason behind your rating
                  </label>
                  <p className="text-xs text-slate-500">
                    Ceritakan alasan atau pengalaman utama Anda yang mendasari rating kepuasan di atas:
                  </p>
                  <textarea
                    rows={3}
                    value={ratingReason}
                    onChange={(e) => setRatingReason(e.target.value)}
                    placeholder="Contoh: Materi yang dibawakan sangat relevan dan aplikatif, serta pembawaan pemateri sangat interaktif..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Submit Checkout Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-checkout-feedback"
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
                >
                  <HeartHandshake className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Kirim Feedback & Selesaikan Check-Out</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
              Silakan pilih identitas peserta di atas untuk membuka formulir feedback.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
