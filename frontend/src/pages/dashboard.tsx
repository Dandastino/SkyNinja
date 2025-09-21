import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Plane, 
  Search, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Plus,
  Clock,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  SortAsc
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, this would come from API
  const recentSearches = [
    {
      id: 1,
      origin: 'New York',
      destination: 'London',
      date: '2024-02-15',
      passengers: 2,
      price: 850,
      status: 'completed'
    },
    {
      id: 2,
      origin: 'San Francisco',
      destination: 'Tokyo',
      date: '2024-03-20',
      passengers: 1,
      price: 1200,
      status: 'tracking'
    }
  ];

  const upcomingTrips = [
    {
      id: 1,
      bookingRef: 'SKY123456',
      origin: 'New York',
      destination: 'Paris',
      departure: '2024-02-15T14:30:00Z',
      return: '2024-02-22T16:45:00Z',
      status: 'confirmed',
      price: 950
    }
  ];

  const priceAlerts = [
    {
      id: 1,
      route: 'NYC → LHR',
      currentPrice: 850,
      targetPrice: 750,
      change: -12,
      status: 'active'
    },
    {
      id: 2,
      route: 'SFO → NRT',
      currentPrice: 1200,
      targetPrice: 1000,
      change: -8,
      status: 'active'
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'price_drop',
      title: 'Price Drop Alert! 🎉',
      message: 'Flight to London dropped by $150',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'booking_confirmation',
      title: 'Booking Confirmed! ✈️',
      message: 'Your flight to Paris is confirmed',
      time: '1 day ago',
      unread: false
    }
  ];

  const stats = [
    {
      title: 'Total Savings',
      value: '$2,450',
      change: '+15%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-success-600 bg-success-100'
    },
    {
      title: 'Flights Booked',
      value: '12',
      change: '+3',
      icon: <Plane className="w-6 h-6" />,
      color: 'text-primary-600 bg-primary-100'
    },
    {
      title: 'Price Alerts',
      value: '8',
      change: '+2',
      icon: <Bell className="w-6 h-6" />,
      color: 'text-warning-600 bg-warning-100'
    },
    {
      title: 'Countries Visited',
      value: '15',
      change: '+2',
      icon: <MapPin className="w-6 h-6" />,
      color: 'text-secondary-600 bg-secondary-100'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'trips', label: 'My Trips', icon: <Plane className="w-4 h-4" /> },
    { id: 'searches', label: 'Recent Searches', icon: <Search className="w-4 h-4" /> },
    { id: 'alerts', label: 'Price Alerts', icon: <Bell className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your flights and travel plans.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-success-600 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-soft mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to="/search"
                      className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Search Flights</p>
                        <p className="text-sm text-gray-600">Find your next adventure</p>
                      </div>
                    </Link>
                    
                    <button className="flex items-center p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors">
                      <div className="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center mr-4">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Set Price Alert</p>
                        <p className="text-sm text-gray-600">Get notified of price drops</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors">
                      <div className="w-10 h-10 bg-success-600 rounded-lg flex items-center justify-center mr-4">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Track Flight</p>
                        <p className="text-sm text-gray-600">Monitor existing bookings</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
                    <Link to="/notifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.unread
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trips' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Trips</h3>
                  <button className="btn btn-outline btn-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
                
                {upcomingTrips.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTrips.map((trip) => (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Plane className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{trip.origin} → {trip.destination}</p>
                              <p className="text-sm text-gray-600">Booking: {trip.bookingRef}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${trip.price}</p>
                            <span className="badge badge-success">Confirmed</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Departure</p>
                            <p className="font-medium">{new Date(trip.departure).toLocaleDateString()}</p>
                            <p className="text-gray-600">{new Date(trip.departure).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Return</p>
                            <p className="font-medium">{new Date(trip.return).toLocaleDateString()}</p>
                            <p className="text-gray-600">{new Date(trip.return).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-3">
                          <Link
                            to={`/booking/${trip.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View Details
                          </Link>
                          <button className="btn btn-outline btn-sm">
                            Check-in
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h3>
                    <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                    <Link to="/search" className="btn btn-primary">
                      Search Flights
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'searches' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Searches</h3>
                  <button className="btn btn-outline btn-sm">
                    <SortAsc className="w-4 h-4 mr-2" />
                    Sort
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentSearches.map((search) => (
                    <div key={search.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{search.origin} → {search.destination}</p>
                            <p className="text-sm text-gray-600">
                              {search.passengers} {search.passengers === 1 ? 'passenger' : 'passengers'} • {new Date(search.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${search.price}</p>
                          <span className={`badge ${
                            search.status === 'completed' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {search.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
                  <button className="btn btn-primary btn-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Alert
                  </button>
                </div>
                
                <div className="space-y-4">
                  {priceAlerts.map((alert) => (
                    <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.route}</p>
                          <p className="text-sm text-gray-600">Target: ${alert.targetPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${alert.currentPrice}</p>
                          <p className={`text-sm ${alert.change < 0 ? 'text-success-600' : 'text-accent-600'}`}>
                            {alert.change > 0 ? '+' : ''}{alert.change}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
