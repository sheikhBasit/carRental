import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Calendar, Users } from 'lucide-react';

const NorthernGuide = () => {
  const navigate = useNavigate();

  const itinerary = [
    {
      day: 1,
      title: "Islamabad to Naran",
      description: "Depart early morning for Naran via the Hazara Motorway. Stop at Balakot for lunch and continue to Naran, arriving by evening.",
      distance: "240 km",
      duration: "6-7 hours",
      highlights: [
        "Kaghan Valley views",
        "Lulusar Lake",
        "Check into hotel in Naran"
      ]
    },
    {
      day: 2,
      title: "Naran to Hunza",
      description: "Early departure via Babusar Top (if open) or the alternative route through Babusar Pass. Arrive in Hunza by late afternoon.",
      distance: "280 km",
      duration: "8-9 hours",
      highlights: [
        "Babusar Pass (4,173m altitude)",
        "Nanga Parbat viewpoint",
        "Arrival in Karimabad"
      ]
    },
    {
      day: 3,
      title: "Hunza Exploration",
      description: "Full day to explore Hunza Valley's key attractions at a relaxed pace.",
      distance: "Local travel",
      duration: "Full day",
      highlights: [
        "Baltit Fort",
        "Attabad Lake",
        "Passu Cones",
        "Local cuisine tasting"
      ]
    }
  ];

  return (
    <div className="max-w-4xl text-black mx-auto px-4 py-8">
  
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Northern Pakistan Road Trip Guide</h1>
        <p className="text-xl mb-4">Complete itinerary for your journey through Gilgit-Baltistan and Khyber Pakhtunkhwa</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
            <Clock className="mr-1" size={16} />
            <span>7-10 days recommended</span>
          </div>
          <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
            <MapPin className="mr-1" size={16} />
            <span>1,200+ km</span>
          </div>
          <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
            <Users className="mr-1" size={16} />
            <span>Best for: Adventure seekers</span>
          </div>
        </div>

        <img 
          src="./assets/northern.jpeg" 
          alt="Northern Pakistan landscape"
          className="w-full h-96 object-cover rounded-xl mb-6"
        />
      </div>

      <div className="mb-12 ">
        <h2 className="text-2xl font-bold mb-4">Recommended Itinerary</h2>
        <div className="space-y-8">
          {itinerary.map((day) => (
            <div key={day.day} className="border-l-4 border-purple-500 pl-6 py-2">
              <div className="flex items-center mb-2">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {day.day}
                </div>
                <h3 className="text-xl font-semibold">{day.title}</h3>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="mr-1" size={16} />
                <span className="mr-4">{day.distance}</span>
                <Clock className="mr-1" size={16} />
                <span>{day.duration}</span>
              </div>
              <p className="mb-3">{day.description}</p>
              <div>
                <h4 className="font-medium mb-2">Highlights:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {day.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-purple-50 p-6 rounded-xl">
          <h3 className="font-bold mb-3">Best Vehicles for This Route</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>4x4 SUVs (Toyota Fortuner, Land Cruiser)</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>High-clearance vehicles (recommended for Babusar Pass)</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>Comfortable sedans (for main routes only)</span>
            </li>
          </ul>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl">
          <h3 className="font-bold mb-3">Essential Tips</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>Check road conditions (Babusar Pass seasonal closures)</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>Carry extra fuel between major towns</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
              <span>Book accommodations in advance during peak season</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => navigate('/book')}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Book Your Adventure Vehicle
        </button>
      </div>
    </div>
  );
};

export default NorthernGuide;