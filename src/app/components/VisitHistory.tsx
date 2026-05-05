import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  Download, Calendar, Clock, Star, MapPin, Plane, Award,
  Search, TrendingUp, BarChart3
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export function VisitHistory() {
  const { colors, glassStyle, mode } = useTheme();
  const isDark = mode === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('2026');

  const visits = [
    {
      id: 1,
      date: '2026-01-05',
      lounge: 'The Wing First Class Lounge',
      terminal: 'Terminal 1',
      checkIn: '14:30',
      checkOut: '17:50',
      duration: '3h 20m',
      flight: 'CX 888 to London',
      services: ['Fine Dining', 'Shower Suite', 'Private Cabana'],
      pointsEarned: 120,
      rating: 5
    },
    {
      id: 2,
      date: '2025-12-28',
      lounge: 'The Pier Business Class Lounge',
      terminal: 'Terminal 1',
      checkIn: '10:15',
      checkOut: '13:00',
      duration: '2h 45m',
      flight: 'CX 250 to Tokyo',
      services: ['Buffet', 'Business Center', 'Bar'],
      pointsEarned: 95,
      rating: 4
    },
    {
      id: 3,
      date: '2025-12-15',
      lounge: 'The Cabin Lounge',
      terminal: 'Terminal 1',
      checkIn: '16:45',
      checkOut: '18:15',
      duration: '1h 30m',
      flight: 'CX 505 to Singapore',
      services: ['Noodle Bar', 'WiFi', 'Shower'],
      pointsEarned: 60,
      rating: 5
    },
    {
      id: 4,
      date: '2025-12-08',
      lounge: 'The Arrival Lounge',
      terminal: 'Terminal 1',
      checkIn: '08:30',
      checkOut: '10:40',
      duration: '2h 10m',
      flight: 'CX 270 from Seoul',
      services: ['Breakfast', 'Shower', 'Barista'],
      pointsEarned: 85,
      rating: 5
    },
    {
      id: 5,
      date: '2025-11-22',
      lounge: 'The Wing First Class Lounge',
      terminal: 'Terminal 1',
      checkIn: '19:00',
      checkOut: '22:30',
      duration: '3h 30m',
      flight: 'CX 251 to New York',
      services: ['Fine Dining', 'Spa Treatment', 'Meeting Room'],
      pointsEarned: 125,
      rating: 5
    },
    {
      id: 6,
      date: '2025-11-10',
      lounge: 'The Pier First Class Lounge',
      terminal: 'Terminal 1',
      checkIn: '13:20',
      checkOut: '16:45',
      duration: '3h 25m',
      flight: 'CX 889 to Paris',
      services: ['À la carte Dining', 'Wine Cellar', 'Day Bed'],
      pointsEarned: 130,
      rating: 5
    },
    {
      id: 7,
      date: '2025-10-28',
      lounge: 'The Cabin Lounge',
      terminal: 'Terminal 1',
      checkIn: '11:00',
      checkOut: '12:45',
      duration: '1h 45m',
      flight: 'CX 420 to Bangkok',
      services: ['Buffet', 'Coffee Bar'],
      pointsEarned: 65,
      rating: 4
    },
    {
      id: 8,
      date: '2025-10-15',
      lounge: 'The Pier Business Class Lounge',
      terminal: 'Terminal 1',
      checkIn: '06:30',
      checkOut: '09:15',
      duration: '2h 45m',
      flight: 'CX 367 to Sydney',
      services: ['Breakfast Buffet', 'Shower', 'Business Center'],
      pointsEarned: 95,
      rating: 5
    }
  ];

  const monthlyVisits = [
    { month: 'Jul', visits: 3 },
    { month: 'Aug', visits: 5 },
    { month: 'Sep', visits: 4 },
    { month: 'Oct', visits: 2 },
    { month: 'Nov', visits: 2 },
    { month: 'Dec', visits: 3 },
    { month: 'Jan', visits: 1 }
  ];

  const loungeDistribution = [
    { name: 'The Wing', value: 15, color: '#8b5cf6' },
    { name: 'The Pier', value: 12, color: '#14b8a6' },
    { name: 'The Cabin', value: 10, color: '#3b82f6' },
    { name: 'The Arrival', value: 10, color: '#a855f7' }
  ];

  const stats = {
    totalVisits: visits.length,
    totalHours: visits.reduce((acc, v) => {
      const hours = parseFloat(v.duration.split('h')[0]);
      const mins = parseFloat(v.duration.split('h')[1]) / 60;
      return acc + hours + mins;
    }, 0),
    totalPoints: visits.reduce((acc, v) => acc + v.pointsEarned, 0),
    avgRating: (visits.reduce((acc, v) => acc + v.rating, 0) / visits.length).toFixed(1),
    favoriteLounge: 'The Wing First Class Lounge'
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.lounge.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.flight.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || visit.date.startsWith(filterYear);
    return matchesSearch && matchesYear;
  });

  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  const tagStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(231,230,221,0.6)',
    border: `1px solid ${colors.cardItemBorder}`,
    color: colors.textSecondary,
  };

  const axisColor = isDark ? '#6b7280' : 'rgb(130,129,118)';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.4)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            Visit History
          </h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>
            Track your lounge visits and earned rewards.
          </p>
        </div>
        <button
          className="px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition-all flex items-center gap-2"
          style={{
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
            border: `1px solid ${colors.glassBorder}`,
            color: colors.text,
          }}
        >
          <Download className="w-5 h-5" />
          Export History
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { icon: <Calendar className="w-5 h-5 text-purple-500" />, label: 'Total Visits', value: stats.totalVisits },
          { icon: <Clock className="w-5 h-5 text-teal-500" />, label: 'Total Hours', value: stats.totalHours.toFixed(0) },
          { icon: <Award className="w-5 h-5 text-blue-500" />, label: 'Points Earned', value: stats.totalPoints },
          { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Avg. Rating', value: stats.avgRating },
          { icon: <MapPin className="w-5 h-5 text-purple-500" />, label: 'Favorite', value: 'The Wing', small: true },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl p-6" style={glassStyle}>
            <div className="flex items-center gap-3 mb-2">
              {stat.icon}
              <p className="text-sm" style={{ color: colors.textSecondary }}>{stat.label}</p>
            </div>
            <p className={stat.small ? 'text-sm font-semibold' : 'text-3xl'} style={{ color: colors.text }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Visits Trend */}
        <div className="rounded-2xl p-6" style={glassStyle}>
          <h2 className="text-xl flex items-center gap-2 mb-4" style={{ color: colors.text }}>
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Monthly Visit Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="rgb(220,181,21)"
                strokeWidth={3}
                dot={{ fill: 'rgb(220,181,21)', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lounge Distribution */}
        <div className="rounded-2xl p-6" style={glassStyle}>
          <h2 className="text-xl flex items-center gap-2 mb-4" style={{ color: colors.text }}>
            <BarChart3 className="w-5 h-5 text-teal-500" />
            Lounge Preferences
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={loungeDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {loungeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="rounded-2xl p-6" style={glassStyle}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
            <input
              type="text"
              placeholder="Search by lounge or flight..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            style={inputStyle}
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Visit History List */}
      <div className="space-y-4">
        {filteredVisits.map((visit) => (
          <div key={visit.id} className="rounded-2xl p-6" style={glassStyle}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: colors.text }}>{visit.lounge}</h3>
                    <p className="text-sm flex items-center gap-2 mt-1" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-4 h-4" />
                      {visit.terminal}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < visit.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Date</p>
                      <p className="text-sm font-medium">{new Date(visit.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Clock className="w-4 h-4 text-teal-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Duration</p>
                      <p className="text-sm font-medium">{visit.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Plane className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Flight</p>
                      <p className="text-sm font-medium">{visit.flight.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Award className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Points</p>
                      <p className="text-sm font-medium text-green-500">+{visit.pointsEarned}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {visit.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs" style={tagStyle}>
                      {service}
                    </span>
                  ))}
                </div>

                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Check-in: {visit.checkIn} • Check-out: {visit.checkOut}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVisits.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={glassStyle}>
          <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-xl mb-2" style={{ color: colors.text }}>No visits found</h3>
          <p style={{ color: colors.textSecondary }}>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
