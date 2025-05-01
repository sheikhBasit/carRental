import React from 'react';
import { Car, Users, DollarSign, Clock, MapPin, Calendar, ChevronRight } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';
import { useNavigate } from 'react-router-dom';

const KPICard = ({ icon: Icon, value, title, color, progress }) => (
  <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Icon size={36} className={`text-${color}-600`} />
      <span className={`text-3xl font-bold text-${color}-600`}>
        {value}
      </span>
    </div>
    <div>
      <p className="text-black text-gray-600">{title}</p>
      <div className="mt-2 h-2 bg-gray-200 rounded-full">
        <div 
          className={`h-2 bg-${color}-600 rounded-full`} 
          style={{width: `${progress}%`}}
        ></div>
      </div>
    </div>
  </div>
);

const Overview = ({ dashboardData, loading, error }) => {
  const { stats, bookings } = dashboardData;
  const navigate = useNavigate();
  
  if (loading) {
    return <LoadingIndicator />;
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date);
    const dateB = new Date(b.createdAt || b.date);
    return dateB - dateA;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBookingClick = (booking) => {
    navigate(`/bookings/${booking._id}`);
  };

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard 
          icon={Car} 
          value={stats.totalVehicles} 
          title="Total Vehicles" 
          color="blue" 
          progress={(stats.totalVehicles > 0 ? (stats.totalVehicles / stats.totalVehicles) * 100 : 0)} 
        />
        
        <KPICard 
          icon={Users} 
          value={stats.totalDrivers} 
          title="Total Drivers" 
          color="green" 
          progress={80} 
        />
        
        <KPICard 
          icon={DollarSign} 
          value={`PKR:${stats.revenue.toLocaleString()}`} 
          title="Total Revenue" 
          color="purple" 
          progress={stats.occupancyRate} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
            <button 
              onClick={() => navigate('/bookings')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Bookings
            </button>
          </div>
          
          <div className="space-y-4">
            {sortedBookings.slice(0, 5).map((booking) => (
              <div 
                key={booking._id} 
                className="border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleBookingClick(booking)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.idVehicle?.manufacturer || 'N/A'} {booking.idVehicle?.model || ''}
                        </h4>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <div className="bg-gray-50 p-1.5 rounded-full">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.user?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="bg-gray-50 p-1.5 rounded-full">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Route</p>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.from} → {booking.to}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Booking ID: {booking._id.substring(0, 8)}...
                    </p>
                    <button 
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookingClick(booking);
                      }}
                    >
                      View details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;