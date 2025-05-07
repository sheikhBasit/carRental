import React from 'react';
import { 
  BarChart2, Car, Users, DollarSign, 
  Shield, FileText, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Sidebar = ({ activeSection, setActiveSection, company }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { icon: BarChart2, label: 'Overview', section: 'overview' },
    { icon: Car, label: 'Vehicles', section: 'vehicles' },
    { icon: Users, label: 'Drivers', section: 'drivers' },
    { icon: DollarSign, label: 'Bookings', section: 'bookings' },
  ];

  const handleLogout = () => {
    // Clear company data cookie
    Cookies.remove('company');
    Cookies.remove('companyToken');
    Cookies.remove('token');

    // Navigate to root
    navigate('/');
  };

  return (
    <div className="bg-gray-900 text-white w-64 p-6 space-y-4 flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          {company?.companyName || 'Loading...'}
        </h2>
        <p className="text-gray-400">Company Dashboard</p>
      </div>

      <nav className="space-y-2 flex-grow">
        {navItems.map((item) => (
          <button
            key={item.section}
            onClick={() => setActiveSection(item.section)}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              activeSection === item.section 
                ? 'bg-blue-100 text-white' 
                : 'hover:bg-gray-200 text-gray-300'
            }`}
          >
            <item.icon className="mr-3" size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout button at the bottom */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center p-3 rounded transition-colors hover:bg-gray-200 text-gray-300 mt-auto"
      >
        <LogOut className="mr-3" size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;