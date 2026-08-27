import { useState, FormEvent } from 'react';
import { CheckCircle2, LogOut, ShieldCheck, Sparkles, UserCheck, X } from 'lucide-react';
import { GoogleUserProfile } from '../types';

interface GoogleAuthButtonProps {
  currentUser: GoogleUserProfile | null;
  onLoginSuccess: (user: GoogleUserProfile) => void;
  onLogout: () => void;
}

export function GoogleAuthButton({
  currentUser,
  onLoginSuccess,
  onLogout
}: GoogleAuthButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Preset demo Google accounts for quick realistic testing
  const presetGoogleAccounts = [
    {
      name: 'Delfi Lazuardi',
      email: 'delfi@lazuardi.sch.id',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      name: 'Budi Santoso',
      email: 'budi.santoso@gmail.com',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      name: 'Dr. Hendra Gunawan',
      email: 'hendra.gunawan@mitraoffice.id',
      picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80'
    }
  ];

  const handleSelectAccount = (account: { name: string; email: string; picture: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      const user: GoogleUserProfile = {
        id: `google-${btoa(account.email).substring(0, 12)}`,
        name: account.name,
        email: account.email,
        picture: account.picture,
        verified: true,
        connectedAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      setIsLoading(false);
      setIsModalOpen(false);
    }, 450);
  };

  const handleCustomLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const user: GoogleUserProfile = {
        id: `google-${Date.now()}`,
        name: customName.trim(),
        email: customEmail.trim(),
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName)}`,
        verified: true,
        connectedAt: new Date().toISOString()
      };
      onLoginSuccess(user);
      setIsLoading(false);
      setIsModalOpen(false);
    }, 450);
  };

  if (currentUser) {
    return (
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200/90 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {currentUser.picture ? (
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 text-white ring-2 ring-white">
              <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Google Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
          title="Keluar dari akun Google"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ganti Akun</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Akses Khusus Peserta: Daftar Instan dengan Akun Google</span>
        </div>
        <p className="text-xs text-slate-500">
          Gunakan akun Google Anda untuk verifikasi otomatis, simpan tiket langsung, dan check-in bebas antre.
        </p>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-sm mx-auto py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 text-xs sm:text-sm transition-all hover:shadow-md cursor-pointer group"
        >
          {/* Google Official Color Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="group-hover:text-blue-600 transition-colors">
            Lanjutkan dengan Google
          </span>
        </button>
      </div>

      {/* Google Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <h3 className="font-bold text-slate-900 text-base">Masuk dengan Google</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pilih akun Google Anda untuk mengisi formulir pendaftaran secara otomatis dan mengaktifkan tiket:
            </p>

            {/* Account Selector List */}
            <div className="space-y-2">
              {presetGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group cursor-pointer"
                >
                  <img
                    src={acc.picture}
                    alt={acc.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-blue-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </div>

            {/* Custom Google Account Input */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Atau Masukkan Akun Google Lain:
              </p>
              <form onSubmit={handleCustomLogin} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Nama Lengkap Google"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="email@gmail.com / domain Google Workspace"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customName || !customEmail}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Ini'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
