import { SDRMetrics, Deal, DateFilter } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { isDateInRange } from '../utils/dateUtils';

interface TabStatsProps {
  metrics: SDRMetrics[];
  dateFilter: DateFilter;
  deals: Deal[];
}

interface DailyStats {
  date: Date;
  distributedToSales: number;
  sentToAutomation: number;
  sentToPartners: number;
  mqlLost: number;
}

export default function TabStats({ metrics, dateFilter, deals }: TabStatsProps) {
  const [anaMetrics, ruffaMetrics] = metrics;

  const calculateDailyStats = (sdrAgent: string): DailyStats[] => {
    const dailyStats: DailyStats[] = [];
    const today = new Date();

    // Create array of last 7 days (oldest to newest)
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      dailyStats.push({
        date,
        distributedToSales: 0,
        sentToAutomation: 0,
        sentToPartners: 0,
        mqlLost: 0,
      });
    }

    // Process deals for each day
    deals.forEach(deal => {
      const { customFields } = deal;
      const agent = customFields.sdrAgent?.trim();

      if (agent !== sdrAgent) return;

      dailyStats.forEach(dayStat => {
        const dayStart = startOfDay(dayStat.date);
        const dayEnd = endOfDay(dayStat.date);

        // Distributed to Sales
        if (
          customFields.distributionTime &&
          isDateInRange(customFields.distributionTime, dayStart, dayEnd) &&
          !customFields.sendToAutomation &&
          !customFields.partner
        ) {
          dayStat.distributedToSales++;
        }

        // Sent to Automation
        if (
          customFields.sendToAutomationDateTime &&
          isDateInRange(customFields.sendToAutomationDateTime, dayStart, dayEnd) &&
          customFields.sendToAutomation
        ) {
          dayStat.sentToAutomation++;
        }

        // Sent to Partners
        if (
          customFields.distributionTime &&
          isDateInRange(customFields.distributionTime, dayStart, dayEnd) &&
          customFields.partner
        ) {
          dayStat.sentToPartners++;
        }

        // MQL Lost
        if (
          customFields.mqlLostReason &&
          customFields.lostDateTime &&
          isDateInRange(customFields.lostDateTime, dayStart, dayEnd)
        ) {
          dayStat.mqlLost++;
        }
      });
    });

    return dailyStats;
  };

  const renderWeeklyStatsTable = (metricsData: SDRMetrics, sdrAgent: string) => {
    const dailyStats = calculateDailyStats(sdrAgent);
    const totalAgentDeals = metricsData.totalAgentDeals;
    const stats = metricsData.stats;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{metricsData.sdrAgent}</h3>
          <p className="text-gray-600 text-sm mt-0.5">Daily Statistics Breakdown - Last 7 Days</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Metric</th>
                {dailyStats.map((dayStat, index) => (
                  <th key={index} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                    <div>{format(dayStat.date, 'dd/MM')}</div>
                    <div className="text-xs font-normal text-gray-500">{format(dayStat.date, 'EEE')}</div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 bg-blue-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Distributed to Sales</div>
                    <div className="text-sm text-gray-500">Number of deals distributed to sales</div>
                  </div>
                </td>
                {dailyStats.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.distributedToSales}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{stats.distributedToSales}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {calculatePercentage(stats.distributedToSales, totalAgentDeals)}
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sent to Automation</div>
                    <div className="text-sm text-gray-500">Number of deals sent to automation</div>
                  </div>
                </td>
                {dailyStats.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.sentToAutomation}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{stats.sentToAutomation}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {calculatePercentage(stats.sentToAutomation, totalAgentDeals)}
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sent to Partners</div>
                    <div className="text-sm text-gray-500">Number of deals sent to partners</div>
                  </div>
                </td>
                {dailyStats.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.sentToPartners}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{stats.sentToPartners}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {calculatePercentage(stats.sentToPartners, totalAgentDeals)}
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10">
                  <div>
                    <div className="text-sm font-medium text-gray-900">MQL Lost</div>
                    <div className="text-sm text-gray-500">Number of MQL deals lost</div>
                  </div>
                </td>
                {dailyStats.map((dayStat, index) => (
                  <td key={index} className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    {dayStat.mqlLost}
                  </td>
                ))}
                <td className="px-6 py-4 text-right bg-blue-50">
                  <div className="text-sm font-semibold text-gray-900">{stats.mqlLost}</div>
                  <div className="text-sm font-medium text-blue-600">
                    {calculatePercentage(stats.mqlLost, totalAgentDeals)}
                  </div>
                </td>
              </tr>

              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                <td className="px-6 py-4 sticky left-0 bg-blue-50 z-10">
                  <div className="text-sm text-gray-900">Total Agent Deals</div>
                </td>
                {dailyStats.map((dayStat, index) => {
                  const dayTotal = 
                    dayStat.distributedToSales +
                    dayStat.sentToAutomation +
                    dayStat.sentToPartners +
                    dayStat.mqlLost;
                  return (
                    <td key={index} className="px-4 py-4 text-center text-sm text-gray-900">
                      {dayTotal}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-right bg-blue-100">
                  <div className="text-sm text-gray-900">{totalAgentDeals}</div>
                  <div className="text-sm text-blue-700">100.0%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStatsTable = (metricsData: SDRMetrics) => {
    const totalAgentDeals = metricsData.totalAgentDeals;
    const stats = metricsData.stats;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{metricsData.sdrAgent}</h3>
          <p className="text-gray-600 text-sm mt-0.5">Statistics Overview</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">% of Agent Total Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Distributed to Sales</div>
                    <div className="text-sm text-gray-500">Number of deals distributed to sales</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.distributedToSales}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.distributedToSales, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sent to Automation</div>
                    <div className="text-sm text-gray-500">Number of deals sent to automation</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.sentToAutomation}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.sentToAutomation, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sent to Partners</div>
                    <div className="text-sm text-gray-500">Number of deals sent to partners</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.sentToPartners}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.sentToPartners, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">MQL Lost</div>
                    <div className="text-sm text-gray-500">Number of MQL deals lost</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.mqlLost}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.mqlLost, totalAgentDeals)}
                </td>
              </tr>

              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">Total Agent Deals</div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {totalAgentDeals}
                </td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  100.0%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {dateFilter === 'weekly' ? (
          <>
            {renderWeeklyStatsTable(anaMetrics, 'Ana Pascoal')}
            {renderWeeklyStatsTable(ruffaMetrics, 'Ruffa Espejon')}
          </>
        ) : (
          <>
            {renderStatsTable(anaMetrics)}
            {renderStatsTable(ruffaMetrics)}
          </>
        )}
      </div>
    </div>
  );
}