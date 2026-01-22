'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { MousePointer, Link, BarChart3, TrendingUp, Activity, Globe, Clock, Filter, Calendar, ChevronDown, X } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  totalClicks: number;
  dailyClicks: Array<{
    clicks: number;
    time: string;
  }>;
  monthlyClicks?: Array<{
    month: string;
    clicks: number;
  }>;
  urlStats: Array<{
    id: number;
    short_code: string;
    original_url: string;
    short_url: string;
    click_count: number;
    created_at: string;
  }>;
  clickDetails?: Array<{
    id: number;
    url_id: number;
    ip_address: string;
    user_agent: string;
    referer: string;
    clicked_at: string;
  }>;
}

interface AnalyticsFilters {
  url?: string;
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}


export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedUrl, setSelectedUrl] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

const formatMonth = (monthString: string) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthIndex = parseInt(monthString) - 1;
  return monthNames[monthIndex] || monthString;
};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const buildQueryParams = (params: AnalyticsFilters): string => {
    const queryParams = new URLSearchParams();
    
    if (params.url && params.url !== 'all') {
      queryParams.append('url', params.url);
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    // Note: period is not sent to API, only used for UI logic
    
    return queryParams.toString();
  };

  const fetchAnalytics = async (customFilters?: AnalyticsFilters) => {
    try {
      setLoading(true);
      setError('');
      
      const currentFilters = customFilters || filters;
      const queryString = buildQueryParams(currentFilters);
      const url = queryString ? `http://localhost:3000/api/analytics?${queryString}` : 'http://localhost:3000/api/analytics';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('Analytics API Response:', data);
      
      if (data.status && data.data) {
        setAnalyticsData(data.data);
        console.log('Analytics Data Set:', data.data);
      } else {
        setError('Failed to load analytics');
        console.log('Analytics Error:', data);
      }
    } catch (err) {
      setError('Failed to load analytics. Please try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilters: AnalyticsFilters = {};
    
    if (selectedUrl && selectedUrl !== 'all') {
      newFilters.url = selectedUrl;
    }
    
    // Set date range based on period (period is only for UI logic)
    if (selectedPeriod === 'week' && startDate) {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 7);
      newFilters.start_date = startDate;
      newFilters.end_date = end.toISOString().split('T')[0];
    } else if (selectedPeriod === 'month' && startDate) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + 1);
      newFilters.start_date = startDate;
      newFilters.end_date = end.toISOString().split('T')[0];
    } else if (selectedPeriod === 'day') {
      // For daily, no date range needed - just fetch all daily data
    } else if (selectedPeriod === 'year') {
      // For yearly, no date range needed - just fetch all yearly data
    } else if (startDate && endDate) {
      // Custom date range without period
      newFilters.start_date = startDate;
      newFilters.end_date = endDate;
    }
    
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setSelectedUrl('all');
    setStartDate('');
    setEndDate('');
    setSelectedPeriod('month');
    setFilters({});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })}`;
  };

  const formatWeek = (weekString: string) => {
    return `Minggu ke-${weekString}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Analytics"
        subtitle="Monitor your link performance and engagement"
        showBackButton={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Professional Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          {/* Filter Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Filter Analytics</h3>
                  <p className="text-sm text-gray-500">Customize your data view</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Active Filters Summary */}
                {(filters.url || filters.start_date || filters.end_date) && (
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Active:</span>
                    <div className="flex space-x-1">
                      {filters.url && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          URL: {filters.url}
                        </span>
                      )}
                      {filters.start_date && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {filters.start_date}
                        </span>
                      )}
                      {filters.end_date && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {filters.end_date}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Expandable Filter Content */}
          {showFilters && (
            <div className="px-6 py-6 border-b border-gray-200 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* URL Filter */}
                <div>
                  <label htmlFor="url-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Link className="w-4 h-4 inline mr-2 text-gray-400" />
                    Filter Link
                  </label>
                  <select
                    id="url-filter"
                    value={selectedUrl}
                    onChange={(e) => setSelectedUrl(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900 transition-colors"
                  >
                    <option value="all">Semua Link</option>
                    {analyticsData?.urlStats?.map((url) => (
                      <option key={url.id} value={url.short_code}>
                        {url.short_code} - {url.original_url.length > 30 ? url.original_url.substring(0, 30) + '...' : url.original_url}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Filter */}
                <div>
                  <label htmlFor="period-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2 text-gray-400" />
                    Periode
                  </label>
                  <select
                    id="period-filter"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900 transition-colors"
                  >
                    <option value="week">Mingguan</option>
                    <option value="month">Bulanan</option>
                  </select>
                </div>

                {/* Date Range Filter - Only show for weekly and monthly periods */}
                {(selectedPeriod === 'week' || selectedPeriod === 'month') && (
                  <>
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="end-date" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        value={(() => {
                          if (selectedPeriod === 'week' && startDate) {
                            const end = new Date(startDate);
                            end.setDate(end.getDate() + 7);
                            return end.toISOString().split('T')[0];
                          } else if (selectedPeriod === 'month' && startDate) {
                            const end = new Date(startDate);
                            end.setMonth(end.getMonth() + 1);
                            return end.toISOString().split('T')[0];
                          }
                          return '';
                        })()}
                        readOnly
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Helper Text */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {selectedPeriod === 'week' || selectedPeriod === 'month' 
                    ? 'Pilih tanggal mulai, tanggal akhir akan dihitung otomatis'
                    : 'Data akan ditampilkan sesuai periode yang dipilih'
                  }
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {Object.keys(filters).length > 0 && (
                    <span>{Object.keys(filters).length} filter aktif</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Terapkan Filter</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {analyticsData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <MousePointer className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Klik</dt>
                      <dd className="text-lg font-medium text-gray-900">{analyticsData.totalClicks.toLocaleString('id-ID')}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <Link className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Link</dt>
                      <dd className="text-lg font-medium text-gray-900">{analyticsData.urlStats?.length?.toLocaleString('id-ID') || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rata-rata Klik/Link</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analyticsData.urlStats && analyticsData.urlStats.length > 0 
                          ? Math.round(analyticsData.totalClicks / analyticsData.urlStats.length).toLocaleString('id-ID')
                          : '0'
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Link Aktif</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analyticsData.urlStats?.filter(url => url.click_count > 0)?.length?.toLocaleString('id-ID') || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              {/* Daily Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Grafik Klik</h3>
                    {analyticsData.dailyClicks && analyticsData.dailyClicks.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {analyticsData.dailyClicks.length} hari data
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="h-64">
                  {analyticsData.dailyClicks && analyticsData.dailyClicks.length > 0 ? (
                    <Line
                      data={{
                        labels: analyticsData.dailyClicks.map((day) => {
                          const date = new Date(day.time);
                          if (analyticsData.dailyClicks.length <= 7) {
                            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                          } else {
                            // Show fewer labels for longer periods
                            const index = analyticsData.dailyClicks.indexOf(day);
                            return index % Math.ceil(analyticsData.dailyClicks.length / 7) === 0 
                              ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                              : '';
                          }
                        }),
                        datasets: [
                          {
                            label: 'Jumlah Klik',
                            data: analyticsData.dailyClicks.map((day) => day.clicks),
                            borderColor: 'rgba(59, 130, 246, 1)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                            pointHoverBorderColor: '#fff',
                            pointHoverBorderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: 'index',
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                              label: function(context) {
                                return `${context.parsed.y} klik`;
                              },
                              title: function(context) {
                                const dataIndex = context[0].dataIndex;
                                const date = new Date(analyticsData.dailyClicks[dataIndex].time);
                                return date.toLocaleDateString('id-ID', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric' 
                                });
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              font: {
                                size: 11,
                              },
                              color: '#6B7280',
                            },
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(229, 231, 235, 0.5)',
                              drawBorder: false,
                            },
                            ticks: {
                              font: {
                                size: 11,
                              },
                              color: '#6B7280',
                              padding: 8,
                            },
                          },
                        },
                        elements: {
                          point: {
                            hoverRadius: 8,
                          }
                        }
                      } as ChartOptions<'line'>}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>Belum ada data klik</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* URL Performance Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performa Link</h3>
                <p className="text-sm text-gray-500 mt-1">Detail performa setiap link yang Anda buat</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link Pendek
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link Asli
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Klik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dibuat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.urlStats?.map((url) => (
                      <tr key={url.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Link className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-600">{url.short_url}</p>
                              <p className="text-xs text-gray-500">{url.short_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 truncate max-w-xs" title={url.original_url}>
                            {url.original_url}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            url.click_count > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {url.click_count.toLocaleString('id-ID')} klik
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(url.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Click Details Table */}
            {analyticsData.clickDetails && analyticsData.clickDetails.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Detail Klik</h3>
                  <p className="text-sm text-gray-500 mt-1">Riwayat setiap klik dengan tanggal dan waktu</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Waktu Klik
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.clickDetails?.slice(0, 50)?.map((click) => (
                        <tr key={click.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-blue-600 font-medium">
                              https://electric-hideously-drake.ngrok-free.app/{click.url_id}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {click.ip_address}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 truncate max-w-xs" title={click.user_agent}>
                              {click.user_agent.length > 50 ? click.user_agent.substring(0, 50) + '...' : click.user_agent}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {click.referer || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(click.clicked_at).toLocaleString('id-ID')}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
