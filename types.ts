
export enum UserRole {
  PATIENT = 'PATIENT'
}

export interface HistoryRecord {
  id: string;
  date: string;
  hospitalName: string;
  summary: string;
  abnormalValues?: string[];
  lifestyleImpact?: string; // New: Translation to Gen-Z lifestyle
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  conditions: string[];
  role: UserRole;
  isPrimary?: boolean;
  isGuest?: boolean;
  history?: HistoryRecord[];
  bioAge?: number; // New: Calculated bio-age
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isRedFlag?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  lastTaken?: string;
  lifestyleCaveat?: string; // New: Gym/Coffee/Study impacts
}

export interface HealthGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export interface SmartwatchMetrics {
  heartRate: number;
  sleepHours: number;
  bloodOxygen: number;
  stressLevel: number;
  steps: number;
  calories: number;
  battery: number;
  hrv?: number; // Heart Rate Variability for Longevity
}

export interface InsurancePolicy {
  id: string;
  provider: string;
  planName: string;
  coverageSummary: string;
  preventativeBenefits: string[];
  longevityScore: number;
}
