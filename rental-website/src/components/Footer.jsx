import React from 'react';
import { Globe, Facebook, Twitter, Instagram, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom'; // or use Next.js Link if using Next.js

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Service', path: '/services' }
      ]
    },
    {
      title: "Locations",
      links: [
        { name: 'Lahore', path: '/locations/lahore' },
        { name: 'Islamabad', path: '/locations/islamabad' },
        { name: 'Karachi', path: '/locations/karachi' }
      ]
    },
    {
      title: "Help",
      links: [
        { name: 'FAQs', path: '/faqs' },
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Terms', path: '/terms' }
      ]
    }
  ];

  // const socialLinks = [
  //   { 
  //     icon: <Facebook size={16} className="text-gray-600 hover:text-blue-600 transition-colors" />, 
  //     url: 'https://facebook.com/drivefleet' 
  //   },
  //   { 
  //     icon: <Twitter size={16} className="text-gray-600 hover:text-blue-400 transition-colors" />, 
  //     url: 'https://twitter.com/drivefleet' 
  //   },
  //   { 
  //     icon: <Instagram size={16} className="text-gray-600 hover:text-pink-600 transition-colors" />, 
  //     url: 'https://instagram.com/drivefleet' 
  //   }
  // ];

  return (
    <footer className="border-t bg-gray-50 border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-black mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6 gap-4">
          <div className="text-sm text-gray-500">
            ©2025 Drive Fleet. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6">
            {/* <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.icon.type.displayName} page`}
                  className="hover:scale-110 transition-transform"
                >
                  {social.icon}
                </a>
              ))}
            </div>
             */}
            <div className="flex items-center">
              <button className="flex items-center text-sm text-gray-600 hover:text-black transition-colors">
                <Globe size={14} className="mr-1" />
                English
                <ChevronDown size={12} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;