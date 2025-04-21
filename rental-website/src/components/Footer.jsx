import React from 'react';
import { Globe, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
const Footer = () => {
  return (
<footer className="border-t bg-gray-50 border-gray-200">
      <div className="container bg-gray-50 mx-auto px-4 py-8">
        {/* Vehicle Types and Makes */}
       

        {/* Main Footer Navigation */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <h4 className="font-bold mb-3">Turo</h4>
            {['About', 'Team', 'Policies', 'Careers', 'Press', 'OpenRoad'].map((item) => (
              <div key={item} className="text-sm text-gray-600 mb-2">{item}</div>
            ))}
          </div>
          <div>
            <h4 className="font-bold mb-3">Locations</h4>
            {['USA (EN)',  'UK (EN)'].map((location) => (
              <div key={location} className="text-sm text-gray-600 mb-2">{location}</div>
            ))}
          </div>
          <div>
            <h4 className="font-bold mb-3">Explore</h4>
            {['How Turo works', 'Trust & safety',  'Get help'].map((explore) => (
              <div key={explore} className="text-sm text-gray-600 mb-2">{explore}</div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex justify-between items-center border-t pt-6">
          <div className="text-sm text-gray-500">
            ©2025 Turo | <span className="ml-2">Terms</span> | <span className="ml-2">Privacy</span> | <span className="ml-2">Sitemap</span> | <span className="ml-2">Cookie preferences</span> | <span className="ml-2">Do not sell or share my personal Information</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Social Icons */}
            <div className="flex space-x-3">
              <Facebook size={20} className="text-gray-600 hover:text-black" />
              <Twitter size={20} className="text-gray-600 hover:text-black" />
              <Instagram size={20} className="text-gray-600 hover:text-black" />
              <Youtube size={20} className="text-gray-600 hover:text-black" />
            </div>
            {/* Language and App Store Buttons */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <Globe size={16} className="mr-1" /> English
              </div>
              <div className="flex space-x-2">
                <img src="/api/placeholder/120/40" alt="App Store" className="h-10" />
                <img src="/api/placeholder/120/40" alt="Google Play" className="h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
