import { useState, useEffect } from 'react';
import Login from './components/Login';
import Tab1Distribution from './components/Tab1Distribution';
import Tab2Automation from './components/Tab2Automation';
import { Deal, DateFilter, SDRMetrics } from './types';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      const { deals: todayDeals } = await fetchAllDealsWithCustomFields(() => {});
      setDeals(todayDeals);
      const todayMetrics = calculateMetrics(todayDeals, 'today');
      setMetrics(todayMetrics);

      // Load yesterday's data in background
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
      const { deals: yesterdayData } = await fetchAllDealsWithCustomFields(() => {});
      setYesterdayDeals(yesterdayData);
    } catch (error) {
      console.error('Error loading yesterday data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { deals: refreshedDeals } = await fetchAllDealsWithCustomFields(() => {});
      if (dateFilter === 'today') {
        setDeals(refreshedDeals);
      } else {
        setYesterdayDeals(refreshedDeals);
      }
      const newMetrics = calculateMetrics(refreshedDeals, dateFilter);
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Failed to refresh data.');
    } finally {
      setIsRefreshing(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { start } = getDateRange(dateFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Loading Spinner */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 z-50 border border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-gray-700">Refreshing...</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">GCS SDR Metrics Dashboard</h1>
              <p className="text-blue-200 mt-1">Active Campaign Performance Tracking</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition font-medium disabled:opacity-50 shadow-lg"
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
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Distribution & Partners
              </button>
              <button
                onClick={() => setActiveTab('automation')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  activeTab === 'automation'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
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
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === 'today'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('yesterday')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      dateFilter === 'yesterday'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={yesterdayDeals.length === 0}
                  >
                    Yesterday
                  </button>
                </div>
                <span className="text-sm text-gray-600">({formatDate(start)})</span>
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
      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-blue-200 text-sm">
            © 2025 Global Citizen Solutions - SDR Metrics Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;