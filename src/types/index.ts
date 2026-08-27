export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified: boolean;
  connectedAt: string;
}

export interface EventItem {
  id: string; // Unique event ID e.g. evt-mitra-01
  title: string; // Nama Event
  imageUrl: string; // Foto Event / Poster URL (Format Portrait 3:4)
  organizer: string; // Penyelenggara (e.g. Mitra Office)
  date: string; // Tanggal Pelaksanaan
  time: string; // Waktu Pelaksanaan
  location: string; // Lokasi / Ruang Pertemuan
  description: string; // Deskripsi Event
  bannerColor?: string; // Fallback or accent gradient
  quota?: number; // Kuota Peserta (optional)
  categories: string[]; // Kategori Peserta yang dapat dipilih
  createdAt: string;
  status: 'active' | 'upcoming' | 'completed' | 'draft';
  speakers?: string[]; // Pemateri / Guest Stars
}

// Alias for compatibility
export type EventInfo = EventItem;

export interface Participant {
  id: string; // Unique ticket code e.g. TKT-89421
  eventId: string; // ID of the event registered for
  name: string;
  email: string;
  phone: string;
  organization: string;
  category: string; // Umum, Mahasiswa, VIP, Mitra Kerja, Karyawan, Pembicara, Undangan
  registeredAt: string; // ISO string or formatted date
  
  // Google Auth integration
  isGoogleVerified?: boolean;
  googleAvatarUrl?: string;
  googlePicture?: string;
  googleId?: string;

  // Attendance status & confirmation
  attendanceConfirmation?: 'Hadir' | 'Tidak'; // Konfirmasi Kehadiran
  isCheckedIn: boolean;
  checkInTime?: string;
  
  isCheckedOut: boolean;
  checkOutTime?: string;
  
  // Feedback data (MenDAKI: Drop, Add, Keep, Improve & Overall Satisfaction)
  feedback?: {
    overallRating: number; // 1 - 5 (Overall Satisfaction)
    ratingReason?: string; // We’d love to know the reason behind your rating
    drop?: string; // Drop (Hal yang perlu dihilangkan / dikurangi)
    add?: string; // Add (Hal baru yang perlu ditambahkan)
    keep?: string; // Keep (Hal yang sudah bagus dan perlu dipertahankan)
    improve?: string; // Improve (Hal yang perlu ditingkatkan / diperbaiki)
    speakerRating?: number; // 1 - 5 (optional legacy)
    facilityRating?: number; // 1 - 5 (optional legacy)
    favoriteTopic?: string;
    suggestions?: string;
    customAnswers?: Record<string, string | number>;
    submittedAt: string;
  };
  notes?: string;
}

export interface FeedbackQuestion {
  id: string;
  title: string;
  type: 'rating' | 'text' | 'choice';
  required: boolean;
  options?: string[]; // For choice type
}

export interface SyncConfig {
  webhookUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

