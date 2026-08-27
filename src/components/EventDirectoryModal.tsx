import { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  Building
} from 'lucide-react';
import { EventItem, Participant } from '../types';

interface EventDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  activeEventId: string;
  participants: Participant[];
  onSelectEvent: (event: EventItem, action: 'register' | 'panitia') => void;
  onOpenCreateEvent: () => void;
}

export function EventDirectoryModal({
  isOpen,
  onClose,
  events,
  activeEventId,
  participants,
  onSelectEvent,
  onOpenCreateEvent
}: EventDirectoryModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredEvents = events.filter((ev) => {
    const q = search.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.organizer.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-scale-in my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Daftar Event Mitra Office</h2>
              <p className="text-xs text-slate-300">
                Pilih event yang ingin diikuti untuk mendaftar dan mendapatkan QR Code tiket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateEvent();
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Event Baru</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama event, lokasi, atau tema acara..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm font-medium">Tidak ada event yang sesuai pencarian.</p>
              <button
                onClick={onOpenCreateEvent}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Buat Event Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredEvents.map((ev) => {
                const count = participants.filter((p) => p.eventId === ev.id).length;
                const isActive = ev.id === activeEventId;

                return (
                  <div
                    key={ev.id}
                    className={`bg-white rounded-2xl border ${
                      isActive
                        ? 'border-blue-500 ring-2 ring-blue-400/30 shadow-md'
                        : 'border-slate-200 shadow-xs hover:shadow-md'
                    } overflow-hidden flex flex-col transition-all`}
                  >
                    {/* Event Photo with Portrait Showcase */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 bg-white">
                      <div className="sm:col-span-5 relative aspect-[3/4] bg-slate-900 overflow-hidden">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Potrait 3:4
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-bold">
                              Aktif
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                          <p className="text-[10px] text-blue-200 flex items-center gap-1 font-medium truncate">
                            <Building className="w-3 h-3" /> {ev.organizer}
                          </p>
                        </div>
                      </div>

                      {/* Content (7 cols) */}
                      <div className="sm:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug">
                            {ev.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {ev.description}
                          </p>

                          <div className="pt-2 space-y-1.5 text-xs text-slate-600 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="font-medium text-slate-800">{ev.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{ev.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="line-clamp-1">{ev.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-slate-800">
                                {count} Peserta {ev.quota ? `/ Kuota ${ev.quota}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelectEvent(ev, 'register');
                              onClose();
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            Daftar & QR
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectEvent(ev, 'panitia');
                              onClose();
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            Admin
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
