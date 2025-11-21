import React, { useState, useEffect } from 'react';
import { Asset, ServiceCategory } from '../types';
import { ASSETS } from '../constants';
import { ArrowLeft, MapPin, Calendar, Info, UserCheck, CornerDownRight, Lock } from 'lucide-react';

interface BookingFlowProps {
  category: ServiceCategory;
  onBack: () => void;
  onComplete: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ category, onBack, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [includeProtection, setIncludeProtection] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const assets = ASSETS.filter(a => a.category === category);

  const handleAssetSelect = (asset: Asset) => {
    if (!asset.available) return;
    setSelectedAsset(asset);
    setStep(2);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 3000);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getCategoryTitle = (cat: ServiceCategory) => {
      if (cat === 'AVIATION') return 'Private Air Transfer';
      return cat.toLowerCase();
  }

  if (step === 1) {
    return (
      <div className={`h-full flex flex-col transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="px-8 pt-14 pb-8 border-b border-neutral-900/50 bg-obsidian sticky top-0 z-20 backdrop-blur-md bg-obsidian/90">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="group flex items-center gap-3 text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" strokeWidth={1} />
              <span className="text-[9px] uppercase tracking-[0.25em]">Return</span>
            </button>
            <span className="text-[9px] text-neutral-700 uppercase tracking-[0.2em] font-mono">01 — 03</span>
          </div>
          <h2 className="text-xl font-serif text-white mt-6 tracking-wider capitalize">Select {getCategoryTitle(category)}</h2>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32 space-y-12">
          {assets.map(asset => (
            <div
              key={asset.id}
              onClick={() => handleAssetSelect(asset)}
              className={`group relative transition-all duration-500 cursor-pointer ${
                asset.available ? 'opacity-100 hover:opacity-100' : 'opacity-40 cursor-not-allowed grayscale'
              }`}
            >
              <div className="relative h-48 w-full overflow-hidden bg-tungsten border border-neutral-800 group-hover:border-neutral-600 transition-colors duration-500 shadow-instrument">
                 {/* Image with architectural crop */}
                 <img 
                    src={asset.image} 
                    alt={asset.name} 
                    className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000 ease-out mix-blend-overlay" 
                 />
                 
                 <div className="absolute top-4 right-4">
                    <span className="text-[9px] text-white/80 font-mono bg-black/50 px-2 py-1 backdrop-blur-sm border border-white/10">
                        {formatCurrency(asset.hourlyRateUSD)}/HR
                    </span>
                 </div>
              </div>

              <div className="mt-5 flex justify-between items-start">
                 <div>
                    <h3 className="text-sm font-medium text-white tracking-[0.15em] mb-2 group-hover:text-white/90">{asset.name}</h3>
                    <div className="flex items-center gap-4 text-[9px] text-neutral-500 uppercase tracking-wider">
                        <span>{asset.specs.passengers} Pax</span>
                        <span className="w-[1px] h-2 bg-neutral-800"></span>
                        <span>{asset.specs.ballisticGrade || 'Standard'}</span>
                    </div>
                 </div>
                 
                 <div className="mt-1">
                    {asset.available ? (
                         <div className="w-1.5 h-1.5 border border-white/40 rounded-full group-hover:bg-white/80 transition-colors" />
                    ) : (
                        <span className="text-[8px] text-neutral-600 uppercase tracking-widest">Reserved</span>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="h-full flex flex-col animate-slide-up">
        <div className="px-8 pt-14 pb-8 border-b border-neutral-900/50 bg-obsidian">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="group flex items-center gap-3 text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" strokeWidth={1} />
              <span className="text-[9px] uppercase tracking-[0.25em]">Back</span>
            </button>
            <span className="text-[9px] text-neutral-700 uppercase tracking-[0.2em] font-mono">02 — 03</span>
          </div>
          <h2 className="text-xl font-serif text-white mt-6 tracking-wider">Mission Logistics</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
           {/* Selected Asset Summary */}
           <div className="flex items-start gap-6 pb-8 border-b border-neutral-900/50">
             <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <span className="text-[9px] font-mono text-neutral-500">REF</span>
             </div>
             <div className="pt-1">
               <p className="text-white text-sm tracking-widest font-medium">{selectedAsset?.name}</p>
               <p className="text-neutral-600 text-[9px] uppercase tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                 Asset secured
               </p>
             </div>
           </div>

           {/* Form Fields - "Architectural" Inputs */}
           <div className="space-y-10">
             <div className="group relative">
               <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-4">Pickup Point</label>
               <div className="flex items-center border-b border-neutral-800 group-focus-within:border-white transition-colors duration-500 pb-2">
                 <MapPin className="w-3 h-3 text-neutral-600 mr-4" strokeWidth={1} />
                 <input type="text" className="w-full bg-transparent text-sm text-white placeholder-neutral-800 focus:outline-none font-light tracking-wide" placeholder="Coordinates or Address" />
               </div>
             </div>

             <div className="group relative">
               <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-4">Destination</label>
               <div className="flex items-center border-b border-neutral-800 group-focus-within:border-white transition-colors duration-500 pb-2">
                 <CornerDownRight className="w-3 h-3 text-neutral-600 mr-4" strokeWidth={1} />
                 <input type="text" className="w-full bg-transparent text-sm text-white placeholder-neutral-800 focus:outline-none font-light tracking-wide" placeholder="Drop-off or Duration" />
               </div>
             </div>

             <div className="group relative">
               <label className="block text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-4">Timing</label>
               <div className="flex items-center border-b border-neutral-800 group-focus-within:border-white transition-colors duration-500 pb-2">
                 <Calendar className="w-3 h-3 text-neutral-600 mr-4" strokeWidth={1} />
                 <input type="datetime-local" className="w-full bg-transparent text-sm text-white placeholder-neutral-800 focus:outline-none font-light tracking-wide text-neutral-400" />
               </div>
             </div>

              {/* Protection Add-On Section */}
              {category !== 'PROTECTION' && (
                 <div className="pt-6">
                    <div 
                        onClick={() => setIncludeProtection(!includeProtection)}
                        className={`cursor-pointer border transition-all duration-500 p-6 flex items-start gap-5 ${includeProtection ? 'border-white bg-white/5' : 'border-neutral-800 bg-transparent hover:border-neutral-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center mt-0.5 ${includeProtection ? 'bg-white border-white' : 'border-neutral-600'}`}>
                            {includeProtection && <div className="w-2 h-2 bg-black" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <UserCheck className={`w-3 h-3 ${includeProtection ? 'text-white' : 'text-neutral-500'}`} />
                                <h4 className={`text-xs font-medium uppercase tracking-widest ${includeProtection ? 'text-white' : 'text-neutral-400'}`}>Secure Protection Detail</h4>
                            </div>
                            <p className="text-[9px] text-neutral-600 font-light leading-relaxed">
                                Add a Close Protection Officer (CPO) to the manifest for duration of movement.
                            </p>
                        </div>
                    </div>
                 </div>
              )}
           </div>

           <div className="flex gap-4 p-5 bg-tungsten/20 border border-neutral-900">
              <Info className="w-3 h-3 text-neutral-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-neutral-500 leading-relaxed font-mono">
                All movements are monitored by ATLAS Operations. Final routing and risk assessment confirmed via secure channel.
              </p>
           </div>
        </div>

        <div className="p-8 bg-obsidian border-t border-neutral-900/50 safe-area-bottom">
          <button
            onClick={() => setStep(3)}
            className="w-full bg-white text-black py-4 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-200 transition-colors border border-white shadow-glow"
          >
            Review Mission
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="h-full flex flex-col animate-slide-up">
        <div className="px-8 pt-14 pb-8 border-b border-neutral-900/50 bg-obsidian">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="group flex items-center gap-3 text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" strokeWidth={1} />
              <span className="text-[9px] uppercase tracking-[0.25em]">Adjust</span>
            </button>
            <span className="text-[9px] text-neutral-700 uppercase tracking-[0.2em] font-mono">03 — 03</span>
          </div>
          <h2 className="text-xl font-serif text-white mt-6 tracking-wider">Confirmation</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-12">
           {isProcessing ? (
             <div className="flex flex-col items-center gap-10 animate-fade-in">
               {/* Minimalist Spinner */}
               <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 border border-neutral-800 rounded-full"></div>
                  <div className="absolute inset-0 border-t border-white rounded-full animate-spin"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
               </div>
               <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white font-medium">Verifying Clearance</p>
                  <p className="text-[9px] text-neutral-600 font-mono">Encrypted Handshake...</p>
               </div>
             </div>
           ) : (
             <>
               <div className="w-full max-w-xs border border-neutral-900 bg-tungsten/10 p-8 space-y-6 shadow-instrument">
                 <div className="flex justify-between items-baseline">
                   <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Asset</span>
                   <span className="text-xs text-white font-medium tracking-wide">{selectedAsset?.name}</span>
                 </div>
                 <div className="w-full h-[1px] bg-neutral-900"></div>
                 <div className="flex justify-between items-baseline">
                   <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Service</span>
                   <span className="text-xs text-white font-medium tracking-wide">{getCategoryTitle(category)}</span>
                 </div>
                 
                 {includeProtection && (
                    <>
                        <div className="w-full h-[1px] bg-neutral-900"></div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-[9px] text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                                <Lock className="w-2 h-2" /> Protocol
                            </span>
                            <span className="text-xs text-white font-medium tracking-wide">CPO Added</span>
                        </div>
                    </>
                 )}

                 <div className="w-full h-[1px] bg-neutral-900"></div>
                 <div className="flex justify-between items-baseline">
                   <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Est. Rate</span>
                   <span className="text-xs text-white font-medium tracking-wide">{formatCurrency(selectedAsset?.hourlyRateUSD || 0)}/hr</span>
                 </div>
               </div>

               <p className="text-[9px] text-neutral-600 leading-relaxed max-w-[240px] mx-auto font-light">
                 By confirming, you authorize a discreet pre-authorization hold. ATLAS Operations will initiate protocol immediately.
               </p>
             </>
           )}
        </div>

        {!isProcessing && (
          <div className="p-8 bg-obsidian border-t border-neutral-900/50 safe-area-bottom">
            <button
              onClick={handleConfirm}
              className="group relative w-full bg-neutral-900 hover:bg-neutral-800 text-white py-4 text-[9px] font-bold uppercase tracking-[0.25em] border border-neutral-800 transition-all duration-500 shadow-instrument hover:shadow-instrument-hover active:scale-[0.99]"
            >
              <span className="relative z-10">Initiate Request</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default BookingFlow;