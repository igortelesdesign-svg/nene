import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Utensils,
  Moon,
  Baby,
  Thermometer,
  CalendarDays,
  Share2,
} from 'lucide-react';
import { Child, TimelineEvent } from '../../types';

interface ChildReportViewProps {
  child: Child;
  events: TimelineEvent[];
  onBack: () => void;
}

type Period = 7 | 30 | 90;

export const ChildReportView: React.FC<ChildReportViewProps> = ({
  child,
  events,
  onBack,
}) => {
  const [period, setPeriod] = useState<Period>(7);

  const filteredEvents = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - period);

    return events.filter(
      (event) =>
        event.childId === child.id &&
        new Date(event.timestamp) >= limit
    );
  }, [events, child.id, period]);

  const feedingEvents = filteredEvents.filter(
    (event) => event.category === 'feeding'
  );

  const sleepEvents = filteredEvents.filter(
    (event) => event.category === 'sleep'
  );

  const diaperEvents = filteredEvents.filter(
    (event) => event.category === 'diaper'
  );

  const temperatureEvents = filteredEvents.filter(
    (event) => event.category === 'temperature'
  );

  const totalSleepMinutes = sleepEvents.reduce(
    (total, event: any) => total + (event.durationMinutes || 0),
    0
  );

  const maxTemperature =
    temperatureEvents.length > 0
      ? Math.max(
          ...temperatureEvents.map(
            (event: any) => Number(event.temperatureC) || 0
          )
        )
      : null;

  const formatSleep = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} min`;

    return `${hours}h ${remainingMinutes}min`;
  };

  const handleGeneratePDF = () => {
    window.print();
  };

  const formatEventDetails = (event: TimelineEvent) => {
    switch (event.category) {
      case 'feeding': {
        const types: Record<string, string> = {
          breast: 'Amamentação',
          formula: 'Fórmula',
          bottle: 'Mamadeira',
          solids: 'Alimento sólido',
          water: 'Água',
          other: 'Outro',
        };

        const details = [types[event.feedingType] || 'Alimentação'];

        if (event.amountMl) details.push(`${event.amountMl} ml`);
        if (event.durationMinutes) details.push(`${event.durationMinutes} min`);
        if (event.foodName) details.push(event.foodName);

        return details.join(' • ');
      }

      case 'sleep':
        return event.durationMinutes
          ? `Sono • ${formatSleep(event.durationMinutes)}`
          : 'Sono registrado';

      case 'diaper': {
        const types: Record<string, string> = {
          wet: 'Molhada',
          dirty: 'Suja',
          both: 'Molhada e suja',
        };

        return `Fralda • ${types[event.diaperType] || event.diaperType}`;
      }

      case 'temperature':
        return `Temperatura • ${Number(event.temperatureC).toFixed(1)}°C`;

      case 'growth': {
        const values = [];
        if (event.weightKg) values.push(`${event.weightKg} kg`);
        if (event.heightCm) values.push(`${event.heightCm} cm`);
        if (event.headCircumferenceCm) {
          values.push(`PC ${event.headCircumferenceCm} cm`);
        }

        return `Crescimento${values.length ? ` • ${values.join(' • ')}` : ''}`;
      }

      case 'appointment':
        return `Consulta • ${event.specialty || 'Sem especialidade'}${
          event.doctorName ? ` • ${event.doctorName}` : ''
        }`;

      case 'vaccine':
        return `Vacina • ${event.vaccineName}${
          event.doseNumber ? ` • ${event.doseNumber}` : ''
        }`;

      case 'note':
        return `${event.title || 'Observação'}${
          event.content ? ` • ${event.content}` : ''
        }`;

      case 'medication':
        return `Medicamento • ${event.medicationName}${
          event.dosage ? ` • ${event.dosage}` : ''
        }`;

      default:
        return 'Registro de cuidado';
    }
  };

  const sortedEvents = [...filteredEvents].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );


  return (
    <div
      id="child-report-print-area"
      className="space-y-5 px-5 pt-3 pb-24 max-w-xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-[#133A34]/5 flex items-center justify-center text-[#133A34]"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[#89A589]">
            Relatório da criança
          </p>

          <h1 className="text-xl font-extrabold text-[#133A34]">
            {child.name}
          </h1>
        </div>
      </div>

      <div className="nene-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={16} className="text-[#89A589]" />
          <span className="text-xs font-bold text-[#133A34]">
            Período do relatório
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days as Period)}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                period === days
                  ? 'bg-[#133A34] text-[#FFF6EE]'
                  : 'bg-[#133A34]/5 text-[#133A34]'
              }`}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-[#F08A6B]" />
          <h2 className="text-sm font-extrabold text-[#133A34]">
            Resumo do período
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="nene-card p-4">
            <Utensils size={18} className="text-[#89A589] mb-2" />
            <p className="text-2xl font-extrabold text-[#133A34]">
              {feedingEvents.length}
            </p>
            <p className="text-[11px] text-[#133A34]/60">
              Alimentações
            </p>
          </div>

          <div className="nene-card p-4">
            <Baby size={18} className="text-[#F6C56B] mb-2" />
            <p className="text-2xl font-extrabold text-[#133A34]">
              {diaperEvents.length}
            </p>
            <p className="text-[11px] text-[#133A34]/60">
              Trocas de fralda
            </p>
          </div>

          <div className="nene-card p-4">
            <Moon size={18} className="text-[#89A589] mb-2" />
            <p className="text-xl font-extrabold text-[#133A34]">
              {formatSleep(totalSleepMinutes)}
            </p>
            <p className="text-[11px] text-[#133A34]/60">
              Sono registrado
            </p>
          </div>

          <div className="nene-card p-4">
            <Thermometer size={18} className="text-[#F08A6B] mb-2" />
            <p className="text-xl font-extrabold text-[#133A34]">
              {maxTemperature !== null
                ? `${maxTemperature.toFixed(1)}°C`
                : '—'}
            </p>
            <p className="text-[11px] text-[#133A34]/60">
              Maior temperatura
            </p>
          </div>
        </div>
      </div>

      <div className="nene-card p-4">
        <p className="text-xs font-bold text-[#133A34] mb-1">
          Registros encontrados
        </p>

        <p className="text-3xl font-extrabold text-[#133A34]">
          {filteredEvents.length}
        </p>

        <p className="text-[11px] text-[#89A589] mt-1">
          Últimos {period} dias
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={16} className="text-[#89A589]" />
          <h2 className="text-sm font-extrabold text-[#133A34]">
            Ocorrências do período
          </h2>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="nene-card p-4">
            <p className="text-xs text-[#133A34]/60 text-center">
              Nenhum registro encontrado neste período.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEvents.map((event) => {
              const date = new Date(event.timestamp);

              return (
                <div
                  key={event.id}
                  className="nene-card p-4 break-inside-avoid"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[#133A34]">
                        {formatEventDetails(event)}
                      </p>

                      {event.notes && (
                        <p className="text-[11px] text-[#133A34]/65 mt-1">
                          {event.notes}
                        </p>
                      )}

                      <p className="text-[10px] text-[#89A589] mt-2">
                        Por {event.createdBy || 'Responsável'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold text-[#133A34]">
                        {date.toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-[#89A589]">
                        {date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleGeneratePDF}
        className="w-full py-3.5 rounded-2xl bg-[#133A34] text-[#FFF6EE] text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
      >
        <Share2 size={17} />
        Gerar / Compartilhar PDF
      </button>

      <p className="text-[10px] leading-relaxed text-[#133A34]/50 text-center px-3">
        Este relatório organiza registros informados pelos responsáveis e não
        substitui avaliação, diagnóstico ou orientação profissional.
      </p>
    </div>
  );
};
