import dayjs from 'dayjs';

export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

export function formatTime(date: string | Date, format = 'HH:mm'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date, format = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(date).format(format);
}

export function getToday(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function getCurrentTime(): string {
  return dayjs().format('HH:mm');
}

export function getMonthDays(year: number, month: number): number {
  return dayjs(`${year}-${month}-01`).daysInMonth();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}-01`).day();
}

export function isSameDay(date1: string, date2: string): boolean {
  return dayjs(date1).isSame(date2, 'day');
}

export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function getMonthStartEnd(year: number, month: number): { start: string; end: string } {
  const start = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
  const end = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
  return { start, end };
}

export function relativeTime(date: string): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return target.format('MM-DD');
}

export function generateCalendarDays(year: number, month: number): { date: string; day: number; isCurrentMonth: boolean }[] {
  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getMonthDays(year, month - 1);
  
  const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    days.push({
      date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day,
      isCurrentMonth: false
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      day: i,
      isCurrentMonth: true
    });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    days.push({
      date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      day: i,
      isCurrentMonth: false
    });
  }
  
  return days;
}
