import { LoadingProgress as LoadingProgressType } from '../types';

interface LoadingProgressProps {
  progress: LoadingProgressType;
}

export default function LoadingProgress({ progress }: LoadingProgressProps) {
  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'metadata': return 'Phase 1: Loading Metadata';
      case 'deals': return 'Phase 2: Fetching Deals';
      case 'customFields': return 'Phase 3: Loading Custom Fields';
      case 'merge': return 'Phase 4: Processing Data';
      case 'complete': return 'Complete';
      default: return 'Loading...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {getPhaseLabel(progress.phase)}
          </h3>
          <p className="text-gray-600 text-sm">{progress.message}</p>
        </div>

        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          {progress.total > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>{progress.current} / {progress.total}</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
          )}
        </div>

        {progress.phase === 'customFields' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-700">
              Using 20 parallel workers to speed up processing while respecting API rate limits...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}