
import React, { useState } from 'react';
import { MessageSquare, Clock, MapPin, Plane, Car, Shield, UserCheck, XCircle, CheckCircle, Activity } from 'lucide-react';
import { ServiceCategory } from '../types';

interface Booking {
  id: string;
  service: ServiceCategory;
  title: string;
  date: string;
  time: string;
  status: 'UPCOMING' | 'PAST' | 'CANCELLED';
  location: string;
  statusLabel: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    service: 'AVIATION',
    title: 'Geneva Executive Transfer',
    date: 'Tomorrow',
    time: '09:00 CET',
    status: 'UPCOMING',
    location: 'LSGG Private Terminal',
    statusLabel: 'Confirmed'
  },
  {
    id: '2',
    service: 'ARMOURED',
    title: 'Diplomatic Convoy',
    date: '14 Nov',
    time: '18:30 SAST',
    status: 'UPCOMING',
    location: 'Pretoria, ZA',
    statusLabel: 'Processing'
  },
  {
    id: '3',
    service: 'PROTECTION',
    title: 'Estate Security Detail',
    date: '02 Nov',
    time: 'Completed',
    status: 'PAST',
    location: 'Cape Town',
    statusLabel: 'Report Filed'
  },
  {
    id: '4',
    service: 'CHAUFFEUR',
    title: 'Paris Fashion Week',
    date: '28 Oct',
    time: 'Cancelled',
    status: 'CANCELLED',
    location: 'Paris, FR',
    statusLabel: 'Client Request'
  }
];

interface BookingTrackerProps {
  onChat: () => void;
}

const BookingTracker: React.FC<BookingTrackerProps> = ({ onChat }) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const filteredBookings = MOCK_BOOKINGS.filter(b => b.status === activeTab);

  const getIcon = (cat: ServiceCategory) => {
    const props = { className: "w-3 h-3 text-neutral-400", strokeWidth: 1.5 };
    switch (cat) {
      case 'AVIATION': return <Plane {...props} />;
      case 'CHAUFFEUR': return <Car {...props} />;
      case 'ARMOURED': return <Shield {...props} />;
      case 'PROTECTION': return <UserCheck {...props} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-white';
      case 'PAST': return 'bg-neutral-600';
      case 'CANCELLED': return 'bg-red-900';
      default: return 'bg-neutral-500';
    }
  };

  return (
    <div className="w-full mt-8 mb-8 animate-fade-in relative z-20">
      <div className="px-8 mb-6 flex items-center justify-between">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500">Mission Log</h3>
        <div className="flex gap-4">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[8px] uppercase tracking-widest transition-colors duration-300 ${
                activeTab === tab ? 'text-white' : 'text-neutral-700 hover:text-neutral-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto px-8 pb-4 scrollbar-hide flex gap-4 snap-x">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="snap-center shrink-0 w-72 bg-tungsten/10 border border-neutral-800/80 hover:border-neutral-600 transition-all duration-500 p-5 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        {getIcon(booking.service)}
                    </div>
                    <div>
                        <span className="block text-[8px] text-neutral-600 uppercase tracking-widest mb-0.5">{booking.service}</span>
                        <span className="block text-[8px] text-neutral-400 font-mono">{booking.id.padStart(4, '0')}</span>
                    </div>
                </div>
                <div className={`px-2 py-1 border border-white/5 bg-neutral-900/50 backdrop-blur flex items-center gap-2`}>
                    <div className={`w-1 h-1 rounded-full ${getStatusColor(booking.status)} ${booking.status === 'UPCOMING' ? 'animate-pulse' : ''}`} />
                    <span className="text-[8px] text-neutral-300 uppercase tracking-widest">{booking.statusLabel}</span>
                </div>
              </div>

              <h4 className="text-sm font-medium text-neutral-200 tracking-wide mb-4 group-hover:text-white transition-colors relative z-10">
                {booking.title}
              </h4>

              <div className="space-y-2 relative z-10 border-t border-neutral-800/50 pt-4">
                <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{booking.date} • {booking.time}</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-mono">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{booking.location}</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onChat();
                    }}
                    className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform"
                  >
                      <MessageSquare className="w-3 h-3" strokeWidth={2} />
                  </button>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-8 border border-dashed border-neutral-800 flex flex-col items-center justify-center">
            <Activity className="w-4 h-4 text-neutral-700 mb-2" />
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest">No Activity Logged</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTracker;
