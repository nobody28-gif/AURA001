import { create } from 'zustand';

export const ESTATE_DATA = [
  { 
    floor: '6th Floor', 
    id: 6,
    floorY: 26,
    name: 'Dragon Crest Sky Villas', 
    price: '$28,500,000', 
    size: '5,800 sq ft', 
    kanji: '龍閣', 
    elevation: '+2,400m', 
    desc: 'The supreme summit overlooking the luminous skyline and mountain canyon.',
    cad: { master: '28x22 ft', living: '42x30 ft', terrace: '1,200 sq ft', ceiling: '16.5 ft' },
    plots: [
      { id: '01', gate: 'North Spire', angle: 0, tag: 'Megacity Overlook', price: '$28.5M', imgColor: '#ff0055', desc: 'Direct view of the towering neon glass skyscrapers.' },
      { id: '02', gate: 'East Gate', angle: Math.PI / 2, tag: 'Skyline Terrace', price: '$26.8M', imgColor: '#00e5ff', desc: 'River reflections and suspended highway ribbons.' },
      { id: '03', gate: 'South Court', angle: Math.PI, tag: 'Lantern Vista', price: '$29.0M', imgColor: '#ffb700', desc: 'Overhanging amber lantern deck with infinite horizon views.' },
      { id: '04', gate: 'West Ridge', angle: (3 * Math.PI) / 2, tag: 'Mountain Horizon', price: '$27.4M', imgColor: '#a855f7', desc: 'Panoramic mountain ridge silhouetted against glowing sunset.' }
    ]
  },
  { 
    floor: '5th Floor', 
    id: 5,
    floorY: 21,
    name: 'Imperial City Suites', 
    price: '$21,200,000', 
    size: '5,100 sq ft', 
    kanji: '紫禁', 
    elevation: '+2,100m', 
    desc: 'Carved golden cedar balconies framing the river metropolis bridges and illuminated suspended skyways.',
    cad: { master: '24x20 ft', living: '36x28 ft', terrace: '950 sq ft', ceiling: '14.5 ft' },
    plots: [
      { id: '01', gate: 'North Wing', angle: 0, tag: 'Cyber Haven', price: '$21.2M', imgColor: '#ff2266', desc: 'Glazed roof tiles catch ambient violet city glare.' },
      { id: '02', gate: 'East Chamber', angle: Math.PI / 2, tag: 'River Vista', price: '$20.5M', imgColor: '#00b4d8', desc: 'Watch golden freight skiffs drift through misty waters.' },
      { id: '03', gate: 'South Balcony', angle: Math.PI, tag: 'Jade Deck', price: '$22.0M', imgColor: '#ff9e00', desc: 'Double tea chambers facing illuminated downtown towers.' },
      { id: '04', gate: 'West Alcove', angle: (3 * Math.PI) / 2, tag: 'Peak Point', price: '$20.8M', imgColor: '#7b2cbf', desc: 'Overlooks mist rising from dark cedar mountain folds.' }
    ]
  },
  { 
    floor: '4th Floor', 
    id: 4,
    floorY: 16,
    name: 'Metropolis Heritage Lofts', 
    price: '$16,800,000', 
    size: '4,600 sq ft', 
    kanji: '古都', 
    elevation: '+1,800m', 
    desc: 'Traditional lattice windows framing futuristic glowing city grids and ancient mountain pine forests.',
    cad: { master: '22x18 ft', living: '32x26 ft', terrace: '800 sq ft', ceiling: '14.0 ft' },
    plots: [
      { id: '01', gate: 'North Loft', angle: 0, tag: 'City Core', price: '$16.8M', imgColor: '#e63946', desc: 'Vaulted timber rafters with glowing neon city horizon.' },
      { id: '02', gate: 'East Veranda', angle: Math.PI / 2, tag: 'Neon Ridge', price: '$16.2M', imgColor: '#48cae4', desc: 'Private meditation balcony under the city glow.' },
      { id: '03', gate: 'South Bower', angle: Math.PI, tag: 'Amber Balcony', price: '$17.4M', imgColor: '#f77f00', desc: 'Acoustic stone chambers dampening the urban buzz.' },
      { id: '04', gate: 'West Post', angle: (3 * Math.PI) / 2, tag: 'Cliff Watch', price: '$16.5M', imgColor: '#9d4edd', desc: 'Night sky stars meet soaring communication spires.' }
    ]
  },
  { 
    floor: '3rd Floor', 
    id: 3,
    floorY: 11,
    name: 'Lotus Spring Onsen Suites', 
    price: '$13,400,000', 
    size: '4,200 sq ft', 
    kanji: '蓮泉', 
    elevation: '+1,500m', 
    desc: 'Thermal spring waters mirroring the illuminated city nightscape and sacred cliffside lanterns.',
    cad: { master: '20x18 ft', living: '30x24 ft', terrace: '750 sq ft', ceiling: '13.5 ft' },
    plots: [
      { id: '01', gate: 'North Hearth', angle: 0, tag: 'Thermal Spa', price: '$13.4M', imgColor: '#d90429', desc: 'Basalt onsens bathed in warm red lantern glows.' },
      { id: '02', gate: 'East Spa', angle: Math.PI / 2, tag: 'Steam Pavillion', price: '$13.0M', imgColor: '#0077b6', desc: 'Warm spring mist billowing against neon skyscrapers.' },
      { id: '03', gate: 'South Bath', angle: Math.PI, tag: 'Golden Pool', price: '$14.1M', imgColor: '#ffaa00', desc: 'Overlooks illuminated mountain suspension bridges.' },
      { id: '04', gate: 'West Retreat', angle: (3 * Math.PI) / 2, tag: 'Zen Terrace', price: '$13.2M', imgColor: '#6a0dad', desc: 'Secluded bamboo garden with silent mountain vistas.' }
    ]
  },
  { 
    floor: '2nd Floor', 
    id: 2,
    floorY: 6,
    name: 'Executive Silk Quarters', 
    price: '$10,800,000', 
    size: '3,800 sq ft', 
    kanji: '華堂', 
    elevation: '+1,200m', 
    desc: 'Boardroom clarity with private courtyards opening directly to the bustling river valley panorama.',
    cad: { master: '18x16 ft', living: '28x22 ft', terrace: '600 sq ft', ceiling: '13.0 ft' },
    plots: [
      { id: '01', gate: 'North Hall', angle: 0, tag: 'Silk Den', price: '$10.8M', imgColor: '#c1121f', desc: 'Hand-carved ebony screens facing city lights.' },
      { id: '02', gate: 'East Chamber', angle: Math.PI / 2, tag: 'River Arch', price: '$10.4M', imgColor: '#023e8a', desc: 'Private VIP lift directly from the lower mountain docks.' },
      { id: '03', gate: 'South Studio', angle: Math.PI, tag: 'Gilded Terrace', price: '$11.2M', imgColor: '#f4a261', desc: 'Sound-isolated work sanctuary surrounded by night mist.' },
      { id: '04', gate: 'West Den', angle: (3 * Math.PI) / 2, tag: 'Pillar Room', price: '$10.6M', imgColor: '#5a189a', desc: 'Overlooks mountain paths lit by stone lanterns.' }
    ]
  },
  { 
    floor: '1st Floor', 
    id: 1,
    floorY: 1,
    name: 'Water Cascade Duplex', 
    price: '$8,200,000', 
    size: '4,500 sq ft', 
    kanji: '瀑庭', 
    elevation: '+900m', 
    desc: 'Resting beside mountain waterfalls where reflections of city neon ripple across pristine natural pools.',
    cad: { master: '22x20 ft', living: '34x26 ft', terrace: '1,100 sq ft', ceiling: '15.0 ft' },
    plots: [
      { id: '01', gate: 'North Pool', angle: 0, tag: 'Waterfall Gate', price: '$8.2M', imgColor: '#e63946', desc: 'Living stream flowing beneath private glass floorings.' },
      { id: '02', gate: 'East Trail', angle: Math.PI / 2, tag: 'Bamboo Walk', price: '$7.9M', imgColor: '#0096c7', desc: 'Stone pathway winding toward the lower city harbor.' },
      { id: '03', gate: 'South Cascade', angle: Math.PI, tag: 'Koi Terrace', price: '$8.6M', imgColor: '#e76f51', desc: 'Two-tier timber deck nestled into ancient moss rocks.' },
      { id: '04', gate: 'West Grotto', angle: (3 * Math.PI) / 2, tag: 'Mist Grove', price: '$8.1M', imgColor: '#7209b7', desc: 'Protected by whispering red cedar canopies.' }
    ]
  }
];

export const WEATHER_PROFILES = {
  night: {
    bg: 'bg-gradient-to-b from-[#060911] via-[#0a101d] to-[#04060b]',
    fog: '#080d16',
    ambient: '#00e5ff',
    ambientIntensity: 0.65,
    dirLight: '#ffeedd',
    dirIntensity: 3.8
  },
  sunset: {
    bg: 'bg-gradient-to-b from-[#180a06] via-[#240e11] to-[#0c0305]',
    fog: '#1e0a08',
    ambient: '#ffd4aa',
    ambientIntensity: 0.9,
    dirLight: '#ff7700',
    dirIntensity: 4.8
  },
  morning: {
    bg: 'bg-gradient-to-b from-[#1d65a6] via-[#6ba8d9] to-[#d4ebfc]',
    fog: '#8ec4e8',
    ambient: '#cfe6f7',
    ambientIntensity: 1.1,
    dirLight: '#fff8db',
    dirIntensity: 5.2
  },
  storm: {
    bg: 'bg-gradient-to-b from-[#050608] via-[#0d1017] to-[#020305]',
    fog: '#07090e',
    ambient: '#60a5fa',
    ambientIntensity: 0.5,
    dirLight: '#93c5fd',
    dirIntensity: 2.5
  }
};

export const useEstateStore = create((set) => ({
  activeFloor: ESTATE_DATA[0],
  weatherPhase: 'night',
  cameraMode: 'orbit',
  activeBalconyPlot: null,
  isBrokerOpen: false,
  isSearchOpen: false,
  cadFloor: null,
  escrowPlot: null,
  plotDetailsFloor: null,

  setWeatherPhase: (weatherPhase) => set({ weatherPhase }),
  setActiveFloor: (activeFloor) => set({ activeFloor }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  
  walkInBalcony: (floor, plot) => set({
    activeBalconyPlot: { ...plot, floorY: floor.floorY },
    cameraMode: 'balcony'
  }),
  
  exitBalcony: () => set({
    cameraMode: 'orbit',
    activeBalconyPlot: null
  }),

  openBroker: (open) => set({ isBrokerOpen: open }),
  openSearch: (open) => set({ isSearchOpen: open }),
  setCadFloor: (floor) => set({ cadFloor: floor }),
  setEscrowPlot: (plot) => set({ escrowPlot: plot }),
  setPlotDetailsFloor: (floor) => set({ plotDetailsFloor: floor })
}));