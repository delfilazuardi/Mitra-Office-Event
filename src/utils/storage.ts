import { Participant, EventItem, FeedbackQuestion, SyncConfig, GoogleUserProfile } from '../types';

const EVENTS_KEY = 'mitra_office_events_v2';
const ACTIVE_EVENT_ID_KEY = 'mitra_office_active_event_id_v2';
const PARTICIPANTS_KEY = 'mitra_office_participants_v2';
const QUESTIONS_KEY = 'mitra_office_questions_v2';
const SYNC_CONFIG_KEY = 'mitra_office_sync_config_v2';
const MY_TICKET_KEY = 'mitra_office_my_ticket_id_v2';
const GOOGLE_USER_KEY = 'mitra_office_google_user_v2';
const PANITIA_AUTH_KEY = 'mitra_office_panitia_auth_v2';

// Foto Event Format Portrait (Rasio 3:4 / 4:5 Poster Vertikal)
export const EVENT_PHOTO_PRESETS = [
  {
    name: 'Tech Summit & AI (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Technology'
  },
  {
    name: 'Business Leadership Workshop (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Workshop'
  },
  {
    name: 'Corporate Gathering & Gala (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Networking'
  },
  {
    name: 'Seminar & Panel Discussion (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Seminar'
  },
  {
    name: 'Executive Masterclass (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Masterclass'
  },
  {
    name: 'Innovation & Creative Workspace (Portrait Poster)',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=1067&q=80',
    tag: 'Innovation'
  }
];

// Daftar Pilihan Instansi Sekolah Mitra Lazuardi & Other
export const SEKOLAH_MITRA_LIST = [
  'Lazuardi Al-Falah Depok',
  'Lazuardi Al-Falah Klaten',
  'Lazuardi Athaillah',
  'Lazuardi Haura',
  'Lazuardi Cordova',
  'Lazuardi Ibnu Sina',
  'Lazuardi Tursina',
  'Lazuardi Ideal',
  'SMA Lazuardi',
  'Lazuardi Kamila',
  'Other'
];

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-mitra-01',
    title: 'Mitra Office Tech Summit 2026: Smart Workspace & AI Transformation',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=1067&q=80',
    organizer: 'Mitra Office Event Management',
    date: 'Sabtu, 28 Maret 2026',
    time: '08:30 - 16:30 WIB',
    location: 'Grand Ballroom Mitra Tower, Lt. 12, Jakarta Selatan',
    description: 'Konferensi tahunan Mitra Office menghadirkan para pakar industri terkemuka, diskusi panel transformasi digital, dan pameran inovasi tempat kerja modern.',
    bannerColor: 'from-blue-700 via-indigo-700 to-cyan-600',
    quota: 250,
    categories: ['Umum', 'Mitra Kerja', 'Karyawan', 'VIP', 'Media / Undangan'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    status: 'active',
    speakers: ['Dr. Ir. Budi Rahardjo', 'Maya Anggraini (VP Tech)', 'Dian Prasetya']
  },
  {
    id: 'evt-mitra-02',
    title: 'Workshop Leadership & Operasional Kantor Modern',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&h=1067&q=80',
    organizer: 'Mitra Office Academy',
    date: 'Kamis, 16 April 2026',
    time: '09:00 - 15:00 WIB',
    location: 'Auditorium Training Center Mitra Office, Gedung B',
    description: 'Pelatihan intensif manajemen kantor, efisiensi alur kerja kolaboratif, dan standarisasi operasional perusahaan masa kini.',
    bannerColor: 'from-emerald-700 via-teal-700 to-cyan-600',
    quota: 100,
    categories: ['Manager / Supervisor', 'Staf Operasional', 'Umum', 'Undangan'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    status: 'active',
    speakers: ['Sari Puspita, M.M.', 'Ir. Hendra Gunawan']
  },
  {
    id: 'evt-mitra-03',
    title: 'Mitra Office Annual Partner Gathering & Gala Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&h=1067&q=80',
    organizer: 'Mitra Office Corporate Relations',
    date: 'Jumat, 22 Mei 2026',
    time: '18:00 - 21:30 WIB',
    location: 'Sky Lounge & Dining Hall Mitra Office, Lt. 25',
    description: 'Malam apresiasi dan silaturahmi eksklusif bagi seluruh mitra kerja, sponsor, dan stakeholders strategis Mitra Office.',
    bannerColor: 'from-violet-800 via-purple-700 to-indigo-800',
    quota: 150,
    categories: ['Mitra Utama', 'Sponsor', 'VIP', 'Direksi'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    status: 'upcoming',
    speakers: ['Board of Directors Mitra Office']
  }
];

export const DEFAULT_FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  {
    id: 'q_overall',
    title: 'Overall Satisfaction (Skala 1-5 Bintang)',
    type: 'rating',
    required: true
  },
  {
    id: 'q_rating_reason',
    title: 'We’d love to know the reason behind your rating',
    type: 'text',
    required: false
  },
  {
    id: 'q_drop',
    title: 'Drop (Hal yang perlu dihilangkan / dikurangi)',
    type: 'text',
    required: false
  },
  {
    id: 'q_add',
    title: 'Add (Hal baru yang perlu ditambahkan)',
    type: 'text',
    required: false
  },
  {
    id: 'q_keep',
    title: 'Keep (Hal yang sudah bagus dan perlu dipertahankan)',
    type: 'text',
    required: false
  },
  {
    id: 'q_improve',
    title: 'Improve (Hal yang perlu ditingkatkan / disempurnakan)',
    type: 'text',
    required: false
  }
];

export const INITIAL_DEMO_PARTICIPANTS: Participant[] = [
  {
    id: 'TKT-88210',
    eventId: 'evt-mitra-01',
    name: 'Bambang Sudirjo, M.M.',
    email: 'bambang.sudirjo@mitrakerja.co.id',
    phone: '081234567890',
    organization: 'PT Sinergi Mandiri Nusantara',
    category: 'Mitra Kerja',
    registeredAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    isCheckedIn: true,
    checkInTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    isCheckedOut: false
  },
  {
    id: 'TKT-94102',
    eventId: 'evt-mitra-01',
    name: 'Siti Nurhaliza Putri',
    email: 'siti.nurhaliza@universitas.ac.id',
    phone: '085712349988',
    organization: 'Universitas Indonesia',
    category: 'Umum',
    registeredAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    isCheckedIn: true,
    checkInTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    isCheckedOut: true,
    checkOutTime: new Date(Date.now() - 3600000 * 1).toISOString(),
    feedback: {
      overallRating: 5,
      ratingReason: 'Acara Mitra Office sangat berbobot, pembicara inspiratif, dan panitia sangat sigap!',
      drop: 'Waktu jeda antar sesi pembuka yang agak terlalu panjang',
      add: 'Sesi studi kasus implementasi AI langsung dan sesi networking interaktif antar sekolah mitra',
      keep: 'Format materi berbobot, kemudahan presensi digital QR code, dan keramahan tim panitia',
      improve: 'Sound system di bagian belakang ruangan dan penataan area display materi',
      submittedAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  },
  {
    id: 'TKT-63019',
    eventId: 'evt-mitra-01',
    name: 'Dian Permatasari',
    email: 'dian.permatasari@mitraoffice.id',
    phone: '081987654321',
    organization: 'Mitra Office internal',
    category: 'Karyawan',
    registeredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isCheckedIn: false,
    isCheckedOut: false
  },
  {
    id: 'TKT-55198',
    eventId: 'evt-mitra-01',
    name: 'Dr. Hendra Gunawan, M.T.',
    email: 'hendra.gunawan@institusi.org',
    phone: '082133445566',
    organization: 'Lembaga Transformasi Digital Indonesia',
    category: 'VIP',
    registeredAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isCheckedIn: true,
    checkInTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    isCheckedOut: false
  },
  {
    id: 'TKT-31902',
    eventId: 'evt-mitra-02',
    name: 'Rian Kurniawan',
    email: 'rian.k@perusahaan.com',
    phone: '087788990011',
    organization: 'PT Prima Logistik',
    category: 'Manager / Supervisor',
    registeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    isCheckedIn: false,
    isCheckedOut: false
  }
];

// --- EVENT FUNCTIONS ---

export function getStoredEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export function saveEvents(events: EventItem[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event('mitra_events_updated'));
  } catch (err) {
    console.error('Failed to save events:', err);
  }
}

export function getActiveEventId(): string {
  try {
    const saved = localStorage.getItem(ACTIVE_EVENT_ID_KEY);
    if (saved) return saved;
    const events = getStoredEvents();
    return events[0]?.id || 'evt-mitra-01';
  } catch {
    return 'evt-mitra-01';
  }
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_EVENT_ID_KEY, id);
    window.dispatchEvent(new Event('mitra_active_event_changed'));
  } catch (err) {
    console.error('Failed to set active event id:', err);
  }
}

export function getStoredEventInfo(): EventItem {
  const events = getStoredEvents();
  const activeId = getActiveEventId();
  const match = events.find((e) => e.id === activeId);
  return match || events[0] || DEFAULT_EVENTS[0];
}

export function saveEventInfo(info: EventItem): void {
  const events = getStoredEvents();
  const index = events.findIndex((e) => e.id === info.id);
  if (index !== -1) {
    events[index] = info;
  } else {
    events.unshift(info);
  }
  saveEvents(events);
}

// --- PARTICIPANT FUNCTIONS ---

export function getStoredParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem(PARTICIPANTS_KEY);
    if (!raw) {
      localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(INITIAL_DEMO_PARTICIPANTS));
      return INITIAL_DEMO_PARTICIPANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PARTICIPANTS;
  }
}

export function saveParticipants(participants: Participant[]): void {
  try {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
    window.dispatchEvent(new Event('event_participants_updated'));
  } catch (err) {
    console.error('Failed to save participants to localStorage:', err);
  }
}

// --- FEEDBACK & SYNC ---

export function getStoredFeedbackQuestions(): FeedbackQuestion[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_FEEDBACK_QUESTIONS;
  } catch {
    return DEFAULT_FEEDBACK_QUESTIONS;
  }
}

export function saveFeedbackQuestions(questions: FeedbackQuestion[]): void {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save feedback questions:', err);
  }
}

export function getStoredSyncConfig(): SyncConfig {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { webhookUrl: '', autoSync: false };
  } catch {
    return { webhookUrl: '', autoSync: false };
  }
}

export function saveSyncConfig(config: SyncConfig): void {
  try {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save sync config:', err);
  }
}

export function getMySavedTicketId(): string | null {
  try {
    return localStorage.getItem(MY_TICKET_KEY);
  } catch {
    return null;
  }
}

export function saveMyTicketId(ticketId: string): void {
  try {
    localStorage.setItem(MY_TICKET_KEY, ticketId);
  } catch (err) {
    console.error('Failed to save ticket id:', err);
  }
}

export function generateTicketId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `TKT-${randomNum}`;
}

export function generateEventId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `evt-mitra-${randomNum}`;
}

// --- GOOGLE AUTHENTICATION HELPERS FOR PESERTA ---

export function getStoredGoogleUser(): GoogleUserProfile | null {
  try {
    const raw = localStorage.getItem(GOOGLE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGoogleUser(user: GoogleUserProfile): void {
  try {
    localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('mitra_google_user_updated'));
  } catch (err) {
    console.error('Failed to save google user:', err);
  }
}

export function clearGoogleUser(): void {
  try {
    localStorage.removeItem(GOOGLE_USER_KEY);
    window.dispatchEvent(new Event('mitra_google_user_updated'));
  } catch (err) {
    console.error('Failed to clear google user:', err);
  }
}

// --- PANITIA MITRA OFFICE ACCESS HELPERS ---

export function isPanitiaAuthenticated(): boolean {
  try {
    return localStorage.getItem(PANITIA_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setPanitiaAuthenticated(status: boolean): void {
  try {
    if (status) {
      localStorage.setItem(PANITIA_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(PANITIA_AUTH_KEY);
    }
    window.dispatchEvent(new Event('mitra_panitia_auth_updated'));
  } catch (err) {
    console.error('Failed to set panitia auth:', err);
  }
}

