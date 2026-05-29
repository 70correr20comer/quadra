import React, { useState, useEffect } from 'react';
import { Court, Sport, ReservationData } from '../types';
import { ShieldCheck, User, CreditCard, Award, Sliders, Clock, AlertTriangle } from 'lucide-react';

interface ReservationFormProps {
  courts: Court[];
  onSubmit: (data: ReservationData) => void;
  selectedCourtIdFromGrid: number | null;
  onClearSelectedCourtId: () => void;
}

// Convert "HH:MM" string to raw duration in minutes for easy overlap checks
export const timeToMinutes = (timeString: string): number => {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
};

// Check if two timeframes overlap
export const checkTimeframeOverlap = (
  s1: string,
  e1: string,
  s2: string,
  e2: string
): boolean => {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);

  // standard interval collision logic
  return start1 < end2 && end1 > start2;
};

export const ReservationForm: React.FC<ReservationFormProps> = ({
  courts,
  onSubmit,
  selectedCourtIdFromGrid,
  onClearSelectedCourtId,
}) => {
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [sport, setSport] = useState<Sport>('Futebol');
  const [courtId, setCourtId] = useState<number>(1);
  
  // Custom manual start and end times - default to standard slots
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('09:00');
  
  const [error, setError] = useState<string | null>(null);

  // Synchronize when the user clicks a court from the grid selection
  useEffect(() => {
    if (selectedCourtIdFromGrid !== null) {
      setCourtId(selectedCourtIdFromGrid);
      const chosenCourt = courts.find((c) => c.id === selectedCourtIdFromGrid);
      if (chosenCourt) {
        setSport(chosenCourt.sport);
      }
      onClearSelectedCourtId();
    }
  }, [selectedCourtIdFromGrid, courts, onClearSelectedCourtId]);

  // Formats CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const rawDigits = value.replace(/\D/g, ''); // Remove non-digits
    const limitedRaw = rawDigits.slice(0, 11); // Limit to 11 digits

    // Format matches
    let formatted = limitedRaw;
    if (limitedRaw.length > 9) {
      formatted = `${limitedRaw.slice(0, 3)}.${limitedRaw.slice(3, 6)}.${limitedRaw.slice(6, 9)}-${limitedRaw.slice(9, 11)}`;
    } else if (limitedRaw.length > 6) {
      formatted = `${limitedRaw.slice(0, 3)}.${limitedRaw.slice(3, 6)}.${limitedRaw.slice(6, 9)}`;
    } else if (limitedRaw.length > 3) {
      formatted = `${limitedRaw.slice(0, 3)}.${limitedRaw.slice(3, 6)}`;
    }

    return formatted;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    setError(null);
  };

  // Quick helper to check if CPF is valid structurally
  const isCpfValid = (value: string) => {
    const plain = value.replace(/\D/g, '');
    if (plain.length !== 11) return false;
    
    // Check for repetitive digits (e.g., 111.111.111-11 is invalid in Brazilian registry)
    const repetitive = /^(.)\1+$/;
    if (repetitive.test(plain)) return false;

    // Validate digit 1
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(plain.charAt(i)) * (10 - i);
    let check1 = 11 - (sum % 11);
    if (check1 === 10 || check1 === 11) check1 = 0;
    if (check1 !== parseInt(plain.charAt(9))) return false;

    // Validate digit 2
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(plain.charAt(i)) * (11 - i);
    let check2 = 11 - (sum % 11);
    if (check2 === 10 || check2 === 11) check2 = 0;
    if (check2 !== parseInt(plain.charAt(10))) return false;

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Basic input validation
    if (!fullName.trim()) {
      setError('Por favor, informe seu Nome Completo.');
      return;
    }
    
    if (fullName.trim().split(' ').length < 2) {
      setError('Por favor, digite seu Sobrenome também.');
      return;
    }

    if (!cpf) {
      setError('Por favor, digite o CPF.');
      return;
    }

    if (!isCpfValid(cpf)) {
      setError('O CPF digitado é inválido. Digite um CPF real com 11 dígitos.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Preencha os horários de início e término.');
      return;
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (startMin >= endMin) {
      setError('O horário de término deve ser posterior ao horário de início!');
      return;
    }

    // Minimum reservation length constraint check if desired, otherwise support any
    if (endMin - startMin < 15) {
      setError('A reserva mínima deve ser de pelo menos 15 minutos.');
      return;
    }

    // 2. Select court validation
    const targetCourt = courts.find((c) => c.id === Number(courtId));
    if (!targetCourt) {
      setError('Quadra selecionada é inexistente.');
      return;
    }

    // 3. Check for specific overlaps with existing reservations on this court
    // "O ESTADO RESERVADA NAO IMPEDE O CLIENTE DE RESERVAR EM OUTRO HORARIO"
    const overlapRes = targetCourt.reservations.find((res) =>
      checkTimeframeOverlap(startTime, endTime, res.startTime, res.endTime)
    );

    if (overlapRes) {
      setError(
        `CONFLITO DE DIÁRIO: A ${targetCourt.name} já está reservada das ${overlapRes.startTime} às ${overlapRes.endTime} por ${overlapRes.name}. Escolha outro período!`
      );
      return;
    }

    // Form validated! Submit to parent
    onSubmit({
      fullName: fullName.trim(),
      cpf,
      sport,
      courtId: Number(courtId),
      startTime,
      endTime,
    });

    // Reset fields
    setFullName('');
    setCpf('');
  };

  // Inspect the current status of the selected court in real-time
  const selectedCourtDetail = courts.find((c) => c.id === Number(courtId));

  return (
    <div id="reservation-form" className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-space font-bold text-gray-900 text-lg">
            Formulário de Agendamento
          </h2>
          <p className="text-xs text-gray-400">
            Determine seu horário exato sem restrições fixas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome Completo Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-400" />
            Nome Completo
          </label>
          <input
            id="input-fullname"
            type="text"
            required
            placeholder="Ex: João da Silva Santos"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
          />
        </div>

        {/* CPF Mascado Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            CPF
          </label>
          <input
            id="input-cpf"
            type="text"
            required
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
          />
          <span className="text-[10px] text-gray-400 mt-1 block">
            Apenas números, máscara de formatação automática.
          </span>
        </div>

        {/* Esporte & Quadra selection selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-gray-400" />
              Esporte
            </label>
            <select
              id="select-sport-form"
              value={sport}
              onChange={(e) => {
                setSport(e.target.value as Sport);
                setError(null);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            >
              <option value="Futebol">Futebol</option>
              <option value="Tênis">Tênis</option>
              <option value="Vôlei">Vôlei</option>
              <option value="Beach Tennis">Beach Tennis</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              Número da Quadra
            </label>
            <select
              id="select-court-form"
              value={courtId}
              onChange={(e) => {
                setCourtId(Number(e.target.value));
                setError(null);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
            >
              <option value={1}>Quadra 1</option>
              <option value={2}>Quadra 2</option>
              <option value={3}>Quadra 3</option>
              <option value={4}>Quadra 4</option>
              <option value={5}>Quadra 5</option>
              <option value={6}>Quadra 6</option>
            </select>
          </div>
        </div>

        {/* CUSTOM TIME SELECTION (Das ... Até ...) */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-3">
          <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Definição Manual do Intervalo Horário
          </span>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">
                Das (Início)
              </label>
              <input
                id="input-start-time"
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 outline-hidden focus:border-indigo-500 font-bold font-mono focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">
                Às (Término)
              </label>
              <input
                id="input-end-time"
                type="time"
                required
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 outline-hidden focus:border-indigo-500 font-bold font-mono focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          <p className="text-[10px] text-gray-400 italic">
            Exemplo: Das <span className="font-bold font-mono text-gray-600">01:00</span> às <span className="font-bold font-mono text-gray-600">18:31</span>. Qualquer horário customizado é aceito!
          </p>
        </div>

        {/* Listing existing reservations for selected court if any */}
        {selectedCourtDetail && selectedCourtDetail.reservations.length > 0 && (
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-xs space-y-1.5">
            <span className="font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Períodos Reservados na {selectedCourtDetail.name}:
            </span>
            <div className="flex flex-col gap-1">
              {selectedCourtDetail.reservations.map((res) => (
                <div key={res.id} className="flex justify-between items-center text-[11px] bg-white border border-amber-100 rounded px-2 py-1 text-amber-950 font-mono">
                  <span className="font-bold">Das {res.startTime} às {res.endTime}</span>
                  <span className="text-[10px] text-gray-400 italic truncate max-w-[120px]" title={res.name}>
                    ({res.name})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Status Insight */}
        {selectedCourtDetail && (
          <div className="mt-3">
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                selectedCourtDetail.status === 'LIVRE'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : selectedCourtDetail.status === 'EM_USO'
                    ? 'bg-amber-50 border-amber-100 text-amber-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedCourtDetail.status === 'LIVRE'
                    ? 'bg-emerald-500'
                    : selectedCourtDetail.status === 'EM_USO'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`}
              />
              <span className="font-medium">
                {selectedCourtDetail.name} está no estado:{' '}
                <strong className="underline">
                  {selectedCourtDetail.status === 'LIVRE'
                    ? 'Liberado'
                    : selectedCourtDetail.status === 'EM_USO'
                      ? 'Em Uso Simulado'
                      : 'Indisponível Simulado'}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            id="form-error-alert"
            className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium shadow-2xs animate-shake flex items-start gap-2"
          >
            <span className="text-red-500 font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Active confirmation trigger */}
        <button
          id="btn-confirm-reservation"
          type="submit"
          className="cursor-pointer w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-space font-semibold text-sm rounded-lg shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
};
