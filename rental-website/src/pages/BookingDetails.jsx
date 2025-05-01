import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`https://car-rental-backend-black.vercel.app/bookings/getBookingById/${id}`);
        setBooking(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="p-6">
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
          </div>
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
                <img key={index} src={url} alt={`Car ${index + 1}`} className="rounded-lg shadow-md w-full h-48 object-cover" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
