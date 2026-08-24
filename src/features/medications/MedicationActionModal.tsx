import React, { useState } from 'react';
import { X, CheckCircle2, Clock, XCircle, Pill, ShieldAlert } from 'lucide-react';
import { Child, MedicationAdministrationEvent, MedicationStatus } from '../../types';

interface MedicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MedicationAdministrationEvent | null;
  child?: Child | null;
  onUpdateStatus: (
    eventId: string,
    status: MedicationStatus,
    actualTime?: string,
    notes?: string
  ) => void;
}

export const MedicationActionModal: React.FC<MedicationActionModalProps> = ({
  isOpen,
  onClose,
  event,
  child,
  onUpdateStatus,
}) => {
  if (!isOpen || !event) return null;

  const [selectedStatus, setSelectedStatus] = useState<MedicationStatus>(event.status || 'administered');
  const [actualTime, setActualTime] = useState<string>(
    event.actualTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState<string>(event.notes || '');

  const handleSave = () => {
    onUpdateStatus(
      event.id,
      selectedStatus,
      selectedStatus === 'administered' ? actualTime : undefined,
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div
      id="medication-action-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="medication-action-dialog"
        className="w-full max-w-md bg-[#FFF6EE] rounded-t-[28px] sm:rounded-[28px] border border-[#133A34]/10 shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-12 h-1.5 bg-[#133A34]/15 rounded-full mx-auto -mt-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#133A34]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F08A6B]/20 text-[#D96D4E] flex items-center justify-center">
              <Pill size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#133A34] leading-tight">
                {event.medicationName}
              </h3>
              <p className="text-xs text-[#89A589]">
                {child ? `Para ${child.name}` : 'Atualizar administração'} • Previsto: {event.scheduledTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#133A34]/60 hover:text-[#133A34] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Prescription details if any */}
        {event.prescriptionNotes && (
          <div className="bg-[#133A34]/5 rounded-xl p-2.5 text-xs text-[#133A34]/80">
            <span className="font-bold text-[#133A34] block mb-0.5">Observação da prescrição:</span>
            <span>{event.prescriptionNotes}</span>
          </div>
        )}

        {/* Dose manual info notice */}
        {event.dosage && (
          <div className="bg-[#89A589]/10 rounded-xl p-2.5 text-[11px] text-[#133A34]">
            <span className="font-bold block">Dose registrada: {event.dosage}</span>
            <span className="text-[10px] text-[#89A589]">
              Informação cadastrada pelo responsável
            </span>
          </div>
        )}

        {/* Status choices */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#133A34] block">
            Status da administração
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus('administered')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'administered'
                  ? 'bg-[#133A34] text-white border-[#133A34] shadow-xs'
                  : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15 hover:border-[#133A34]/30'
              }`}
            >
              <CheckCircle2 size={18} className={selectedStatus === 'administered' ? 'text-[#89A589]' : 'text-[#89A589]'} />
              <span>Administrado</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('postponed')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'postponed'
                  ? 'bg-[#133A34] text-white border-[#133A34] shadow-xs'
                  : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15 hover:border-[#133A34]/30'
              }`}
            >
              <Clock size={18} className={selectedStatus === 'postponed' ? 'text-[#F6C56B]' : 'text-[#8C5D00]'} />
              <span>Adiado</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus('skipped')}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedStatus === 'skipped'
                  ? 'bg-[#133A34] text-white border-[#133A34] shadow-xs'
                  : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15 hover:border-[#133A34]/30'
              }`}
            >
              <XCircle size={18} className={selectedStatus === 'skipped' ? 'text-[#F08A6B]' : 'text-[#D96D4E]'} />
              <span>Não administrado</span>
            </button>
          </div>
        </div>

        {/* Actual Time input if administered */}
        {selectedStatus === 'administered' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#133A34] block">
              Horário real da administração
            </label>
            <input
              type="time"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
            />
          </div>
        )}

        {/* Observations input */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#133A34] block">
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Tomou junto com um pouco de leite, sem queixas..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34] resize-none"
          />
        </div>

        {/* Safe notice */}
        <div className="p-2.5 rounded-xl bg-[#F08A6B]/10 border border-[#F08A6B]/20 flex items-start gap-2 text-[10px] text-[#133A34]">
          <ShieldAlert size={14} className="text-[#F08A6B] shrink-0 mt-0.5" />
          <span>
            O NENÊ não calcula dosagens nem recomenda medicamentos. Apenas registra as informações fornecidas pelo responsável.
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#133A34]/20 text-xs font-bold text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#133A34] text-white text-xs font-bold hover:bg-[#1a4e46] cursor-pointer shadow-xs"
          >
            Salvar status
          </button>
        </div>
      </div>
    </div>
  );
};
