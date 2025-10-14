import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';

interface Tab2Props {
  metrics: SDRMetrics[];
}

export default function Tab2Automation({ metrics }: Tab2Props) {
  const [anaMetrics, ruffaMetrics] = metrics;

  const getTotalDeals = (metricsData: SDRMetrics) => {
    return Object.values(metricsData.dealsByOwner).reduce((sum, owner) => sum + owner.total, 0);
  };

  const getTotalAutomation = (auto: SDRMetrics['automationMetrics']) => {
    return (
      auto.noInterest +
      auto.portugalD7 +
      auto.portugalTax +
      auto.portugalLegal +
      auto.serviceNotAvailable +
      auto.futureOpportunity +
      auto.unresponsiveUnqualified +
      auto.tagToDelete +
      auto.ineligible
    );
  };

  const renderSDRAutomationTable = (metricsData: SDRMetrics) => {
    const totalDeals = getTotalDeals(metricsData);
    const totalAutomation = getTotalAutomation(metricsData.automationMetrics);
    const auto = metricsData.automationMetrics;

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{metricsData.sdrAgent}</h3>
          <p className="text-blue-100 text-sm mt-1">Total Automation Actions: {totalAutomation}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Automation Type</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">% of Agent Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">No Interest Automation</div>
                    <div className="text-sm text-gray-500">Interest not Identified</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.noInterest}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.noInterest, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Portugal D7 Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal D7</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.portugalD7}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.portugalD7, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Portugal Tax Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal Taxes</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.portugalTax}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.portugalTax, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Portugal Legal Consultation</div>
                    <div className="text-sm text-gray-500">Paid Consultation Portugal Legal</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.portugalLegal}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.portugalLegal, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 bg-red-50/50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Service Not Available</div>
                    <div className="text-sm text-gray-500">Lost - Service not Available</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.serviceNotAvailable}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.serviceNotAvailable, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-yellow-50 bg-yellow-50/50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Lost - Future Opportunity</div>
                    <div className="text-sm text-gray-500">Future Opportunities</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.futureOpportunity}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.futureOpportunity, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 bg-red-50/50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Unresponsive / Unqualified</div>
                    <div className="text-sm text-gray-500">Lost - Unqualified</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.unresponsiveUnqualified}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.unresponsiveUnqualified, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-100 bg-gray-100/50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Tag to Delete</div>
                    <div className="text-sm text-gray-500">Lost - Tag to Delete</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.tagToDelete}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.tagToDelete, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-red-50 bg-red-50/50 transition">
                <td className="px-6 py-4 text-gray-700">
                  <div>
                    <div className="font-medium">Ineligible</div>
                    <div className="text-sm text-gray-500">Lost - Can't Afford/Ineligible</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{auto.ineligible}</td>
                <td className="px-6 py-4 text-right text-blue-600 font-medium">
                  {calculatePercentage(auto.ineligible, totalDeals)}
                </td>
              </tr>

              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 font-bold border-t-2 border-blue-300">
                <td className="px-6 py-4 text-gray-900">Total</td>
                <td className="px-6 py-4 text-right text-gray-900">{totalAutomation}</td>
                <td className="px-6 py-4 text-right text-blue-700">
                  {calculatePercentage(totalAutomation, totalDeals)}
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