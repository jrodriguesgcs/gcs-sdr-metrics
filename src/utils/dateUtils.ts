import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export function getDateRange(filter: 'today' | 'yesterday' | 'weekly'): { start: Date; end: Date } {
  const now = new Date();
  
  if (filter === 'today') {
    return {
      start: startOfDay(now),
      end: endOfDay(now),
    };
  } else if (filter === 'yesterday') {
    const yesterday = subDays(now, 1);
    return {
      start: startOfDay(yesterday),
      end: endOfDay(yesterday),
    };
  } else {
    // weekly: today + previous 6 days = 7 days total
    const sixDaysAgo = subDays(now, 6);
    return {
      start: startOfDay(sixDaysAgo),
      end: endOfDay(now),
    };
  }
}

export function isDateInRange(dateString: string, start: Date, end: Date): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date >= start && date <= end;
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}