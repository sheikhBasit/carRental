import React, { useState, useRef, useEffect } from 'react';
import { Menu, Heart, Calendar, Inbox, User, CreditCard, CarFront, HelpCircle, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const SideMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    // Add event listener when menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handler for menu item clicks
  const handleMenuItemClick = (itemText) => {
    switch (itemText) {
      case 'Become a host':
        navigate('/rental-signup');
        break;
      case 'Favorites':
        navigate('/favorites');
        break;
      case 'Trips':
        navigate('/trips');
        break;
      case 'Inbox':
        navigate('/inbox');
        break;
      case 'Account':
        navigate('/account');
        break;
      case 'How Drive Fleet works':
        navigate('/how-it-works');
        break;
      case 'Contact support':
        navigate('/contact');
        break;
      case 'Log out':
        // Handle logout logic here
        console.log('Logging out');
        // Then navigate to home or login page
        navigate('/login');
        break;
      default:
        break;
    }
    onClose(); // Close menu after navigation
  };

  const menuItems = [
    { icon: Heart, text: 'Favorites' },
    { icon: Calendar, text: 'Trips' },
    { icon: Inbox, text: 'Inbox' },
    { icon: User, text: 'Account' },
    { icon: CarFront, text: 'Become a host' },
    { icon: HelpCircle, text: 'How Drive Fleet works' },
    { icon: HelpCircle, text: 'Contact support' },
    { icon: LogOut, text: 'Log out' }
  ];

  return (
    <div
      ref={menuRef}
      className={`fixed inset-y-16 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}
    >
      <div className="py-2 ">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-3 hover:bg-gray-100 text-black cursor-pointer"
            onClick={() => handleMenuItemClick(item.text)}
          >
            <item.icon className="mr-3 text-gray-600" size={20} />
            <span className="text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const goToHome = () => {
    navigate('/');
  };
  
  const goToBecomeHost = () => {
    navigate('/rental-signup');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Drive Fleet Logo - Navigate to Home */}
          <div 
            className="text-2xl font-bold text-black cursor-pointer" 
            onClick={goToHome}
          >
            Drive Fleet
          </div>
          
          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded"
              onClick={goToBecomeHost}
            >
              Become a host
            </button>
            <button
              onClick={toggleMenu}
              className="text-white hover:bg-gray-800 bg-black p-2 rounded"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Sliding Side Menu */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40"
        />
      )}
    </>
  );
};

export default Header;