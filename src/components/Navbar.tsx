import {
  CalendarCheck,
  QrCode,
  UserPlus,
  ShieldCheck,
  MessageSquareHeart,
  PlusCircle,
  ChevronDown,
  Layers,
  LogOut,
  Lock
} from 'lucide-react';
import { EventItem } from '../types';

interface NavbarProps {
  activeTab: 'register' | 'ticket' | 'panitia' | 'checkout' | 'events';
  setActiveTab: (tab: 'register' | 'ticket' | 'panitia' | 'checkout' | 'events') => void;
  eventInfo: EventItem;
  hasSavedTicket: boolean;
  isPanitiaMode: boolean;
  onOpenCreateEvent: () => void;
  onOpenEventDirectory: () => void;
  onOpenAdminAuth: () => void;
  onLogoutPanitia: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  eventInfo,
  hasSavedTicket,
  isPanitiaMode,
  onOpenCreateEvent,
  onOpenEventDirectory,
  onOpenAdminAuth,
  onLogoutPanitia
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('register')}
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    Mitra Office <span className="text-blue-400">Event</span>
                  </span>
                  {isPanitiaMode ? (
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full uppercase tracking-wider">
                      Mode Panitia
                    </span>
                  ) : (
                    <span className="hidden lg:inline-flex px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full uppercase tracking-wider">
                      Portal Peserta
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="truncate max-w-[130px] sm:max-w-xs md:max-w-sm text-slate-300 font-medium">
                    {eventInfo.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Switcher Button (Only for Panitia Mode) */}
            {isPanitiaMode && (
              <button
                onClick={onOpenEventDirectory}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Ganti atau Lihat Semua Event"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Ganti Event</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Quick Create Event Button (Only for Panitia Mode) */}
            {isPanitiaMode && (
              <button
                id="nav-btn-create-event"
                onClick={onOpenCreateEvent}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer mr-1"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>+ Buat Event</span>
              </button>
            )}

            {/* Navigation Tabs - ONLY 3 TABS FOR PESERTA: Registrasi, Tiket Saya, Check-Out */}
            <nav className="flex items-center space-x-1 sm:space-x-1.5">
              {/* 1. Registrasi */}
              <button
                id="nav-tab-register"
                onClick={() => setActiveTab('register')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrasi</span>
              </button>

              {/* 2. Tiket Saya */}
              <button
                id="nav-tab-ticket"
                onClick={() => setActiveTab('ticket')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'ticket'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Tiket Saya</span>
                {hasSavedTicket && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                )}
              </button>

              {/* 3. Check-Out */}
              <button
                id="nav-tab-checkout"
                onClick={() => setActiveTab('checkout')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'checkout'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquareHeart className="w-4 h-4 text-amber-300" />
                <span>Check-Out</span>
              </button>

              {/* 4. Panitia / Admin Tab (HANYA MUNCUL JIKA MODE PANITIA AKTIF) */}
              {isPanitiaMode && (
                <button
                  id="nav-tab-panitia"
                  onClick={() => setActiveTab('panitia')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'panitia'
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50 font-bold'
                      : 'text-indigo-300 hover:text-white hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>Admin Panitia</span>
                </button>
              )}

              {/* Logout button when in Panitia Mode */}
              {isPanitiaMode && (
                <button
                  onClick={onLogoutPanitia}
                  title="Keluar ke Tampilan Peserta"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
