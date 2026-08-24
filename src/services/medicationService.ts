import { Medication, MedicationLog, MedicationStatus, NewMedicationRegistrationInput, MedicationAdministrationEvent } from '../types';

const MEDS_STORAGE_KEY = 'nene_sprint3_medications';
const LOGS_STORAGE_KEY = 'nene_sprint3_medication_logs';

const initialMedications: Medication[] = [
  {
    id: 'med-samyr-amox',
    childId: 'child-samyr',
    familyId: 'family-01',
    name: 'Amoxicilina',
    dosageManual: '2,5 ml a cada 12h',
    prescriptionNotes: 'Tratamento de 7 dias orientado pela Dra. Camila para otite.',
    active: true,
    createdAt: '2026-08-20T08:00:00.000Z',
  },
  {
    id: 'med-samyr-vitd',
    childId: 'child-samyr',
    familyId: 'family-01',
    name: 'Vitamina D',
    dosageManual: '2 gotas ao dia',
    prescriptionNotes: 'Suplementação diária orientada pelo pediatra.',
    active: true,
    createdAt: '2026-04-01T08:00:00.000Z',
  },
  {
    id: 'med-suayla-vitd',
    childId: 'child-suayla',
    familyId: 'family-01',
    name: 'Vitamina D',
    dosageManual: '2 gotas ao dia',
    prescriptionNotes: 'Suplementação diária orientada pelo pediatra.',
    active: true,
    createdAt: '2026-04-01T08:00:00.000Z',
  },
];

const initialLogs: MedicationLog[] = [
  {
    id: 'evt-01',
    medicationId: 'med-samyr-amox',
    childId: 'child-samyr',
    familyId: 'family-01',
    medicationName: 'Amoxicilina',
    scheduledTime: '08:00',
    actualTime: '08:04',
    status: 'administered',
    dosageManual: '2,5 ml',
    prescriptionNotes: 'Tratamento de 7 dias orientado pela Dra. Camila.',
    notes: 'Administrado conforme orientação médica. Tomou bem.',
    administeredBy: 'Ana',
    timestamp: '2026-08-24T08:04:00.000Z',
    createdAt: '2026-08-24T08:04:00.000Z',
  },
];

function getStoredMeds(): Medication[] {
  try {
    const raw = localStorage.getItem(MEDS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialMedications;
}

function saveStoredMeds(meds: Medication[]) {
  localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(meds));
}

function getStoredLogs(): MedicationLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialLogs;
}

function saveStoredLogs(logs: MedicationLog[]) {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
}

/**
 * Service do módulo de Medicações.
 * Na Sprint 3 opera de forma local/mockada com persistência em localStorage,
 * já estruturado com os contratos que alimentarão as tabelas 'medications' e 'medication_logs' no Supabase.
 */
export const medicationService = {
  /**
   * Retorna os medicamentos cadastrados (filtro opcional por childId)
   */
  async getMedications(childId?: string): Promise<Medication[]> {
    const meds = getStoredMeds();
    if (childId && childId !== 'all') {
      return meds.filter((m) => m.childId === childId);
    }
    return meds;
  },

  /**
   * Retorna os registros / logs de administração (filtro opcional por childId)
   */
  async getMedicationLogs(childId?: string): Promise<MedicationLog[]> {
    const logs = getStoredLogs();
    if (childId && childId !== 'all') {
      return logs.filter((l) => l.childId === childId);
    }
    return logs;
  },

  /**
   * Registra uma administração de medicamento
   */
  async registerMedication(input: NewMedicationRegistrationInput): Promise<MedicationLog> {
    const nowIso = new Date().toISOString();
    const newLogId = 'med-log-' + Date.now();

    const newLog: MedicationLog = {
      id: newLogId,
      childId: input.childId,
      familyId: input.familyId,
      medicationName: input.medicationName.trim(),
      scheduledTime: input.scheduledTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actualTime:
        input.status === 'administered'
          ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : undefined,
      status: input.status,
      dosageManual: input.dosageManual?.trim() || undefined,
      prescriptionNotes: input.prescriptionNotes?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      administeredBy: input.administeredBy,
      timestamp: nowIso,
      createdAt: nowIso,
    };

    const currentLogs = getStoredLogs();
    const updatedLogs = [newLog, ...currentLogs];
    saveStoredLogs(updatedLogs);

    // Se o medicamento ainda não constar na lista de medicamentos da criança, salvar também
    const currentMeds = getStoredMeds();
    const exists = currentMeds.some(
      (m) => m.childId === input.childId && m.name.toLowerCase() === input.medicationName.trim().toLowerCase()
    );

    if (!exists) {
      const newMed: Medication = {
        id: 'med-' + Date.now(),
        childId: input.childId,
        familyId: input.familyId,
        name: input.medicationName.trim(),
        dosageManual: input.dosageManual?.trim() || undefined,
        prescriptionNotes: input.prescriptionNotes?.trim() || undefined,
        active: true,
        createdAt: nowIso,
      };
      saveStoredMeds([newMed, ...currentMeds]);
    }

    return newLog;
  },

  /**
   * Atualiza o status de administração (Administrado, Adiado, Não administrado)
   */
  async updateLogStatus(
    logId: string,
    status: MedicationStatus,
    actualTime?: string,
    notes?: string
  ): Promise<MedicationLog | null> {
    const currentLogs = getStoredLogs();
    let updatedLog: MedicationLog | null = null;

    const newLogs = currentLogs.map((log) => {
      if (log.id === logId) {
        updatedLog = {
          ...log,
          status,
          actualTime:
            actualTime ||
            (status === 'administered'
              ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : log.actualTime),
          notes: notes !== undefined ? notes : log.notes,
        };
        return updatedLog;
      }
      return log;
    });

    saveStoredLogs(newLogs);
    return updatedLog;
  },

  /**
   * Converte MedicationLog para o formato de TimelineEvent para integração imediata
   */
  logToTimelineEvent(log: MedicationLog): MedicationAdministrationEvent {
    return {
      id: log.id,
      childId: log.childId,
      familyId: log.familyId || 'family-default',
      category: 'medication',
      medicationId: log.medicationId,
      medicationName: log.medicationName,
      scheduledTime: log.scheduledTime,
      actualTime: log.actualTime,
      status: log.status,
      dosage: log.dosageManual,
      dosageManual: log.dosageManual,
      prescriptionNotes: log.prescriptionNotes,
      timestamp: log.timestamp || log.createdAt,
      createdBy: log.administeredBy || 'Responsável',
      notes: log.notes,
    };
  },
};
