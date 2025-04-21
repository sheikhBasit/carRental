import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCookies } from 'react-cookie';
import axios from 'axios';

export default function AccountPage() {
  const [cookies] = useCookies(['userId']);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notification states
  const [mobileNotifications, setMobileNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [manualExpert, setManualExpert] = useState(false);
  const [creditCode, setCreditCode] = useState('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = cookies.userId || "67d338f3f22c60ec8701405a"; // fallback user ID
        const response = await axios.get(
          `https://car-rental-backend-black.vercel.app/users/${userId}`
        );
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [cookies.userId]);
  
  if (loading) {
    return (
      <div className="max-w-5xl text-black mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Account</h1>
        <p>Loading your account information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl text-black mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Account</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Account</h1>
      
      {/* Contact Information Section */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-4">Contact information</h2>
        
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="flex-1">
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wide text-gray-600 mb-1">Email</label>
              <div className="flex items-center">
                <input
                  type="email"
                  value={userData?.email}
                  readOnly
                  className="border border-gray-300 p-2 w-full rounded"
                />
                {userData?.verified && (
                  <div className="flex items-center ml-2 text-purple-600">
                    <CheckCircle size={16} />
                    <span className="ml-1 text-sm">Verified</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wide text-gray-600 mb-1">PASSWORD</label>
              <button className="border  text-white border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
                Update
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wide text-gray-600 mb-1">MOBILE PHONE</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={userData?.mobilePhone || "+1234567890"}
                  readOnly
                  className="border border-gray-300 p-2 w-full rounded mr-2"
                />
                <button className="border text-white border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
                  Update
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wide text-gray-600 mb-1">MOBILE NOTIFICATIONS</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={mobileNotifications}
                  onChange={() => setMobileNotifications(!mobileNotifications)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="ml-2">Enable text message notifications</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wide text-gray-600 mb-1">EMAIL NOTIFICATIONS</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="ml-2">Promotions and announcements</span>
              </div>
            </div>
            
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Save changes
            </button>
          </div>
          
          {/* <div className="md:w-72">
            <div className="border border-gray-300 p-4 rounded">
              <div className="flex items-center">
                <img 
                  src={userData?.profilePic || "/api/placeholder/50/50"} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h3 className="font-medium">{userData?.name || "Abdul Basit"}</h3>
              </div>
              <button className="mt-3 border text-white border-gray-300 px-3 py-1 text-sm rounded w-full">
                Disconnect (Google)
              </button>
            </div>
          </div> */}
        </div>
      </section>
      
      {/* Transmission Section */}
      <section className="border-t border-gray-200 pt-6 mb-10">
        <h2 className="text-lg font-medium mb-4">Transmission</h2>
        <p className="mb-4">Some cars on Turo do not have automatic transmissions. Are you an expert at driving manual transmissions?</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="expert-yes"
              name="manual-expert"
              checked={manualExpert}
              onChange={() => setManualExpert(true)}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="expert-yes" className="ml-2">Yes, I am an expert</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="expert-no"
              name="manual-expert"
              checked={!manualExpert}
              onChange={() => setManualExpert(false)}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="expert-no" className="ml-2">No, I am not an expert</label>
          </div>
        </div>
        
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Save changes
        </button>
      </section>
      
      {/* Approval Status Section */}
      <section className="border-t border-gray-200 pt-6 mb-10">
        <h2 className="text-lg font-medium mb-4">Approval status</h2>
        <p className="mb-2">Before you can drive a Turo car, we need a bit more information.</p>
        {userData?.approvalStatus === "pending" ? (
          <a href="#" className="text-purple-600 hover:underline">Complete your approval</a>
        ) : (
          <div className="text-green-600">✓ Approved to drive</div>
        )}
      </section>
      
      {/* Travel Credit Section */}
      <section className="border-t border-gray-200 pt-6 mb-10">
        <h2 className="text-lg font-medium mb-6">Travel credit</h2>
        
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wide text-gray-600 mb-2">GIFT CARDS</h3>
          <p className="mb-4">Gift cards get added to your travel credit balance and will automatically apply towards your next trip.</p>
          <button className="border  text-white border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
            Redeem
          </button>
        </div>
        
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wide text-gray-600 mb-2">TRAVEL CREDIT CODE</h3>
          <p className="mb-4">Travel credit will automatically apply towards your next trip. Promo codes must be entered at checkout.</p>
          
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Enter code"
              value={creditCode}
              onChange={(e) => setCreditCode(e.target.value)}
              className="border border-gray-300 p-2 rounded mr-2"
            />
            <button className="border text-white border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
              Apply
            </button>
          </div>
        </div>
        
        <p className="mb-6">Balance: ${userData?.travelCredit || 0}</p>
      </section>
      
      {/* Download Account Data Section */}
      <section className="border-t border-gray-200 pt-6 mb-10">
        <h2 className="text-lg font-medium mb-4">Download account data</h2>
        <p className="mb-4">You can download a copy of all information Turo has accumulated throughout your time as a Turo user. You may download your data as often as you'd like.</p>
        <button className="border text-white border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
          Download my data
        </button>
      </section>
      
      {/* Close Account Section */}
      <section className="border-t border-gray-200 pt-6 mb-10">
        <h2 className="text-lg font-medium mb-4">Close account</h2>
        <button className="border text-white border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
          Close my account
        </button>
      </section>
    </div>
  );
}