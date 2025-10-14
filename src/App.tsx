import { useState, useEffect } from 'react';
import Login from './components/Login';
import LoadingProgress from './components/LoadingProgress';
import RefreshNotification from './components/RefreshNotification';
import Tab1Distribution from './components/Tab1Distribution';
import Tab2Automation from './components/Tab2Automation';
import { Deal, DateFilter, SDRMetrics, LoadingProgress as LoadingProgressType } from './types';
import { fetchAllDealsWithCustomFields } from './services/api';
import { calculateMetrics } from './utils/metricsUtils';
import { formatDate, getDateRange } from './utils/dateUtils';

const APP_PASSWORD = 'Welcome-GCS-Dashboard-2025';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'distribution' | 'automation'>('distribution');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [yesterdayDeals, setYesterdayDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<SDRMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isYesterdayLoading, setIsYesterdayLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgressType>({
    phase: 'idle',
    message: '',
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [refreshMessage, setRefreshMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && deals.length === 0) {
      loadTodayData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (refreshStatus === 'success' || refreshStatus === 'error') {
      const timer = setTimeout(() => {
        setRefreshStatus('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [refreshStatus]);

  const handleLogin = (password: string) => {
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const loadTodayData = async () => {
    setIsLoading(true);
    try {
      const { deals: todayDeals } = await fetchAllDealsWithCustomFields(setLoadingProgress);
      setDeals(todayDeals);
      const todayMetrics = calculateMetrics(todayDeals, 'today');
      setMetrics(todayMetrics);

      // Show success notification
      setRefreshStatus('success');
      setRefreshMessage('All deals from today have been loaded');

      loadYesterdayDataInBackground();
    } catch (error) {
      console.error('Error loading today data:', error);
      alert('Failed to load data. Please check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadYesterdayDataInBackground = async () => {
    setIsYesterdayLoading(true);
    try {
      const { deals: yesterdayData } = await fetchAllDealsWithCustomFields(() => {});
      setYesterdayDeals(yesterdayData);
    } catch (error) {
      console.error('Error loading yesterday data:', error);
    } finally {
      setIsYesterdayLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshStatus('loading');
    setRefreshMessage('Refreshing data...');
    
    try {
      const { deals: refreshedDeals } = await fetchAllDealsWithCustomFields(setLoadingProgress);
      
      if (dateFilter === 'today') {
        setDeals(refreshedDeals);
        const newMetrics = calculateMetrics(refreshedDeals, 'today');
        setMetrics(newMetrics);
      } else {
        setYesterdayDeals(refreshedDeals);
        const newMetrics = calculateMetrics(refreshedDeals, 'yesterday');
        setMetrics(newMetrics);
      }
      
      setRefreshStatus('success');
      setRefreshMessage('All deals from today and yesterday have been loaded');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshStatus('error');
      setRefreshMessage('Refresh failed. Please try again.');
    }
  };

  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    const currentDeals = filter === 'today' ? deals : yesterdayDeals;
    const newMetrics = calculateMetrics(currentDeals, filter);
    setMetrics(newMetrics);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const { start } = getDateRange(dateFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Loading Progress Modal */}
      {isLoading && <LoadingProgress progress={loadingProgress} />}

      {/* Refresh Notification */}
      {refreshStatus !== 'idle' && (
        <RefreshNotification 
          status={refreshStatus} 
          message={refreshMessage}
          onClose={() => setRefreshStatus('idle')}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GCS SDR Metrics Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm">Active Campaign Performance Tracking</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshStatus === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs & Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
            {/* Tab Navigation */}
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'distribution'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Distribution & Partners
              </button>
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'automation'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Automation & Lost Reasons
              </button>
            </div>

            {/* Date Filter */}
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Date Filter:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDateFilterChange('today')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      dateFilter === 'today'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('yesterday')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm relative ${
                      dateFilter === 'yesterday'
                        ? 'bg-blue-600 text-white shadow-md'
                        : isYesterdayLoading
                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isYesterdayLoading}
                  >
                    {isYesterdayLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></span>
                      </span>
                    )}
                    <span className={isYesterdayLoading ? 'invisible' : ''}>Yesterday</span>
                  </button>
                </div>
                <span className="text-sm text-gray-500">({formatDate(start)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {metrics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading metrics...</p>
          </div>
        ) : (
          <>
            {activeTab === 'distribution' && <Tab1Distribution metrics={metrics} />}
            {activeTab === 'automation' && <Tab2Automation metrics={metrics} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Global Citizen Solutions - SDR Metrics Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;