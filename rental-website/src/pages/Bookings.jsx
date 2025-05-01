import React from 'react';
import { 
  RefreshCw, ChevronDown, FileText, 
  Check, X 
} from 'lucide-react';

const Bookings = ({ bookings, vehicles }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Booking Management</h2>
        <div className="flex space-x-2">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh Bookings
          </button>
          <div className="relative">
            <button
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center"
            >
              <ChevronDown size={18} className="mr-2" />
              Filter Status
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-black text-left">Booking ID</th>
              <th className="p-3 text-black text-left">Vehicle</th>
              <th className="p-3 text-black text-left">Customer</th>
              <th className="p-3 text-black text-left">Start Date</th>
              <th className="p-3 text-black text-left">End Date</th>
              <th className="p-3 text-black text-left">Total Price</th>
              <th className="p-3 text-black text-left">Status</th>
              <th className="p-3 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const vehicle = vehicles.find(v => v._id === booking.vehicleId);
              
              return (
                <tr key={booking._id} className="border-b text-black hover:bg-gray-50">
                  <td className="p-3 font-medium">#{booking._id.slice(-6)}</td>
                  <td className="p-3">
                    {vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Unknown Vehicle'}
                  </td>
                  <td className="p-3">{booking.customerName || booking.userId?.slice(0, 10) || 'Unknown'}</td>
                  <td className="p-3">{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td className="p-3">Rs. {booking.totalPrice?.toLocaleString() || '0'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'active' ? 'bg-green-100 text-green-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <FileText size={20} />
                    </button>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-800"
                          title="Complete Booking"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          title="Cancel Booking"
                        >
                          <X size={20} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;