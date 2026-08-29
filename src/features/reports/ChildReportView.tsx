import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Utensils,
  Moon,
  Baby,
  Thermometer,
  CalendarDays,
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

  return (
    <div className="space-y-5 px-5 pt-3 pb-24 max-w-xl mx-auto">
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

      <p className="text-[10px] leading-relaxed text-[#133A34]/50 text-center px-3">
        Este relatório organiza registros informados pelos responsáveis e não
        substitui avaliação, diagnóstico ou orientação profissional.
      </p>
    </div>
  );
};
