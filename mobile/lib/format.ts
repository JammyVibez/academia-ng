import type { AcademicLevel } from './types';

export const LEVEL_LABELS: Record<AcademicLevel, string> = {
  YEAR_1: '100 Level',
  YEAR_2: '200 Level',
  YEAR_3: '300 Level',
  YEAR_4: '400 Level',
  YEAR_5: '500 Level',
  YEAR_6: '600 Level',
  POSTGRADUATE: 'Postgraduate',
};

const LEVEL_SHORT: Record<AcademicLevel, string> = {
  YEAR_1: '100',
  YEAR_2: '200',
  YEAR_3: '300',
  YEAR_4: '400',
  YEAR_5: '500',
  YEAR_6: '600',
  POSTGRADUATE: 'PG',
};

export const LEVELS = Object.keys(LEVEL_LABELS) as AcademicLevel[];

export const LEVEL_OPTIONS: { value: AcademicLevel; label: string }[] = LEVELS.map((value) => ({
  value,
  label: LEVEL_LABELS[value],
}));

export function levelLabel(level?: AcademicLevel | null): string | null {
  if (!level) return null;
  return LEVEL_LABELS[level] ?? null;
}

export function levelShortLabel(level?: AcademicLevel | null): string {
  if (!level) return '—';
  return LEVEL_SHORT[level] ?? '—';
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName?: string | null): string {
  const name = (fullName || '').trim();
  if (!name) return 'Student';
  return name.split(/\s+/)[0];
}

export function unitLabel(units?: number | null): string {
  const value = units ?? 0;
  return `${value} unit${value === 1 ? '' : 's'}`;
}
