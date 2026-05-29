import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Court, CourtStatus, Sport, Reservation } from '../types';
import { Clock, Check, Lock, Award, Sparkles, Trash2, CalendarDays } from 'lucide-react';

interface CourtCardProps {
  court: Court;
  onStatusChange: (courtId: number, status: CourtStatus) => void;
  onSportChange: (courtId: number, sport: Sport) => void;
  onCancelReservation: (courtId: number, reservationId: string) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({
  court,
  onStatusChange,
  onSportChange,
  onCancelReservation,
}) => {
  // ambient / overall state (for visualization indicators)
  const isCurrentlyReserved = court.status === 'RESERVADA' || court.reservations.length > 0;
  const activeStatus: CourtStatus = court.reservations.length > 0 ? 'RESERVADA' : court.status;

  const getStatusConfig = (status: CourtStatus) => {
    switch (status) {
      case 'LIVRE':
        return {
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          indicatorColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          badgeText: 'LIVRE / SEM COLISÃO',
          borderColor: 'border-emerald-500/20',
          hoverBorderColor: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
          accentColor: 'text-emerald-600',
        };
      case 'EM_USO':
        return {
          bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
          indicatorColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          badgeText: 'EM USO (SIMULAÇÃO)',
          borderColor: 'border-amber-500/20',
          hoverBorderColor: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
          accentColor: 'text-amber-600',
        };
      case 'RESERVADA':
        return {
          bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
          indicatorColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
          badgeText: 'RESERVADA',
          borderColor: 'border-rose-500/25',
          hoverBorderColor: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
          accentColor: 'text-rose-600',
        };
    }
  };

  const config = getStatusConfig(activeStatus);

  // Render court miniature diagram
  const renderCourtMiniature = () => {
    switch (court.sport) {
      case 'Futebol':
        return (
          <div className="relative w-full h-24 bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-lg overflow-hidden border border-emerald-500/40 shadow-inner flex flex-col justify-between p-2">
            <div className="absolute inset-x-2 inset-y-0 border-l border-r border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/20 rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-widest text-emerald-100 bg-black/20 px-1 py-0.5 rounded font-medium">
                SINTÉTICA
              </span>
              <Award className="w-3.5 h-3.5 text-emerald-250/40" />
            </div>
            <div className="relative z-10 text-center">
              <span className="text-white font-space font-medium tracking-wide text-xs drop-shadow-md">
                {court.sport}
              </span>
            </div>
            <div className="relative z-10 flex justify-between items-end text-[8px] font-mono text-emerald-100/70">
              <span>90x45m</span>
              <span>Fut 7</span>
            </div>
          </div>
        );

      case 'Tênis':
        return (
          <div className="relative w-full h-24 bg-gradient-to-b from-amber-700 to-orange-700 rounded-lg overflow-hidden border border-amber-600/40 shadow-inner flex flex-col justify-between p-2">
            <div className="absolute inset-x-2.5 inset-y-1 border border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/25 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200/40 border-dashed pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-widest text-orange-100 bg-black/20 px-1 py-0.5 rounded font-medium">
                SAIBRO
              </span>
              <Sparkles className="w-3.5 h-3.5 text-orange-250/40" />
            </div>
            <div className="relative z-10 text-center">
              <span className="text-white font-space font-medium tracking-wide text-xs drop-shadow-md">
                {court.sport}
              </span>
            </div>
            <div className="relative z-10 flex justify-between items-end text-[8px] font-mono text-orange-100/70">
              <span>Rápida</span>
              <span>Singles</span>
            </div>
          </div>
        );

      case 'Vôlei':
        return (
          <div className="relative w-full h-24 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-lg overflow-hidden border border-blue-500/40 shadow-inner flex flex-col justify-between p-2">
            <div className="absolute inset-x-3 inset-y-1 border border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100/50 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-widest text-blue-100 bg-black/20 px-1 py-0.5 rounded font-medium">
                GINÁSIO
              </span>
              <Award className="w-3.5 h-3.5 text-blue-250/40" />
            </div>
            <div className="relative z-10 text-center">
              <span className="text-white font-space font-medium tracking-wide text-xs drop-shadow-md">
                {court.sport}
              </span>
            </div>
            <div className="relative z-10 flex justify-between items-end text-[8px] font-mono text-blue-100/70">
              <span>Oficial</span>
              <span>Piso Vinílico</span>
            </div>
          </div>
        );

      case 'Beach Tennis':
        return (
          <div className="relative w-full h-24 bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg overflow-hidden border border-amber-300/40 shadow-inner flex flex-col justify-between p-2">
            <div className="absolute inset-x-3 inset-y-1 border border-amber-600/20 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-700/30 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-[9px] font-mono tracking-widest text-amber-950 bg-black/5 px-1 py-0.5 rounded font-medium">
                AREIA
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500/30" />
            </div>
            <div className="relative z-10 text-center">
              <span className="text-amber-950 font-space font-medium tracking-wide text-xs drop-shadow-sm">
                {court.sport}
              </span>
            </div>
            <div className="relative z-10 flex justify-between items-end text-[8px] font-mono text-amber-900/60">
              <span>Beach Pro</span>
              <span>Duplas</span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      id={`court-card-${court.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col bg-white rounded-xl border p-4.5 transition-all duration-300 ${config.borderColor} ${config.hoverBorderColor} hover:shadow-lg`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${config.indicatorColor}`} />
          <h3 className="font-space font-bold text-gray-800 text-base">
            {court.name}
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border font-mono ${config.bgColor}`}
        >
          {config.badgeText}
        </span>
      </div>

      {/* visual miniature of court layout */}
      <div className="mb-4">
        {renderCourtMiniature()}
      </div>

      {/* RESERVATIONS LOG / LISTINGS SECTION */}
      <div className="flex-1 mb-4">
        {court.reservations.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Reservas Ativas ({court.reservations.length}):
            </span>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {court.reservations.map((res) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-rose-50/75 rounded-lg p-2.5 border border-rose-100 flex flex-col relative text-xs group"
                  >
                    {/* Delete cancellation controller */}
                    <button
                      id={`btn-cancel-res-${res.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent modal trigger
                        onCancelReservation(court.id, res.id);
                      }}
                      className="cursor-pointer absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                      title="Excluir Reserva"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex justify-between text-[10px] text-rose-800 font-bold mb-0.5">
                      <span className="truncate max-w-[130px]">{res.name}</span>
                      <span className="font-mono text-[9px] mr-5 text-gray-400">CPF: {res.cpf.slice(-6)}</span>
                    </div>

                    {/* DYNAMIC TIME SPAN DISPLAY (Das H1 - Às H2) */}
                    <div className="mt-1 bg-white border border-rose-200/50 rounded p-1 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-bold font-mono text-[11px] text-rose-900">
                        <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        Das {res.startTime} às {res.endTime}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : court.status === 'EM_USO' ? (
          <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100 text-xs text-center flex flex-col justify-center items-center py-4">
            <Clock className="w-5 h-5 text-amber-500 mb-1 animate-pulse" />
            <p className="text-amber-800 font-medium text-[11px] uppercase tracking-wider">
              Jogadores em Campo
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Partida em andamento voluntária
            </p>
          </div>
        ) : court.status === 'RESERVADA' ? (
          <div className="bg-rose-50/50 rounded-lg p-2.5 border border-rose-100 text-xs text-center flex flex-col justify-center items-center py-4">
            <Lock className="w-5 h-5 text-rose-500 mb-1 animate-bounce" />
            <p className="text-rose-800 font-medium text-[11px] uppercase tracking-wider">
              Bloqueado Manualmente
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Reservado por painel interno
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50/40 rounded-lg p-3 border border-emerald-100 text-xs text-center flex flex-col justify-center items-center py-5">
            <Check className="w-5 h-5 text-emerald-500 mb-1" />
            <p className="text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
              Livre / Sem Agendamentos
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Nenhuma colisão de horário cadastrada
            </p>
          </div>
        )}
      </div>

      {/* Manual simulation controller */}
      <div className="border-t border-gray-100 pt-3 mt-auto">
        <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">
          Simular Estado Rápido
        </label>
        
        <div className="grid grid-cols-3 gap-1">
          <button
            id={`btn-manual-livre-${court.id}`}
            type="button"
            onClick={() => onStatusChange(court.id, 'LIVRE')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] font-semibold transition-all ${
              court.status === 'LIVRE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-emerald-50'
            }`}
            title="Definir Livre"
          >
            <Check className="w-3 h-3 mb-0.5" />
            Livre
          </button>
          
          <button
            id={`btn-manual-em_uso-${court.id}`}
            type="button"
            onClick={() => onStatusChange(court.id, 'EM_USO')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] font-semibold transition-all ${
              court.status === 'EM_USO'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-amber-50'
            }`}
            title="Definir Em Uso"
          >
            <Clock className="w-3 h-3 mb-0.5" />
            Em Uso
          </button>
          
          <button
            id={`btn-manual-reservada-${court.id}`}
            type="button"
            onClick={() => onStatusChange(court.id, 'RESERVADA')}
            className={`cursor-pointer flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] font-semibold transition-all ${
              court.status === 'RESERVADA'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-rose-50'
            }`}
            title="Definir Bloqueio Manual"
          >
            <Lock className="w-3 h-3 mb-0.5" />
            Bloque.
          </button>
        </div>

        {/* Change sport selector */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] gap-2">
          <span className="text-gray-400 font-medium">Modalidade:</span>
          <select
            id={`select-sport-${court.id}`}
            value={court.sport}
            onChange={(e) => onSportChange(court.id, e.target.value as Sport)}
            className="cursor-pointer bg-white text-gray-700 border border-gray-200 rounded px-1.5 py-0.5 text-[11px] font-medium outline-hidden focus:border-indigo-500"
          >
            <option value="Futebol">Futebol</option>
            <option value="Tênis">Tênis</option>
            <option value="Vôlei">Vôlei</option>
            <option value="Beach Tennis">Beach Tennis</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};
