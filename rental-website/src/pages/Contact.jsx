import { useState } from 'react';
import { BookmarkIcon, MapPinIcon, DollarSignIcon, XSquareIcon, PlaneIcon, HandIcon, AlertTriangleIcon, UserCircleIcon, PhoneIcon, ClipboardIcon, ShieldIcon, CarIcon } from 'lucide-react';

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState('guests');

  const renderArticleCard = (title, links, icon, articlesCount) => {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          {icon}
          <h2 className="text-2xl font-bold ml-2">{title}</h2>
        </div>
        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="border-b border-indigo-200  pb-4">
              <p href="#" className="text-gray-800 hover:text-indigo-600">{link}</p>
            </div>
          ))}
          {articlesCount && (
            <div className="pt-2">
              <p href="#" className="text-indigo-600 hover:text-indigo-800">Show all {articlesCount} articles</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto text-black px-4 py-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Help Center</h1>
        <p className="text-xl">What can we do for you?</p>
      </div>

      <div className="mb-8 border-b">
        <div className="flex">
          <p 
            className={`px-6 py-3 font-medium ${activeTab === 'guests' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('guests')}
          >
            GUESTS
          </p>
          <p 
            className={`px-6 py-3 font-medium ${activeTab === 'hosts' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('hosts')}
          >
            HOSTS
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 mb-12 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BookmarkIcon className="text-indigo-600 mr-3" />
          Featured Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <p href="#" className="hover:text-indigo-600">Getting started | Guests</p>
          <p href="#" className="hover:text-indigo-600">US airport information | Guests</p>
          <p href="#" className="hover:text-indigo-600">Canada airport information | Guests</p>
          <p href="#" className="hover:text-indigo-600">Resolving problems booking a car</p>
          <p href="#" className="hover:text-indigo-600">Messaging your host</p>
          <p href="#" className="hover:text-indigo-600">Canceling a trip with your host</p>
          <p href="#" className="hover:text-indigo-600">Refunds</p>
          <p href="#" className="hover:text-indigo-600">Promotions and discounts</p>
          <p href="#" className="hover:text-indigo-600">Paying for your trip</p>
          <p href="#" className="hover:text-indigo-600">Adding a driver to a trip</p>
          <p href="#" className="hover:text-indigo-600">Extending a trip</p>
          <p href="#" className="hover:text-indigo-600">Roadside assistance numbers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderArticleCard(
          "Getting started", 
          ["Getting to know Turo | Guests", "Getting started | Guests", "Where Turo operates"], 
          <ClipboardIcon className="text-indigo-600" size={24} />, 
          "14"
        )}
        
        {renderArticleCard(
          "Planning your trip", 
          ["Adding a driver to a trip", "Messaging your host", "Selecting pickup and return"], 
          <MapPinIcon className="text-indigo-600" size={24} />,
          "17"
        )}
        
        {renderArticleCard(
          "Paying for your trip", 
          ["Refunds", "Paying for your trip", "Trip costs"], 
          <DollarSignIcon className="text-indigo-600" size={24} />,
          "25"
        )}
        
        {renderArticleCard(
          "Changing or canceling your trip", 
          ["Canceling a trip with your host", "Canceled trips", "Extending a trip"], 
          <XSquareIcon className="text-indigo-600" size={24} />,
          "10"
        )}
        
        {renderArticleCard(
          "Arranging airport delivery", 
          ["Abilene Regional Airport (ABI) | Guests", "Albuquerque International Sunport (ABQ) | Guests", "Appleton International Airport (ATW) | Guests"], 
          <PlaneIcon className="text-indigo-600" size={24} />,
          "100"
        )}
        
        {renderArticleCard(
          "Understanding guest responsibilities", 
          ["Violation fees | Guests", "Trip photos guide | Guests", "Paying for fuel or EV charging"], 
          <HandIcon className="text-indigo-600" size={24} />,
          "11"
        )}
        
        {renderArticleCard(
          "Managing incidents", 
          ["Reporting a vehicle that's unsafe or unsatisfactory", "Roadside assistance numbers", "Roadside assistance | US guests"], 
          <AlertTriangleIcon className="text-indigo-600" size={24} />,
          "7"
        )}
        
        {renderArticleCard(
          "Managing your account", 
          ["Resolving issues logging in", "Opting in/Opting out of text messages", "Closing your account"], 
          <UserCircleIcon className="text-indigo-600" size={24} />,
          "7"
        )}
        
        {renderArticleCard(
          "Troubleshooting account issues", 
          ["Resolving problems booking a car", "Multiple or linked accounts", "Low auto insurance score"], 
          <PhoneIcon className="text-indigo-600" size={24} />,
          "6"
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderArticleCard(
          "Vehicle use policies", 
          ["No smoking policy | Guests", "Service animal and pet policy | Guests", "Additional usage policy | Guests"], 
          <ClipboardIcon className="text-indigo-600" size={24} />,
          "9"
        )}
        
        {renderArticleCard(
          "Understanding and choosing protection", 
          ["Personal insurance | Guests", "Insurance or coverage via a credit card", "Understanding insurance and your physical damage contract | US guests"], 
          <ShieldIcon className="text-indigo-600" size={24} />,
          "13"
        )}
        
        {renderArticleCard(
          "Managing vehicle damage", 
          ["Reporting damage | Guests", "Damage claim charges | Guests", "Resolving damage directly with your host"], 
          <CarIcon className="text-indigo-600" size={24} />,
          "9"
        )}
      </div>

      <div className="fixed bottom-4 right-4">
        <button className="bg-indigo-600 text-white rounded-full p-4 flex items-center">
          <span className="mr-2">Contact Us</span>
        </button>
      </div>
    </div>
  );
}