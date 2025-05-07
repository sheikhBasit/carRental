import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthToken, getCompanyFromCookies } from '../../utils/auth'; // adjust path if needed

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://car-rental-backend-black.vercel.app/api/bookings/getBookingById/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setBooking(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const confirmHandover = async () => {
    if (!booking?._id) return;
    
    setIsConfirming(true);
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `https://car-rental-backend-black.vercel.app/api/bookings/updateBooking/${booking._id}`,
        {
          status: 'ongoing',
          handoverAt: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setBooking(response.data);
      alert('Handover confirmed successfully! The rental period has now started.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm handover');
    } finally {
      setIsConfirming(false);
    }
  };

  // Loader component
  const Loader = () => (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (loading) return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <Loader />
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <div className="bg-white rounded-lg shadow p-6 text-red-500">
        Error: {error}
      </div>
    </div>
  );

  if (!booking) return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        Booking not found
      </div>
    </div>
  );

  const canConfirmHandover = booking.status === 'confirmed' && 
                            booking.fromTime && 
                            new Date(booking.fromTime) < new Date();

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Booking Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-medium">{booking._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{booking.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">From Date & Time</p>
              <p className="font-medium">{booking.from} at {booking.fromTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To Date & Time</p>
              <p className="font-medium">{booking.to} at {booking.toTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Intercity Booking</p>
              <p className="font-medium">{booking.intercity ? 'Yes' : 'No'}</p>
            </div>
            {booking.handoverAt && (
              <div>
                <p className="text-sm text-gray-500">Handover At</p>
                <p className="font-medium">{new Date(booking.handoverAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Handover Confirmation Button */}
          {canConfirmHandover && (
            <div className="mt-6">
              <button
                onClick={confirmHandover}
                disabled={isConfirming}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${isConfirming ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isConfirming ? 'Confirming...' : 'Confirm Vehicle Handover'}
              </button>
            </div>
          )}
        </div>

        {/* User & Vehicle Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">User & Vehicle Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">User</p>
              <p className="font-medium">{booking.user?.name}</p>
              <p className="text-sm text-gray-500">{booking.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehicle</p>
              <p className="font-medium">{booking.vehicle?.manufacturer} {booking.vehicle?.model}</p>
              <p className="text-sm text-gray-500">Plate: {booking.vehicle?.numberPlate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent</p>
              <p className="font-medium">Rs. {booking.vehicle?.rent}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transmission</p>
              <p className="font-medium">{booking.vehicle?.transmission}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium">{booking.vehicle?.capacity} persons</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{booking.vehicle?.cities?.[0]?.name}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Images */}
        {booking.vehicle?.carImageUrls?.length > 0 && (
          <div className="col-span-1 lg:col-span-2 mt-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {booking.vehicle.carImageUrls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Car ${index + 1}`} 
                  className="rounded-lg shadow-md w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;