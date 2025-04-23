import React from 'react';
import { Globe, Facebook, Twitter, Instagram, ChevronDown } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: ['About Us', 'Contact Us', 'Service']
    },
    {
      title: "Locations",
      links: ['Lahore', 'Islamabad', 'Karachi']
    },
    {
      title: "Help",
      links: ['FAQs', 'How It Works', 'Terms']
    }
  ];

  return (
    <footer className="border-t bg-gray-50 border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-black mb-2">{section.title}</h4>
              <ul className="text-sm text-gray-600">
                {section.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center border-t pt-4">
          <div className="text-sm text-gray-500">
            ©2025 Drive Fleet
          </div>
          
          <div className="flex space-x-4">
            <Facebook size={16} className="text-gray-600" />
            <Twitter size={16} className="text-gray-600" />
            <Instagram size={16} className="text-gray-600" />
            <span className="flex items-center text-sm text-gray-600">
              <Globe size={14} className="mr-1" />English
              <ChevronDown size={12} className="ml-1" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;