import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';

interface TabStatsProps {
  metrics: SDRMetrics[];
}

export default function TabStats({ metrics }: TabStatsProps) {
  const [anaMetrics, ruffaMetrics] = metrics;

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
                    <div className="text-sm font-medium text-gray-900">Distributed Deals to Sales</div>
                    <div className="text-sm text-gray-500">DISTRIBUTION Time not blank, Send to Automation blank</div>
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
                    <div className="text-sm font-medium text-gray-900">Leads Sent to Automation</div>
                    <div className="text-sm text-gray-500">Send to Automation not blank, created in filtered date</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.sentToAutomation}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.sentToAutomation, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Deals MQL Lost</div>
                    <div className="text-sm text-gray-500">MQL Lost Reason not blank, Lost Date Time in filtered date</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.mqlLost}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.mqlLost, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-yellow-50 transition-colors bg-yellow-50/30">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Deals to Address</div>
                    <div className="text-sm text-gray-500">Created in filtered date, no Distribution/Lost/Automation</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  {stats.toAddress}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(stats.toAddress, totalAgentDeals)}
                </td>
              </tr>

              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">Total Agent Deals</div>
                    <div className="text-sm text-gray-500">Any activity in filtered date (created/distributed/lost)</div>
                  </div>
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
        {renderStatsTable(anaMetrics)}
        {renderStatsTable(ruffaMetrics)}
      </div>
    </div>
  );
}