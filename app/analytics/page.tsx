'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { MousePointer, Link, BarChart3, TrendingUp, Activity, Globe, Clock } from 'lucide-react';

interface AnalyticsData {
  totalClicks: number;
  dailyClicks: Array<{
    date: string;
    clicks: number;
  }>;
  monthlyClicks: Array<{    // ← Di sini
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
  clickDetails: Array<{
    id: number;
    url_id: number;
    ip_address: string;
    user_agent: string;
    referer: string;
    clicked_at: string;
  }>;
}


export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly'>('daily');
  const [selectedUrl, setSelectedUrl] = useState<string>('all'); // Add URL filter state

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
    if (selectedUrl !== undefined) {
      fetchAnalytics(selectedUrl);
    }
  }, [selectedUrl]);

  const fetchAnalytics = async (urlFilter?: string) => {
    try {
      setLoading(true);
      const filterParam = urlFilter && urlFilter !== 'all' ? `?url=${urlFilter}` : '';
      const response = await fetch(`http://localhost:3000/api/analytics${filterParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      console.log('Analytics API Response:', data); // Debug log
      
      if (data.status && data.data) {
        setAnalyticsData(data.data);
        console.log('Analytics Data Set:', data.data); // Debug log
      } else {
        setError('Failed to load analytics');
        console.log('Analytics Error:', data); // Debug log
      }
    } catch (err) {
      setError('Failed to load analytics. Please try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
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

        {analyticsData && (
          <>
            {/* URL Filter */}
            {analyticsData && analyticsData.urlStats && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Link</h3>
                  <div className="flex items-center space-x-4">
                    <label htmlFor="url-filter" className="text-sm font-medium text-gray-700">
                      Pilih Link:
                    </label>
                    <select
                      id="url-filter"
                      value={selectedUrl}
                      onChange={(e) => setSelectedUrl(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="all">Semua Link</option>
                      {analyticsData.urlStats.map((url) => (
                        <option key={url.id} value={url.short_code}>
                          {url.short_code} - {url.original_url.length > 30 ? url.original_url.substring(0, 30) + '...' : url.original_url}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

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
                      <dd className="text-lg font-medium text-gray-900">{analyticsData.urlStats.length.toLocaleString('id-ID')}</dd>
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
                        {analyticsData.urlStats.length > 0 
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
                        {analyticsData.urlStats.filter(url => url.click_count > 0).length.toLocaleString('id-ID')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Grafik Harian</h3>
                    {analyticsData.dailyClicks.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        7 hari terakhir
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="h-64 relative">
                  {analyticsData.dailyClicks.length > 0 ? (
                    <>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                        {(() => {
                          const maxClicks = Math.max(...analyticsData.dailyClicks.map(d => d.clicks), 1);
                          return [maxClicks, Math.floor(maxClicks * 0.5), 0].map((val, idx) => (
                            <div key={idx}>{val}</div>
                          ));
                        })()}
                      </div>
                      
                      {/* Chart bars */}
                      <div className="ml-8 h-full pb-8 flex items-end justify-between gap-2">
                        {analyticsData.dailyClicks.map((day, index) => {
                          const maxClicks = Math.max(...analyticsData.dailyClicks.map(d => d.clicks), 1);
                          const heightPercentage = (day.clicks / maxClicks) * 100;
                          const date = new Date(day.date);
                          const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()];
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center group">
                              <div className="w-full relative">
                                {day.clicks > 0 ? (
                                  <div
                                    className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t cursor-pointer relative"
                                    style={{ 
                                      height: `${Math.max(heightPercentage, 8)}px`,
                                      minHeight: '8px'
                                    }}
                                  >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      {day.clicks} klik
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-1 bg-gray-200 rounded cursor-pointer">
                                    {/* Tooltip for zero clicks */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                      0 klik
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* X-axis label */}
                              <div className="text-xs text-gray-600 mt-2 text-center">
                                {dayName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>Belum ada data klik harian</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Chart */}
              {/* Monthly Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Grafik Bulanan</h3>
                    {analyticsData.monthlyClicks && analyticsData.monthlyClicks.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Data tahun berjalan
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="h-64 relative">
                  {analyticsData.monthlyClicks && analyticsData.monthlyClicks.length > 0 ? (
                    <>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                        {(() => {
                          const maxClicks = Math.max(...analyticsData.monthlyClicks.map(m => m.clicks), 1);
                          return [maxClicks, Math.floor(maxClicks * 0.5), 0].map((val, idx) => (
                            <div key={idx}>{val}</div>
                          ));
                        })()}
                      </div>
                      
                      {/* Chart bars */}
                      <div className="ml-8 h-full pb-8 flex items-end justify-between gap-1">
                        {(() => {
                          // Sort months so January (1) is first, December (12) is last
                          const sortedMonths = [...analyticsData.monthlyClicks].sort((a, b) => {
                            return parseInt(a.month) - parseInt(b.month);
                          });
                          
                          const maxClicks = Math.max(...sortedMonths.map(m => m.clicks), 1);
                          
                          return sortedMonths.map((month, index) => {
                            const heightPercentage = (month.clicks / maxClicks) * 100;
                            
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center group">
                                <div className="w-full relative">
                                  {month.clicks > 0 ? (
                                    <div
                                      className="w-full bg-green-500 hover:bg-green-600 transition-all rounded-t cursor-pointer relative"
                                      style={{ 
                                        height: `${Math.max(heightPercentage, 8)}px`,
                                        minHeight: '8px'
                                      }}
                                    >
                                      {/* Tooltip */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {formatMonth(month.month)}: {month.clicks} klik
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-1 bg-gray-200 rounded cursor-pointer">
                                      {/* Tooltip for zero clicks */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {formatMonth(month.month)}: 0 klik
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* X-axis label */}
                                <div className="text-xs text-gray-600 mt-2 text-center">
                                  {formatMonth(month.month)}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>Belum ada data klik bulanan</p>
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
                    {analyticsData.urlStats.map((url) => (
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
                      {analyticsData.clickDetails.slice(0, 50).map((click) => (
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
