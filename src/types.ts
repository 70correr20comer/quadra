/**
 * Types for the Sports Court Reservation System
 */

export type Sport = 'Futebol' | 'Tênis' | 'Vôlei' | 'Beach Tennis';

export type CourtStatus = 'LIVRE' | 'EM_USO' | 'RESERVADA';

export interface Reservation {
  id: string;
  name: string;
  cpf: string;
  sport: Sport;
  startTime: string; // format: "HH:MM" (e.g. "01:00")
  endTime: string;   // format: "HH:MM" (e.g. "18:31")
  reservedAt: string;
}

export interface Court {
  id: number;
  name: string;
  sport: Sport;
  status: CourtStatus;
  reservations: Reservation[];
}

export interface ReservationData {
  fullName: string;
  cpf: string;
  sport: Sport;
  courtId: number;
  startTime: string;
  endTime: string;
}
