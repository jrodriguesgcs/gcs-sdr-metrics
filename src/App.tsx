import { useState, useEffect } from 'react';
import Login from './components/Login';
import LoadingProgress from './components/LoadingProgress';
import Tab1Distribution from './components/Tab1Distribution';
import Tab2Automation from './components/Tab2Automation';
import { Deal, LoadingProgress as LoadingProgressType, DateFilter, SDRMetrics } from './types';
import { fetchAllDealsWithCustomFields } from './services/api';
import { calculateMetrics } from './utils/metricsUtils';
import { formatDate, getDateRange } from './utils/dateUtils';

const APP_PASSWORD = 'Welcome-GCS-Dashboard-2025'; // Change this to your desired password

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'distribution' | 'automation'>('distribution');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [yesterdayDeals, setYesterdayDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<SDRMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgressType>({
    phase: 'idle',
    message: '',
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [yesterdayLoadingInBackground, setYesterdayLoadingInBackground] = useState(false);

  useEffect(() => {
    if (isAuthenticated && deals.length === 0) {
      loadTodayData();
    }
  }, [isAuthenticated]);

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
      const todayDeals = await fetchAllDealsWithCustomFields(setLoadingProgress);
      setDeals(todayDeals);
      const todayMetrics = calculateMetrics(todayDeals, 'today');
      setMetrics(todayMetrics);
      
      // Start loading yesterday's data in background
      setYesterdayLoadingInBackground(true);
      loadYesterdayDataInBackground();
    } catch (error) {
      console.error('Error loading today data:', error);
      alert('Failed to load data. Please check your API configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadYesterdayDataInBackground = async () => {
    try {
      const yesterdayData = await fetchAllDealsWithCustomFields(() => {});
      setYesterdayDeals(yesterdayData);
      setYesterdayLoadingInBackground(false);
    } catch (error) {
      console.error('Error loading yesterday data:', error);
      setYesterdayLoadingInBackground(false);
    }
  };

  const handleRefresh = () => {
    const currentDeals = dateFilter === 'today' ? deals : yesterdayDeals;
    const newMetrics = calculateMetrics(currentDeals, dateFilter);
    setMetrics(newMetrics);
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
    <div className="min-h-screen bg-ice-white">
      {isLoading && <LoadingProgress progress={loadingProgress} />}

      {/* Header */}
      <header className="bg-night-blue shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">GCS SDR Metrics Dashboard</h1>
              <p className="text-electric-blue-100 mt-1">
                Active Campaign Performance Tracking
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {yesterdayLoadingInBackground && (
                <div className="flex items-center text-electric-blue-100 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading yesterday's data...
                </div>
              )}
              <button
                onClick={handleRefresh}
                className="bg-electric-blue text-white px-6 py-2 rounded-lg hover:bg-electric-blue-500 transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs & Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === 'distribution'
                    ? 'bg-night-blue text-white'
                    : 'text-night-blue-200 hover:text-night-blue'
                }`}
              >
                Distribution & Partners
              </button>
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === 'automation'
                    ? 'bg-night-blue text-white'
                    : 'text-night-blue-200 hover:text-night-blue'
                }`}
              >
                Automation & Lost Reasons
              </button>
            </div>

            {/* Date Filter */}
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-night-blue">Date Filter:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDateFilterChange('today')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === 'today'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-200 text-night-blue-200 hover:bg-gray-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('yesterday')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === 'yesterday'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-200 text-night-blue-200 hover:bg-gray-300'
                    }`}
                    disabled={yesterdayDeals.length === 0}
                  >
                    Yesterday
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  ({formatDate(start)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {metrics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading metrics...</p>
          </div>
        ) : (
          <>
            {activeTab === 'distribution' && <Tab1Distribution metrics={metrics} />}
            {activeTab === 'automation' && <Tab2Automation metrics={metrics} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-night-blue mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-electric-blue-100 text-sm">
            © 2025 Global Citizen Solutions - SDR Metrics Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;