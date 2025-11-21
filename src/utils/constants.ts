import { Asset } from './types';

export const ASSETS: Asset[] = [
  // Aviation
  {
    id: 'avi-1',
    name: 'Airbus H130',
    category: 'AVIATION',
    description: 'The quietest helicopter in its category, offering panoramic visibility for scenic transfers.',
    specs: { speed: '130 kts', range: '327 nm', passengers: 6, luggage: 'Medium' },
    image: 'https://picsum.photos/800/600?grayscale',
    hourlyRateUSD: 2200,
    available: true,
  },
  {
    id: 'avi-2',
    name: 'Pilatus PC-12 NGX',
    category: 'AVIATION',
    description: 'Versatile turboprop delivering jet-class speed with access to shorter runways.',
    specs: { speed: '290 kts', range: '1,803 nm', passengers: 8, luggage: 'Large' },
    image: 'https://picsum.photos/801/600?grayscale',
    hourlyRateUSD: 3500,
    available: true,
  },
  // Chauffeur
  {
    id: 'chauf-1',
    name: 'Mercedes-Maybach S-Class',
    category: 'CHAUFFEUR',
    description: 'The ultimate expression of luxury. Extended wheelbase for maximum rear comfort.',
    specs: { passengers: 3, luggage: '3 Large', languages: ['English', 'Xhosa', 'Zulu'] },
    image: 'https://picsum.photos/802/600?grayscale',
    hourlyRateUSD: 150,
    available: true,
  },
  {
    id: 'chauf-2',
    name: 'Range Rover Autobiography',
    category: 'CHAUFFEUR',
    description: 'Commanding presence with executive rear seating configuration.',
    specs: { passengers: 3, luggage: '4 Large', languages: ['English', 'Afrikaans'] },
    image: 'https://picsum.photos/803/600?grayscale',
    hourlyRateUSD: 180,
    available: true,
  },
  // Armoured
  {
    id: 'arm-1',
    name: 'Toyota Land Cruiser 300 (B6)',
    category: 'ARMOURED',
    description: 'Discreet armoured transport. B6 protection against high-powered rifles.',
    specs: { passengers: 4, ballisticGrade: 'B6', luggage: '3 Large' },
    image: 'https://picsum.photos/804/600?grayscale',
    hourlyRateUSD: 450,
    available: true,
  },
  {
    id: 'arm-2',
    name: 'Cadillac Escalade (B7)',
    category: 'ARMOURED',
    description: 'Maximum civilian protection level. VR9 certified.',
    specs: { passengers: 5, ballisticGrade: 'B7', luggage: '4 Large' },
    image: 'https://picsum.photos/805/600?grayscale',
    hourlyRateUSD: 750,
    available: false,
  },
  // Protection
  {
    id: 'prot-1',
    name: 'Close Protection Officer (CPO)',
    category: 'PROTECTION',
    description: 'Highly trained specialist. Discreet or overt presence as requested.',
    specs: { passengers: 0, specialties: ['Route Planning', 'First Aid', 'Evasive Driving'] },
    image: 'https://picsum.photos/806/600?grayscale',
    hourlyRateUSD: 120,
    available: true,
  },
  {
    id: 'prot-2',
    name: 'Tactical Support Team',
    category: 'PROTECTION',
    description: 'Full security detail for high-risk movements.',
    specs: { passengers: 0, specialties: ['Crowd Control', 'Convoy Ops'] },
    image: 'https://picsum.photos/807/600?grayscale',
    hourlyRateUSD: 500,
    available: true,
  },
];

export const SERVICE_DESCRIPTIONS = {
  AVIATION: "On-demand rotor and fixed-wing charter.",
  CHAUFFEUR: "Executive transport with professional drivers.",
  ARMOURED: "Ballistic-rated vehicles for sensitive movements.",
  PROTECTION: "Specialized security personnel and risk management."
};
