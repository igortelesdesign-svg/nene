import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  Utensils, 
  Moon, 
  Pill, 
  Check, 
  Scale, 
  Stethoscope, 
  FileText,
  Thermometer,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Child, CareCategory, TimelineEvent, MedicationAdministrationEvent } from '../../types';
import { calculateChildAge } from '../../utils/dateUtils';
import { medicationService } from '../../services/medicationService';

interface QuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  preselectedChildId?: string | 'all';
  onAddEvent: (event: TimelineEvent) => void;
  currentUserName: string;
}

type QuickCategory = 
  | 'feeding' 
  | 'sleep' 
  | 'medication' 
  | 'diaper' 
  | 'temperature' 
  | 'growth' 
  | 'appointment' 
  | 'note'
  | 'other';

export const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({
  isOpen,
  onClose,
  childrenList,
  preselectedChildId = 'all',
  onAddEvent,
  currentUserName,
}) => {
  // Step in the modal: 'select_child' | 'select_category' | 'fill_details'
  const initialChild =
    preselectedChildId !== 'all' && childrenList.some((c) => c.id === preselectedChildId)
      ? preselectedChildId
      : childrenList[0]?.id || '';

  const [selectedChildId, setSelectedChildId] = useState<string>(initialChild);
  const [selectedCategory, setSelectedCategory] = useState<QuickCategory | null>(null);

  // Form states
  // Diaper
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');

  // Feeding
  const [feedingType, setFeedingType] = useState<'breast' | 'bottle' | 'solids'>('bottle');
  const [bottleMl, setBottleMl] = useState<number>(120);
  const [solidFood, setSolidFood] = useState<string>('Fruta amassada');
  const [foodAcceptance, setFoodAcceptance] = useState<'good' | 'partial' | 'refused'>('good');

  // Sleep
  const [sleepMinutes, setSleepMinutes] = useState<number>(45);

  // Medication (Sprint 3: Safe, structured for medications & medication_logs tables)
  const [medName, setMedName] = useState<string>('');
  const [medScheduledTime, setMedScheduledTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });
  const [medDosageManual, setMedDosageManual] = useState<string>('');
  const [medPrescriptionNotes, setMedPrescriptionNotes] = useState<string>('');
  const [medNotes, setMedNotes] = useState<string>('');
  const [medStatus, setMedStatus] = useState<'administered' | 'postponed' | 'skipped'>('administered');

  // Temperature
  const [temperature, setTemperature] = useState<number>(36.5);

  // Weight
  const [weightKg, setWeightKg] = useState<number>(7.2);

  // Appointment
  const [appointmentSpecialty, setAppointmentSpecialty] = useState<string>('Pediatria');
  const [appointmentDoctor, setAppointmentDoctor] = useState<string>('Dra. Camila Nogueira');

  // General note / Other
  const [noteText, setNoteText] = useState<string>('');

  if (!isOpen) return null;

  const currentChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  const handleSelectChildAndProceed = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleSelectCategory = (catId: QuickCategory) => {
    setSelectedCategory(catId);
  };

  const handleSave = () => {
    if (!selectedCategory || !currentChild) return;

    const nowIso = new Date().toISOString();
    const eventBase = {
      id: 'evt-' + Date.now(),
      childId: currentChild.id,
      familyId: currentChild.familyId,
      timestamp: nowIso,
      createdBy: currentUserName,
      notes: noteText.trim() || undefined,
    };

    let newEvent: TimelineEvent;

    switch (selectedCategory) {
      case 'diaper':
        newEvent = {
          ...eventBase,
          category: 'diaper',
          diaperType,
        };
        break;
      case 'feeding':
        newEvent = {
          ...eventBase,
          category: 'feeding',
          feedingType,
          amountMl: feedingType === 'bottle' ? bottleMl : undefined,
          foodName: feedingType === 'solids' ? solidFood : undefined,
          acceptance: feedingType === 'solids' ? foodAcceptance : undefined,
          durationMinutes: feedingType === 'breast' ? 20 : undefined,
        };
        break;
      case 'sleep':
        newEvent = {
          ...eventBase,
          category: 'sleep',
          startTime: new Date(Date.now() - sleepMinutes * 60000).toISOString(),
          endTime: nowIso,
          durationMinutes: sleepMinutes,
          quality: 'calm',
        };
        break;
      case 'medication':
        newEvent = {
          ...eventBase,
          category: 'medication',
          medicationName: medName.trim() || 'Medicamento',
          scheduledTime: medScheduledTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          actualTime:
            medStatus === 'administered'
              ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : undefined,
          status: medStatus,
          dosage: medDosageManual.trim() || undefined,
          dosageManual: medDosageManual.trim() || undefined,
          prescriptionNotes: medPrescriptionNotes.trim() || undefined,
          notes: medNotes.trim() || noteText.trim() || undefined,
        };
        // Persistir também no medicationService
        medicationService.registerMedication({
          childId: currentChild.id,
          familyId: currentChild.familyId,
          medicationName: medName.trim() || 'Medicamento',
          scheduledTime: medScheduledTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          dosageManual: medDosageManual.trim() || undefined,
          prescriptionNotes: medPrescriptionNotes.trim() || undefined,
          notes: medNotes.trim() || noteText.trim() || undefined,
          status: medStatus,
          administeredBy: currentUserName || 'Responsável',
        });
        break;
      case 'temperature':
        newEvent = {
          ...eventBase,
          category: 'temperature',
          temperatureC: temperature,
        };
        break;
      case 'growth':
        newEvent = {
          ...eventBase,
          category: 'growth',
          weightKg,
        };
        break;
      case 'appointment':
        newEvent = {
          ...eventBase,
          category: 'appointment',
          specialty: appointmentSpecialty,
          doctorName: appointmentDoctor,
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'upcoming',
        };
        break;
      case 'other':
      case 'note':
      default:
        newEvent = {
          ...eventBase,
          category: 'note',
          title: selectedCategory === 'other' ? 'Outro registro' : 'Observação da rotina',
          content: noteText || 'Registro rápido de rotina.',
        };
        break;
    }

    onAddEvent(newEvent);
    // Reset and close
    setSelectedCategory(null);
    setNoteText('');
    onClose();
  };

  const categories = [
    {
      id: 'feeding',
      label: 'Alimentação',
      desc: 'Peito, mamadeira ou sólidos',
      icon: Utensils,
      color: '#89A589',
      bg: 'bg-[#89A589]/15',
    },
    {
      id: 'sleep',
      label: 'Sono',
      desc: 'Sonecas e sono noturno',
      icon: Moon,
      color: '#133A34',
      bg: 'bg-[#133A34]/10',
    },
    {
      id: 'medication',
      label: 'Medicamento',
      desc: 'Registrar administração',
      icon: Pill,
      color: '#F08A6B',
      bg: 'bg-[#F08A6B]/15',
    },
    {
      id: 'diaper',
      label: 'Fralda',
      desc: 'Molhada, suja ou ambas',
      icon: Layers,
      color: '#F6C56B',
      bg: 'bg-[#F6C56B]/25',
    },
    {
      id: 'temperature',
      label: 'Temperatura',
      desc: 'Aferição de febre',
      icon: Thermometer,
      color: '#D96D4E',
      bg: 'bg-[#D96D4E]/15',
    },
    {
      id: 'growth',
      label: 'Peso',
      desc: 'Acompanhamento do peso',
      icon: Scale,
      color: '#89A589',
      bg: 'bg-[#89A589]/15',
    },
    {
      id: 'appointment',
      label: 'Consulta',
      desc: 'Pediatra ou especialista',
      icon: Stethoscope,
      color: '#133A34',
      bg: 'bg-[#133A34]/10',
    },
    {
      id: 'note',
      label: 'Observação',
      desc: 'Comportamento e marcos',
      icon: FileText,
      color: '#133A34',
      bg: 'bg-[#133A34]/5',
    },
    {
      id: 'other',
      label: 'Outro',
      desc: 'Outros cuidados gerais',
      icon: HelpCircle,
      color: '#89A589',
      bg: 'bg-[#89A589]/10',
    },
  ];

  return (
    <div
      id="quick-register-backdrop"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="quick-register-sheet"
        className="w-full max-w-md bg-[#FFF6EE] rounded-t-[28px] sm:rounded-[28px] border border-[#133A34]/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Mobile drag pill indicator */}
        <div className="w-12 h-1.5 bg-[#133A34]/15 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-[#133A34]/5 flex items-center justify-between bg-[#FFF6EE]">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button
                id="quick-register-back-btn"
                onClick={() => setSelectedCategory(null)}
                type="button"
                className="p-1 rounded-full text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer"
                aria-label="Voltar"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-[#133A34] leading-tight">
                {selectedCategory ? 'Registrar cuidado' : 'Registrar cuidado'}
              </h2>
              <p className="text-xs text-[#89A589]">
                {currentChild ? `Para ${currentChild.name}` : 'Selecione a criança'}
              </p>
            </div>
          </div>
          <button
            id="quick-register-close-btn"
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-[#133A34]/60 hover:text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Para quem é este cuidado? */}
        <div className="px-5 py-3 bg-[#F2EFE6]/50 border-b border-[#133A34]/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#133A34]/70 mb-2">
            Para quem é este cuidado?
          </div>
          <div className={`grid gap-2 ${childrenList.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {childrenList.map((child) => {
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  id={`register-child-${child.id}-btn`}
                  onClick={() => handleSelectChildAndProceed(child.id)}
                  type="button"
                  className={`p-2.5 rounded-2xl flex items-center gap-2 border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#133A34] text-white border-[#133A34] shadow-sm'
                      : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/10 hover:border-[#133A34]/25'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
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

        {/* Step 2: O que você quer registrar? */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!selectedCategory ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#133A34] mb-2">
                O que você quer registrar?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      id={`select-category-${cat.id}-btn`}
                      onClick={() => handleSelectCategory(cat.id as QuickCategory)}
                      type="button"
                      className="p-3 rounded-2xl bg-[#FFF6EE] border border-[#133A34]/5 hover:border-[#133A34]/20 hover:shadow-xs transition-all text-left flex items-start gap-2.5 cursor-pointer group"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#133A34] leading-snug">
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-[#89A589] line-clamp-1">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Forms for the chosen category */
            <div className="space-y-4">
              {/* Diaper Form */}
              {selectedCategory === 'diaper' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#133A34] block">
                    Tipo de fralda
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'wet', label: 'Molhada 💧' },
                      { id: 'dirty', label: 'Suja 💩' },
                      { id: 'both', label: 'Ambas 💧💩' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDiaperType(item.id as any)}
                        className={`py-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          diaperType === item.id
                            ? 'bg-[#133A34] text-white border-[#133A34]'
                            : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feeding Form */}
              {selectedCategory === 'feeding' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#133A34] block">
                    Tipo de alimentação
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bottle', label: 'Mamadeira 🍼' },
                      { id: 'breast', label: 'Peito 🤱' },
                      { id: 'solids', label: 'Sólidos 🥣' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFeedingType(item.id as any)}
                        className={`py-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          feedingType === item.id
                            ? 'bg-[#133A34] text-white border-[#133A34]'
                            : 'bg-[#FFF6EE] text-[#133A34] border-[#133A34]/15'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {feedingType === 'bottle' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#133A34]">Quantidade:</span>
                        <span className="font-bold text-[#133A34] bg-[#FFF6EE] px-2.5 py-1 rounded-md border border-[#133A34]/10">
                          {bottleMl} ml
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[60, 90, 120, 150, 180].map((ml) => (
                          <button
                            key={ml}
                            type="button"
                            onClick={() => setBottleMl(ml)}
                            className={`flex-1 py-2 text-xs rounded-lg font-bold border cursor-pointer ${
                              bottleMl === ml
                                ? 'bg-[#133A34] text-white border-[#133A34]'
                                : 'bg-[#FFF6EE] border-[#133A34]/15'
                            }`}
                          >
                            {ml}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedingType === 'solids' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-[#133A34] block mb-1">
                          Alimento oferecido
                        </label>
                        <input
                          type="text"
                          value={solidFood}
                          onChange={(e) => setSolidFood(e.target.value)}
                          placeholder="Ex: Banana amassada, Papinha..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#133A34] block mb-1">
                          Aceitação
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'good', label: 'Aceitou bem 😊' },
                            { id: 'partial', label: 'Parcial 😐' },
                            { id: 'refused', label: 'Recusou 🙅' },
                          ].map((ac) => (
                            <button
                              key={ac.id}
                              type="button"
                              onClick={() => setFoodAcceptance(ac.id as any)}
                              className={`py-2 text-[11px] font-bold rounded-lg border cursor-pointer ${
                                foodAcceptance === ac.id
                                  ? 'bg-[#133A34] text-white border-[#133A34]'
                                  : 'bg-[#FFF6EE] border-[#133A34]/15'
                              }`}
                            >
                              {ac.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sleep Form */}
              {selectedCategory === 'sleep' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#133A34] block">
                    Duração da soneca
                  </label>
                  <div className="flex gap-2">
                    {[30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSleepMinutes(mins)}
                        className={`flex-1 py-2.5 text-xs rounded-xl font-bold border cursor-pointer ${
                          sleepMinutes === mins
                            ? 'bg-[#133A34] text-white border-[#133A34]'
                            : 'bg-[#FFF6EE] border-[#133A34]/15'
                        }`}
                      >
                        {mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? mins % 60 : ''}` : `${mins}m`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Form (Sprint 3) */}
              {selectedCategory === 'medication' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#F08A6B]/10 rounded-2xl border border-[#F08A6B]/20 text-[11px] text-[#133A34] leading-relaxed">
                    <strong className="block font-bold mb-0.5">Uso Seguro</strong>
                    O NENÊ não recomenda, calcula doses nem prescreve medicamentos. As informações são registradas pelo responsável a partir de orientações médicas.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#133A34] block mb-1">
                      Nome do medicamento <span className="text-[#F08A6B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="quick-med-name-input"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="Ex: Amoxicilina, Vitamina D, Paracetamol..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-[#133A34] block mb-1 flex items-center gap-1">
                        <Clock size={11} className="text-[#89A589]" />
                        <span>Horário previsto</span>
                      </label>
                      <input
                        type="time"
                        value={medScheduledTime}
                        onChange={(e) => setMedScheduledTime(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#133A34] block mb-1">
                        Estado
                      </label>
                      <select
                        value={medStatus}
                        onChange={(e) => setMedStatus(e.target.value as any)}
                        className="w-full px-2 py-2 text-xs font-bold rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] text-[#133A34] focus:outline-none focus:border-[#133A34]"
                      >
                        <option value="administered">Administrado ✅</option>
                        <option value="postponed">Adiado ⏳</option>
                        <option value="skipped">Não administrado ❌</option>
                      </select>
                    </div>
                  </div>

                  {/* Dose informada pelo responsável */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-xs font-bold text-[#133A34]">
                        Dose (opcional)
                      </label>
                      <span className="text-[10px] text-[#89A589] italic">
                        informação cadastrada pelo responsável
                      </span>
                    </div>
                    <input
                      type="text"
                      value={medDosageManual}
                      onChange={(e) => setMedDosageManual(e.target.value)}
                      placeholder="Ex: 2,5 ml, 2 gotas, 1 flaconete..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                    />
                  </div>

                  {/* Observação da prescrição */}
                  <div>
                    <label className="text-xs font-bold text-[#133A34] block mb-1">
                      Observação da prescrição
                    </label>
                    <input
                      type="text"
                      value={medPrescriptionNotes}
                      onChange={(e) => setMedPrescriptionNotes(e.target.value)}
                      placeholder="Ex: Receitado pela Dra. Camila para 7 dias"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                    />
                  </div>

                  {/* Observações opcionais */}
                  <div>
                    <label className="text-xs font-bold text-[#133A34] block mb-1">
                      Observações opcionais
                    </label>
                    <input
                      type="text"
                      value={medNotes}
                      onChange={(e) => setMedNotes(e.target.value)}
                      placeholder="Ex: Tomou bem junto à refeição..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34]"
                    />
                  </div>
                </div>
              )}

              {/* Temperature Form */}
              {selectedCategory === 'temperature' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#133A34] block">
                    Temperatura aferida (°C)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value) || 36.5)}
                      className="w-24 px-3 py-2 text-base font-bold text-center rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                    />
                    <span className="text-xs text-[#89A589]">
                      {temperature >= 37.8 ? '⚠️ Estado febril' : 'Normal / Sem febre'}
                    </span>
                  </div>
                </div>
              )}

              {/* Weight Form */}
              {selectedCategory === 'growth' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#133A34] block">
                    Peso atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 7.0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                  />
                </div>
              )}

              {/* Appointment Form */}
              {selectedCategory === 'appointment' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#133A34] block mb-1">
                      Especialidade
                    </label>
                    <input
                      type="text"
                      value={appointmentSpecialty}
                      onChange={(e) => setAppointmentSpecialty(e.target.value)}
                      placeholder="Ex: Pediatria de rotina, Oftalmo..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#133A34] block mb-1">
                      Profissional
                    </label>
                    <input
                      type="text"
                      value={appointmentDoctor}
                      onChange={(e) => setAppointmentDoctor(e.target.value)}
                      placeholder="Ex: Dra. Camila Nogueira"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/20 bg-[#FFF6EE]"
                    />
                  </div>
                </div>
              )}

              {/* Observations / Other Input */}
              <div>
                <label className="text-xs font-bold text-[#133A34] block mb-1">
                  Observações adicionais (opcional)
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ex: Ficou tranquilo, mamou com calma..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#133A34]/15 bg-[#FFF6EE] focus:outline-none focus:border-[#133A34] resize-none"
                />
              </div>

              <div className="text-[10px] text-[#89A589] pt-1">
                Registrado por <strong>{currentUserName}</strong> para <strong>{currentChild?.name}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {selectedCategory && (
          <div className="p-4 border-t border-[#133A34]/10 bg-[#FFF6EE] flex gap-3">
            <button
              id="cancel-record-btn"
              onClick={() => setSelectedCategory(null)}
              type="button"
              className="px-4 py-2.5 rounded-full border border-[#133A34]/15 text-xs font-bold text-[#133A34] hover:bg-[#133A34]/5 cursor-pointer"
            >
              Voltar
            </button>
            <button
              id="confirm-save-record-btn"
              onClick={handleSave}
              type="button"
              className="flex-1 py-2.5 rounded-full bg-[#133A34] hover:bg-[#1a4e46] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Check size={16} className="text-[#F08A6B]" />
              <span>Salvar cuidado de {currentChild?.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
