import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Search, 
  Shield, 
  Zap, 
  Globe, 
  TrendingDown,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one_way'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to search page with parameters
    const params = new URLSearchParams({
      origin: searchForm.origin,
      destination: searchForm.destination,
      departure: searchForm.departureDate,
      passengers: searchForm.passengers.toString(),
      type: searchForm.tripType
    });
    if (searchForm.returnDate) {
      params.set('return', searchForm.returnDate);
    }
    window.location.href = `/flights?${params.toString()}`;
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Price Prediction",
      description: "Our machine learning algorithms predict optimal booking times to save you money."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Region Search",
      description: "VPN integration finds the best prices worldwide by searching from different regions."
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Real-Time Price Tracking",
      description: "Get instant notifications when flight prices drop or rise significantly."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Booking",
      description: "End-to-end encrypted booking process with secure payment processing."
    }
  ];

  const stats = [
    { number: "2M+", label: "Flights Searched" },
    { number: "$500M+", label: "Saved by Users" },
    { number: "50+", label: "Countries Covered" },
    { number: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, NY",
      text: "SkyNinja saved me $300 on my trip to Europe! The price prediction was spot on.",
      rating: 5
    },
    {
      name: "Michael Chen",
      location: "San Francisco, CA",
      text: "The multi-region search feature is incredible. Found flights 40% cheaper than other sites.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      location: "Miami, FL",
      text: "Real-time notifications helped me book at the perfect time. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Flight with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                AI-Powered Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              SkyNinja revolutionizes flight booking with advanced price prediction, 
              multi-region search, and real-time tracking to get you the best deals.
            </p>
            
            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-strong">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <input
                      type="text"
                      placeholder="City or Airport"
                      value={searchForm.origin}
                      onChange={(e) => setSearchForm({...searchForm, origin: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <input
                      type="text"
                      placeholder="City or Airport"
                      value={searchForm.destination}
                      onChange={(e) => setSearchForm({...searchForm, destination: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                    <input
                      type="date"
                      value={searchForm.departureDate}
                      onChange={(e) => setSearchForm({...searchForm, departureDate: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                    <input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value})}
                      className="input"
                      disabled={searchForm.tripType === 'one_way'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                    <select
                      value={searchForm.passengers}
                      onChange={(e) => setSearchForm({...searchForm, passengers: parseInt(e.target.value)})}
                      className="input"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tripType"
                        value="one_way"
                        checked={searchForm.tripType === 'one_way'}
                        onChange={(e) => setSearchForm({...searchForm, tripType: e.target.value, returnDate: ''})}
                        className="mr-2"
                      />
                      One Way
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tripType"
                        value="round_trip"
                        checked={searchForm.tripType === 'round_trip'}
                        onChange={(e) => setSearchForm({...searchForm, tripType: e.target.value})}
                        className="mr-2"
                      />
                      Round Trip
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg flex items-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search Flights</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkyNinja?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge AI technology with global market intelligence 
              to deliver the best flight booking experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SkyNinja Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced system works behind the scenes to find you the best deals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Globally</h3>
              <p className="text-gray-600">
                Our VPN-powered system searches flight prices from multiple regions 
                simultaneously to find the best deals worldwide.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms analyze price patterns and 
                predict the optimal time to book your flight.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Booking</h3>
              <p className="text-gray-600">
                Get personalized recommendations and real-time alerts to book 
                at the perfect moment for maximum savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied travelers who have saved money with SkyNinja.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Save on Your Next Flight?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join SkyNinja today and start finding better flight deals with AI-powered intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/flights"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
            >
              Search Flights Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
