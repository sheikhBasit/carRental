import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const UserCarRentalsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  // Vehicle image placeholder
  const vehicleImagePlaceholder = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2128&auto=format&fit=crop";
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log("Invalid token format, clearing token");
        localStorage.removeItem('token');
        return null;
      }
      
      return token;
    } catch (error) {
      console.log("Error parsing token:", error);
      localStorage.removeItem('token');
      return null;
    }
  };
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
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'ongoing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'canceled':
        return (
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'ongoing':
        return (
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const viewBookingDetails = (bookingId) => {
    navigate(`/booking-confirmation/${bookingId}`);
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `https://car-rental-backend-black.vercel.app/api/bookings/cancelBooking/${bookingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
  
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(responseText || 'Failed to cancel booking');
      }
  
      const updatedBooking = JSON.parse(responseText).booking;
  
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? updatedBooking : booking
      ));
  
      setActiveTab('canceled');
      
      alert('Booking canceled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel your booking. Please try again later.');
    }
  };

  const isBookingOngoing = (booking) => {
    const now = new Date();
    const fromDate = new Date(`${booking.from}T${booking.fromTime}`);
    const toDate = new Date(`${booking.to}T${booking.toTime}`);
    return now >= fromDate && now <= toDate;
  };

  useEffect(() => {
    const fetchUserBookings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = getUserIdFromCookies();
        const token = getAuthToken();
        
        if (!userId || !token) {
          setError('User not authenticated. Please log in again.');
          setIsLoading(false);
          navigate('/login');
          return;
        }
        
        const response = await fetch(
          `https://car-rental-backend-black.vercel.app/api/bookings/userBookings?userId=${userId}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }

        let data = await response.json();
        
        // Filter based on active tab
        if (activeTab === 'upcoming') {
          data = data.filter(booking => 
            booking.status === 'confirmed' && !isBookingOngoing(booking)
          );
        } else if (activeTab === 'ongoing') {
          data = data.filter(booking => 
            booking.status === 'confirmed' && isBookingOngoing(booking)
          );
        } else if (activeTab === 'previous') {
          data = data.filter(booking => booking.status === 'completed');
        } else if (activeTab === 'canceled') {
          data = data.filter(booking => booking.status === 'canceled');
        }

        // Handle empty array case
        if (data.length === 0) {
          const tabSpecificMessage = {
            upcoming: "No upcoming bookings found",
            ongoing: "No ongoing rentals at the moment",
            previous: "No previous bookings found",
            canceled: "No canceled bookings found"
          };
          setError(tabSpecificMessage[activeTab]);
          setBookings([]);
          return;
        }

        setBookings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError(err.message || 'Failed to load your bookings. Please try again later.');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBookings();
  }, [activeTab, navigate]);

  // Calculate rental duration
  const calculateDuration = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const differenceInTime = end.getTime() - start.getTime();
    // Convert to days and round up
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays > 0 ? differenceInDays : 1; // Minimum 1 day
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header with background */}
          <div className="bg-blue-600 mb-5 py-6 px-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Your Trips</h1>
            <p className="text-blue-100 mt-1"></p>
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'ongoing', label: 'Ongoing' },
                { key: 'previous', label: 'Previous' },
                { key: 'canceled', label: 'canceled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative py-4 px-6 text-center font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {/* Loading state */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 h-48 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 pt-4 md:pt-0 md:pl-6">
                        <div className="h-7 bg-gray-200 rounded w-3/12 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-8/12 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/12 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="h-10 bg-gray-200 rounded"></div>
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error || bookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No {activeTab} rentals</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {error || 
                    (activeTab === 'upcoming' 
                      ? "You don't have any upcoming car rentals." 
                      : activeTab === 'ongoing'
                      ? "You don't have any ongoing rentals at the moment."
                      : activeTab === 'previous'
                      ? "You don't have any previous car rentals."
                      : "You don't have any canceled car rentals.")}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/cars')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Available Cars
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const vehicle = booking.idVehicle;
                  const duration = calculateDuration(booking.from, booking.to);
                  const totalRent = vehicle.rent * duration;
                  const imageUrl = vehicle.carImageUrls && vehicle.carImageUrls.length > 0
                    ? vehicle.carImageUrls[0]
                    : vehicleImagePlaceholder;
                  
                  // Determine if booking is ongoing (for the ongoing tab)
                  const isOngoing = isBookingOngoing(booking);
                  const status = isOngoing ? 'ongoing' : booking.status;
                  
                  return (
                    <div key={booking._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-col md:flex-row">
                        {/* Car Image */}
                        <div className="w-full md:w-1/4 h-48 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`${vehicle.manufacturer} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/api/placeholder/400/300";
                            }}
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <h2 className="text-xl font-bold text-gray-900 capitalize">
                                  {vehicle.manufacturer} {vehicle.model}
                                </h2>
                                <div className={`ml-3 flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
                                  {getStatusIcon(status)}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>
                                    {formatDate(booking.from)} - {formatDate(booking.to)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>
                                    {booking.fromTime} - {booking.toTime}
                                  </span>
                                </div>
                                
                                {booking.cityName && (
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="capitalize">{booking.cityName}</span>
                                  </div>
                                )}
                                
                                {booking.driver && (
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>With Driver</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="flex items-center text-sm text-gray-500">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  <span>{vehicle.capacity} Passengers</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{vehicle.transmission}</span>
                                </div>
                                {booking.company && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span>{booking.company.companyName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-6 md:text-right">
                              <p className="text-lg font-bold text-gray-900">Rs.{totalRent}</p>
                              <p className="text-sm text-gray-500">
                                {vehicle.rent} × {duration} {duration === 1 ? 'day' : 'days'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button
                              onClick={() => viewBookingDetails(booking._id)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>
                            
                            {status === 'confirmed' && (
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="mr-2 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel Booking
                              </button>
                            )}
                            
                            {status === 'ongoing' && (
                              <button
                                onClick={() => navigate(`/extend-booking/${booking._id}`)}
                                className="inline-flex items-center px-4 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <svg className="mr-2 h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Extend Rental
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        {!isLoading && bookings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <h2 className="text-2xl font-bold text-gray-900">{bookings.length}</h2>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Total Spent</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Rs.{bookings.reduce((total, booking) => {
                      const duration = calculateDuration(booking.from, booking.to);
                      return total + (booking.idVehicle.rent * duration);
                    }, 0)}
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm">Rental Days</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {bookings.reduce((total, booking) => {
                      return total + calculateDuration(booking.from, booking.to);
                    }, 0)}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-base font-medium text-gray-900">What is the cancellation policy?</h4>
              <p className="mt-2 text-sm text-gray-600">You can cancel your booking up to 24 hours before your scheduled pickup time for a full refund. Cancellations within 24 hours may be subject to a cancellation fee.</p>
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">Can I modify my booking?</h4>
              <p className="mt-2 text-sm text-gray-600">Yes, you can modify confirmed bookings including changes to dates, times, and adding/removing a driver option. Changes are subject to availability.</p>
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">What documents do I need for pickup?</h4>
              <p className="mt-2 text-sm text-gray-600">Please bring your valid driver's license, a credit card in your name, and a government-issued ID. International renters may require additional documentation.</p>
            </div>
          </div>
        </div>
        
        {/* Need Help */}
        <div className="mt-8 bg-blue-50 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Need Help With Your Booking?</h3>
              <p className="mt-1 text-blue-700">Our customer support team is available 24/7 to assist you.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => navigate('/contact')} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCarRentalsPage;