import { useState, useEffect } from 'react';
import { DateFilter } from '../types';
import { CallMetrics, DailyCallMetrics, CloudTalkCall } from '../types/cloudtalk';
import { fetchCloudTalkCalls, getGCSOperatorUserId } from '../services/cloudtalkApi';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getDateRange } from '../utils/dateUtils';

interface TabPhoneCallsProps {
  dateFilter: DateFilter;
}

const LISBON_TZ = 'Europe/Lisbon';

export default function TabPhoneCalls({ dateFilter }: TabPhoneCallsProps) {
  const [calls, setCalls] = useState<CloudTalkCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCalls();
  }, [dateFilter]);

  const loadCalls = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_CLOUDTALK_API_KEY;
      if (!apiKey) {
        throw new Error('CloudTalk API key not configured');
      }

      // Get GCS Operator user ID
      const userId = await getGCSOperatorUserId(apiKey);
      if (!userId) {
        throw new Error('GCS Operator user not found');
      }

      // Get date range
      const { start, end } = getDateRange(dateFilter);
      
      // Format dates for CloudTalk API (Lisbon timezone)
      const dateFrom = format(fromZonedTime(start, LISBON_TZ), 'yyyy-MM-dd HH:mm:ss');
      const dateTo = format(fromZonedTime(end, LISBON_TZ), 'yyyy-MM-dd HH:mm:ss');

      // Fetch calls
      const fetchedCalls = await fetchCloudTalkCalls(apiKey, userId, dateFrom, dateTo);
      setCalls(fetchedCalls);
    } catch (err) {
      console.error('Error loading calls:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnasHours = (callStart: string): boolean => {
    const callDate = toZonedTime(parseISO(callStart), LISBON_TZ);
    const hour = callDate.getHours();
    const minute = callDate.getMinutes();
    
    // Between 10:00:00 and 18:30:00
    if (hour > 10 && hour < 18) return true;
    if (hour === 10 && minute >= 0) return true;
    if (hour === 18 && minute <= 30) return true;
    
    return false;
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
      if (call.direction === 'incoming') {
        metrics.incomingTotal++;
        if (call.status === 'answered') {
          metrics.incomingAnswered++;
        } else if (call.status === 'missed') {
          metrics.incomingMissed++;
        }
      } else if (call.direction === 'outgoing') {
        metrics.outgoingTotal++;
        if (call.status === 'answered') {
          metrics.outgoingAnswered++;
        } else if (call.status === 'missed') {
          metrics.outgoingMissed++;
        }
      }
      metrics.grandTotal++;
    });

    return metrics;
  };

  const calculateDailyMetrics = (isAnaHours: boolean): DailyCallMetrics[] => {
    const dailyMetrics: DailyCallMetrics[] = [];
    const today = new Date();

    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      dailyMetrics.push({
        date,
        incomingAnswered: 0,
        incomingMissed: 0,
        incomingTotal: 0,
        outgoingAnswered: 0,
        outgoingMissed: 0,
        outgoingTotal: 0,
        grandTotal: 0,
      });
    }

    // Filter calls by time and aggregate by day
    calls.forEach(call => {
      const matchesTimeFilter = isAnaHours ? isAnasHours(call.start) : !isAnasHours(call.start);
      if (!matchesTimeFilter) return;

      const callDate = toZonedTime(parseISO(call.start), LISBON_TZ);
      
      dailyMetrics.forEach(dayStat => {
        const dayStart = startOfDay(dayStat.date);
        const dayEnd = endOfDay(dayStat.date);
        
        if (isWithinInterval(callDate, { start: dayStart, end: dayEnd })) {
          if (call.direction === 'incoming') {
            dayStat.incomingTotal++;
            if (call.status === 'answered') dayStat.incomingAnswered++;
            if (call.status === 'missed') dayStat.incomingMissed++;
          } else if (call.direction === 'outgoing') {
            dayStat.outgoingTotal++;
            if (call.status === 'answered') dayStat.outgoingAnswered++;
            if (call.status === 'missed') dayStat.outgoingMissed++;
          }
          dayStat.grandTotal++;
        }
      });
    });

    return dailyMetrics;
  };

  const renderWeeklyTable = (title: string, isAnaHours: boolean) => {
    const dailyMetrics = calculateDailyMetrics(isAnaHours);
    const totalMetrics = calculateMetrics(
      calls.filter(call => isAnaHours ? isAnasHours(call.start) : !isAnasHours(call.start))
    );

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-0.5">Daily Call Breakdown - Last 7 Days</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Metric</th>
                {dailyMetrics.map((dayStat, index) => (
                  <th key={index} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                    <div>{format(dayStat.date, 'dd/MM')}</div>
                    <div className="text-xs font-normal text-gray-500">{format(dayStat.date, 'EEE')}</div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 bg-blue-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div className="text-sm font-medium text-gray-900">Incoming - Answered</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.incomingAnswered}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{totalMetrics.incomingAnswered}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.incomingAnswered / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div className="text-sm font-medium text-gray-900">Incoming - Missed</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.incomingMissed}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{totalMetrics.incomingMissed}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.incomingMissed / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="bg-green-50 font-semibold">
                <td className="px-6 py-4 sticky left-0 bg-green-50 z-10">
                  <div className="text-sm text-gray-900">Incoming Total</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm text-gray-900">
                    {dayStat.incomingTotal}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-100">
                  <div className="text-sm text-gray-900">{totalMetrics.incomingTotal}</div>
                  <div className="text-sm text-blue-700">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.incomingTotal / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div className="text-sm font-medium text-gray-900">Outgoing - Answered</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.outgoingAnswered}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{totalMetrics.outgoingAnswered}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.outgoingAnswered / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div className="text-sm font-medium text-gray-900">Outgoing - Missed</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.outgoingMissed}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{totalMetrics.outgoingMissed}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.outgoingMissed / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="bg-purple-50 font-semibold">
                <td className="px-6 py-4 sticky left-0 bg-purple-50 z-10">
                  <div className="text-sm text-gray-900">Outgoing Total</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm text-gray-900">
                    {dayStat.outgoingTotal}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-100">
                  <div className="text-sm text-gray-900">{totalMetrics.outgoingTotal}</div>
                  <div className="text-sm text-blue-700">
                    {totalMetrics.grandTotal > 0 ? ((totalMetrics.outgoingTotal / totalMetrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                  </div>
                </td>
              </tr>

              <tr className="bg-blue-100 font-bold border-t-2 border-blue-300">
                <td className="px-6 py-4 sticky left-0 bg-blue-100 z-10">
                  <div className="text-sm text-gray-900">Grand Total</div>
                </td>
                {dailyMetrics.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm text-gray-900">
                    {dayStat.grandTotal}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-200">
                  <div className="text-sm text-gray-900">{totalMetrics.grandTotal}</div>
                  <div className="text-sm text-blue-900">100.0%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSimpleTable = (title: string, isAnaHours: boolean) => {
    const metrics = calculateMetrics(
      calls.filter(call => isAnaHours ? isAnasHours(call.start) : !isAnasHours(call.start))
    );

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-0.5">Call Statistics</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Incoming - Answered</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{metrics.incomingAnswered}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {metrics.grandTotal > 0 ? ((metrics.incomingAnswered / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Incoming - Missed</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{metrics.incomingMissed}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {metrics.grandTotal > 0 ? ((metrics.incomingMissed / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="bg-green-50 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Incoming Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.incomingTotal}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.incomingTotal / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Answered</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{metrics.outgoingAnswered}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingAnswered / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Outgoing - Missed</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{metrics.outgoingMissed}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingMissed / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

              <tr className="bg-purple-50 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Outgoing Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{metrics.outgoingTotal}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {metrics.grandTotal > 0 ? ((metrics.outgoingTotal / metrics.grandTotal) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>

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
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {dateFilter === 'weekly' ? (
          <>
            {renderWeeklyTable('Ana Pascoal (10:00 - 18:30)', true)}
            {renderWeeklyTable('Ruffa Espejon (Other Hours)', false)}
          </>
        ) : (
          <>
            {renderSimpleTable('Ana Pascoal (10:00 - 18:30)', true)}
            {renderSimpleTable('Ruffa Espejon (Other Hours)', false)}
          </>
        )}
      </div>
    </div>
  );
}