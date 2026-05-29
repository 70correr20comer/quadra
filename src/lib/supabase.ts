import { createClient } from '@supabase/supabase-js';
import { Court, Reservation } from '../types';

// Retrieve credentials safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey.trim() !== '' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client dynamically
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Constant holding instructions for creating the database schema in Supabase
export const DATABASE_SCHEMA_SQL = `-- CRIAÇÃO DA TABELA DE RESERVAS NO SUPABASE SQL EDITOR
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    court_id INT NOT NULL,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL,
    sport TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    reserved_at TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar acesso público livre (Configuração RLS padrão para simplicidade de desenvolvimento)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso público irrestrito" ON public.reservations
    FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Loads all reservations from Supabase. Fallbacks to localStorage if Supabase is offline/unconfigured.
 */
export async function fetchAllReservations(): Promise<Record<number, Reservation[]>> {
  const defaultMap: Record<number, Reservation[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase: Running in Offline Local Mode. Reading from LocalStorage.');
    try {
      const stored = localStorage.getItem('arena_play_reservations');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
    return defaultMap;
  }

  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    if (data) {
      const result: Record<number, Reservation[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: []
      };

      data.forEach((row: any) => {
        const courtId = Number(row.court_id);
        if (result[courtId]) {
          result[courtId].push({
            id: row.id,
            name: row.name,
            cpf: row.cpf,
            sport: row.sport,
            startTime: row.start_time,
            endTime: row.end_time,
            reservedAt: row.reserved_at
          });
        }
      });

      // Also persist to localStorage as backup cache
      localStorage.setItem('arena_play_reservations', JSON.stringify(result));
      return result;
    }
  } catch (error) {
    console.error('Supabase: Error fetching reservations, falling back to cached local storage:', error);
    try {
      const stored = localStorage.getItem('arena_play_reservations');
      if (stored) return JSON.parse(stored);
    } catch {}
  }

  return defaultMap;
}

/**
 * Adds a new reservation. Synchronizes with Supabase of configured, otherwise persists locally.
 */
export async function saveReservationToDB(
  courtId: number,
  reservation: Reservation
): Promise<boolean> {
  const currentReservations = await fetchAllReservations();
  if (!currentReservations[courtId]) {
    currentReservations[courtId] = [];
  }
  currentReservations[courtId].push(reservation);
  
  // Always update our local backup first
  localStorage.setItem('arena_play_reservations', JSON.stringify(currentReservations));

  if (!isSupabaseConfigured || !supabase) {
    return true; // Local success
  }

  try {
    const { error } = await supabase
      .from('reservations')
      .insert({
        id: reservation.id,
        court_id: courtId,
        name: reservation.name,
        cpf: reservation.cpf,
        sport: reservation.sport,
        start_time: reservation.startTime,
        end_time: reservation.endTime,
        reserved_at: reservation.reservedAt
      });

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Supabase: Failed to insert reservation, queued in local storage fallback:', error);
    return false;
  }
}

/**
 * Removes a reservation from database. Fallbacks to localStorage.
 */
export async function deleteReservationFromDB(
  courtId: number,
  reservationId: string
): Promise<boolean> {
  const currentReservations = await fetchAllReservations();
  if (currentReservations[courtId]) {
    currentReservations[courtId] = currentReservations[courtId].filter((r) => r.id !== reservationId);
  }
  
  // Always update our local backup first
  localStorage.setItem('arena_play_reservations', JSON.stringify(currentReservations));

  if (!isSupabaseConfigured || !supabase) {
    return true; // Local success
  }

  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId);

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Supabase: Failed to delete reservation, updating locally only:', error);
    return false;
  }
}
