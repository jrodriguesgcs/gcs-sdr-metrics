import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';

interface Tab2Props {
  metrics: SDRMetrics[];
}

export default function Tab2Automation({ metrics }: Tab2Props) {
  const [anaMetrics, ruffaMetrics] = metrics;

  const getTotalDeals = (metricsData: SDRMetrics) => {
    return Object.values(metricsData.dealsByOwner).reduce(
      (sum, owner) => sum + owner.total,
      0
    );
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-night-blue px-6 py-4">
          <h3 className="text-xl font-bold text-white">{metricsData.sdrAgent}</h3>
          <p className="text-electric-blue-100 text-sm mt-1">
            Total Automation Actions: {totalAutomation}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-electric-blue-20">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-night-blue">
                  Automation Type
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-night-blue">
                  Count
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-night-blue">
                  % of Agent Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">No Interest Automation</div>
                    <div className="text-sm text-gray-600">Interest not Identified</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.noInterest}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.noInterest, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Portugal D7 Consultation</div>
                    <div className="text-sm text-gray-600">Paid Consultation Portugal D7</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.portugalD7}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.portugalD7, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Portugal Tax Consultation</div>
                    <div className="text-sm text-gray-600">Paid Consultation Portugal Taxes</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.portugalTax}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.portugalTax, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Portugal Legal Consultation</div>
                    <div className="text-sm text-gray-600">Paid Consultation Portugal Legal</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.portugalLegal}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.portugalLegal, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 bg-red-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Service Not Available</div>
                    <div className="text-sm text-gray-600">Lost - Service not Available</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.serviceNotAvailable}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.serviceNotAvailable, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 bg-yellow-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Lost - Future Opportunity</div>
                    <div className="text-sm text-gray-600">Future Opportunities</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.futureOpportunity}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.futureOpportunity, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 bg-red-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Unresponsive / Unqualified</div>
                    <div className="text-sm text-gray-600">Lost - Unqualified</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.unresponsiveUnqualified}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.unresponsiveUnqualified, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 bg-gray-100">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Tag to Delete</div>
                    <div className="text-sm text-gray-600">Lost - Tag to Delete</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.tagToDelete}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.tagToDelete, totalDeals)}
                </td>
              </tr>

              <tr className="hover:bg-gray-50 bg-red-50">
                <td className="px-6 py-4 text-night-blue">
                  <div>
                    <div className="font-medium">Ineligible</div>
                    <div className="text-sm text-gray-600">Lost - Can't Afford/Ineligible</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-night-blue">
                  {auto.ineligible}
                </td>
                <td className="px-6 py-4 text-right text-electric-blue-700">
                  {calculatePercentage(auto.ineligible, totalDeals)}
                </td>
              </tr>

              <tr className="bg-night-blue-50 font-bold">
                <td className="px-6 py-4 text-night-blue">Total</td>
                <td className="px-6 py-4 text-right text-night-blue">{totalAutomation}</td>
                <td className="px-6 py-4 text-right text-electric-blue">
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