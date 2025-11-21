
import React, { useState } from 'react';
import { User, CreditCard, Tag, Bell, Settings, ChevronRight, ArrowLeft, FileText, Shield, Lock, LogOut } from 'lucide-react';

type SectionType = 'MAIN' | 'PERSONAL' | 'BILLING' | 'PROMO' | 'NOTIFICATIONS' | 'SETTINGS' | 'LEGAL_PRIVACY' | 'LEGAL_TERMS' | 'LEGAL_NOTICE';

const Dashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionType>('MAIN');

  const MenuItem = ({ icon: Icon, label, onClick, value }: { icon: any, label: string, onClick: () => void, value?: string }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 border-b border-neutral-900 hover:bg-neutral-900/30 transition-all duration-300 group"
    >
      <div className="flex items-center gap-5">
        <Icon className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" strokeWidth={1} />
        <span className="text-xs text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-[9px] text-neutral-600 font-mono uppercase">{value}</span>}
        <ChevronRight className="w-3 h-3 text-neutral-700 group-hover:translate-x-1 transition-transform" strokeWidth={1} />
      </div>
    </button>
  );

  const Header = ({ title }: { title: string }) => (
    <div className="px-8 pt-14 pb-8 border-b border-neutral-900/50 bg-obsidian sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {currentSection !== 'MAIN' ? (
             <button onClick={() => setCurrentSection('MAIN')} className="group flex items-center gap-3 text-neutral-500 hover:text-white transition-colors">
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" strokeWidth={1} />
                <span className="text-[9px] uppercase tracking-[0.25em]">Profile</span>
            </button>
        ) : (
            <h2 className="text-xl font-serif text-white tracking-widest">Client Profile</h2>
        )}
        {currentSection === 'MAIN' && <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] mt-2 font-mono">ID: 8849-ALPHA</p>}
      </div>
      {currentSection !== 'MAIN' && (
        <h2 className="text-xl font-serif text-white mt-6 tracking-wider animate-fade-in">{title}</h2>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'PERSONAL':
        return (
            <div className="p-8 space-y-8 animate-slide-up">
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-3">Full Name</label>
                        <input type="text" defaultValue="Jonathan V. Sterling" className="w-full bg-tungsten/10 border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none transition-colors" />
                    </div>
                    <div className="group">
                        <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-3">Primary Contact</label>
                        <input type="text" defaultValue="+1 (212) 555-0199" className="w-full bg-tungsten/10 border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none transition-colors font-mono" />
                    </div>
                    <div className="group">
                        <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-3">Secure Email</label>
                        <input type="email" defaultValue="j.sterling@atlas-secure.net" className="w-full bg-tungsten/10 border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none transition-colors" />
                    </div>
                    <div className="group">
                        <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-3">Principal Residence</label>
                        <input type="text" defaultValue="15 Central Park West, New York" className="w-full bg-tungsten/10 border-b border-neutral-800 py-2 text-sm text-white focus:border-white focus:outline-none transition-colors" />
                    </div>
                </div>
                <div className="pt-6">
                    <button className="px-6 py-3 bg-white text-black text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors">Update Records</button>
                </div>
            </div>
        );
      case 'BILLING':
        return (
            <div className="animate-slide-up">
                <div className="p-8 border-b border-neutral-900">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-6">Active Method</h3>
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-none border border-neutral-700 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                            <CreditCard className="w-12 h-12 text-white" strokeWidth={0.5} />
                        </div>
                        <p className="text-xs text-neutral-400 font-mono mb-8">CENTURION</p>
                        <p className="text-lg text-white font-mono tracking-widest mb-4">•••• •••• •••• 8849</p>
                        <div className="flex justify-between">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-widest">J.V. STERLING</span>
                            <span className="text-[9px] text-neutral-500 font-mono">09/28</span>
                        </div>
                    </div>
                </div>
                <div className="p-8">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-6">Recent Invoices</h3>
                    <div className="space-y-4">
                        {[
                            { id: 'INV-2023-001', date: 'Oct 12, 2023', amount: '$4,500.00', service: 'Aviation Charter' },
                            { id: 'INV-2023-002', date: 'Sep 28, 2023', amount: '$1,250.00', service: 'Armoured Transport' }
                        ].map(inv => (
                            <div key={inv.id} className="flex justify-between items-center py-3 border-b border-neutral-900/50">
                                <div>
                                    <p className="text-xs text-neutral-300 font-medium">{inv.service}</p>
                                    <p className="text-[9px] text-neutral-600 font-mono mt-1">{inv.id} • {inv.date}</p>
                                </div>
                                <span className="text-xs text-white font-mono">{inv.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
      case 'PROMO':
        return (
            <div className="p-8 space-y-6 animate-slide-up">
                <div className="border border-neutral-800 bg-tungsten/10 p-6 relative overflow-hidden group cursor-pointer hover:border-neutral-600 transition-colors">
                     <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
                     <h3 className="text-sm font-serif text-white tracking-wider mb-2">Winter Aviation Credit</h3>
                     <p className="text-[9px] text-neutral-500 leading-relaxed mb-4">Receive complimentary ground transport with any international jet charter booked before December 2023.</p>
                     <span className="text-[9px] font-mono text-white border border-neutral-700 px-2 py-1">CODE: ALTITUDE-23</span>
                </div>
                <div className="border border-neutral-800 bg-tungsten/10 p-6 opacity-50 grayscale">
                     <h3 className="text-sm font-serif text-neutral-400 tracking-wider mb-2">Monaco GP Access</h3>
                     <p className="text-[9px] text-neutral-600 leading-relaxed mb-4">Exclusive paddock club access included with helicopter transfers.</p>
                     <span className="text-[9px] font-mono text-neutral-600 border border-neutral-800 px-2 py-1">EXPIRED</span>
                </div>
            </div>
        );
      case 'NOTIFICATIONS':
        return (
             <div className="animate-slide-up">
                 {[
                     { title: 'Route Safety Update', time: '2h ago', text: 'Increased traffic reported on N1 route. Alternative path loaded for 14:00 transfer.', urgent: false },
                     { title: 'Payment Confirmed', time: '1d ago', text: 'Authorization hold for Booking #4922 released.', urgent: false },
                     { title: 'Security Alert', time: '3d ago', text: 'Civil unrest reported near destination sector. Advisory issued.', urgent: true }
                 ].map((note, i) => (
                     <div key={i} className={`p-6 border-b border-neutral-900 ${note.urgent ? 'bg-red-900/10' : ''}`}>
                         <div className="flex justify-between items-start mb-2">
                             <h4 className={`text-xs font-medium tracking-wide ${note.urgent ? 'text-red-400' : 'text-white'}`}>{note.title}</h4>
                             <span className="text-[9px] text-neutral-600 font-mono">{note.time}</span>
                         </div>
                         <p className="text-[10px] text-neutral-500 leading-relaxed">{note.text}</p>
                     </div>
                 ))}
             </div>
        );
      case 'SETTINGS':
        return (
            <div className="p-8 space-y-8 animate-slide-up">
                <div className="space-y-6">
                    {[
                        { label: 'FaceID Authentication', desc: 'Require biometrics for app entry', active: true },
                        { label: 'Real-time Location', desc: 'Allow Ops to track device during active missions', active: true },
                        { label: 'Push Notifications', desc: 'Mission updates and security alerts', active: true },
                        { label: 'Stealth Mode', desc: 'Dim interface and reduce haptics', active: false },
                    ].map((setting, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-neutral-300 tracking-wide">{setting.label}</p>
                                <p className="text-[9px] text-neutral-600 mt-1">{setting.desc}</p>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${setting.active ? 'bg-white' : 'bg-neutral-800'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-transform duration-300 ${setting.active ? 'left-4.5' : 'left-0.5'}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
      case 'LEGAL_PRIVACY':
      case 'LEGAL_TERMS':
      case 'LEGAL_NOTICE':
          return (
              <div className="p-8 animate-slide-up">
                  <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-[10px] text-neutral-500 leading-loose text-justify">
                          This document constitutes a binding agreement between the Client and ATLAS Secure Logistics. 
                          All data transmission is encrypted using military-grade protocols. Client location data is 
                          retained only for the duration of active missions and is subsequently purged from operational 
                          servers within 24 hours. By using this interface, you acknowledge that ATLAS acts as a 
                          facilitator for third-party armoured and aviation assets. Force majeure clauses apply to all 
                          high-risk environment operations. 
                      </p>
                      <p className="text-[10px] text-neutral-500 leading-loose text-justify mt-4">
                          Strict confidentiality is maintained regarding all client movements. Disclosure of operational 
                          details to unauthorized parties constitutes a breach of service terms.
                      </p>
                  </div>
              </div>
          );
      default:
        return (
          <div className="animate-fade-in">
            <div className="py-4">
                <MenuItem icon={User} label="Personal Information" onClick={() => setCurrentSection('PERSONAL')} />
                <MenuItem icon={CreditCard} label="Payment & Billing" onClick={() => setCurrentSection('BILLING')} value="Visa •• 42" />
                <MenuItem icon={Tag} label="Promotions" onClick={() => setCurrentSection('PROMO')} value="1 Active" />
                <MenuItem icon={Bell} label="Notifications" onClick={() => setCurrentSection('NOTIFICATIONS')} />
                <MenuItem icon={Settings} label="User Settings" onClick={() => setCurrentSection('SETTINGS')} />
            </div>

            <div className="mt-12 px-8 pb-32">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600 mb-6">Legal & Compliance</h3>
                <div className="space-y-4">
                    <button onClick={() => setCurrentSection('LEGAL_NOTICE')} className="block text-[10px] text-neutral-500 hover:text-white transition-colors tracking-wide">Legal Notice</button>
                    <button onClick={() => setCurrentSection('LEGAL_PRIVACY')} className="block text-[10px] text-neutral-500 hover:text-white transition-colors tracking-wide">Privacy Policy</button>
                    <button onClick={() => setCurrentSection('LEGAL_TERMS')} className="block text-[10px] text-neutral-500 hover:text-white transition-colors tracking-wide">Terms & Conditions</button>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-900 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <LogOut className="w-3 h-3 text-neutral-500" />
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500">Secure Logout</span>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full bg-obsidian pb-32">
      <Header title={
          currentSection === 'PERSONAL' ? 'Personal Information' :
          currentSection === 'BILLING' ? 'Payment & Billing' :
          currentSection === 'PROMO' ? 'Promotions' :
          currentSection === 'NOTIFICATIONS' ? 'Notifications' :
          currentSection === 'SETTINGS' ? 'Preferences' : 
          'Legal'
      } />
      {renderContent()}
    </div>
  );
};

export default Dashboard;
