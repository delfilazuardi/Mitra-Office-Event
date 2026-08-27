import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Maximize2, Minimize2, Download, Printer, Copy, Check, Sparkles, MessageSquareHeart, HelpCircle } from 'lucide-react';
import { EventInfo } from '../types';

interface MasterCheckoutQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: EventInfo;
}

export function MasterCheckoutQrModal({ isOpen, onClose, eventInfo }: MasterCheckoutQrModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Direct checkout link for all participants
  const checkoutUrl = `${window.location.origin}${window.location.pathname}?tab=checkout`;

  const handleCopy = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-2xl max-h-[92vh]'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquareHeart className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">1 Master QR Code Check-Out Acara</h3>
              <p className="text-xs text-teal-100">Untuk discan oleh seluruh peserta saat acara berakhir</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isFullscreen ? 'Keluar Fullscreen' : 'Tampilkan Layar Penuh (Proyektor)'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div ref={printAreaRef} className="flex flex-col items-center justify-center space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Scan Untuk Presensi Selesai & Feedback
            </span>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {eventInfo.title}
            </h2>

            {/* QR Big Box */}
            <div className="p-5 bg-white border-4 border-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all">
              <QRCodeSVG
                value={checkoutUrl}
                size={isFullscreen ? 320 : 230}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Arahkan Kamera HP Anda ke QR Code di Atas
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                Nama Anda akan otomatis terdeteksi, lalu isi pertanyaan feedback singkat untuk menyelesaikan presensi check-out.
              </p>
            </div>
          </div>

          {/* How it works info box */}
          <div className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Cara Kerja Check-Out Terpusat (1 QR untuk Semua):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Panitia menayangkan QR Code ini di <strong>Layar Proyektor</strong> atau mencetaknya di meja pintu keluar.</li>
              <li>Peserta men-scan QR Code ini menggunakan kamera ponsel masing-masing.</li>
              <li>Halaman formulir terbuka, nama peserta otomatis terdeteksi (atau tinggal pilih/ketik nama mereka).</li>
              <li>Peserta mengisi kuesioner feedback, lalu status otomatis berubah menjadi <strong>CHECKED-OUT</strong> dan data langsung tersimpan!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Salin Link Check-Out</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Cetak Poster QR</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
