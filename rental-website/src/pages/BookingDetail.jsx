import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCar, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaBuilding, FaPhone, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await axios.get(`https://car-rental-backend-black.vercel.app/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaCheckCircle /> Confirmed
        </span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaClock /> Pending
        </span>;
      case 'canceled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaTimesCircle /> Canceled
        </span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded max-w-md">
          <p>Booking not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="mt-2 text-gray-600">Here's your booking information</p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Booking Status Header */}
          <div className="bg-purple-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Booking #{booking._id.slice(-8).toUpperCase()}</h2>
            <div className="text-white">
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <div className="p-6">
            {/* Vehicle Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaCar className="text-purple-600" /> Vehicle Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={booking.idVehicle.carImageUrls?.[0] || '/default-car.jpg'} 
                    alt={`${booking.idVehicle.manufacturer} ${booking.idVehicle.model}`}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.idVehicle.manufacturer} {booking.idVehicle.model}</h4>
                    <p className="text-gray-600 text-sm">Year: {booking.idVehicle.year}</p>
                    <p className="text-gray-600 text-sm">Color: {booking.idVehicle.color}</p>
                    <p className="text-gray-600 text-sm">Seats: {booking.idVehicle.capacity}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Daily Rate</p>
                      <p className="font-medium">Rs. {booking.idVehicle.rent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transmission</p>
                      <p className="font-medium">{booking.idVehicle.transmission}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fuel Type</p>
                      <p className="font-medium">{booking.idVehicle.fuelType || 'Diesel'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mileage</p>
                      <p className="font-medium">{booking.idVehicle.mileage || 'Unlimited'} km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-600" /> Booking Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Date</p>
                      <p className="font-medium">
                        {new Date(booking.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaClock className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Time</p>
                      <p className="font-medium">{booking.fromTime}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Return Date</p>
                      <p className="font-medium">
                        {new Date(booking.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaClock className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Return Time</p>
                      <p className="font-medium">{booking.toTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-600" /> Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full mt-1">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pickup Location</p>
                      <p className="font-medium">{booking.from}</p>
                      <p className="text-sm text-gray-500 mt-1">City: {booking.cityName}</p>
                      <p className="text-sm text-gray-500">Trip Type: {booking.intercity ? 'Intercity' : 'Intracity'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full mt-1">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Return Location</p>
                      <p className="font-medium">{booking.to}</p>
                      <p className="text-sm text-gray-500 mt-1">Same as pickup location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-purple-600" /> People Involved
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaUser className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-gray-500">{booking.user.email}</p>
                    </div>
                  </div>
                </div>
                {booking.driver && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <FaUser className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Driver</p>
                        <p className="font-medium">{booking.driver.name}</p>
                        <p className="text-sm text-gray-500">Experience: {booking.driver.experience} years</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaBuilding className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rental Company</p>
                      <p className="font-medium">{booking.company.companyName}</p>
                      <p className="text-sm text-gray-500">
                        <FaPhone className="inline mr-1" /> {booking.company.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-purple-600" /> Payment Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-xl">Rs. {booking.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">
                      {booking.paymentStatus === 'paid' ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{booking.paymentMethod || 'Credit Card'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to Home
              </button>
              {booking.status === 'pending' && (
                <button
                  onClick={() => alert('Cancel booking functionality to be implemented')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => alert('Contact support functionality to be implemented')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Contact Support
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;