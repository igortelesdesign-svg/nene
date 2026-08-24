import React from 'react';
import { Pill, Clock, FileText, CheckCircle2, ChevronRight, Edit3 } from 'lucide-react';
import { Child, MedicationAdministrationEvent } from '../../types';
import { MedicationStatusBadge } from './MedicationStatusBadge';
import { formatTimeOnly } from '../../utils/dateUtils';

interface MedicationTimelineCardProps {
  event: MedicationAdministrationEvent;
  child?: Child;
  showChildBadge?: boolean;
  onOpenActionModal: (event: MedicationAdministrationEvent) => void;
}

export const MedicationTimelineCard: React.FC<MedicationTimelineCardProps> = ({
  event,
  child,
  showChildBadge = true,
  onOpenActionModal,
}) => {
  const isAdministered = event.status === 'administered';
  const isPostponed = event.status === 'postponed';
  const isSkipped = event.status === 'skipped';

  return (
    <div
      id={`medication-card-${event.id}`}
      className="bg-[#FFF6EE] p-4 rounded-[22px] border border-[#133A34]/5 shadow-xs flex flex-col gap-2.5 transition-all hover:border-[#133A34]/15 group"
    >
      {/* Top row: Child identification & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {showChildBadge && child && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
              >
                {child.name.charAt(0)}
              </span>
              <span className="text-xs font-bold text-[#133A34] truncate">
                {child.name}
              </span>
            </div>
          )}
          <span className="text-[11px] text-[#133A34]/40 font-medium">
            • {formatTimeOnly(event.timestamp)}
          </span>
        </div>

        <MedicationStatusBadge status={event.status || 'administered'} size="sm" />
      </div>

      {/* Main Info Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#F08A6B]/15 text-[#D96D4E] flex items-center justify-center shrink-0 mt-0.5">
            <Pill size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#133A34] leading-tight truncate">
              {event.medicationName}
            </h4>

            {/* Time details */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#89A589] mt-0.5">
              <span>Previsto: <strong>{event.scheduledTime}</strong></span>
              {event.actualTime && (
                <span className="text-[#133A34]/70">
                  • Realizado: <strong>{event.actualTime}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick action button to edit/update status */}
        <button
          onClick={() => onOpenActionModal(event)}
          type="button"
          className="p-1.5 rounded-xl bg-[#133A34]/5 hover:bg-[#133A34]/10 text-[#133A34] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
          title="Alterar status ou detalhes da administração"
        >
          <Edit3 size={13} />
          <span className="hidden sm:inline">Status</span>
        </button>
      </div>

      {/* Manual Dosage notice */}
      {event.dosage && (
        <div className="bg-[#89A589]/10 rounded-xl px-2.5 py-1.5 text-[11px] text-[#133A34] flex items-baseline justify-between gap-2 border border-[#89A589]/20">
          <span className="font-semibold truncate">Dose: {event.dosage}</span>
          <span className="text-[9px] text-[#89A589] shrink-0 italic">
            (cadastrado pelo responsável)
          </span>
        </div>
      )}

      {/* Prescription notes */}
      {event.prescriptionNotes && (
        <div className="text-[11px] text-[#133A34]/80 bg-[#133A34]/5 px-2.5 py-1.5 rounded-xl">
          <span className="font-semibold text-[#133A34]">Prescrição/Orientação: </span>
          <span>{event.prescriptionNotes}</span>
        </div>
      )}

      {/* Caregiver notes */}
      {event.notes && (
        <p className="text-[11px] text-[#89A589] italic bg-[#FFF6EE] border border-[#133A34]/5 p-2 rounded-xl">
          "{event.notes}"
        </p>
      )}

      {/* Footer with Caregiver credit */}
      <div className="text-[10px] text-[#133A34]/40 pt-1.5 border-t border-[#133A34]/5 flex justify-between items-center">
        <span>Registrado por {event.createdBy || 'Responsável'}</span>
      </div>
    </div>
  );
};
