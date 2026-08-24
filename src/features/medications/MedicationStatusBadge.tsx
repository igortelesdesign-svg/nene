import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { MedicationStatus } from '../../types';

interface MedicationStatusBadgeProps {
  status: MedicationStatus;
  size?: 'sm' | 'md';
}

export const MedicationStatusBadge: React.FC<MedicationStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'administered':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#89A589]/20 text-[#133A34] ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 size={size === 'sm' ? 11 : 13} className="text-[#133A34]" />
          <span>Administrado</span>
        </span>
      );

    case 'postponed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#F6C56B]/30 text-[#8C5D00] ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock size={size === 'sm' ? 11 : 13} className="text-[#8C5D00]" />
          <span>Adiado</span>
        </span>
      );

    case 'skipped':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#F08A6B]/20 text-[#D96D4E] ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <XCircle size={size === 'sm' ? 11 : 13} className="text-[#D96D4E]" />
          <span>Não administrado</span>
        </span>
      );

    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#133A34]/10 text-[#133A34] ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <AlertCircle size={size === 'sm' ? 11 : 13} className="text-[#133A34]/70" />
          <span>Horário previsto</span>
        </span>
      );
  }
};
