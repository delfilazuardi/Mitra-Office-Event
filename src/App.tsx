import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Navbar } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { TicketCard } from './components/TicketCard';
import { CheckoutFeedbackForm } from './components/CheckoutFeedbackForm';
import { PanitiaDashboard } from './components/PanitiaDashboard';
import { QrScannerModal } from './components/QrScannerModal';
import { MasterCheckoutQrModal } from './components/MasterCheckoutQrModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { EventCreationModal } from './components/EventCreationModal';
import { EventDirectoryModal } from './components/EventDirectoryModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  Search,
  QrCode,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  UserCheck,
  RefreshCw
} from 'lucide-react';

import { Participant, EventItem, SyncConfig, FeedbackQuestion, GoogleUserProfile } from './types';
import {
  getStoredEvents,
  saveEvents,
  getStoredEventInfo,
  saveEventInfo,
  getActiveEventId,
  setActiveEventId,
  getStoredParticipants,
  saveParticipants,
  getStoredFeedbackQuestions,
  getStoredSyncConfig,
  saveSyncConfig,
  getMySavedTicketId,
  saveMyTicketId,
  generateTicketId,
  getStoredGoogleUser,
  saveGoogleUser,
  clearGoogleUser,
  isPanitiaAuthenticated,
  setPanitiaAuthenticated
} from './utils/storage';
import { syncToGoogleSheetWebhook } from './utils/googleSheets';

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'ticket' | 'checkout' | 'panitia'>('register');
  const [isPanitiaMode, setIsPanitiaMode] = useState<boolean>(isPanitiaAuthenticated());
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  const [events, setEvents] = useState<EventItem[]>(getStoredEvents());
  const [activeEvent, setActiveEvent] = useState<EventItem>(getStoredEventInfo());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [feedbackQuestions, setFeedbackQuestions] = useState<FeedbackQuestion[]>(getStoredFeedbackQuestions());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(getStoredSyncConfig());
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(getStoredGoogleUser());

  // Active participant ticket
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketSearchError, setTicketSearchError] = useState('');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMasterCheckoutQrOpen, setIsMasterCheckoutQrOpen] = useState(false);
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEventDirectoryOpen, setIsEventDirectoryOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Initialize data and check URL params
  useEffect(() => {
    const loadedEvents = getStoredEvents();
    setEvents(loadedEvents);

    const loadedParticipants = getStoredParticipants();
    setParticipants(loadedParticipants);

    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    const tabParam = params.get('tab');
    const ticketParam = params.get('ticket') || params.get('id');

    // Handle event selection from URL
    let currentEvt = getStoredEventInfo();
    if (eventParam) {
      const matchEvt = loadedEvents.find((e) => e.id === eventParam);
      if (matchEvt) {
        currentEvt = matchEvt;
        setActiveEventId(matchEvt.id);
        setActiveEvent(matchEvt);
      }
    } else {
      setActiveEvent(currentEvt);
    }

    if (tabParam === 'checkout') {
      setActiveTab('checkout');
    } else if (tabParam === 'panitia') {
      if (isPanitiaAuthenticated()) {
        setIsPanitiaMode(true);
        setActiveTab('panitia');
      } else {
        setIsAdminAuthModalOpen(true);
        setActiveTab('register');
      }
    } else if (tabParam === 'ticket' || ticketParam) {
      const match = loadedParticipants.find(
        (p) => p.id.toLowerCase() === (ticketParam || '').toLowerCase()
      );
      if (match) {
        setActiveParticipant(match);
        setActiveTab('ticket');
      } else {
        const mySavedId = getMySavedTicketId();
        const myMatch = loadedParticipants.find((p) => p.id === mySavedId);
        if (myMatch) {
          setActiveParticipant(myMatch);
          setActiveTab('ticket');
        }
      }
    } else {
      // Default to saved ticket if exists
      const mySavedId = getMySavedTicketId();
      if (mySavedId) {
        const myMatch = loadedParticipants.find((p) => p.id === mySavedId);
        if (myMatch) {
          setActiveParticipant(myMatch);
        }
      }
    }
  }, []);

  // Synchronize participants when state updates
  const updateAndSaveParticipants = useCallback(
    (newParticipants: Participant[]) => {
      setParticipants(newParticipants);
      saveParticipants(newParticipants);

      // Trigger automatic background Google Sheet Webhook sync if enabled
      if (syncConfig.autoSync && syncConfig.webhookUrl) {
        syncToGoogleSheetWebhook(newParticipants, syncConfig).catch((err) => {
          console.warn('Auto sync error:', err);
        });
      }
    },
    [syncConfig]
  );

  // 1. Participant Registration Handler
  const handleRegisterSuccess = (newParticipant: Participant) => {
    const updated = [newParticipant, ...participants];
    updateAndSaveParticipants(updated);
    setActiveParticipant(newParticipant);
    saveMyTicketId(newParticipant.id);
    setActiveTab('ticket');
  };

  // 2. Ticket Lookup Handler (Search by Ticket ID, Email, or Phone)
  const handleSearchTicket = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const query = ticketSearchQuery.trim().toLowerCase();
    if (!query) {
      setTicketSearchError('Masukkan ID Tiket, Email, atau No. Handphone Anda');
      return;
    }

    const found = participants.find(
      (p) =>
        p.id.toLowerCase() === query ||
        p.email.toLowerCase() === query ||
        p.phone.replace(/[^0-9]/g, '') === query.replace(/[^0-9]/g, '')
    );

    if (found) {
      setActiveParticipant(found);
      saveMyTicketId(found.id);
      setTicketSearchError('');
      setTicketSearchQuery('');
    } else {
      setTicketSearchError(`Tiket dengan pencarian "${ticketSearchQuery}" tidak ditemukan. Pastikan Anda sudah mengisi formulir registrasi.`);
    }
  };

  // 3. Tab navigation guard for Peserta vs Panitia
  const handleTabChange = (tab: 'register' | 'ticket' | 'checkout' | 'panitia' | 'events') => {
    if (tab === 'events') {
      if (isPanitiaMode) {
        setIsEventDirectoryOpen(true);
      }
      return;
    }

    if (tab === 'panitia') {
      if (isPanitiaMode) {
        setActiveTab('panitia');
      } else {
        setIsAdminAuthModalOpen(true);
      }
      return;
    }

    setActiveTab(tab);
  };

  // 4. Panitia Authentication
  const handleAdminAuthSuccess = () => {
    setIsPanitiaMode(true);
    setPanitiaAuthenticated(true);
    setActiveTab('panitia');
  };

  const handleLogoutPanitia = () => {
    setIsPanitiaMode(false);
    setPanitiaAuthenticated(false);
    setActiveTab('register');
  };

  // 5. Event Switcher Handler
  const handleSelectActiveEvent = (eventId: string) => {
    const found = events.find((e) => e.id === eventId);
    if (found) {
      setActiveEventId(found.id);
      setActiveEvent(found);
      saveEventInfo(found);
    }
  };

  // 6. Save or Update Event
  const handleSaveEvent = (savedEvent: EventItem) => {
    const existingIndex = events.findIndex((e) => e.id === savedEvent.id);
    let updatedEvents: EventItem[];

    if (existingIndex !== -1) {
      updatedEvents = [...events];
      updatedEvents[existingIndex] = savedEvent;
    } else {
      updatedEvents = [savedEvent, ...events];
    }

    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setActiveEvent(savedEvent);
    setActiveEventId(savedEvent.id);
    setEditingEvent(null);
    setIsCreateEventOpen(false);
  };

  // 7. Delete Event
  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter((e) => e.id !== eventId);
    setEvents(updated);
    saveEvents(updated);

    if (activeEvent.id === eventId && updated.length > 0) {
      setActiveEvent(updated[0]);
      setActiveEventId(updated[0].id);
    }
  };

  // 8. Panitia Scanner Check-In Action
  const handleScanResult = (scannedRaw: string) => {
    let ticketId = scannedRaw.trim();

    // Try parsing if QR content is JSON
    try {
      if (scannedRaw.startsWith('{') && scannedRaw.endsWith('}')) {
        const parsed = JSON.parse(scannedRaw);
        if (parsed.ticketId) {
          ticketId = parsed.ticketId;
        } else if (parsed.id) {
          ticketId = parsed.id;
        }
      }
    } catch {
      // Not JSON, use raw
    }

    // Lookup participant
    const foundIndex = participants.findIndex(
      (p) =>
        p.id.toLowerCase() === ticketId.toLowerCase() ||
        p.email.toLowerCase() === ticketId.toLowerCase() ||
        p.phone === ticketId
    );

    if (foundIndex === -1) {
      return {
        success: false,
        message: `ID Tiket "${ticketId}" tidak terdaftar dalam sistem peserta event ini.`
      };
    }

    const target = participants[foundIndex];
    if (target.isCheckedIn) {
      return {
        success: true,
        participant: target,
        message: `Peserta ${target.name} SUDAH CHECK-IN sebelumnya pada ${new Date(
          target.checkInTime || ''
        ).toLocaleTimeString('id-ID')}.`
      };
    }

    // Mark as Checked-In
    const updatedTarget: Participant = {
      ...target,
      isCheckedIn: true,
      checkInTime: new Date().toISOString()
    };

    const updatedList = [...participants];
    updatedList[foundIndex] = updatedTarget;
    updateAndSaveParticipants(updatedList);

    // If matches active local participant, update it
    if (activeParticipant && activeParticipant.id === updatedTarget.id) {
      setActiveParticipant(updatedTarget);
    }

    return {
      success: true,
      participant: updatedTarget,
      message: `CHECK-IN BERHASIL! Selamat datang, ${updatedTarget.name} (${updatedTarget.organization || 'Umum'}).`
    };
  };

  // 9. Manual Check-in toggle from table
  const handleToggleCheckIn = (participantId: string) => {
    const updated = participants.map((p) => {
      if (p.id === participantId) {
        const nextState = !p.isCheckedIn;
        return {
          ...p,
          isCheckedIn: nextState,
          checkInTime: nextState ? new Date().toISOString() : undefined
        };
      }
      return p;
    });
    updateAndSaveParticipants(updated);
  };

  // 10. Manual Check-out toggle from table
  const handleToggleCheckOut = (participantId: string) => {
    const updated = participants.map((p) => {
      if (p.id === participantId) {
        const nextState = !p.isCheckedOut;
        return {
          ...p,
          isCheckedOut: nextState,
          checkOutTime: nextState ? new Date().toISOString() : undefined
        };
      }
      return p;
    });
    updateAndSaveParticipants(updated);
  };

  // 11. Delete participant
  const handleDeleteParticipant = (participantId: string) => {
    const updated = participants.filter((p) => p.id !== participantId);
    updateAndSaveParticipants(updated);
    if (activeParticipant && activeParticipant.id === participantId) {
      setActiveParticipant(null);
    }
  };

  // 12. Manual Add participant from dashboard
  const handleAddParticipant = (data: Partial<Participant>) => {
    const newP: Participant = {
      id: generateTicketId(),
      eventId: data.eventId || activeEvent.id,
      name: data.name || 'Peserta',
      email: data.email || '-',
      phone: data.phone || '-',
      organization: data.organization || '-',
      category: data.category || 'Umum',
      registeredAt: new Date().toISOString(),
      isCheckedIn: false,
      isCheckedOut: false
    };
    const updated = [newP, ...participants];
    updateAndSaveParticipants(updated);
  };

  // 13. Feedback submission from Checkout Form
  const handleSubmitFeedback = (
    participantId: string,
    feedbackData: NonNullable<Participant['feedback']>
  ) => {
    const updated = participants.map((p) => {
      if (p.id === participantId) {
        return {
          ...p,
          isCheckedIn: true,
          checkInTime: p.checkInTime || new Date().toISOString(),
          isCheckedOut: true,
          checkOutTime: new Date().toISOString(),
          feedback: feedbackData
        };
      }
      return p;
    });
    updateAndSaveParticipants(updated);
  };

  // 14. Sync Config Update
  const handleSaveSyncConfig = (newConfig: SyncConfig) => {
    setSyncConfig(newConfig);
    saveSyncConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation - ONLY 3 TABS FOR PESERTA */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        eventInfo={activeEvent}
        hasSavedTicket={!!activeParticipant}
        isPanitiaMode={isPanitiaMode}
        onOpenCreateEvent={() => {
          setEditingEvent(null);
          setIsCreateEventOpen(true);
        }}
        onOpenEventDirectory={() => setIsEventDirectoryOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onLogoutPanitia={handleLogoutPanitia}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: REGISTRASI PESERTA */}
        {activeTab === 'register' && (
          <RegistrationForm
            eventInfo={activeEvent}
            onRegisterSuccess={handleRegisterSuccess}
            onOpenEventDirectory={isPanitiaMode ? () => setIsEventDirectoryOpen(true) : undefined}
            registeredCount={participants.filter((p) => p.eventId === activeEvent.id).length}
            googleUser={googleUser}
            onGoogleLoginSuccess={(user) => {
              setGoogleUser(user);
              saveGoogleUser(user);
            }}
            onGoogleLogout={() => {
              setGoogleUser(null);
              clearGoogleUser();
            }}
          />
        )}

        {/* Tab 2: TIKET SAYA */}
        {activeTab === 'ticket' && (
          <div className="space-y-6">
            {activeParticipant ? (
              <div className="space-y-4">
                <TicketCard
                  participant={activeParticipant}
                  eventInfo={
                    events.find((e) => e.id === activeParticipant.eventId) || activeEvent
                  }
                  onOpenCheckout={() => {
                    setActiveTab('checkout');
                  }}
                />

                {/* Switch / Search other ticket button */}
                <div className="max-w-md mx-auto text-center pt-2">
                  <button
                    onClick={() => setActiveParticipant(null)}
                    className="text-xs text-slate-500 hover:text-blue-600 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Cari atau Buka Tiket Peserta Lain</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Ticket Search Box for Participants */
              <div className="max-w-md mx-auto py-6 px-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Cari & Tampilkan E-Tiket Saya</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Masukkan ID Tiket, Email, atau No. Handphone yang Anda gunakan saat mendaftar.
                  </p>
                </div>

                <form onSubmit={handleSearchTicket} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={ticketSearchQuery}
                      onChange={(e) => {
                        setTicketSearchQuery(e.target.value);
                        setTicketSearchError('');
                      }}
                      placeholder="ID Tiket (TKT-XXXXX) / Email / No. HP"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {ticketSearchError && (
                    <div className="flex items-start gap-1.5 text-rose-600 text-xs font-medium p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{ticketSearchError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Tampilkan E-Tiket QR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center space-y-3">
                  <p className="text-xs text-slate-500">Belum pernah mendaftar acara ini?</p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Daftar Baru Sekarang</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: CHECK-OUT & FEEDBACK (Halaman Peserta Scan 1 Master QR & Isi Evaluasi MenDAKI) */}
        {activeTab === 'checkout' && (
          <CheckoutFeedbackForm
            participants={participants.filter((p) => p.eventId === activeEvent.id)}
            eventInfo={activeEvent}
            questions={feedbackQuestions}
            preSelectedParticipantId={activeParticipant?.id}
            onSubmitFeedback={handleSubmitFeedback}
          />
        )}

        {/* Tab 4: DASHBOARD ADMIN & PANITIA (HANYA AKTIF UNTUK MODE PANITIA) */}
        {activeTab === 'panitia' && isPanitiaMode && (
          <PanitiaDashboard
            participants={participants}
            events={events}
            activeEvent={activeEvent}
            syncConfig={syncConfig}
            onSelectActiveEvent={handleSelectActiveEvent}
            onOpenCreateEvent={() => {
              setEditingEvent(null);
              setIsCreateEventOpen(true);
            }}
            onEditEvent={(ev) => {
              setEditingEvent(ev);
              setIsCreateEventOpen(true);
            }}
            onDeleteEvent={handleDeleteEvent}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenMasterCheckoutQr={() => setIsMasterCheckoutQrOpen(true)}
            onOpenSheetSync={() => setIsSheetSyncOpen(true)}
            onToggleCheckIn={handleToggleCheckIn}
            onToggleCheckOut={handleToggleCheckOut}
            onDeleteParticipant={handleDeleteParticipant}
            onAddParticipant={handleAddParticipant}
            onUpdateEventInfo={handleSaveEvent}
          />
        )}
      </main>

      {/* Admin Passcode Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Global Modals (Only for Admin / Panitia) */}
      {isPanitiaMode && (
        <>
          {/* 1. Create / Edit Event Modal for Admin */}
          <EventCreationModal
            isOpen={isCreateEventOpen}
            onClose={() => {
              setIsCreateEventOpen(false);
              setEditingEvent(null);
            }}
            onSaveEvent={handleSaveEvent}
            initialEvent={editingEvent}
          />

          {/* 2. Event Directory Modal (Browse all events) */}
          <EventDirectoryModal
            isOpen={isEventDirectoryOpen}
            onClose={() => setIsEventDirectoryOpen(false)}
            events={events}
            activeEventId={activeEvent.id}
            participants={participants}
            onSelectEvent={(selected, action) => {
              handleSelectActiveEvent(selected.id);
              if (action === 'register') {
                setActiveTab('register');
              } else {
                setActiveTab('panitia');
              }
            }}
            onOpenCreateEvent={() => {
              setIsEventDirectoryOpen(false);
              setEditingEvent(null);
              setIsCreateEventOpen(true);
            }}
          />

          {/* 3. Camera QR Scanner Check-in for Panitia */}
          <QrScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScanResult={handleScanResult}
            participants={participants}
          />

          {/* 4. 1 Master QR Code Check-Out Projector for Panitia */}
          <MasterCheckoutQrModal
            isOpen={isMasterCheckoutQrOpen}
            onClose={() => setIsMasterCheckoutQrOpen(false)}
            eventInfo={activeEvent}
          />

          {/* 5. Google Sheet Sync & Export Modal */}
          <GoogleSheetSyncModal
            isOpen={isSheetSyncOpen}
            onClose={() => setIsSheetSyncOpen(false)}
            participants={participants.filter((p) => p.eventId === activeEvent.id)}
            syncConfig={syncConfig}
            onSaveSyncConfig={handleSaveSyncConfig}
          />
        </>
      )}

      {/* Global Footer - ONLY PESERTA LINKS BY DEFAULT */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 font-medium">
            © 2026 Mitra Office Event • Sistem Registrasi & E-Tiket QR Code
          </p>
          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('register')}
              className={`transition-colors cursor-pointer ${activeTab === 'register' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
            >
              Registrasi
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`transition-colors cursor-pointer ${activeTab === 'ticket' ? 'text-blue-400 font-bold' : 'hover:text-white'}`}
            >
              Tiket Saya
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`transition-colors cursor-pointer ${activeTab === 'checkout' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
            >
              Check-Out & Evaluasi
            </button>

            {/* Discrete Panitia Access Link */}
            {isPanitiaMode ? (
              <button
                onClick={() => setActiveTab('panitia')}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer ml-2 bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 rounded-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dashboard Admin Panitia</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer ml-1"
                title="Login Khusus Panitia"
              >
                <Lock className="w-3 h-3" />
                <span>Akses Panitia</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
