'use client';

interface StatsOverviewProps {
  stats: {
    totalLeads: number;
    newThisWeek: number;
    highQuality: number;
    industries: string[];
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="lead-engine-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalLeads.toLocaleString()}
          </div>
          <div className="text-gray-600 font-medium">Total Leads</div>
          <div className="text-sm text-gray-500 mt-1">All time</div>
        </div>

        {/* New This Week */}
        <div className="lead-engine-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            +{stats.newThisWeek}
          </div>
          <div className="text-gray-600 font-medium">New This Week</div>
          <div className="text-sm text-gray-500 mt-1">Last 7 days</div>
        </div>

        {/* High Quality Leads */}
        <div className="lead-engine-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.highQuality.toLocaleString()}
          </div>
          <div className="text-gray-600 font-medium">High Quality</div>
          <div className="text-sm text-gray-500 mt-1">Score 80+</div>
        </div>

        {/* Active Industries */}
        <div className="lead-engine-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats.industries.length}
          </div>
          <div className="text-gray-600 font-medium">Industries</div>
          <div className="text-sm text-gray-500 mt-1">Targeted</div>
        </div>
      </div>

      {/* Industry Distribution */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Industry Distribution</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.industries.map((industry, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center text-sm font-medium"
            >
              {industry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
