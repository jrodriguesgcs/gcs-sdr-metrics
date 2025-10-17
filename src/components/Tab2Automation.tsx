import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';

interface Tab2Props {
  metrics: SDRMetrics[];
}

export default function Tab2Automation({ metrics }: Tab2Props) {
  const [anaMetrics, ruffaMetrics] = metrics;

  const getTotalAutomation = (auto: SDRMetrics['automationMetrics']) => {
    return (
      auto.portugalD7 +
      auto.portugalTax +
      auto.portugalLegal +
      auto.goldcrest +
      auto.serviceNotAvailable +
      auto.futureOpportunity +
      auto.ineligible +
      auto.tagToDelete
    );
  };

  const renderSDRAutomationTable = (metricsData: SDRMetrics) => {
    const totalAgentDeals = metricsData.totalAgentDeals;
    const totalAutomation = getTotalAutomation(metricsData.automationMetrics);
    const auto = metricsData.automationMetrics;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{metricsData.sdrAgent}</h3>
          <p className="text-gray-600 text-sm mt-0.5">
            Total Automation Actions: {totalAutomation} ({calculatePercentage(totalAutomation, totalAgentDeals)} of {totalAgentDeals} total deals)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Automation Type</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">% of Agent Total Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Portugal D7 Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal D7</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.portugalD7}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.portugalD7, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Portugal Tax Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal Taxes</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.portugalTax}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.portugalTax, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Portugal Legal Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal Legal</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.portugalLegal}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.portugalLegal, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Goldcrest Automation</div>
                    <div className="text-sm text-gray-500">Send to Goldcrest</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.goldcrest}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.goldcrest, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 bg-red-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Service Not Available</div>
                    <div className="text-sm text-gray-500">Lost - Service not Available</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.serviceNotAvailable}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.serviceNotAvailable, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-yellow-50 bg-yellow-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Lost - Future Opportunity</div>
                    <div className="text-sm text-gray-500">Future Opportunities</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.futureOpportunity}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.futureOpportunity, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 bg-red-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Ineligible</div>
                    <div className="text-sm text-gray-500">Lost - Can't Afford/Ineligible</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.ineligible}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.ineligible, totalAgentDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-100 bg-gray-100/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Tag to Delete</div>
                    <div className="text-sm text-gray-500">Lost - Tag to Delete</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{auto.tagToDelete}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                  {calculatePercentage(auto.tagToDelete, totalAgentDeals)}
                </td>
              </tr>

              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">{totalAutomation}</td>
                <td className="px-6 py-4 text-right text-sm text-blue-700">
                  {calculatePercentage(totalAutomation, totalAgentDeals)}
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
        {renderSDRAutomationTable(anaMetrics)}
        {renderSDRAutomationTable(ruffaMetrics)}
      </div>
    </div>
  );
}