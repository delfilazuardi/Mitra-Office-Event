import { useState, FormEvent } from 'react';
import { ShieldCheck, KeyRound, Lock, Eye, EyeOff, X, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Valid standard panitia PINs
    const validPins = ['1234', 'mitra2026', 'admin', 'panitia'];

    if (validPins.includes(pin.trim().toLowerCase())) {
      setError('');
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError('PIN Panitia tidak sesuai. Silakan gunakan PIN default: 1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Akses Khusus Panitia</h3>
              <p className="text-xs text-slate-500">Masukkan PIN Admin Mitra Office</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError('');
              setPin('');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative description */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-indigo-950">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Keamanan Akses Acara
          </p>
          <p className="text-indigo-700">
            Tampilan umum dirancang khusus untuk <strong>Peserta</strong> (Registrasi, Tiket Saya, dan Check-Out).
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              PIN / Passcode Panitia:
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan PIN (Default: 1234)"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-600 text-xs font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Default PIN Akses:</span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">1234</span>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError('');
                setPin('');
                onClose();
              }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Buka Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
