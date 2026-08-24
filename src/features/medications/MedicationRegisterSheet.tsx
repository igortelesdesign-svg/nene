import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  Pill, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldAlert,
  FileText,
  Calendar,
  Check
} from 'lucide-react';
import { Child, MedicationAdministrationEvent } from '../../types';
import { medicationService } from '../../services/medicationService';
import { calculateChildAge } from '../../utils/dateUtils';

interface MedicationRegisterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  preselectedChildId?: string | 'all';
  currentUserName: string;
  onSuccessAddEvent: (event: MedicationAdministrationEvent) => void;
}

export const MedicationRegisterSheet: React.FC<MedicationRegisterSheetProps> = ({
  isOpen,
  onClose,
  childrenList,
  preselectedChildId = 'all',
  currentUserName,
  onSuccessAddEvent,
}) => {
  const initialChildId =
    preselectedChildId !== 'all' && childrenList.some((c) => c.id === preselectedChildId)
      ? preselectedChildId
      : childrenList[0]?.id || '';

  const [selectedChildId, setSelectedChildId] = useState<string>(initialChildId);

  // Medication form fields
  const [medicationName, setMedicationName] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });
  const [dosageManual, setDosageManual] = useState<string>('');
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'administered' | 'postponed' | 'skipped'>('administered');
  const [actualTime, setActualTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim()) {
      setErrorMsg('Por favor, informe o nome do medicamento.');
      return;
    }
    if (!currentChild) {
      setErrorMsg('Selecione uma criança.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const log = await medicationService.registerMedication({
        childId: currentChild.id,
        familyId: currentChild.familyId,
        medicationName: medicationName.trim(),
        scheduledTime: scheduledTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dosageManual: dosageManual.trim() || undefined,
        prescriptionNotes: prescriptionNotes.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        administeredBy: currentUserName || 'Responsável',
      });

      const timelineEvent = medicationService.logToTimelineEvent(log);
      onSuccessAddEvent(timelineEvent);

      // Reset form
      setMedicationName('');
      setDosageManual('');
      setPrescriptionNotes('');
      setNotes('');
      setStatus('administered');
      onClose();
    } catch (err: any) {
      console.error('[MedicationRegisterSheet error]:', err);
      setErrorMsg('Não foi possível salvar o registro de medicamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="medication-register-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="medication-register-sheet"
        className="w-full max-w-md bg-[#FFF6EE] rounded-t-[28px] sm:rounded-[28px] border border-[#133A34]/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-12 h-1.5 bg-[#133A34]/15 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#133A34]/10 flex items-center justify-between bg-[#FFF6EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F08A6B]/20 text-[#D96D4E] flex items-center justify-center">
              <Pill size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#133A34] leading-tight">
                Registrar Medicamento
              </h2>
              <p className="text-xs text-[#89A589]">
                {currentChild ? `Para ${currentChild.name}` : 'Selecione a criança'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-[#133A34]/60 hover:text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Child Selector */}
        <div className="px-5 py-3 bg-[#F2EFE6]/60 border-b border-[#133A34]/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#133A34]/70 mb-2">
            Para quem é a medicação?
          </div>
          <div className={`grid gap-2 ${childrenList.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {childrenList.map((child) => {
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  id={`med-select-child-${child.id}-btn`}
                  onClick={() => setSelectedChildId(child.id)}
                  type="button"
                  className={`p-2.5 rounded-2xl flex items-center gap-2 border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#133A34] text-white border-[#133A34] shadow-xs'
                      : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/10 hover:border-[#133A34]/25'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: child.avatarBgColor || (child.sex === 'female' ? '#F08A6B' : '#89A589') }}
                  >
                    {child.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{child.name}</div>
                    <div
                      className={`text-[10px] ${
                        isSelected ? 'text-white/70' : 'text-[#89A589]'
                      }`}
                    >
                      {calculateChildAge(child.birthDate).fullAge}
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="ml-auto text-[#F08A6B] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome do medicamento */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#133A34] block">
              Nome do medicamento <span className="text-[#F08A6B]">*</span>
            </label>
            <input
              type="text"
              id="medication-name-input"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ex: Amoxicilina, Vitamina D, Paracetamol..."
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34] shadow-2xs"
            />
          </div>

          {/* Horário previsto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#133A34] block flex items-center gap-1">
                <Clock size={12} className="text-[#89A589]" />
                <span>Horário previsto</span>
              </label>
              <input
                type="time"
                id="medication-scheduled-time-input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34]"
              />
            </div>

            {/* Status Inicial */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#133A34] block">
                Estado da administração
              </label>
              <div className="flex gap-1">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] font-bold focus:outline-none focus:border-[#133A34]"
                >
                  <option value="administered">Administrado ✅</option>
                  <option value="postponed">Adiado ⏳</option>
                  <option value="skipped">Não administrado ❌</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dosagem informada pelo responsável */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-[#133A34] block">
                Dosagem (opcional)
              </label>
              <span className="text-[10px] text-[#89A589] italic">
                informação cadastrada pelo responsável
              </span>
            </div>
            <input
              type="text"
              id="medication-dosage-manual-input"
              value={dosageManual}
              onChange={(e) => setDosageManual(e.target.value)}
              placeholder="Ex: 2,5 ml, 2 gotas, 1 comprimido..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34]"
            />
          </div>

          {/* Observação da prescrição */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#133A34] block flex items-center gap-1">
              <FileText size={12} className="text-[#89A589]" />
              <span>Observação da prescrição</span>
            </label>
            <input
              type="text"
              id="medication-prescription-notes-input"
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="Ex: Conforme receita da Dra. Camila de 20/08 (7 dias)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34]"
            />
          </div>

          {/* Observações opcionais */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#133A34] block">
              Observações opcionais
            </label>
            <textarea
              id="medication-notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Tomou bem junto com a mamadeira, sem cuspir..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34] resize-none"
            />
          </div>

          {/* Safe ethical banner */}
          <div className="p-3 bg-[#F08A6B]/10 rounded-2xl border border-[#F08A6B]/20 flex items-start gap-2.5 text-[11px] text-[#133A34] leading-relaxed">
            <ShieldAlert size={16} className="text-[#F08A6B] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#133A34] font-bold">Uso Seguro</strong>
              O NENÊ não recomenda, não calcula doses e não prescreve medicamentos. Este registro serve apenas para organização familiar baseada nas orientações do seu médico ou pediatra.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[#133A34]/20 text-xs font-bold text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="submit-medication-register-btn"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[#133A34] text-white text-xs font-bold hover:bg-[#1a4e46] cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check size={16} className="text-[#F08A6B]" />
                  <span>Salvar medicação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
