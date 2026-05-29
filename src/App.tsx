import { useState, useEffect } from 'react';
import { Court, CourtStatus, Sport, ReservationData, Reservation } from './types';
import { ReservationForm } from './components/ReservationForm';
import { CourtCard } from './components/CourtCard';
import { SuccessModal } from './components/SuccessModal';
import {
  isSupabaseConfigured,
  fetchAllReservations,
  saveReservationToDB,
  deleteReservationFromDB,
} from './lib/supabase';
import {
  Trophy,
  Dribbble,
  RefreshCw,
  Activity,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Initial state for 6 courts
  const [courts, setCourts] = useState<Court[]>([
    { id: 1, name: 'Quadra 1', sport: 'Futebol', status: 'LIVRE', reservations: [] },
    { id: 2, name: 'Quadra 2', sport: 'Tênis', status: 'LIVRE', reservations: [] },
    { id: 3, name: 'Quadra 3', sport: 'Vôlei', status: 'LIVRE', reservations: [] },
    { id: 4, name: 'Quadra 4', sport: 'Beach Tennis', status: 'LIVRE', reservations: [] },
    { id: 5, name: 'Quadra 5', sport: 'Futebol', status: 'LIVRE', reservations: [] },
    { id: 6, name: 'Quadra 6', sport: 'Tênis', status: 'LIVRE', reservations: [] },
  ]);

  // Selected court to focus/scroll from grid selection
  const [selectedCourtIdFromGrid, setSelectedCourtIdFromGrid] = useState<number | null>(null);

  // Success modal activation states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeReservation, setActiveReservation] = useState<ReservationData | null>(null);

  // States
  const [isLoading, setIsLoading] = useState(true);

  // Load reservations from Supabase / localStorage fallback on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const reservationsMap = await fetchAllReservations();
        setCourts((prevCourts) =>
          prevCourts.map((c) => {
            const list = reservationsMap[c.id] || [];
            return {
              ...c,
              reservations: list,
              status: list.length > 0 ? 'RESERVADA' : c.status
            };
          })
        );
      } catch (err) {
        console.error('Failed fetching data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handler for reserving a court via Form Submission
  const handleReservationSubmit = async (data: ReservationData) => {
    const reservationId = 'res-' + Math.random().toString(36).substring(2, 11);
    const newBooking: Reservation = {
      id: reservationId,
      name: data.fullName,
      cpf: data.cpf,
      sport: data.sport,
      startTime: data.startTime,
      endTime: data.endTime,
      reservedAt: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // 1. Persist to DB (Real Supabase or localStorage fallback)
    await saveReservationToDB(data.courtId, newBooking);

    // 2. Synchronize memory state to reflect visually
    setCourts((prevCourts) =>
      prevCourts.map((c) => {
        if (c.id === data.courtId) {
          return {
            ...c,
            sport: data.sport,
            status: 'RESERVADA',
            reservations: [...c.reservations, newBooking],
          };
        }
        return c;
      })
    );

    // 3. Save details to display on success popup / modal
    setActiveReservation(data);
    setIsSuccessModalOpen(true);
  };

  // Handler for canceling a specific booking
  const handleCancelReservation = async (courtId: number, reservationId: string) => {
    // 1. Remove from DB (Real Supabase or localStorage fallback)
    await deleteReservationFromDB(courtId, reservationId);

    // 2. Remove memory state representation
    setCourts((prevCourts) =>
      prevCourts.map((c) => {
        if (c.id === courtId) {
          const updatedBookings = c.reservations.filter((r) => r.id !== reservationId);
          return {
            ...c,
            reservations: updatedBookings,
            // If we cleared all reservations and it was marked RESERVADA, make it LIVRE
            status: updatedBookings.length === 0 && c.status === 'RESERVADA' ? 'LIVRE' : c.status
          };
        }
        return c;
      })
    );
  };

  // Handler for fast manual status switches from mini-court controls
  const handleStatusChangeManual = (courtId: number, newStatus: CourtStatus) => {
    setCourts((prevCourts) =>
      prevCourts.map((c) => {
        if (c.id === courtId) {
          const updated: Court = { ...c, status: newStatus };
          
          if (newStatus === 'RESERVADA') {
            // Add a mock simulated booking dynamically
            const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
            const mockBooking: Reservation = {
              id: mockId,
              name: 'Reserva Rápida Simulação',
              cpf: '000.000.000-00',
              sport: c.sport,
              startTime: '13:00',
              endTime: '14:30',
              reservedAt: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            };

            updated.reservations = [...c.reservations, mockBooking];
            
            // Sync mock booking to database / offline cache
            saveReservationToDB(courtId, mockBooking);
          }
          return updated;
        }
        return c;
      })
    );
  };

  // Handler for manual sport change in dropdown inside card mini-court
  const handleSportChangeManual = (courtId: number, newSport: Sport) => {
    setCourts((prevCourts) =>
      prevCourts.map((c) => (c.id === courtId ? { ...c, sport: newSport } : c))
    );
  };

  // Reset helper to wipe active DB reservations as well
  const handleResetAllCourts = async () => {
    if (confirm('Deseja realmente redefinir todas as reservas e dados locais/nuvem?')) {
      // Clear localStorage
      localStorage.removeItem('arena_play_reservations');

      // Clear records on Supabase if connected
      if (isSupabaseConfigured) {
        try {
          // Simply truncate/delete on the client table
          await deleteReservationFromDB(1, 'all'); // trigger local update
        } catch (e) {
          console.error(e);
        }
      }

      // Hard set original state
      setCourts([
        { id: 1, name: 'Quadra 1', sport: 'Futebol', status: 'LIVRE', reservations: [] },
        { id: 2, name: 'Quadra 2', sport: 'Tênis', status: 'LIVRE', reservations: [] },
        { id: 3, name: 'Quadra 3', sport: 'Vôlei', status: 'LIVRE', reservations: [] },
        { id: 4, name: 'Quadra 4', sport: 'Beach Tennis', status: 'LIVRE', reservations: [] },
        { id: 5, name: 'Quadra 5', sport: 'Futebol', status: 'LIVRE', reservations: [] },
        { id: 6, name: 'Quadra 6', sport: 'Tênis', status: 'LIVRE', reservations: [] },
      ]);
      setSelectedCourtIdFromGrid(null);
    }
  };

  // Click on a court automatically focuses inside form
  const handleSelectCourtFromGrid = (courtId: number) => {
    setSelectedCourtIdFromGrid(courtId);
  };

  // Counters for stats
  const totalLivreCount = courts.filter((c) => c.status === 'LIVRE' && c.reservations.length === 0).length;
  const totalEmUsoCount = courts.filter((c) => c.status === 'EM_USO').length;
  const totalReservadasCount = courts.filter((c) => c.status === 'RESERVADA' || c.reservations.length > 0).length;

  return (
    <div id="main-app" className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight pb-16">
      {/* Decorative colored bar top */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-rose-500 w-full" />

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-gray-100 py-5 px-4 md:px-8 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center animate-pulse">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-space font-extrabold text-xl md:text-2xl text-gray-900 tracking-tight flex items-center gap-1.5">
                Arena Play
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-sm">
                  ESPORTES
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Sistema de Gestão & Agendamento de Quadras
              </p>
            </div>
          </div>

          {/* Quick Realtime Counters */}
          <div className="flex items-center flex-wrap justify-center gap-2 md:gap-4 bg-slate-50/50 p-2 rounded-2xl border border-gray-100">
            {/* Livre indicator */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-500 font-medium">Livre:</span>
              <span className="text-emerald-700 font-bold">{totalLivreCount}</span>
            </div>

            {/* Em Uso indicator */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-gray-500 font-medium">Uso:</span>
              <span className="text-amber-700 font-bold">{totalEmUsoCount}</span>
            </div>

            {/* Reservada indicator */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-gray-500 font-medium">Agendadas:</span>
              <span className="text-rose-700 font-bold">{totalReservadasCount}</span>
            </div>

            {/* Fast resets */}
            <button
              id="btn-global-reset"
              type="button"
              onClick={handleResetAllCourts}
              className="cursor-pointer p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
              title="Redefinir todas as quadras e limpar reservas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Dashboard layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Banner with simulation controls info */}
        <div className="mb-8 bg-gradient-to-r from-slate-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none w-1/3 flex items-center justify-center">
            <Activity className="w-40 h-40 text-emerald-400 animate-pulse" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-3 border border-emerald-500/35">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Horários Livres e Flexíveis
            </span>
            <h2 className="font-space font-extrabold text-2xl md:text-3xl tracking-tight mb-2">
              Reservas por Parâmetros Avançados de Tempo!
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              O agendamento de uma quadra não obstrui que outros jogadores a reservem em horários alternados. Defina manualmente os intervalos (ex: <strong className="text-white">Das 01:00 às 18:31</strong>) e agende seu treino livremente!
            </p>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                id="btn-quick-tip"
                type="button"
                onClick={handleResetAllCourts}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-white border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Limpar & Reiniciar Quadras
              </button>
              <span className="text-[11px] text-slate-300 md:inline hidden ml-2">
                Dica: Clique em qualquer card de quadra para preencher o formulário na hora!
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Reservation Form (4 Span) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <ReservationForm
              courts={courts}
              onSubmit={handleReservationSubmit}
              selectedCourtIdFromGrid={selectedCourtIdFromGrid}
              onClearSelectedCourtId={() => setSelectedCourtIdFromGrid(null)}
            />
          </div>

          {/* Column 2: Interactive Grid of Court Cards (8 Span) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="font-space font-extrabold text-gray-800 text-lg flex items-center gap-2">
                  <Dribbble className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                  Quadro Interativo de Quadras
                </h3>
                <p className="text-xs text-gray-400">
                  Selecione tempos manuais abaixo. Cadastros evitam colisões em nível de minuto para a mesma quadra!
                </p>
              </div>
            </div>

            {/* Grid display */}
            <div id="courts-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courts.map((court) => (
                <div
                  key={court.id}
                  onClick={() => handleSelectCourtFromGrid(court.id)}
                  className="cursor-pointer transition-transform duration-200 active:scale-[0.99] hover:scale-[1.01]"
                  title="Focar agendamento nesta quadra"
                >
                  <CourtCard
                    court={court}
                    onStatusChange={handleStatusChangeManual}
                    onSportChange={handleSportChangeManual}
                    onCancelReservation={handleCancelReservation}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Success Modal Confirmation Dialog popup */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setActiveReservation(null);
        }}
        reservationDetails={activeReservation}
      />
    </div>
  );
}
