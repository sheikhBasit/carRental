import { useState, useEffect } from 'react';
import { CheckCircle, User, Bell, Shield, Download, LogOut, CreditCard, Car, Calendar, X } from 'lucide-react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const [cookies] = useCookies(['userId']);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const navigate = useNavigate();

  // Fallback dummy data
  const dummyUserData = {
    name: "Abdul Basit",
    email: "abdul@example.com",
    mobilePhone: "+92 300 1234567",
    verified: true,
    joinDate: "March 2025"
  };

  const dummyBookings = [
    {
      id: "booking1",
      car: "Toyota Corolla",
      dates: "March 15 - March 18, 2025",
      status: "completed",
      carImage: "./assets/toyota.jpg"
    },
    {
      id: "booking2",
      car: "Honda Civic",
      dates: "April 5 - April 10, 2025",
      status: "upcoming",
      carImage: "./assets/honda.jpeg"
    }
  ];

  const dummyCards = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '11/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '5678', expiry: '03/26', isDefault: false }
  ];

  // Profile states
  const [mobileNotifications, setMobileNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [cards, setCards] = useState(dummyCards);
  const [bookings, setBookings] = useState(dummyBookings);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = cookies.userId || "67d338f3f22c60ec8701405a";
        const response = await axios.get(
          `https://car-rental-backend-black.vercel.app/users/${userId}`
        );
        setUserData(response.data);
        
        // Fetch bookings if on bookings tab
        if (activeTab === 'bookings') {
          const bookingsResponse = await axios.get(
            `https://car-rental-backend-black.vercel.app/bookings/userBookings?userId=${userId}&status=all`
          );
          setBookings(bookingsResponse.data || dummyBookings);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("");
        setUserData(dummyUserData);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [cookies.userId, activeTab]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.delete(
        `https://car-rental-backend-black.vercel.app/bookings/${bookingId}`
      );
      setBookings(bookings.filter(b => b.id !== bookingId));
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) {
      try {
        await axios.delete(
          `https://car-rental-backend-black.vercel.app/users/${cookies.userId || "67d338f3f22c60ec8701405a"}`
        );
        // Redirect to home after account deletion
        navigate('/');
      } catch (err) {
        console.error("Error deleting account:", err);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl text-black mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <p>Loading your account information...</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <div>
                <h3 className="font-medium text-xl">{userData?.name || dummyUserData.name}</h3>
                <p className="text-gray-500">Member since {userData?.joinDate || dummyUserData.joinDate}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center">
                <input
                  type="email"
                  value={userData?.email || dummyUserData.email}
                  readOnly
                  className="border border-gray-300 p-2 w-full rounded"
                />
                {userData?.verified && (
                  <div className="flex items-center ml-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="ml-1 text-sm">Verified</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <button className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50 text-white">
                Change Password
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={userData?.mobilePhone || dummyUserData.mobilePhone}
                  readOnly
                  className="border border-gray-300 p-2 w-full rounded mr-2"
                />
                <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-white">
                  Update
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Preferences</label>
              <div className="space-y-2 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={mobileNotifications}
                    onChange={() => setMobileNotifications(!mobileNotifications)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="ml-2">SMS notifications for bookings and reminders</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="ml-2">Email notifications for promotions and updates</span>
                </div>
              </div>
            </div>
            
            <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
              Save Changes
            </button>
          </div>
        );
        
      case 'payment':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
            <div className="space-y-4 mb-6">
              {cards.map(card => (
                <div key={card.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">{card.type} •••• {card.last4}</p>
                      <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {card.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                        Default
                      </span>
                    )}
                    <button 
                      onClick={() => setCards(cards.filter(c => c.id !== card.id))}
                      className="text-sm text-white hover:text-purple-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50">
              Add Payment Method
            </button>
          </div>
        );
        
      case 'bookings':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Rental History</h3>
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-start mb-3">
                    <img 
                      src={booking.carImage} 
                      alt={booking.car}
                      className="w-20 h-16 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{booking.car}</h4>
                          <p className="text-sm text-gray-500">{booking.dates}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      View Details
                    </button>
                    {booking.status === 'upcoming' && (
                      <button 
                        onClick={() => {
                          setBookingToCancel(booking.id);
                          setShowCancelModal(true);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>  
        );
        
      case 'privacy':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Privacy & Data</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Download Your Data</h4>
                <p className="text-gray-600 mb-3">You can download a copy of all information Drive Fleet has about your account and activities.</p>
                <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-white flex items-center">
                  <Download size={16} className="mr-2" />
                  Download My Data
                </button>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium mb-2">Account Deletion</h4>
                <p className="text-gray-600 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4">
            <nav className="space-y-1">
              <p 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-left ${
                  activeTab === 'profile' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={18} className="mr-3" />
                <span>Profile</span>
              </p>
              
              <p 
                onClick={() => setActiveTab('payment')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-left ${
                  activeTab === 'payment' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CreditCard size={18} className="mr-3" />
                <span>Payment Methods</span>
              </p>
              
              <p
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-left ${
                  activeTab === 'bookings' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} className="mr-3" />
                <span>Rental History</span>
              </p>
              
              <p
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-left ${
                  activeTab === 'privacy' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield size={18} className="mr-3" />
                <span>Privacy & Data</span>
              </p>
            </nav>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cancel Booking</h2>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to cancel this booking? A cancellation fee may apply.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button 
                onClick={() => handleCancelBooking(bookingToCancel)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}