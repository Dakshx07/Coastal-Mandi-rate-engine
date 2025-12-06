import { Harbour, Species, Rate, Subscriber } from '../types';
import { supabase } from './supabaseClient';

// --- Harbours ---
export const getHarbours = async (): Promise<Harbour[]> => {
  const { data, error } = await supabase
    .from('harbours')
    .select('*');

  if (error) {
    console.error('Error fetching harbours:', error);
    return [];
  }
  return data || [];
};

export const addHarbour = async (name: string, state: string): Promise<Harbour | null> => {
  const { data, error } = await supabase
    .from('harbours')
    .insert({ name, state, last_updated_timestamp: Date.now() })
    .select()
    .single();

  if (error) {
    console.error('Error adding harbour:', error);
    return null;
  }
  return data;
};

// --- Species ---
export const getSpecies = async (): Promise<Species[]> => {
  const { data, error } = await supabase
    .from('species')
    .select('*');

  if (error) {
    console.error('Error fetching species:', error);
    return [];
  }
  return data || [];
};

export const addSpecies = async (name_en: string, name_local: string): Promise<Species | null> => {
  const { data, error } = await supabase
    .from('species')
    .insert({ name_en, name_local, image_url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80&w=200' }) // Default placeholder
    .select()
    .single();

  if (error) {
    console.error('Error adding species:', error);
    return null;
  }
  return data;
};

// --- Rates ---
export const getRates = async (harbourId?: string, speciesId?: string): Promise<Rate[]> => {
  let query = supabase.from('rates').select('*');

  if (harbourId) {
    query = query.eq('harbour_id', harbourId);
  }
  if (speciesId) {
    query = query.eq('species_id', speciesId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching rates:', error);
    return [];
  }
  return data || [];
};

export const addRate = async (rate: Omit<Rate, 'id'>): Promise<Rate | null> => {
  // Check if rate already exists for this harbour/species/date
  const { data: existing } = await supabase
    .from('rates')
    .select('id')
    .eq('harbour_id', rate.harbour_id)
    .eq('species_id', rate.species_id)
    .eq('date', rate.date)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('rates')
      .update({
        price_per_kg: rate.price_per_kg,
        verification_level: rate.verification_level,
        lots_checked: rate.lots_checked,
        rate_confidence_score: rate.rate_confidence_score,
        source_admin_id: rate.source_admin_id
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) console.error('Error updating rate:', error);
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('rates')
      .insert(rate)
      .select()
      .single();

    if (error) console.error('Error adding rate:', error);
    return data;
  }
};

export const updateRateById = async (rateId: string, newPrice: number): Promise<Rate | null> => {
  const { data, error } = await supabase
    .from('rates')
    .update({ price_per_kg: newPrice })
    .eq('id', rateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating rate by ID:', error);
    return null;
  }
  return data;
};

// --- Subscribers ---
export const getSubscribers = async (harbourId: string): Promise<Subscriber[]> => {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('harbour_id_subscribed', harbourId);

  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
  return data || [];
};

export const addSubscriber = async (phone: string, harbourId: string): Promise<Subscriber | null> => {
  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      phone_number: phone,
      harbour_id_subscribed: harbourId,
      opt_in_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding subscriber:', error);
    return null;
  }
  return data;
};
// --- Demo Data Population ---
export const populateDemoData = async () => {
  const demoHarbours = [
    { name: 'Veraval Harbour', state: 'Gujarat' },
    { name: 'Porbandar', state: 'Gujarat' },
    { name: 'Mangrol', state: 'Gujarat' },
    { name: 'Sassoon Dock', state: 'Maharashtra' },
    { name: 'Bhaucha Dhakka', state: 'Maharashtra' },
    { name: 'Ratnagiri', state: 'Maharashtra' },
    { name: 'Malpe Harbour', state: 'Karnataka' },
    { name: 'Mangalore Old Port', state: 'Karnataka' },
    { name: 'Karwar', state: 'Karnataka' },
    { name: 'Kochi Harbour', state: 'Kerala' },
    { name: 'Munambam', state: 'Kerala' },
    { name: 'Neendakara', state: 'Kerala' },
    { name: 'Thoothukudi', state: 'Tamil Nadu' },
    { name: 'Chennai Kasimedu', state: 'Tamil Nadu' },
    { name: 'Vizag Fishing Harbour', state: 'Andhra Pradesh' },
    { name: 'Kakinada', state: 'Andhra Pradesh' },
    { name: 'Paradip', state: 'Odisha' },
    { name: 'Digha Mohana', state: 'West Bengal' }
  ];

  const demoSpecies = [
    { name_en: 'Sardine', name_local: 'Mathi / Tarli' },
    { name_en: 'Mackerel', name_local: 'Ayala / Bangda' },
    { name_en: 'Seer Fish', name_local: 'Neymeen / Surmai' },
    { name_en: 'Prawns (Tiger)', name_local: 'Chemmeen / Jhinga' },
    { name_en: 'Prawns (White)', name_local: 'Vella Chemmeen' },
    { name_en: 'Tuna (Yellowfin)', name_local: 'Choora / Kuppa' },
    { name_en: 'Squid', name_local: 'Koonthal / Calamari' },
    { name_en: 'Cuttlefish', name_local: 'Kanava' },
    { name_en: 'Pomfret (Black)', name_local: 'Karutha Avoli / Halwa' },
    { name_en: 'Pomfret (Silver)', name_local: 'Vella Avoli / Paplet' },
    { name_en: 'Crab (Blue)', name_local: 'Njandu / Kekda' },
    { name_en: 'Anchovy', name_local: 'Netholi / Kati' },
    { name_en: 'Red Snapper', name_local: 'Chemballi / Rane' },
    { name_en: 'Grouper', name_local: 'Kalava' },
    { name_en: 'Barracuda', name_local: 'Sheela' },
    { name_en: 'Ribbon Fish', name_local: 'Vaala / Pambadi' },
    { name_en: 'Sole Fish', name_local: 'Manthal / Lep' }
  ];

  console.log("Starting demo data population...");

  // Insert Harbours
  for (const h of demoHarbours) {
    const { data: existing } = await supabase
      .from('harbours')
      .select('id')
      .eq('name', h.name)
      .single();

    if (!existing) {
      await addHarbour(h.name, h.state);
      console.log(`Added harbour: ${h.name}`);
    }
  }

  // Insert Species
  for (const s of demoSpecies) {
    const { data: existing } = await supabase
      .from('species')
      .select('id')
      .eq('name_en', s.name_en)
      .single();

    if (!existing) {
      await addSpecies(s.name_en, s.name_local);
      console.log(`Added species: ${s.name_en}`);
    }
  }

  console.log("Demo data population complete.");
};
