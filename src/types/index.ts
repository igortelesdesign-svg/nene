export type CareCategory = 
  | 'feeding' 
  | 'sleep' 
  | 'medication' 
  | 'diaper' 
  | 'temperature' 
  | 'growth' 
  | 'appointment' 
  | 'vaccine' 
  | 'note';

export type UserRole = 'admin' | 'responsible' | 'caregiver' | 'viewer';

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role: UserRole;
  relation: string;
  createdAt: string;
  lastAccess?: string;
}

export interface FamilyMember {
  id: string;
  familyId?: string;
  userId: string;
  role: UserRole;
  relation?: string;
  createdAt?: string;
  joinedAt?: string;
  // Joined fields from profile
  profile?: Profile;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Family {
  id: string;
  name: string;
  createdBy?: string;
  creatorId?: string;
  createdAt: string;
  updatedAt?: string;
  members?: FamilyMember[];
}

export type ChildSex = 'male' | 'female' | 'other' | 'not_informed';

export interface Child {
  id: string;
  familyId: string;
  name: string;
  nickname?: string | null;
  birthDate: string; // YYYY-MM-DD
  sex?: ChildSex | null;
  gender?: ChildSex;
  avatarBgColor?: string;
  photoUrl?: string | null;
  bloodType?: string | null;
  allergies?: string | string[] | null;
  pediatrician?: string | null;
  pediatricianPhone?: string | null;
  notes?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export interface BaseCareEvent {
  id: string;
  childId: string;
  familyId: string;
  category: CareCategory;
  timestamp: string; // ISO datetime
  createdBy: string; // Name of caretaker
  notes?: string;
}

export interface FeedingEvent extends BaseCareEvent {
  category: 'feeding';
  feedingType: 'breast' | 'formula' | 'bottle' | 'solids' | 'water' | 'other';
  durationMinutes?: number;
  amountMl?: number;
  foodName?: string;
  preparationMethod?: string;
  acceptance?: 'good' | 'partial' | 'refused';
  reaction?: 'none' | 'skin_reaction' | 'vomit' | 'discomfort' | 'other';
}

export interface SleepEvent extends BaseCareEvent {
  category: 'sleep';
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  isOngoing?: boolean;
  quality?: 'calm' | 'restless' | 'interrupted';
}

export interface DiaperEvent extends BaseCareEvent {
  category: 'diaper';
  diaperType: 'wet' | 'dirty' | 'both';
  conditionNotes?: string;
}

export interface MedicationSchedule {
  id: string;
  childId: string;
  name: string;
  prescriptionNotes?: string;
  startDate: string;
  endDate?: string;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  dosage?: string;
  active: boolean;
}

export * from './medication';

export interface MedicationAdministrationEvent extends BaseCareEvent {
  category: 'medication';
  medicationId?: string;
  medicationName: string;
  scheduledTime: string;
  actualTime?: string;
  status: 'administered' | 'postponed' | 'skipped' | 'pending';
  dosage?: string;
  dosageManual?: string;
  prescriptionNotes?: string;
}

export interface TemperatureEvent extends BaseCareEvent {
  category: 'temperature';
  temperatureC: number;
  feverMedicationGiven?: boolean;
}

export interface GrowthEvent extends BaseCareEvent {
  category: 'growth';
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
}

export interface AppointmentEvent extends BaseCareEvent {
  category: 'appointment';
  specialty: string;
  doctorName: string;
  location?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'upcoming' | 'completed' | 'canceled';
  questionsToAsk?: string[];
  summaryNotes?: string;
}

export interface VaccineEvent extends BaseCareEvent {
  category: 'vaccine';
  vaccineName: string;
  doseNumber: string;
  scheduledDate: string;
  appliedDate?: string;
  location?: string;
  status: 'applied' | 'upcoming' | 'delayed';
}

export interface NoteEvent extends BaseCareEvent {
  category: 'note';
  title: string;
  content: string;
}

export type TimelineEvent = 
  | FeedingEvent 
  | SleepEvent 
  | DiaperEvent 
  | MedicationAdministrationEvent 
  | TemperatureEvent 
  | GrowthEvent 
  | AppointmentEvent 
  | VaccineEvent 
  | NoteEvent;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'medication' | 'appointment' | 'vaccine' | 'routine';
  scheduledTime: string;
  childId?: string;
  read: boolean;
}
