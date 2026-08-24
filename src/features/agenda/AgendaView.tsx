import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Stethoscope, 
  Pill, 
  Syringe, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Check, 
  Plus, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Child, TimelineEvent, AppointmentEvent, MedicationSchedule } from '../../types';

interface AgendaViewProps {
  childrenList: Child[];
  selectedChildId: string | 'all';
  events: TimelineEvent[];
  medicationSchedules: MedicationSchedule[];
  onAddQuestion: (eventId: string, question: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  childrenList,
  selectedChildId,
  events,
  medicationSchedules,
  onAddQuestion,
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Appointments
  const appointments = events.filter(
    (e) =>
      e.category === 'appointment' &&
      (selectedChildId === 'all' || e.childId === selectedChildId)
  ) as AppointmentEvent[];

  // Active medication schedules
  const activeSchedules = medicationSchedules.filter(
    (s) => s.active && (selectedChildId === 'all' || s.childId === selectedChildId)
  );

  const handleAddQuestionSubmit = (appointmentId: string) => {
    if (!newQuestionText.trim()) return;
    onAddQuestion(appointmentId, newQuestionText.trim());
    setNewQuestionText('');
    setSelectedAppointmentId(null);
  };

  return (
    <div id="agenda-view-container" className="space-y-5 px-5 pt-3 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#133A34] tracking-tight flex items-center gap-2">
          <span>Agenda & Cuidados</span>
        </h1>
        <p className="text-xs text-[#89A589]">
          Consultas médicas, horários de remédios e vacinas
        </p>
      </div>

      {/* Consultas Pediátricas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
            <Stethoscope size={14} className="text-[#89A589]" />
            <span>Consultas Médicas</span>
          </h2>
          <span className="text-[11px] text-[#89A589]">{appointments.length} agendadas</span>
        </div>

        {appointments.length === 0 ? (
          <div className="nene-card p-5 text-center text-xs text-[#89A589]">
            Nenhuma consulta agendada para o filtro selecionado.
          </div>
        ) : (
          appointments.map((apt) => {
            const child = childrenList.find((c) => c.id === apt.childId);
            return (
              <div
                key={apt.id}
                id={`appointment-card-${apt.id}`}
                className="nene-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#89A589]/20 text-[#133A34] flex items-center justify-center font-bold">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#133A34]">{apt.specialty}</h3>
                        {child && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded text-[#FFF6EE]"
                            style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
                          >
                            {child.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#89A589]">{apt.doctorName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#133A34] block">
                      {apt.scheduledTime}
                    </span>
                    <span className="text-[10px] text-[#89A589] block">Hoje</span>
                  </div>
                </div>

                {apt.location && (
                  <div className="flex items-center gap-1 text-[11px] text-[#133A34]/70">
                    <MapPin size={12} className="text-[#89A589]" />
                    <span>{apt.location}</span>
                  </div>
                )}

                {/* Perguntas para levar */}
                <div className="bg-[#FFF6EE] rounded-xl p-3 border border-[#133A34]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#133A34] flex items-center gap-1">
                      <HelpCircle size={13} className="text-[#F08A6B]" />
                      Perguntas para levar ao pediatra
                    </span>
                    <button
                      onClick={() =>
                        setSelectedAppointmentId(
                          selectedAppointmentId === apt.id ? null : apt.id
                        )
                      }
                      className="text-[10px] font-bold text-[#133A34] hover:text-[#F08A6B] flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={12} />
                      Adicionar pergunta
                    </button>
                  </div>

                  {apt.questionsToAsk && apt.questionsToAsk.length > 0 ? (
                    <ul className="space-y-1.5">
                      {apt.questionsToAsk.map((q, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#133A34] flex items-start gap-1.5 bg-[#F2EFE6]/60 p-2 rounded-lg"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F08A6B] mt-1.5 shrink-0" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-[#89A589] italic">
                      Nenhuma dúvida anotada ainda.
                    </p>
                  )}

                  {selectedAppointmentId === apt.id && (
                    <div className="pt-2 flex gap-2">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Ex: Perguntar sobre ganho de peso..."
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[#133A34]/20 bg-[#FFF6EE]"
                      />
                      <button
                        onClick={() => handleAddQuestionSubmit(apt.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#133A34] text-[#FFF6EE] text-xs font-bold cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Horários de Medicamentos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
            <Pill size={14} className="text-[#F08A6B]" />
            <span>Horários de Medicamentos Orientados</span>
          </h2>
          <span className="text-[11px] text-[#89A589]">{activeSchedules.length} ativos</span>
        </div>

        <div className="space-y-2.5">
          {activeSchedules.map((med) => {
            const child = childrenList.find((c) => c.id === med.childId);
            return (
              <div
                key={med.id}
                id={`med-schedule-${med.id}`}
                className="nene-card p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F08A6B]/20 text-[#D96D4E] flex items-center justify-center font-bold">
                    <Pill size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#133A34]">{med.name}</span>
                      {child && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded text-[#FFF6EE]"
                          style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
                        >
                          {child.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#89A589]">
                      Orientação do profissional de saúde
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {med.scheduledTimes.map((time, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#FFF6EE] border border-[#133A34]/15 text-[11px] font-bold text-[#133A34]"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calendário Vacinal Resumo */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#133A34]/70 flex items-center gap-1.5">
            <Syringe size={14} className="text-[#89A589]" />
            <span>Vacinas Recentes / Próximas</span>
          </h2>
        </div>

        <div className="nene-card p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#89A589]" />
              <span className="font-bold text-[#133A34]">Pentavalente & Pólio (2ª dose)</span>
            </div>
            <span className="text-[10px] text-[#89A589] font-medium">Realizada aos 4 meses</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6C56B]" />
              <span className="font-bold text-[#133A34]">Pentavalente & Pólio (3ª dose)</span>
            </div>
            <span className="text-[10px] text-[#89A589] font-medium">Próxima aos 6 meses</span>
          </div>
        </div>
      </section>
    </div>
  );
};
