export type WeeklyActivity = {
  weekStart: string;
  activeDays: number;
  targetDays: number;
  completed: boolean;
};

function dateFromValue(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

export function mondayKey(value: string) {
  const date = dateFromValue(value);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().slice(0, 10);
}

export function unifiedActivityDates(sources: string[][]) {
  return [...new Set(sources.flat().filter(Boolean))].sort();
}

export function weeklyActivity(dates: string[], targetDays = 3, today = new Date()) {
  const todayKey = today.toISOString().slice(0, 10);
  const currentWeekStart = mondayKey(todayKey);
  const currentWeekDates = dates.filter((date) => mondayKey(date) === currentWeekStart);
  const weeks = new Map<string, Set<string>>();
  for (const date of dates) {
    const weekStart = mondayKey(date);
    const weekDates = weeks.get(weekStart) ?? new Set<string>();
    weekDates.add(date);
    weeks.set(weekStart, weekDates);
  }

  const completedWeeks = [...weeks.entries()].filter(([, weekDates]) => weekDates.size >= targetDays).length;
  const current: WeeklyActivity = {
    weekStart: currentWeekStart,
    activeDays: new Set(currentWeekDates).size,
    targetDays,
    completed: new Set(currentWeekDates).size >= targetDays,
  };

  return { current, completedWeeks };
}
