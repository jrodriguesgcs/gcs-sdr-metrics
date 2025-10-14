import { SDRMetrics } from '../types';

interface TimeToDistributionProps {
  metrics: SDRMetrics;
}

export default function TimeToDistribution({ metrics }: TimeToDistributionProps) {
  const intervals = Object.entries(metrics.timeToDistribution).sort((a, b) => b[1] - a[1]);
  const top3Values = intervals.slice(0, 3).map(([_, count]) => count);

  if (intervals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">{metrics.sdrAgent}</h3>
          <p className="text-slate-300 text-sm mt-0.5">Time to Distribution</p>
        </div>
        <div className="p-6 text-center text-gray-500 text-sm">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
        <h3 className="text-base font-semibold text-white">{metrics.sdrAgent}</h3>
        <p className="text-slate-300 text-sm mt-0.5">Time to Distribution</p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {intervals.map(([interval, count]) => {
            const isTop3 = top3Values.includes(count);
            return (
              <div
                key={interval}
                className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
                  isTop3
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className={`text-sm font-medium ${isTop3 ? 'text-blue-900' : 'text-gray-700'}`}>
                  {interval}
                </span>
                <span className={`text-sm font-semibold ${isTop3 ? 'text-blue-700' : 'text-gray-600'}`}>
                  {count} {count === 1 ? 'deal' : 'deals'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}