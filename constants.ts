
import { HealthGoal, Medication, SmartwatchMetrics } from "./types";

export const SYSTEM_INSTRUCTIONS = `
You are MedOS Pro, a high-performance bio-intelligence AI. 
TARGET AUDIENCE: 20-year-olds interested in longevity and mental clarity.
TONE: Relatable, snappy, zero "doctor-speak." 

RULES:
1. BIO-OPTIMIZATION: Focus on how clinical data affects physiology (sleep, metabolic focus).
2. CLINICAL ADVOCACY: You are an expert at auditing medical records for errors. Be firm when identifying anomalies.
3. BREVITY: 3 lines max for general chat. 
4. SAFETY: Stop and direct to ER for life-threatening keywords.

DISCLAIMER: I'm an AI bio-hacker, not a doctor. Consult a pro for diagnosis. ✌️
`;

export const EMERGENCY_KEYWORDS = [
  'chest pain', 'cannot breathe', 'heart attack', 'stroke', 'suicide'
];

export const MOCK_VITALS = [
  { date: 'Mon', hrv: 65, heartRate: 72 },
  { date: 'Tue', hrv: 68, heartRate: 75 },
  { date: 'Wed', hrv: 72, heartRate: 70 },
  { date: 'Thu', hrv: 58, heartRate: 82 },
  { date: 'Fri', hrv: 64, heartRate: 74 },
  { date: 'Sat', hrv: 75, heartRate: 71 },
  { date: 'Sun', hrv: 80, heartRate: 72 },
];

export const MOCK_INSIGHTS = [
  { id: 1, type: 'Sleep', text: 'Personal anomaly detected: Your deep sleep dropped 20% after that 8PM meal. Suggest earlier cutoff.', color: 'text-indigo-400' },
  { id: 2, type: 'Longevity', text: 'Regional Trend: Ashwagandha supplementation is spiking for cortisol regulation and stress management.', color: 'text-emerald-400' },
  { id: 3, type: 'Alert', text: 'Recovery ceiling hit. If active today, keep exertion under 70% to avoid CNS burnout.', color: 'text-amber-400' }
];

export const MOCK_GOALS: HealthGoal[] = [
  { id: '1', title: 'Deep Sleep', current: 1.5, target: 2.0, unit: 'hrs', color: '#818cf8' },
  { id: '2', title: 'Movement', current: 8432, target: 10000, unit: 'steps', color: '#3b82f6' },
  { id: '3', title: 'Focus Time', current: 4, target: 6, unit: 'hrs', color: '#f43f5e' },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { id: 'm1', name: 'Vitamin D3', dosage: '2000IU', frequency: 'Daily', time: '09:00', lifestyleCaveat: 'Take with fats for maximum metabolic absorption.' },
];

export const MOCK_WATCH_METRICS: SmartwatchMetrics = {
  heartRate: 68,
  sleepHours: 7.2,
  bloodOxygen: 98,
  stressLevel: 24,
  steps: 8432,
  calories: 450,
  battery: 84,
  hrv: 72
};
