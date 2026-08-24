import { getSupabaseClient } from '../lib/supabase/client';
import type {
  TimelineEvent,
  FeedingEvent,
  SleepEvent,
  DiaperEvent,
  TemperatureEvent,
  GrowthEvent,
  AppointmentEvent,
  VaccineEvent,
  NoteEvent,
} from '../types';

type PersistableCareEvent =
  | FeedingEvent
  | SleepEvent
  | DiaperEvent
  | TemperatureEvent
  | GrowthEvent
  | AppointmentEvent
  | VaccineEvent
  | NoteEvent;

interface CareEventRow {
  id: string;
  family_id: string;
  child_id: string;
  category:
    | 'feeding'
    | 'sleep'
    | 'diaper'
    | 'temperature'
    | 'growth'
    | 'appointment'
    | 'vaccine'
    | 'note';
  occurred_at: string;
  created_by: string;
  notes: string | null;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function eventToData(event: PersistableCareEvent): Record<string, unknown> {
  switch (event.category) {
    case 'feeding':
      return {
        feedingType: event.feedingType,
        durationMinutes: event.durationMinutes,
        amountMl: event.amountMl,
        foodName: event.foodName,
        preparationMethod: event.preparationMethod,
        acceptance: event.acceptance,
        reaction: event.reaction,
      };

    case 'sleep':
      return {
        startTime: event.startTime,
        endTime: event.endTime,
        durationMinutes: event.durationMinutes,
        isOngoing: event.isOngoing,
        quality: event.quality,
      };

    case 'diaper':
      return {
        diaperType: event.diaperType,
        conditionNotes: event.conditionNotes,
      };

    case 'temperature':
      return {
        temperatureC: event.temperatureC,
        feverMedicationGiven: event.feverMedicationGiven,
      };

    case 'growth':
      return {
        weightKg: event.weightKg,
        heightCm: event.heightCm,
        headCircumferenceCm: event.headCircumferenceCm,
      };

    case 'appointment':
      return {
        specialty: event.specialty,
        doctorName: event.doctorName,
        location: event.location,
        scheduledDate: event.scheduledDate,
        scheduledTime: event.scheduledTime,
        status: event.status,
        questionsToAsk: event.questionsToAsk,
        summaryNotes: event.summaryNotes,
      };

    case 'vaccine':
      return {
        vaccineName: event.vaccineName,
        doseNumber: event.doseNumber,
        scheduledDate: event.scheduledDate,
        appliedDate: event.appliedDate,
        location: event.location,
        status: event.status,
      };

    case 'note':
      return {
        title: event.title,
        content: event.content,
      };
  }
}

function rowToEvent(row: CareEventRow, createdByName = 'Responsável'): TimelineEvent {
  const base = {
    id: row.id,
    childId: row.child_id,
    familyId: row.family_id,
    timestamp: row.occurred_at,
    createdBy: createdByName,
    notes: row.notes ?? undefined,
  };

  const data = row.data ?? {};

  switch (row.category) {
    case 'feeding':
      return {
        ...base,
        category: 'feeding',
        feedingType: data.feedingType as FeedingEvent['feedingType'],
        durationMinutes: data.durationMinutes as number | undefined,
        amountMl: data.amountMl as number | undefined,
        foodName: data.foodName as string | undefined,
        preparationMethod: data.preparationMethod as string | undefined,
        acceptance: data.acceptance as FeedingEvent['acceptance'],
        reaction: data.reaction as FeedingEvent['reaction'],
      };

    case 'sleep':
      return {
        ...base,
        category: 'sleep',
        startTime: data.startTime as string,
        endTime: data.endTime as string | undefined,
        durationMinutes: data.durationMinutes as number | undefined,
        isOngoing: data.isOngoing as boolean | undefined,
        quality: data.quality as SleepEvent['quality'],
      };

    case 'diaper':
      return {
        ...base,
        category: 'diaper',
        diaperType: data.diaperType as DiaperEvent['diaperType'],
        conditionNotes: data.conditionNotes as string | undefined,
      };

    case 'temperature':
      return {
        ...base,
        category: 'temperature',
        temperatureC: data.temperatureC as number,
        feverMedicationGiven: data.feverMedicationGiven as boolean | undefined,
      };

    case 'growth':
      return {
        ...base,
        category: 'growth',
        weightKg: data.weightKg as number | undefined,
        heightCm: data.heightCm as number | undefined,
        headCircumferenceCm: data.headCircumferenceCm as number | undefined,
      };

    case 'appointment':
      return {
        ...base,
        category: 'appointment',
        specialty: data.specialty as string,
        doctorName: data.doctorName as string,
        location: data.location as string | undefined,
        scheduledDate: data.scheduledDate as string,
        scheduledTime: data.scheduledTime as string,
        status: data.status as AppointmentEvent['status'],
        questionsToAsk: data.questionsToAsk as string[] | undefined,
        summaryNotes: data.summaryNotes as string | undefined,
      };

    case 'vaccine':
      return {
        ...base,
        category: 'vaccine',
        vaccineName: data.vaccineName as string,
        doseNumber: data.doseNumber as string,
        scheduledDate: data.scheduledDate as string,
        appliedDate: data.appliedDate as string | undefined,
        location: data.location as string | undefined,
        status: data.status as VaccineEvent['status'],
      };

    case 'note':
      return {
        ...base,
        category: 'note',
        title: data.title as string,
        content: data.content as string,
      };
  }
}

export const careService = {
  async createEvent(
    event: PersistableCareEvent,
    userId: string
  ): Promise<TimelineEvent> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const payload = {
      family_id: event.familyId,
      child_id: event.childId,
      category: event.category,
      occurred_at: event.timestamp,
      created_by: userId,
      notes: event.notes ?? null,
      data: eventToData(event),
    };

    const { data, error } = await supabase
      .from('care_events' as never)
      .insert(payload as never)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return rowToEvent(data as CareEventRow, event.createdBy);
  },

  async getEvents(familyId: string): Promise<TimelineEvent[]> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { data, error } = await supabase
      .from('care_events' as never)
      .select('*')
      .eq('family_id', familyId)
      .order('occurred_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as CareEventRow[]).map((row) => rowToEvent(row));
  },

  async deleteEvent(eventId: string): Promise<void> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase não configurado.');
    }

    const { error } = await supabase
      .from('care_events' as never)
      .delete()
      .eq('id', eventId);

    if (error) {
      throw error;
    }
  },
};
