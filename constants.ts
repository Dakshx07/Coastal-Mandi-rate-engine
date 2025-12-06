
import { Harbour, Species, Rate } from './types';
import { getRelativeDate } from './utils';

export const HARBOURS: Harbour[] = [
  { id: 'h1', name: 'Kochi Harbour', state: 'Kerala', last_updated_timestamp: Date.now() },
  { id: 'h2', name: 'Vizag Fishing Harbour', state: 'Andhra Pradesh', last_updated_timestamp: Date.now() },
  { id: 'h3', name: 'Mangalore Old Port', state: 'Karnataka', last_updated_timestamp: Date.now() },
  { id: 'h4', name: 'Sassoon Dock', state: 'Maharashtra', last_updated_timestamp: Date.now() },
  { id: 'h5', name: 'Chennai Kasimedu', state: 'Tamil Nadu', last_updated_timestamp: Date.now() },
  { id: 'h6', name: 'Veraval Harbour', state: 'Gujarat', last_updated_timestamp: Date.now() },
  { id: 'h7', name: 'Paradip Fishing Harbour', state: 'Odisha', last_updated_timestamp: Date.now() },
  { id: 'h8', name: 'Malpe Harbour', state: 'Karnataka', last_updated_timestamp: Date.now() },
  { id: 'h9', name: 'Munambam Harbour', state: 'Kerala', last_updated_timestamp: Date.now() },
];

export const SPECIES: Species[] = [
  { id: 's1', name_en: 'Sardine', name_local: 'Mathi / Tarli', image_url: 'https://loremflickr.com/320/240/sardine,fish' },
  { id: 's2', name_en: 'Mackerel', name_local: 'Ayala / Bangda', image_url: 'https://loremflickr.com/320/240/mackerel,fish' },
  { id: 's3', name_en: 'Seer Fish', name_local: 'Neymeen / Surmai', image_url: 'https://loremflickr.com/320/240/kingfish,fish' },
  { id: 's4', name_en: 'Prawns (Medium)', name_local: 'Chemmeen / Jhinga', image_url: 'https://loremflickr.com/320/240/prawns,seafood' },
  { id: 's5', name_en: 'Tuna', name_local: 'Choora / Kuppa', image_url: 'https://loremflickr.com/320/240/tuna,fish' },
  { id: 's6', name_en: 'Squid', name_local: 'Koonthal / Calamari', image_url: 'https://loremflickr.com/320/240/squid,seafood' },
  { id: 's7', name_en: 'Pomfret (Black)', name_local: 'Avoli / Halwa', image_url: 'https://loremflickr.com/320/240/pomfret,fish' },
  { id: 's8', name_en: 'Crab', name_local: 'Njandu / Kekda', image_url: 'https://loremflickr.com/320/240/crab,seafood' },
  { id: 's9', name_en: 'Anchovy', name_local: 'Netholi / Kati', image_url: 'https://loremflickr.com/320/240/anchovy,fish' },
  { id: 's10', name_en: 'Red Snapper', name_local: 'Chemballi / Rane', image_url: 'https://loremflickr.com/320/240/redsnapper,fish' },
  { id: 's11', name_en: 'Tiger Prawns', name_local: 'Puli Chemmeen', image_url: 'https://loremflickr.com/320/240/tigerprawn,seafood' },
  { id: 's12', name_en: 'Pearl Spot', name_local: 'Karimeen', image_url: 'https://loremflickr.com/320/240/pearlspot,fish' },
  { id: 's13', name_en: 'Indian Salmon', name_local: 'Rawas', image_url: 'https://loremflickr.com/320/240/salmon,fish' },
  { id: 's14', name_en: 'Barracuda', name_local: 'Sheela', image_url: 'https://loremflickr.com/320/240/barracuda,fish' },
  { id: 's15', name_en: 'Lobster', name_local: 'Konju', image_url: 'https://loremflickr.com/320/240/lobster,seafood' },
];

const generatePrices = (basePrice: number): number[] => {
  const prices: number[] = [];
  let current = basePrice;
  for (let i = 0; i < 7; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.2); // +/- 10%
    current += change;
    prices.push(Math.round(current));
  }
  return prices.reverse(); // Oldest to newest
};

export const INITIAL_RATES: Rate[] = [];

// Generate 7 days of data for the first harbour (Kochi) for 3 species to show trends immediately
const demoSpecies = [SPECIES[0], SPECIES[2], SPECIES[4]]; // Sardine, Seer, Tuna
const demoHarbour = HARBOURS[0];

demoSpecies.forEach(sp => {
  const basePrice = sp.id === 's1' ? 120 : sp.id === 's3' ? 800 : 250;
  const prices = generatePrices(basePrice);

  prices.forEach((price, index) => {
    // index 0 is oldest (6 days ago), index 6 is today
    const dayOffset = 6 - index;
    INITIAL_RATES.push({
      id: `rate_${demoHarbour.id}_${sp.id}_${index}`,
      harbour_id: demoHarbour.id,
      species_id: sp.id,
      price_per_kg: price,
      date: getRelativeDate(dayOffset),
      source_admin_id: 'admin_init',
      verification_level: 'Verified',
      rate_confidence_score: 90,
      lots_checked: 15
    });
  });
});

// Fill some random data for other harbours for "Today"
HARBOURS.slice(1).forEach(h => {
  SPECIES.forEach(sp => {
    INITIAL_RATES.push({
      id: `rate_${h.id}_${sp.id}_today`,
      harbour_id: h.id,
      species_id: sp.id,
      price_per_kg: Math.round(Math.random() * 500) + 50,
      date: getRelativeDate(0),
      source_admin_id: 'admin_init',
      verification_level: 'Phone Call',
      rate_confidence_score: 50,
      lots_checked: 5
    });
  });
});

// --- DATA ASSET: Quick Compare Mock Data ---
export const QUICK_COMPARE_MOCK_DATA = {
  "harbour_a": "Kochi Harbour",
  "harbour_b": "Vizag Fishing Harbour",
  "comparison_species": [
    {
      "species_name": "Sardine",
      "price_a": 125,
      "change_a": 5.2,
      "price_b": 118,
      "change_b": -2.1
    },
    {
      "species_name": "Mackerel",
      "price_a": 240,
      "change_a": 1.5,
      "price_b": 255,
      "change_b": 0.0
    },
    {
      "species_name": "Seer Fish",
      "price_a": 850,
      "change_a": 12.0,
      "price_b": 810,
      "change_b": 4.5
    },
    {
      "species_name": "Prawns",
      "price_a": 400,
      "change_a": -5.5,
      "price_b": 380,
      "change_b": -1.2
    },
    {
      "species_name": "Squid",
      "price_a": 320,
      "change_a": 0.0,
      "price_b": 340,
      "change_b": 2.8
    }
  ]
};
