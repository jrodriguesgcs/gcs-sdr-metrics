import { useState, useEffect } from 'react';
import { DateFilter, PhoneCallsDateFilter } from '../types';
import { CallMetrics, DailyCallMetrics, CloudTalkCall } from '../types/cloudtalk';
import { fetchCloudTalkCalls, getGCSOperatorUserId } from '../services/cloudtalkApi';
import { format, startOfDay, endOfDay, parseISO, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getDateRange, formatMonthYear } from '../utils/dateUtils';

interface TabPhoneCallsProps {
  dateFilter: DateFilter;
}

const LISBON_TZ = 'Europe/Lisbon';

// Ana's working hours (Lisbon timezone): 9:00 - 17:30
const ANA_START_HOUR = 9;
const ANA_START_MINUTE = 0;
const ANA_END_HOUR = 17;
const ANA_END_MINUTE = 30;

export default function TabPhoneCalls({ dateFilter }: TabPhoneCallsProps) {
  const [calls, setCalls] = useState<CloudTalkCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local date filter for Phone Calls tab only
  const [phoneCallsFilter, setPhoneCallsFilter] = useState<PhoneCallsDateFilter>(dateFilter);

  // Sync with parent dateFilter when it changes (only for today/yesterday/weekly)
  useEffect(() => {
    if (dateFilter === 'today' || dateFilter === 'yesterday' || dateFilter === 'weekly') {
      setPhoneCallsFilter(dateFilter);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadCalls();
  }, [phoneCallsFilter]);

  const loadCalls = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get GCS Operator user ID (no API key needed - proxy handles it)
      const userId = await getGCSOperatorUserId();
      if (!userId) {
        throw new Error('GCS Operator user not found');
      }

      // Get date range based on phoneCallsFilter
      const { start, end } = getDateRange(phoneCallsFilter);
      
      // Format dates for CloudTalk API (Lisbon timezone)
      const dateFrom = format(fromZonedTime(start, LISBON_TZ), 'yyyy-MM-dd HH:mm:ss');
      const dateTo = format(fromZonedTime(end, LISBON_TZ), 'yyyy-MM-dd HH:mm:ss');

      // Fetch calls (no API key needed - proxy handles it)
      const fetchedCalls = await fetchCloudTalkCalls(userId, dateFrom, dateTo);
      setCalls(fetchedCalls);
    } catch (err) {
      console.error('Error loading calls:', err);
      setError(err instanceof Error ? err.message : 'Failed to load phone calls');
    } finally {
      setIsLoading(false);
    }
  };

  const isWithinAnaHours = (dateString: string): boolean => {
    const date = toZonedTime(parseISO(dateString), LISBON_TZ);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const anaStartMinutes = ANA_START_HOUR * 60 + ANA_START_MINUTE;
    const anaEndMinutes = ANA_END_HOUR * 60 + ANA_END_MINUTE;
    
    return timeInMinutes >= anaStartMinutes && timeInMinutes < anaEndMinutes;
  };

  const filterCallsByAgent = (isAna: boolean): CloudTalkCall[] => {
    return calls.filter(call => {
      const isAnaHours = isWithinAnaHours(call.started_at);
      return isAna ? isAnaHours : !isAnaHours;
    });
  };

  // Determine if a call is answered based on billsec and is_voicemail
  // - Answered: billsec > 0 AND NOT a voicemail
  // - Missed: billsec = 0 OR is_voicemail = true
  const isCallAnswered = (call: CloudTalkCall): boolean => {
    const billsec = parseInt(call.billsec || '0');
    // A call is answered if there was actual conversation time AND it's not a voicemail
    return billsec > 0 && !call.is_voicemail;
  };

  const calculateMetrics = (filteredCalls: CloudTalkCall[]): CallMetrics => {
    const metrics: CallMetrics = {
      incomingAnswered: 0,
      incomingMissed: 0,
      incomingTotal: 0,
      outgoingAnswered: 0,
      outgoingMissed: 0,
      outgoingTotal: 0,
      grandTotal: 0,
    };

    filteredCalls.forEach(call => {
      const isAnswered = isCallAnswered(call);

      if (call.type === 'incoming') {
        if (isAnswered) {
          metrics.incomingAnswered++;
        } else {
          metrics.incomingMissed++;
        }
        metrics.incomingTotal++;
      } else if (call.type === 'outgoing') {
        if (isAnswered) {
          metrics.outgoingAnswered++;
        } else {
          metrics.outgoingMissed++;
        }
        metrics.outgoingTotal++;
      }
    });

    // Grand total counts all calls (answered + missed)
    metrics.grandTotal = metrics.incomingTotal + metrics.outgoingTotal;

    return metrics;
  };

  const calculateDailyMetrics = (filteredCalls: CloudTalkCall[]): DailyCallMetrics[] => {
    const { start, end } = getDateRange(phoneCallsFilter);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = parseISO(call.started_at);
        return isWithinInterval(callDate, { start: dayStart, end: dayEnd });
      });

      const dayMetrics: DailyCallMetrics = {
        date: day,
        incomingAnswered: 0,
        incomingMissed: 0,
        incomingTotal: 0,
        outgoingAnswered: 0,
        outgoingMissed: 0,
        outgoingTotal: 0,
        grandTotal: 0,
      };

      dayCalls.forEach(call => {
        const isAnswered = isCallAnswered(call);

        if (call.type === 'incoming') {
          if (isAnswered) {
            dayMetrics.incomingAnswered++;
          } else {
            dayMetrics.incomingMissed++;
          }
          dayMetrics.incomingTotal++;
        } else if (call.type === 'outgoing') {
          if (isAnswered) {
            dayMetrics.outgoingAnswered++;
          } else {
            dayMetrics.outgoingMissed++;
          }
          dayMetrics.outgoingTotal++;
        }
      });

      dayMetrics.grandTotal = dayMetrics.incomingTotal + dayMetrics.outgoingTotal;

      return dayMetrics;
    });
  };

  const getFilterLabel = (): string => {
    const now = new Date();
    switch (phoneCallsFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'weekly':
        return 'Last 7 Days';
      case 'currentMonth':
        return formatMonthYear(now);
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return formatMonthYear(lastMonth);
      default:
        return '';
    }
  };

  const renderWeeklyTable = (title: string, isAna: boolean) => {
    const filteredCalls = filterCallsByAgent(isAna);
    const dailyMetrics = calculateDailyMetrics(filteredCalls);
    const totalMetrics = calculateMetrics(filteredCalls);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-blue-100 text-sm">{getFilterLabel()} - Daily Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                {dailyMetrics.map((dm, idx) => (
                  <th key={idx} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {format(dm.date, 'dd/MM')}
                    <br />
                    <span className="text-gray-400 normal-case">{format(dm.date, 'EEE')}</span>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-blue-50">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Incoming Answered */}
              <tr className="bg-green-50">
                <td className="sticky left-0 bg-green-50 px-6 py-4 text-sm font-medium text-gray-900">Incoming - Answered</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.incomingAnswered}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">{totalMetrics.incomingAnswered}</td>
              </tr>

              {/* Incoming Missed */}
              <tr className="bg-red-50">
                <td className="sticky left-0 bg-red-50 px-6 py-4 text-sm font-medium text-gray-900">Incoming - Missed</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.incomingMissed}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">{totalMetrics.incomingMissed}</td>
              </tr>

              {/* Incoming Total */}
              <tr className="bg-green-100 font-semibold">
                <td className="sticky left-0 bg-green-100 px-6 py-4 text-sm text-gray-900">Incoming Total</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.incomingTotal}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-100">{totalMetrics.incomingTotal}</td>
              </tr>

              {/* Outgoing Answered */}
              <tr className="bg-purple-50">
                <td className="sticky left-0 bg-purple-50 px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Answered</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.outgoingAnswered}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">{totalMetrics.outgoingAnswered}</td>
              </tr>

              {/* Outgoing Missed */}
              <tr className="bg-orange-50">
                <td className="sticky left-0 bg-orange-50 px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Missed</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.outgoingMissed}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">{totalMetrics.outgoingMissed}</td>
              </tr>

              {/* Outgoing Total */}
              <tr className="bg-purple-100 font-semibold">
                <td className="sticky left-0 bg-purple-100 px-6 py-4 text-sm text-gray-900">Outgoing Total</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.outgoingTotal}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-blue-100">{totalMetrics.outgoingTotal}</td>
              </tr>

              {/* Grand Total */}
              <tr className="bg-blue-100 font-bold border-t-2 border-blue-300">
                <td className="sticky left-0 bg-blue-100 px-6 py-4 text-sm text-gray-900">Grand Total</td>
                {dailyMetrics.map((dm, idx) => (
                  <td key={idx} className="px-4 py-4 text-center text-sm text-gray-900">{dm.grandTotal}</td>
                ))}
                <td className="px-6 py-4 text-center text-sm font-bold text-blue-900 bg-blue-200">{totalMetrics.grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSimpleTable = (title: string, isAna: boolean) => {
    const filteredCalls = filterCallsByAgent(isAna);
    const metrics = calculateMetrics(filteredCalls);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-blue-100 text-sm">{getFilterLabel()} Statistics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Incoming Answered */}
              <tr className="bg-green-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Incoming - Answered</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.incomingAnswered}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.incomingAnswered / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Incoming Missed */}
              <tr className="bg-red-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Incoming - Missed</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.incomingMissed}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.incomingMissed / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Incoming Total */}
              <tr className="bg-green-100 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Incoming Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.incomingTotal}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.incomingTotal / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Outgoing Answered */}
              <tr className="bg-purple-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Answered</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.outgoingAnswered}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingAnswered / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Outgoing Missed */}
              <tr className="bg-orange-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Missed</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.outgoingMissed}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingMissed / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Outgoing Total */}
              <tr className="bg-purple-100 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Outgoing Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.outgoingTotal}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingTotal / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              {/* Grand Total */}
              <tr className="bg-blue-100 font-bold border-t-2 border-blue-300">
                <td className="px-6 py-4 text-sm text-gray-900">Grand Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.grandTotal}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-900">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Determine if we should show daily breakdown (weekly or month filters)
  const showDailyBreakdown = phoneCallsFilter === 'weekly' || phoneCallsFilter === 'currentMonth' || phoneCallsFilter === 'lastMonth';

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading phone call data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={loadCalls}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phone Calls Specific Date Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          
          {/* Standard filters */}
          <button
            onClick={() => setPhoneCallsFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              phoneCallsFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPhoneCallsFilter('yesterday')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              phoneCallsFilter === 'yesterday'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setPhoneCallsFilter('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              phoneCallsFilter === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          
          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          {/* Month filters */}
          <button
            onClick={() => setPhoneCallsFilter('currentMonth')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              phoneCallsFilter === 'currentMonth'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setPhoneCallsFilter('lastMonth')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              phoneCallsFilter === 'lastMonth'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6">
        {showDailyBreakdown ? (
          <>
            {renderWeeklyTable('Ana Pascoal (9:00 - 17:30)', true)}
            {renderWeeklyTable('Ruffa Espejon (Other Hours)', false)}
          </>
        ) : (
          <>
            {renderSimpleTable('Ana Pascoal (9:00 - 17:30)', true)}
            {renderSimpleTable('Ruffa Espejon (Other Hours)', false)}
          </>
        )}
      </div>
    </div>
  );
}