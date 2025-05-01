import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const UserTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const getUserIdFromCookies = () => {
    try {
      const userCookie = Cookies.get('user');
      if (!userCookie) return null;
      
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData.id;
    } catch (err) {
      console.error('Error parsing user cookie:', err);
      return null;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewTripDetails = (tripId) => {
    navigate(`/booking-confirmation/${tripId}`);
  };

  const cancelTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    
    try {
      const response = await fetch(
        `https://car-rental-backend-black.vercel.app/bookings/cancelBooking/${tripId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(responseText || 'Failed to cancel trip');
      }
  
      const updatedBooking = JSON.parse(responseText).booking;
  
      setTrips(trips.map(trip => 
        trip._id === tripId ? updatedBooking : trip
      ));
  
      setActiveTab('cancelled');
      
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling trip:', err);
      alert(err.message || 'Failed to cancel your trip. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchUserTrips = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = getUserIdFromCookies();
        
        if (!userId) {
          setError('User not authenticated. Please log in again.');
          setIsLoading(false);
          navigate('/login');
          return;
        }
        
        const statusMapping = {
          upcoming: 'confirmed',
          previous: 'completed',
          cancelled: 'cancelled'
        };

        const response = await fetch(
          `https://car-rental-backend-black.vercel.app/bookings/userBookings?userId=${userId}&status=${statusMapping[activeTab]}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();
        
        // Handle case where response is an object with message property
        if (data && data.message) {
          const tabSpecificMessage = {
            upcoming: "You don't have any upcoming trips",
            previous: "You don't have any previous trips",
            cancelled: "You don't have any cancelled trips"
          };
          setError(data.message || tabSpecificMessage[activeTab]);
          setTrips([]);
          return;
        }

        // Handle case where response is not an array
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }

        // Handle empty array case
        if (data.length === 0) {
          const tabSpecificMessage = {
            upcoming: "No upcoming trips found",
            previous: "No previous trips found",
            cancelled: "No cancelled trips found"
          };
          setError(tabSpecificMessage[activeTab]);
          setTrips([]);
          return;
        }

        setTrips(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
        setError(err.message || 'Failed to load your trips. Please try again later.');
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTrips();
  }, [activeTab, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Trips</h1>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          {['upcoming', 'previous', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-8 w-full max-w-3xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-3/12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-8/12 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/12 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error || trips.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No {activeTab} trips</h3>
          <p className="mt-1 text-gray-500">
            {error || 
              (activeTab === 'upcoming' 
                ? "You don't have any upcoming trips." 
                : activeTab === 'previous'
                ? "You don't have any previous trips."
                : `You don't have any ${activeTab} trips.`)}
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Explore Destinations
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className="text-xl font-bold text-gray-900 mr-3">{trip.propertyName || 'Trip Booking'}</h2>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Check-in:</span> {formatDate(trip.checkInDate)} | 
                      <span className="font-medium ml-2">Check-out:</span> {formatDate(trip.checkOutDate)}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <span className="font-medium">Guests:</span> {trip.guests} | 
                      <span className="font-medium ml-2">Booking ID:</span> {trip._id.slice(-8)}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <p className="text-lg font-bold text-gray-900">Rs.{trip.totalAmount?.toFixed(2) || '5000.00'}</p>
                    <p className="text-sm text-gray-500">Booked on {formatDate(trip.bookingDate)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => viewTripDetails(trip._id)}
                    className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  
                  {trip.status === 'confirmed' && (
                    <button
                      onClick={() => cancelTrip(trip._id)}
                      className="flex-1 bg-white border border-red-300 rounded-md py-2 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Cancel Trip
                    </button>
                  )}
                  
                  {trip.status === 'confirmed' && new Date(trip.checkInDate) > new Date() && (
                    <button
                      onClick={() => navigate(`/trips/${trip._id}/modify`)}
                      className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Modify Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTripsPage;