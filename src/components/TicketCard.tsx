import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  Sparkles,
  Copy,
  Check,
  QrCode,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Participant, EventItem } from '../types';

interface TicketCardProps {
  participant: Participant;
  eventInfo: EventItem;
  onOpenCheckout?: (participantId: string) => void;
}

export function TicketCard({ participant, eventInfo, onOpenCheckout }: TicketCardProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const qrDataValue = JSON.stringify({
    type: 'MITRA_EVENT_TICKET',
    eventId: eventInfo.id,
    ticketId: participant.id,
    name: participant.name,
    email: participant.email,
    category: participant.category
  });

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?event=${eventInfo.id}&ticket=${participant.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTicketAsImage = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Halo! Ini adalah E-Tiket resmi Mitra Office Event:\n\n*Event:* ${eventInfo.title}\n*Nama:* ${participant.name}\n*Kode Tiket:* ${participant.id}\n*Tanggal:* ${eventInfo.date}\n*Lokasi:* ${eventInfo.location}\n\nTunjukkan QR Code ini ke Panitia saat Check-In.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto my-4 space-y-4">
      {/* Top Banner Alert */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 shadow-sm flex items-start gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 mt-0.5">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-emerald-950 text-sm">Registrasi Berhasil & Tiket Siap!</p>
          <p className="text-emerald-700 mt-0.5 leading-relaxed">
            Tunjukkan <strong>QR Code Tiket</strong> di bawah ini kepada <strong>Panitia Mitra Office</strong> saat tiba di lokasi untuk Check-In otomatis.
          </p>
        </div>
      </div>

      {/* The Printable / Viewable Ticket Card */}
      <div
        ref={ticketRef}
        id={`ticket-card-${participant.id}`}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transition-all"
      >
        {/* Ticket Header with Event Photo */}
        <div className="relative aspect-[16/7] w-full bg-slate-900 overflow-hidden">
          <img
            src={eventInfo.imageUrl}
            alt={eventInfo.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />

          {/* Badges */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Mitra Office Event
            </span>
            <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase">
              {participant.category || 'Umum'}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-base sm:text-lg font-extrabold leading-snug line-clamp-2 drop-shadow">
              {eventInfo.title}
            </h2>
            <p className="text-[11px] text-blue-200 mt-0.5 font-medium flex items-center gap-1">
              <Building className="w-3 h-3" /> {eventInfo.organizer}
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium">Status:</span>
            {participant.attendanceConfirmation === 'Tidak' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[11px]">
                Konfirmasi: Tidak Hadir
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                Konfirmasi: Hadir
              </span>
            )}
            {participant.isCheckedIn ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Check-In
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium text-[11px]">
                <Clock className="w-3.5 h-3.5" /> Belum Check-In
              </span>
            )}
            {participant.isGoogleVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full font-bold text-[10px]">
                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Google Verified
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 font-bold">
            {participant.id}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="p-6 text-center flex flex-col items-center justify-center bg-white">
          <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-md inline-block">
            <QRCodeSVG
              id="ticket-qr-svg"
              value={qrDataValue}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Ticket ID & Instructions */}
          <div className="mt-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg font-mono font-extrabold text-sm tracking-wider border border-slate-200">
              {participant.id}
            </span>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Pindai QR ini pada Scanner Panitia untuk Check-In
            </p>
          </div>
        </div>

        {/* Participant Detail Card */}
        <div className="px-6 py-4 bg-slate-50 border-t border-b border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span className="text-slate-500">Nama Peserta:</span>
            <span className="font-bold text-slate-900 text-right">{participant.name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span className="text-slate-500">Instansi / Divisi:</span>
            <span className="font-semibold text-slate-800 text-right">{participant.organization || '-'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium text-slate-700 text-right">{participant.email}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span className="text-slate-500">Konfirmasi Kehadiran:</span>
            <span className={`font-bold text-right ${participant.attendanceConfirmation === 'Tidak' ? 'text-rose-600' : 'text-emerald-700'}`}>
              {participant.attendanceConfirmation === 'Tidak' ? 'Tidak Hadir' : 'Hadir'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
            <span className="text-slate-500">Waktu Acara:</span>
            <span className="font-medium text-slate-800 text-right">{eventInfo.date}</span>
          </div>

          <div className="flex justify-between items-start py-1">
            <span className="text-slate-500 shrink-0">Lokasi:</span>
            <span className="font-medium text-slate-800 text-right line-clamp-2 max-w-[200px]">
              {eventInfo.location}
            </span>
          </div>
        </div>

        {/* Ticket Footer Seal */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">Mitra Office Verified</span>
          </div>
          <span className="text-slate-400">
            {new Date(participant.registeredAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 no-print">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadTicketAsImage}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Tautan Tiket Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Salin Link E-Tiket Saya</span>
            </>
          )}
        </button>

        {/* Quick Check-out button when event finishes */}
        {onOpenCheckout && (
          <div className="pt-2">
            <button
              onClick={() => onOpenCheckout(participant.id)}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Selesai Mengikuti Acara? Check-Out & Beri Feedback</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
