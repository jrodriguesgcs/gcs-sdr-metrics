interface RefreshNotificationProps {
  status: 'loading' | 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export default function RefreshNotification({ status, message, onClose }: RefreshNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className={`rounded-xl shadow-lg p-4 flex items-center space-x-3 border ${
        status === 'success' 
          ? 'bg-green-50 border-green-200' 
          : status === 'error'
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
      }`}>
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
        {status === 'success' && (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className={`text-sm font-medium ${
          status === 'success' 
            ? 'text-green-900' 
            : status === 'error'
            ? 'text-red-900'
            : 'text-gray-700'
        }`}>
          {message}
        </span>
        {(status === 'success' || status === 'error') && onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}