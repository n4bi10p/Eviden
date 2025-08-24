import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobalStats } from '../hooks/useApi';
import { apiService } from '../services/ApiService';
import { cn } from '../utils';

export function ApiDebugTest() {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use our API hook
  const { data: globalStats, loading: statsLoading, error: statsError } = useGlobalStats();

  const runApiTests = async () => {
    setLoading(true);
    const results: any[] = [];

    try {
      // Test 1: Global Stats
      try {
        const stats = await apiService.getGlobalStats();
        results.push({
          test: 'Global Stats',
          status: 'success',
          data: stats,
        });
      } catch (error) {
        results.push({
          test: 'Global Stats',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Test 2: Events (simplified parameters)
      try {
        const events = await apiService.getEvents({ 
          organizer: 'alice.johnson@eviden.com'
        });
        results.push({
          test: 'Get Events',
          status: 'success',
          data: events,
        });
      } catch (error) {
        results.push({
          test: 'Get Events',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Test 3: Direct API call
      try {
        const response = await fetch('http://localhost:5000/api/users/stats/global');
        const data = await response.json();
        results.push({
          test: 'Direct Fetch Test',
          status: 'success',
          data: data,
        });
      } catch (error) {
        results.push({
          test: 'Direct Fetch Test',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      'min-h-screen p-6',
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    )}>
      <div className="max-w-4xl mx-auto">
        <h1 className={cn(
          'text-3xl font-bold mb-6',
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        )}>
          API Integration Test
        </h1>

        {/* API Hook Test */}
        <div className={cn(
          'rounded-xl p-6 mb-6',
          theme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border border-white/20'
            : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
        )}>
          <h2 className={cn(
            'text-xl font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          )}>
            useGlobalStats Hook Test
          </h2>
          
          {statsLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                Loading global stats...
              </span>
            </div>
          )}

          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {statsError.message}
            </div>
          )}

          {globalStats && (
            <div className={cn(
              'p-4 rounded-lg',
              theme === 'dark' ? 'bg-black/20' : 'bg-slate-100'
            )}>
              <pre className={cn(
                'text-sm overflow-auto',
                theme === 'dark' ? 'text-white/90' : 'text-slate-800'
              )}>
                {JSON.stringify(globalStats, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Manual Test Button */}
        <div className={cn(
          'rounded-xl p-6 mb-6',
          theme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border border-white/20'
            : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
        )}>
          <h2 className={cn(
            'text-xl font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          )}>
            Manual API Tests
          </h2>

          <button
            onClick={runApiTests}
            disabled={loading}
            className={cn(
              'px-6 py-3 rounded-xl font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105',
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Running Tests...</span>
              </div>
            ) : (
              'Run API Tests'
            )}
          </button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="mt-6 space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border',
                    result.status === 'success'
                      ? theme === 'dark'
                        ? 'bg-green-900/20 border-green-500/30 text-green-300'
                        : 'bg-green-50 border-green-200 text-green-800'
                      : theme === 'dark'
                        ? 'bg-red-900/20 border-red-500/30 text-red-300'
                        : 'bg-red-50 border-red-200 text-red-800'
                  )}
                >
                  <h3 className="font-semibold mb-2">
                    {result.test} - {result.status.toUpperCase()}
                  </h3>
                  
                  {result.data && (
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  
                  {result.error && (
                    <div className="text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Info */}
        <div className={cn(
          'rounded-xl p-6',
          theme === 'dark'
            ? 'bg-white/10 backdrop-blur-sm border border-white/20'
            : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
        )}>
          <h2 className={cn(
            'text-xl font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          )}>
            Configuration
          </h2>
          
          <div className={cn(
            'p-4 rounded-lg text-sm',
            theme === 'dark' ? 'bg-black/20 text-white/90' : 'bg-slate-100 text-slate-800'
          )}>
            <div>Frontend URL: http://localhost:3000</div>
            <div>Backend API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</div>
            <div>Environment: {import.meta.env.DEV ? 'Development' : 'Production'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiDebugTest;
