import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, ChevronDown, FileText, 
  Check, X, Filter, Calendar, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bookings = ({ bookings, vehicles }) => {
  const [transactionPrices, setTransactionPrices] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const navigate = useNavigate();
  
  if (!bookings) {
    console.warn("Bookings prop is undefined or null");
    return <div>Loading bookings...</div>;
  }

  if (!vehicles) {
    console.log("Vehicles prop is undefined or null");
    return <div>Loading vehicle data...</div>;
  }

  useEffect(() => {
    // Fetch transaction prices for all bookings
    const fetchTransactionPrices = async () => {
      const prices = {};
      
      for (const booking of bookings) {
        try {
          const response = await fetch(`https://car-rental-backend-black.vercel.app/api/transaction/booking/${booking._id}`);
          const data = await response.json();
          
          if (data.success && data.transaction) {
            prices[booking._id] = data.transaction.amount;
          }
        } catch (error) {
          console.error(`Failed to fetch transaction for booking ${booking._id}:`, error);
        }
      }
      
      setTransactionPrices(prices);
    };

    fetchTransactionPrices();
  }, [bookings]);

  // Apply filters whenever filters or transaction prices change
  useEffect(() => {
    applyFilters();
  }, [filters, transactionPrices, bookings]);

  const applyFilters = () => {
    let result = [...bookings];
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(booking => booking.status === filters.status);
    }
    
    // Filter by start date
    if (filters.startDate) {
      const startDateObj = new Date(filters.startDate);
      result = result.filter(booking => new Date(booking.from) >= startDateObj);
    }
    
    // Filter by end date
    if (filters.endDate) {
      const endDateObj = new Date(filters.endDate);
      result = result.filter(booking => new Date(booking.to) <= endDateObj);
    }
    
    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      result = result.filter(booking => {
        const vehicle = booking.vehicle || vehicles.find(v => v._id === booking.idVehicle || v._id === booking.vehicleId);
        const priceFromTransaction = transactionPrices[booking._id];
        const calculatedPrice = vehicle?.rent && 
                             Math.ceil(
                               (new Date(booking.to) - new Date(booking.from)) / (1000 * 60 * 60 * 24)
                             ) * vehicle.rent;
        const totalPrice = priceFromTransaction || booking.totalPrice || calculatedPrice || 0;
        
        // Apply min price filter if set
        if (filters.minPrice && totalPrice < parseFloat(filters.minPrice)) {
          return false;
        }
        
        // Apply max price filter if set
        if (filters.maxPrice && totalPrice > parseFloat(filters.maxPrice)) {
          return false;
        }
        
        return true;
      });
    }
    
    setFilteredBookings(result);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingClick = (booking) => {
    navigate(`/bookings/${booking._id}`);
  };
  
  const handleCompleteBooking = async (bookingId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [bookingId]: { complete: true } }));
      
      const response = await fetch(`https://car-rental-backend-black.vercel.app/api/bookings/completeBooking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // If using cookies
      });
  
      if (!response.ok) {
        throw new Error('Failed to complete booking');
      }
  
      // Handle success - you might want to refresh the bookings
      console.log(`Booking ${bookingId} completed successfully`);
      window.location.reload(); // Temporary solution until you implement proper state management
  
    } catch (error) {
      console.error(`Error completing booking ${bookingId}:`, error);
      alert('Failed to complete booking. Please try again.'); // User feedback
    } finally {
      setLoadingStates(prev => ({ ...prev, [bookingId]: { complete: false } }));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [bookingId]: { cancel: true } }));
      
      const response = await fetch(`https://car-rental-backend-black.vercel.app/api/bookings/cancelBooking/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh bookings or update state as needed
      console.log(`Booking ${bookingId} cancelled successfully`);
      // You might want to add a refresh mechanism here
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [bookingId]: { cancel: false } }));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Booking Management</h2>
        <div className="flex space-x-2">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh Bookings
          </button>
          <div className="relative">
            <button
              className="bg-gray-200 text-white px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-gray-50 p-4 mb-6 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (From)</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (To)</label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full border text-black border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (Rs.)</label>
              <div className="relative">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <DollarSign size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (Rs.)</label>
              <div className="relative">
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full text-black border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <DollarSign size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                status: 'all',
                startDate: '',
                endDate: '',
                minPrice: '',
                maxPrice: ''
              })}
              className="mr-2 bg-gray-200 text-white px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
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
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => {
              
              const vehicle = booking.vehicle || vehicles.find(v => v._id === booking.idVehicle || v._id === booking.vehicleId);
              const priceFromTransaction = transactionPrices[booking._id];
              const calculatedPrice = vehicle?.rent && 
                                   Math.ceil(
                                     (new Date(booking.to) - new Date(booking.from)) / (1000 * 60 * 60 * 24)
                                   ) * vehicle.rent;
              const totalPrice = priceFromTransaction || booking.totalPrice || calculatedPrice;
              const isLoadingComplete = loadingStates[booking._id]?.complete;
              const isLoadingCancel = loadingStates[booking._id]?.cancel;

              return (
                <tr key={booking._id} className="border-b text-black hover:bg-gray-50">
                  <td className="p-3 font-medium">#{booking._id.slice(-6)}</td>
                  <td className="p-3">
                    {vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : 'Unknown Vehicle'}
                    {vehicle?.numberPlate && ` (${vehicle.numberPlate})`}
                  </td>
                  <td className="p-3">
                    {booking.user?.name || booking.customerName || 'Unknown Customer'}
                  </td>
                  <td className="p-3">
                    {new Date(booking.from).toLocaleDateString()} {booking.fromTime && `at ${booking.fromTime}`}
                  </td>
                  <td className="p-3">
                    {new Date(booking.to).toLocaleDateString()} {booking.toTime && `at ${booking.toTime}`}
                  </td>
                  <td className="p-3">Rs. {totalPrice?.toLocaleString() || '0'}</td>
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
                      onClick={() => handleBookingClick(booking)}
                    >
                      <FileText size={20} />
                    </button>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Complete Booking"
                          onClick={() => handleCompleteBooking(booking._id)}
                          disabled={isLoadingComplete}
                        >
                          {isLoadingComplete ? '...' : <Check size={20} />}
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Cancel Booking"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={isLoadingCancel}
                        >
                          {isLoadingCancel ? '...' : <X size={20} />}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No bookings match your filter criteria. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredBookings.length > 0 && (
        <div className="mt-4 text-gray-500 text-sm">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      )}
    </div>
  );
};

export default Bookings;