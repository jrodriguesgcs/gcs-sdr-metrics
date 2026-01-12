import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateFilter, PhoneCallsDateFilter } from '../types';

export function getDateRange(filter: DateFilter | PhoneCallsDateFilter): { start: Date; end: Date } {
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
  } else if (filter === 'weekly') {
    // weekly: today + previous 6 days = 7 days total
    const sixDaysAgo = subDays(now, 6);
    return {
      start: startOfDay(sixDaysAgo),
      end: endOfDay(now),
    };
  } else if (filter === 'currentMonth') {
    // Current month: from 1st of current month to now
    return {
      start: startOfMonth(now),
      end: endOfDay(now),
    };
  } else if (filter === 'lastMonth') {
    // Last month: entire previous month
    const lastMonth = subMonths(now, 1);
    return {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth),
    };
  }
  
  // Default fallback to today
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

export function isDateInRange(dateString: string, start: Date, end: Date): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date >= start && date <= end;
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}