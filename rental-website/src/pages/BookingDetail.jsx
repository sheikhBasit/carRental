import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCar, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaBuilding, FaPhone, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getAuthToken } from '../../utils/auth';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [fallbackVehicle, setFallbackVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FEEDBACK & DAMAGE REPORT LOGIC ---
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageDescription, setDamageDescription] = useState("");
  const [damageImages, setDamageImages] = useState([]);
  const [damageUploading, setDamageUploading] = useState(false);

  // --- Delivery/Return Reminder Logic ---
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    if (!booking) return;
    const now = new Date();
    const fromTime = booking.fromTime ? new Date(booking.fromTime) : null;
    const toTime = booking.toTime ? new Date(booking.toTime) : null;
    let reminderMsg = null;
    if (booking.status === 'confirmed' && fromTime) {
      const diff = (fromTime.getTime() - now.getTime()) / (60 * 1000);
      if (diff > 0 && diff <= 30) {
        reminderMsg = `Your vehicle will be delivered at ${fromTime.toLocaleString()}`;
      }
    }
    if (booking.status === 'ongoing' && toTime) {
      const diff = (toTime.getTime() - now.getTime()) / (60 * 1000);
      if (diff > 0 && diff <= 30) {
        reminderMsg = `Your vehicle is due for return at ${toTime.toLocaleString()}`;
      }
      if (diff < 0) {
        reminderMsg = `Your vehicle return is overdue! Please return as soon as possible.`;
      }
    }
    setReminder(reminderMsg);
  }, [booking]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`https://car-rental-backend-black.vercel.app/api/bookings/getBookingById/${bookingId}`,

          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const bookingData = response.data;
        
       
        
        setBooking(bookingData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (booking && booking.status === 'completed') {
      setShowFeedbackForm(true);
    }
  }, [booking]);

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

  const getVehicleStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaCheckCircle /> Available
        </span>;
      case 'unavailable':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaTimesCircle /> Unavailable
        </span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{status}</span>;
    }
  };

  // Get the vehicle to display (either the booking's vehicle or the fallback)
  const displayVehicle = booking?.idVehicle || fallbackVehicle;

  const submitFeedback = async () => {
    try {
      await axios.post('https://car-rental-backend-black.vercel.app/api/feedback', {
        booking: booking._id,
        rating,
        comment
      });
      setShowFeedbackForm(false);
      alert('Feedback submitted!');
    } catch (e) {
      alert('Failed to submit feedback.');
    }
  };

  const submitDamage = async () => {
    setDamageUploading(true);
    try {
      await axios.post('https://car-rental-backend-black.vercel.app/api/damagereport', {
        booking: booking._id,
        description: damageDescription,
        images: damageImages
      });
      setShowDamageForm(false);
      alert('Damage report submitted!');
    } catch (e) {
      alert('Failed to submit damage report.');
    }
    setDamageUploading(false);
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
        {reminder && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 mb-6 rounded">
            <p className="font-semibold">{reminder}</p>
          </div>
        )}
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
            {/* Vehicle Information - Only show if we have a vehicle to display */}
            {displayVehicle && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaCar className="text-purple-600" /> Vehicle Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={displayVehicle.carImageUrls?.[0] || '/default-car.jpg'} 
                      alt={`${displayVehicle.manufacturer} ${displayVehicle.model}`}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{displayVehicle.manufacturer} {displayVehicle.model}</h4>
                      <p className="text-gray-600 text-sm">Year: {displayVehicle.year}</p>
                      <p className="text-gray-600 text-sm">Color: {displayVehicle.color}</p>
                      <p className="text-gray-600 text-sm">Seats: {displayVehicle.capacity}</p>
                      {!booking.idVehicle && (
                        <p className="text-xs text-yellow-600 mt-1">Default vehicle shown as original was not available</p>
                      )}
                      <p className="text-gray-600 text-sm mt-2">Status: {getVehicleStatusBadge(displayVehicle.status)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Daily Rate</p>
                        <p className="font-medium">Rs. {displayVehicle.rent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transmission</p>
                        <p className="font-medium">{displayVehicle.transmission}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fuel Type</p>
                        <p className="font-medium">{displayVehicle.fuelType || 'Diesel'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mileage</p>
                        <p className="font-medium">{displayVehicle.mileage || 'Unlimited'} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buffer Time */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-purple-600" /> Buffer Time
              </h3>
              <p className="text-gray-600">Please note that there is a {booking.bufferTime} hour buffer time before and after the booking period.</p>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaTimesCircle className="text-purple-600" /> Cancellation Policy
              </h3>
              <p className="text-gray-600">Please note that cancellations are only allowed up to {booking.cancellationTime} hours before the booking period.</p>
            </div>

            {/* Terms Acceptance */}
            {booking.status !== 'confirmed' && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-purple-600" /> Terms Acceptance
                </h3>
                <p className="text-gray-600">Please accept the terms and conditions to confirm your booking.</p>
                <button
                  onClick={() => alert('Terms acceptance functionality to be implemented')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Accept Terms
                </button>
              </div>
            )}

            {/* Rest of the booking details remain the same */}
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
                      <span className="text-green-600">Paid</span>
                      
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{booking.paymentMethod || 'Credit Card'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-purple-600" /> Feedback
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <select 
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="block w-full pl-10 p-2 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comment</p>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="block w-full p-2 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <button 
                        onClick={submitFeedback}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Damage Report Form */}
            {showDamageForm && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaTimesCircle className="text-purple-600" /> Damage Report
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <textarea 
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        className="block w-full p-2 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Images</p>
                      <input 
                        type="file"
                        multiple
                        onChange={(e) => setDamageImages(e.target.files)}
                        className="block w-full p-2 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <button 
                        onClick={submitDamage}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        {damageUploading ? 'Uploading...' : 'Submit Damage Report'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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