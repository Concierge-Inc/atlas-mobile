
import React, { useState } from 'react';
import { ViewState, ServiceCategory } from './types';
import { SERVICE_DESCRIPTIONS } from './constants';
import BookingFlow from './components/BookingFlow';
import Concierge from './components/Concierge';
import Dashboard from './components/Dashboard';
import BookingTracker from './components/BookingTracker';
import {
  Plane,
  Car,
  Shield,
  UserCheck,
  Home,
  MessageSquare,
  User,
  Menu,
  X,
  Command
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setIsMenuOpen(false);
    if (newView === ViewState.HOME) {
      setSelectedCategory(null);
    }
  };

  const startBooking = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setView(ViewState.BOOKING_FLOW);
  };

  const getCategoryIcon = (cat: ServiceCategory, customClassName?: string) => {
    const className = customClassName || "w-5 h-5 text-neutral-500 mb-6 opacity-80 transition-colors duration-500 group-hover:text-white";
    const props = { className, strokeWidth: 1 };
    switch (cat) {
      case 'AVIATION': return <Plane {...props} />;
      case 'CHAUFFEUR': return <Car {...props} />;
      case 'ARMOURED': return <Shield {...props} />;
      case 'PROTECTION': return <UserCheck {...props} />;
    }
  };

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'AVIATION': return 'PRIVATE AIR TRANSFER';
      case 'CHAUFFEUR': return 'CHAUFFEUR SERVICES';
      case 'ARMOURED': return 'ARMOURED TRANSPORT';
      case 'PROTECTION': return 'PROTECTION SERVICES';
      default: return cat;
    }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.BOOKING_FLOW:
        if (selectedCategory) {
          return (
            <BookingFlow
              category={selectedCategory}
              onBack={() => navigateTo(ViewState.HOME)}
              onComplete={() => navigateTo(ViewState.CONCIERGE)}
            />
          );
        }
        return null;
      case ViewState.CONCIERGE:
        return <Concierge />;
      case ViewState.PROFILE:
        return <Dashboard />;
      case ViewState.HOME:
      default:
        return (
          <div className="animate-fade-in min-h-full bg-obsidian pb-32 relative">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/20 via-obsidian to-obsidian pointer-events-none" />

            <header className="pt-14 px-8 pb-8 flex justify-between items-start relative z-10">
              <div>
                <h1 className="text-xl font-serif tracking-widest text-white">ATLAS</h1>
                <div className="h-[1px] w-8 bg-neutral-800 my-3" />
                <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em]">Global Private Services</p>
              </div>
              <div className="flex flex-col items-end">
                 <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 rounded-full animate-pulse-slow"></div>
                 </div>
                 <span className="text-[9px] text-neutral-600 uppercase tracking-widest mt-2 font-mono">Online</span>
              </div>
            </header>

            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-2 gap-3 px-6 mt-4 relative z-10">
              {(['AVIATION', 'CHAUFFEUR', 'ARMOURED', 'PROTECTION'] as ServiceCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => startBooking(cat)}
                  className="group relative bg-neutral-900/20 hover:bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700 transition-all duration-500 p-5 flex flex-col justify-between aspect-[4/5] text-left overflow-hidden shadow-sm hover:shadow-glow"
                >
                   {/* Card Background & Hover Effects */}
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="p-2 bg-neutral-900/80 border border-white/5 rounded-sm text-neutral-400 group-hover:text-white transition-colors">
                         {getCategoryIcon(cat, "w-4 h-4")}
                      </div>
                      {cat !== 'PROTECTION' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" title="Protection Available">
                            <UserCheck className="w-3 h-3 text-neutral-600" strokeWidth={1.5} />
                        </div>
                      )}
                   </div>

                   <div className="relative z-10">
                      <h2 className="text-[10px] font-medium text-neutral-300 tracking-[0.2em] group-hover:text-white transition-colors leading-5 mb-3">
                        {getCategoryLabel(cat).split(' ').map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        ))}
                      </h2>
                      <div className="w-4 h-[1px] bg-neutral-800 group-hover:w-full group-hover:bg-white/20 transition-all duration-700 ease-out" />
                   </div>
                </button>
              ))}
            </div>

            {/* Booking Tracker Panel */}
            <BookingTracker onChat={() => navigateTo(ViewState.CONCIERGE)} />
            
            <div className="px-8 mt-4 relative z-10">
                <div className="flex justify-center opacity-20">
                  <Command className="w-4 h-4 text-neutral-700" strokeWidth={1} />
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-neutral-200 font-sans selection:bg-white/20 selection:text-white">
      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian flex flex-col items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/20 to-obsidian pointer-events-none" />
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-4 text-neutral-600 hover:text-white transition-colors z-50">
            <X className="w-5 h-5" strokeWidth={1} />
          </button>
          <nav className="space-y-10 text-center relative z-10">
            {['Protocol', 'Privacy', 'Concierge', 'Settings'].map((item) => (
              <a key={item} href="#" className="block text-lg font-serif text-neutral-500 hover:text-white transition-colors duration-700 tracking-widest uppercase">
                {item}
              </a>
            ))}
          </nav>
          <div className="absolute bottom-12 text-[9px] text-neutral-700 uppercase tracking-[0.3em]">
            Encrypted • V 2.5.0
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="max-w-md mx-auto h-screen relative shadow-2xl shadow-black bg-obsidian flex flex-col overflow-hidden border-x border-neutral-900/30">
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-obsidian">
            {renderContent()}
        </div>

        {/* Architectural Bottom Nav */}
        <nav className="absolute bottom-0 left-0 right-0 glass-panel px-6 pb-8 pt-5 flex justify-between items-center z-40">
          {[
            { id: ViewState.HOME, icon: Home, label: 'Home' },
            { id: ViewState.CONCIERGE, icon: MessageSquare, label: 'Chat' },
            { id: ViewState.PROFILE, icon: User, label: 'Profile' }
          ].map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className="group flex flex-col items-center gap-2 w-16 relative"
              >
                {/* Active Indicator Line */}
                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-[1px] h-4 transition-all duration-500 ${isActive ? 'bg-white opacity-50' : 'bg-transparent opacity-0'}`} />
                
                <item.icon 
                  className={`w-4 h-4 transition-all duration-500 ${isActive ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-500'}`} 
                  strokeWidth={1} 
                />
                <span className={`text-[8px] uppercase tracking-[0.25em] transition-colors duration-500 ${isActive ? 'text-white' : 'text-neutral-700'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
             onClick={() => setIsMenuOpen(true)}
             className="group flex flex-col items-center gap-2 w-16"
          >
            <Menu className="w-4 h-4 text-neutral-600 group-hover:text-neutral-500 transition-colors" strokeWidth={1} />
            <span className="text-[8px] text-neutral-700 uppercase tracking-[0.25em]">Menu</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;
