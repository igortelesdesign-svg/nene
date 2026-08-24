export type MedicationStatus = 'administered' | 'postponed' | 'skipped' | 'pending';

/**
 * Estrutura preparada para futura tabela 'medications' no Supabase
 */
export interface Medication {
  id: string;
  childId: string;
  familyId?: string;
  name: string;
  dosageManual?: string; // Informação cadastrada manualmente pelo responsável
  prescriptionNotes?: string; // Observação da prescrição médica anotada pelo responsável
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Estrutura preparada para futura tabela 'medication_logs' no Supabase
 */
export interface MedicationLog {
  id: string;
  medicationId?: string;
  childId: string;
  familyId?: string;
  medicationName: string;
  scheduledTime: string; // Ex: "08:00" ou ISO
  actualTime?: string; // Ex: "08:05" ou ISO
  status: MedicationStatus;
  dosageManual?: string; // Informação de dose cadastrada pelo responsável
  prescriptionNotes?: string; // Observação da prescrição informada pelo responsável
  notes?: string; // Observações opcionais da administração
  administeredBy?: string;
  timestamp: string; // ISO
  createdAt: string;
}

export interface NewMedicationRegistrationInput {
  childId: string;
  familyId?: string;
  medicationName: string;
  scheduledTime: string;
  dosageManual?: string; // Informação manual cadastrada pelo responsável
  prescriptionNotes?: string; // Observação da prescrição
  notes?: string; // Observações opcionais
  status: 'administered' | 'postponed' | 'skipped';
  administeredBy: string;
}
