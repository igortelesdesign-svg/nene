import React, { useState } from 'react';
import { 
  Pill, 
  Utensils, 
  Moon, 
  Layers, 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Thermometer,
  Scale,
  Plus
} from 'lucide-react';
import { Child, TimelineEvent, MedicationAdministrationEvent, AppointmentEvent, FeedingEvent, SleepEvent } from '../../types';
import { calculateChildAge, formatTimeOnly } from '../../utils/dateUtils';
import { MedicationTimelineCard } from '../medications/MedicationTimelineCard';
import { MedicationActionModal } from '../medications/MedicationActionModal';

interface DashboardViewProps {
  userName: string;
  childrenList: Child[];
  selectedChildId: string | 'all';
  events: TimelineEvent[];
  onOpenRegister: () => void;
  onSelectChild: (childId: string) => void;
  onUpdateEventStatus: (
    eventId: string,
    status: 'administered' | 'postponed' | 'skipped',
    actualTime?: string,
    notes?: string
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  childrenList,
  selectedChildId,
  events,
  onOpenRegister,
  onSelectChild,
  onUpdateEventStatus,
}) => {
  const [selectedMedEventForAction, setSelectedMedEventForAction] = useState<MedicationAdministrationEvent | null>(null);
  // Filter children based on selector
  const displayedChildren =
    selectedChildId === 'all'
      ? childrenList
      : childrenList.filter((c) => c.id === selectedChildId);

  // Filter events based on child
  const filteredEvents =
    selectedChildId === 'all'
      ? events
      : events.filter((e) => e.childId === selectedChildId);

  // Sort events chronologically (latest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Calculate quick daily stats for the active filter
  const todayFeedings = filteredEvents.filter((e) => e.category === 'feeding').length;
  const todayDiapers = filteredEvents.filter((e) => e.category === 'diaper').length;
  
  const todaySleepMinutes = filteredEvents
    .filter((e) => e.category === 'sleep')
    .reduce((acc, curr) => acc + ((curr as SleepEvent).durationMinutes || 0), 0);
  
  const sleepHours = Math.floor(todaySleepMinutes / 60);
  const sleepMins = todaySleepMinutes % 60;
  const sleepString = sleepHours > 0 ? `${sleepHours}h${sleepMins ? sleepMins + 'm' : ''}` : `${sleepMins}m`;

  return (
    <div id="dashboard-view-content" className="space-y-6 pb-24">
      {/* Friendly Clean Minimalism Greeting */}
      <section className="px-6 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-[#133A34] tracking-tight">
              Bom dia, {userName} 👋
            </h1>
            <p className="text-sm text-[#133A34]/60 mt-0.5">
              {selectedChildId === 'all'
                ? 'Hoje com seus nenês'
                : `Hoje com ${displayedChildren[0]?.name || 'seu nenê'}`}
            </p>
          </div>

          <button
            id="dashboard-header-add-btn"
            onClick={onOpenRegister}
            type="button"
            className="px-3.5 py-2 rounded-full bg-[#FFF6EE] border border-[#133A34]/10 hover:border-[#133A34]/25 text-[#133A34] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Plus size={14} className="text-[#F08A6B]" />
            <span>Registrar</span>
          </button>
        </div>
      </section>

      {/* Children Overview Cards - Clean Minimalism */}
      <section className="px-6">
        <div className={`grid gap-3 ${displayedChildren.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {displayedChildren.map((child) => {
            const age = calculateChildAge(child.birthDate);
            
            // Find next or latest care for this child
            const childEvents = events.filter((e) => e.childId === child.id);
            const pendingMed = childEvents.find(
              (e) => e.category === 'medication' && (e as MedicationAdministrationEvent).status === 'pending'
            ) as MedicationAdministrationEvent | undefined;

            const nextAppointment = childEvents.find(
              (e) => e.category === 'appointment' && (e as AppointmentEvent).status === 'upcoming'
            ) as AppointmentEvent | undefined;

            return (
              <div
                key={child.id}
                id={`child-summary-card-${child.id}`}
                className="bg-[#FFF6EE] p-4 rounded-[24px] border border-[#133A34]/5 shadow-xs transition-all hover:border-[#133A34]/15"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs text-white"
                      style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
                    >
                      {child.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#133A34] leading-tight">
                        {child.name}
                      </span>
                      <span className="text-[10px] text-[#133A34]/50">
                        {age.fullAge}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectChild(child.id)}
                    type="button"
                    className="text-[11px] font-semibold text-[#89A589] hover:text-[#133A34] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Detalhes</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Next Care item in Clean Minimalism style */}
                <div className="bg-[#133A34]/5 rounded-xl p-2.5 mt-3">
                  <p className="text-[9px] uppercase tracking-wider text-[#133A34]/40 font-bold">
                    Próximo cuidado
                  </p>
                  {pendingMed ? (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#133A34] font-medium">
                          💊 {pendingMed.medicationName}
                        </p>
                        <p className="text-[10px] text-[#F08A6B] font-bold mt-0.5">
                          {pendingMed.scheduledTime}
                        </p>
                      </div>
                      <button
                        onClick={() => onUpdateEventStatus(pendingMed.id, 'administered')}
                        className="px-2.5 py-1 rounded-lg bg-[#133A34] text-[#FFF6EE] text-[10px] font-bold cursor-pointer hover:bg-[#1a4e46] transition-all"
                      >
                        Registrar administração
                      </button>
                    </div>
                  ) : nextAppointment ? (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#133A34] font-medium">
                          🩺 {nextAppointment.specialty} ({nextAppointment.doctorName})
                        </p>
                        <p className="text-[10px] text-[#F6C56B] font-bold mt-0.5">
                          {nextAppointment.scheduledTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 flex items-center justify-between">
                      <p className="text-xs text-[#133A34]">🍼 Alimentação</p>
                      <p className="text-[10px] text-[#89A589] font-bold">Em breve</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Metrics Glance */}
      <section className="px-6">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#FFF6EE] p-3 rounded-2xl border border-[#133A34]/5 text-center shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#89A589]/15 text-[#133A34] mx-auto flex items-center justify-center mb-1">
              <Utensils size={12} />
            </div>
            <div className="text-sm font-bold text-[#133A34]">{todayFeedings}</div>
            <div className="text-[10px] text-[#133A34]/50">Alimentações</div>
          </div>

          <div className="bg-[#FFF6EE] p-3 rounded-2xl border border-[#133A34]/5 text-center shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#133A34]/10 text-[#133A34] mx-auto flex items-center justify-center mb-1">
              <Moon size={12} />
            </div>
            <div className="text-sm font-bold text-[#133A34]">
              {todaySleepMinutes > 0 ? sleepString : '0m'}
            </div>
            <div className="text-[10px] text-[#133A34]/50">Sono total</div>
          </div>

          <div className="bg-[#FFF6EE] p-3 rounded-2xl border border-[#133A34]/5 text-center shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#F6C56B]/25 text-[#133A34] mx-auto flex items-center justify-center mb-1">
              <Layers size={12} />
            </div>
            <div className="text-sm font-bold text-[#133A34]">{todayDiapers}</div>
            <div className="text-[10px] text-[#133A34]/50">Fraldas</div>
          </div>
        </div>
      </section>

      {/* Próximos Cuidados & Linha do Tempo */}
      <section className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-[#133A34] text-lg font-bold">Próximos cuidados</h2>
          <span className="text-[#89A589] text-xs font-semibold">
            {sortedEvents.length} {sortedEvents.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="bg-[#FFF6EE] p-8 rounded-3xl border border-[#133A34]/5 text-center shadow-xs">
            <Sparkles size={24} className="mx-auto text-[#89A589] mb-2" />
            <p className="text-xs font-bold text-[#133A34]">Nenhum cuidado registrado hoje ainda</p>
            <p className="text-[11px] text-[#89A589] mt-0.5 mb-3">
              Toque em registrar para adicionar o primeiro cuidado.
            </p>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-full bg-[#133A34] text-[#FFF6EE] text-xs font-bold cursor-pointer"
            >
              Registrar primeiro cuidado
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((evt, idx) => {
              const child = childrenList.find((c) => c.id === evt.childId);
              const formattedTime = formatTimeOnly(evt.timestamp);
              const isLast = idx === sortedEvents.length - 1;

              // Node color based on category
              const nodeColor =
                evt.category === 'medication'
                  ? 'bg-[#F08A6B]'
                  : evt.category === 'feeding'
                  ? 'bg-[#89A589]'
                  : evt.category === 'appointment'
                  ? 'bg-[#F6C56B]'
                  : evt.category === 'sleep'
                  ? 'bg-[#133A34]'
                  : evt.category === 'temperature'
                  ? 'bg-[#F08A6B]'
                  : 'bg-[#89A589]';

              return (
                <div
                  key={evt.id}
                  id={`timeline-event-${evt.id}`}
                  className="flex gap-3.5 items-start relative"
                >
                  {/* Left time label */}
                  <div className="text-[#133A34]/50 text-xs font-bold w-11 pt-1 text-right shrink-0">
                    {formattedTime}
                  </div>

                  {/* Vertical continuous guide line */}
                  {!isLast && (
                    <div className="w-px h-full bg-[#133A34]/10 absolute left-[56px] top-6" />
                  )}

                  {/* Timeline Category Node */}
                  <div className={`w-3 h-3 rounded-full ${nodeColor} z-10 mt-1.5 shrink-0 shadow-xs`} />

                  {/* Event Detail Card */}
                  {evt.category === 'medication' ? (
                    <div className="flex-1">
                      <MedicationTimelineCard
                        event={evt as MedicationAdministrationEvent}
                        child={child}
                        showChildBadge={selectedChildId === 'all'}
                        onOpenActionModal={(medEvt) => setSelectedMedEventForAction(medEvt)}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 bg-[#FFF6EE] p-3.5 rounded-2xl border border-[#133A34]/5 shadow-xs flex flex-col gap-1.5 transition-all hover:border-[#133A34]/15">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-[#133A34]">
                              {child?.name || 'Nenê'}
                            </p>
                            {selectedChildId === 'all' && child && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white"
                                style={{ backgroundColor: child.avatarBgColor || '#89A589' }}
                              >
                                {child.name}
                              </span>
                            )}
                          </div>

                          {/* Category specific label */}
                          <p className="text-xs text-[#133A34]/80 mt-0.5">
                            {evt.category === 'feeding' && (
                              <span>
                                🍼 {(evt as FeedingEvent).feedingType === 'bottle' && `Alimentação (Mamadeira ${(evt as FeedingEvent).amountMl} ml)`}
                                {(evt as FeedingEvent).feedingType === 'breast' && `Alimentação (Amamentação no peito)`}
                                {(evt as FeedingEvent).feedingType === 'solids' && `Alimentação (${(evt as FeedingEvent).foodName})`}
                              </span>
                            )}
                            {evt.category === 'sleep' && (
                              <span>😴 Dormiu ({(evt as SleepEvent).durationMinutes} min)</span>
                            )}
                            {evt.category === 'diaper' && (
                              <span>
                                🧷 Fralda ({evt.diaperType === 'wet' ? 'Molhada' : evt.diaperType === 'dirty' ? 'Suja' : 'Molhada e Suja'})
                              </span>
                            )}
                            {evt.category === 'appointment' && (
                              <span>🩺 Consulta: {(evt as AppointmentEvent).specialty}</span>
                            )}
                            {evt.category === 'growth' && (
                              <span>⚖️ Peso: {evt.weightKg} kg</span>
                            )}
                            {evt.category === 'temperature' && (
                              <span>🌡️ Febre: {evt.temperatureC}°C</span>
                            )}
                            {evt.category === 'note' && (
                              <span>📝 Observação</span>
                            )}
                          </p>
                        </div>

                        {/* Right side icon */}
                        <div className="w-6 h-6 rounded-full border border-[#133A34]/15 flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#133A34]/20 rounded-xs" />
                        </div>
                      </div>

                      {evt.notes && (
                        <p className="text-[11px] text-[#89A589] italic">
                          "{evt.notes}"
                        </p>
                      )}

                      <div className="text-[10px] text-[#133A34]/40 pt-1 border-t border-[#133A34]/5 flex justify-between items-center">
                        <span>Por {evt.createdBy}</span>
                        {evt.category === 'appointment' && (evt as AppointmentEvent).doctorName && (
                          <span>{(evt as AppointmentEvent).doctorName}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Medication Action Modal */}
      <MedicationActionModal
        isOpen={Boolean(selectedMedEventForAction)}
        onClose={() => setSelectedMedEventForAction(null)}
        event={selectedMedEventForAction}
        child={childrenList.find((c) => c.id === selectedMedEventForAction?.childId)}
        onUpdateStatus={(eventId, status, actualTime, notes) => {
          onUpdateEventStatus(eventId, status, actualTime, notes);
        }}
      />
    </div>
  );
};
