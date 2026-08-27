import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle, Volume2, Search, UserCheck } from 'lucide-react';
import { Participant } from '../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (scannedText: string) => { success: boolean; participant?: Participant; message: string };
  participants: Participant[];
}

export function QrScannerModal({ isOpen, onClose, onScanResult, participants }: QrScannerModalProps) {
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' | 'info'; participant?: Participant } | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);

  // Play audio beep cue on success
  const playBeep = (isError = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (isError) {
        osc.frequency.value = 220; // low frequency error
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.value = 880; // high frequency crisp chime
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch {
      // AudioContext might be blocked before user interaction
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupScanner();
      setScanMessage(null);
      return;
    }

    // Initialize camera listing
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera for mobile
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang'));
          const selectedId = backCam ? backCam.id : devices[0].id;
          setActiveCameraId(selectedId);
          startScanner(selectedId);
        } else {
          setScanMessage({
            text: 'Tidak ada kamera terdeteksi di perangkat ini. Anda dapat menggunakan pencarian manual di bawah.',
            type: 'error'
          });
        }
      })
      .catch((err) => {
        console.warn('Camera permission or listing error:', err);
        setScanMessage({
          text: 'Izin kamera tidak diberikan atau belum didukung di peramban ini. Silakan gunakan input manual di bawah.',
          type: 'info'
        });
      });

    return () => {
      cleanupScanner();
    };
  }, [isOpen]);

  const cleanupScanner = async () => {
    if (scannerRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.log('Scanner cleanup:', err);
      } finally {
        scannerRef.current = null;
        isStoppingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  const startScanner = async (cameraId: string) => {
    await cleanupScanner();

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        () => {
          // ignore frame errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting html5qrcode:', err);
      setIsScanning(false);
      setScanMessage({
        text: 'Gagal mengaktifkan kamera. Pastikan izin kamera telah disetujui.',
        type: 'error'
      });
    }
  };

  const handleDecoded = (rawText: string) => {
    // Prevent spam triggers
    const result = onScanResult(rawText);
    if (result.success) {
      playBeep(false);
      setScanMessage({
        text: result.message,
        type: 'success',
        participant: result.participant
      });
    } else {
      playBeep(true);
      setScanMessage({
        text: result.message,
        type: 'error',
        participant: result.participant
      });
    }
  };

  const handleManualCheckIn = (p: Participant) => {
    const result = onScanResult(p.id);
    if (result.success) {
      playBeep(false);
      setScanMessage({
        text: result.message,
        type: 'success',
        participant: result.participant
      });
    } else {
      playBeep(true);
      setScanMessage({
        text: result.message,
        type: 'error',
        participant: result.participant
      });
    }
    setManualQuery('');
  };

  const filteredManualParticipants = manualQuery.trim()
    ? participants.filter(
        (p) =>
          p.name.toLowerCase().includes(manualQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(manualQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(manualQuery.toLowerCase()) ||
          p.phone.includes(manualQuery)
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Scanner Check-In Panitia</h3>
              <p className="text-xs text-slate-400">Arahkan kamera ke QR Code di E-Tiket Peserta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-sm mx-auto flex items-center justify-center border-2 border-slate-700 shadow-inner">
            <div id="qr-reader-viewport" className="w-full h-full" />
            
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-blue-400/70 rounded-2xl animate-pulse flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              </div>
            </div>
          </div>

          {/* Camera Switcher if multiple */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-between text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-300">Pilih Kamera:</span>
              <select
                value={activeCameraId}
                onChange={(e) => {
                  setActiveCameraId(e.target.value);
                  startScanner(e.target.value);
                }}
                className="bg-slate-900 text-white px-3 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Kamera ${c.id.substring(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Real-time Scan Result Banner */}
          {scanMessage && (
            <div
              className={`p-4 rounded-2xl border transition-all text-sm animate-scale-in ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : scanMessage.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                  : 'bg-blue-950/80 border-blue-500/50 text-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanMessage.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-base">{scanMessage.text}</p>
                  {scanMessage.participant && (
                    <div className="text-xs space-y-0.5 text-slate-200 pt-1 border-t border-white/10">
                      <p>
                        <strong>Nama:</strong> {scanMessage.participant.name}
                      </p>
                      <p>
                        <strong>ID Tiket:</strong> {scanMessage.participant.id} •{' '}
                        <strong>Kategori:</strong> {scanMessage.participant.category}
                      </p>
                      <p>
                        <strong>Instansi:</strong> {scanMessage.participant.organization}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Search & Check-in alternative */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Atau Cari Peserta Manual (Nama, Email, ID Tiket):
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Ketik nama atau kode tiket..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {manualQuery.trim() && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                {filteredManualParticipants.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Peserta tidak ditemukan</p>
                ) : (
                  filteredManualParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.id} • {p.organization}</p>
                      </div>
                      <button
                        onClick={() => handleManualCheckIn(p)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all ${
                          p.isCheckedIn
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {p.isCheckedIn ? 'Check-In Ulang' : 'Check-In'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Audio Beep Otomatis Aktif</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
