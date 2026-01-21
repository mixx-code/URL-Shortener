import Card from '../atoms/Card';
import StatCard from '../molecules/StatCard';
import ProgressBar from '../molecules/ProgressBar';

interface AnalyticsData {
  total_clicks: number;
  unique_visitors: number;
  top_countries: Array<{ country: string; count: number }>;
  top_devices: Array<{ device: string; count: number }>;
  daily_clicks: Array<{ date: string; clicks: number }>;
}

interface AnalyticsOverviewProps {
  analytics: AnalyticsData;
}

export default function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  const averagePerDay = analytics.daily_clicks && analytics.daily_clicks.length > 0 
    ? Math.round(analytics.total_clicks / analytics.daily_clicks.length)
    : 0;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Klik"
          value={analytics.total_clicks}
          variant="blue"
        />
        <StatCard
          title="Pengunjung Unik"
          value={analytics.unique_visitors}
          variant="green"
        />
        <StatCard
          title="Rata-rata per Hari"
          value={averagePerDay}
          variant="purple"
        />
      </div>

      {/* Top Countries */}
      {analytics.top_countries && analytics.top_countries.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Negara Teratas</h3>
          <div className="space-y-2">
            {analytics.top_countries.map((country, index) => (
              <ProgressBar
                key={index}
                value={country.count}
                max={analytics.total_clicks}
                variant="blue"
                label={country.country}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Devices */}
      {analytics.top_devices && analytics.top_devices.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Perangkat Teratas</h3>
          <div className="space-y-2">
            {analytics.top_devices.map((device, index) => (
              <ProgressBar
                key={index}
                value={device.count}
                max={analytics.total_clicks}
                variant="green"
                label={device.device}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
