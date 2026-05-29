import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Calendar, User, CreditCard, ShieldCheck, Ticket } from 'lucide-react';
import { ReservationData } from '../types';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationDetails: ReservationData | null;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  reservationDetails,
}) => {
  if (!isOpen || !reservationDetails) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Ticket Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 z-10 flex flex-col"
        >
          {/* Header decoration */}
          <div className="bg-emerald-600 p-6 text-white text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mb-3 backdrop-blur-xs"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="font-space font-extrabold text-xl tracking-tight">
              Reserva Confirmada!
            </h3>
            <p className="text-emerald-100 text-xs mt-1 font-medium font-mono">
              COMPROVANTE DE AGENDAMENTO
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 bg-slate-50 relative">
            {/* Left and right ticket cutouts */}
            <div className="absolute top-0 -left-3 w-6 h-6 rounded-full bg-slate-900/60 backdrop-blur-md" />
            <div className="absolute top-0 -right-3 w-6 h-6 rounded-full bg-slate-900/60 backdrop-blur-md" />

            <div className="bg-white rounded-xl border border-gray-200/60 p-4.5 shadow-xs space-y-4">
              {/* Card Title */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Ticket className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  DADOS DA RESERVA
                </span>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 gap-3.5 text-sm">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Nome Completo
                  </span>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold font-space">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{reservationDetails.fullName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    CPF
                  </span>
                  <div className="flex items-center gap-2 text-gray-700 font-mono text-xs">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>{reservationDetails.cpf}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Horário Reservado
                  </span>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold font-mono text-sm bg-indigo-50/40 p-2 rounded-lg border border-indigo-100/35">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Das {reservationDetails.startTime} às {reservationDetails.endTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Quadra
                    </span>
                    <div className="bg-indigo-50 text-indigo-950 font-bold px-2 py-1 rounded text-center font-space">
                      Quadra {reservationDetails.courtId}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Esporte
                    </span>
                    <div className="bg-emerald-50 text-emerald-950 font-bold px-2 py-1 rounded text-center text-xs flex justify-center items-center h-full">
                      {reservationDetails.sport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Safety note */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  STATUS: ATIVO
                </span>
                <span>ID: #{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
            <button
              id="btn-close-modal"
              type="button"
              onClick={onClose}
              className="cursor-pointer px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-space font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all w-full"
            >
              Excelente, Fechar!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
