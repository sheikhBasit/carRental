import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Map, Clock } from 'lucide-react';

const MotorwayGuide = () => {
  const navigate = useNavigate();

  const motorways = [
    {
      name: "M-2 (Islamabad-Lahore)",
      length: "375 km",
      travelTime: "3.5-4 hours",
      tollCost: "Approx. PKR 1,200",
      features: [
        "Rest areas every 50km",
        "24/7 patrol service",
        "Emergency phones every 2km"
      ]
    },
    {
      name: "M-3 (Lahore-Abdul Hakeem)",
      length: "230 km",
      travelTime: "2-2.5 hours",
      tollCost: "Approx. PKR 800",
      features: [
        "Connects to M-4",
        "Multiple service plazas",
        "Heavy truck lane"
      ]
    },
    {
      name: "M-9 (Karachi-Hyderabad)",
      length: "136 km",
      travelTime: "1.5 hours",
      tollCost: "Approx. PKR 600",
      features: [
        "Coastal route",
        "Modern rest stops",
        "Emergency services"
      ]
    }
  ];

  return (
    <div className="max-w-4xl text-black mx-auto px-4 py-8">

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pakistan's Motorway Network Guide</h1>
          <p className="text-gray-600"></p>
        </header>

        <img 
          src="./assets/motorway.jpeg" 
          alt="Pakistan Motorway"
          className="w-full h-96 object-cover rounded-xl mb-8"
        />

        <div className="prose max-w-none">
          <p className="text-xl mb-6">
            Pakistan's expanding motorway network has revolutionized road travel across the country. 
            This guide covers everything you need to know to navigate these modern highways safely and efficiently.
          </p>

          <h2 className="text-2xl font-bold mb-4 mt-8">Major Motorways Overview</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {motorways.map((mw) => (
              <div key={mw.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">{mw.name}</h3>
                <div className="flex items-center text-gray-600 mb-1">
                  <Map className="mr-1" size={16} />
                  <span>{mw.length}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock className="mr-1" size={16} />
                  <span>{mw.travelTime}</span>
                </div>
                <div className="text-gray-600 mb-3">Toll: {mw.tollCost}</div>
                <ul className="list-disc pl-5 space-y-1">
                  {mw.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Motorway Travel Tips</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Before You Go</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your vehicle's condition (especially tires and brakes)</li>
                <li>Ensure you have sufficient fuel (service areas are spaced)</li>
                <li>Carry cash for toll payments (no digital payments yet)</li>
                <li>Download offline maps (cellular coverage can be spotty)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">On the Road</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Observe speed limits (typically 120km/h for cars)</li>
                <li>Use left lane only for overtaking</li>
                <li>Take breaks every 2 hours at service areas</li>
                <li>Keep emergency numbers handy (130 for motorway police)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Drive Fleet Motorway Services</h2>
          <p className="mb-4">
            When you rent with Drive Fleet for motorway travel, you benefit from:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-6">
            <li>24/7 roadside assistance covering all motorways</li>
            <li>Vehicles pre-checked for highway conditions</li>
            <li>Optional E-Tag for seamless toll payments</li>
            <li>Detailed route guides with your booking</li>
          </ul>

          <div className="bg-purple-50 p-6 rounded-xl mb-8">
            <h3 className="font-bold mb-3">Did You Know?</h3>
            <p>
              The M-5 (Multan-Sukkur) is Pakistan's longest motorway at 392km, 
              reducing travel time between Punjab and Sindh by up to 5 hours compared to 
              traditional routes.
            </p>
          </div>
        </div>
      </article>

      
    </div>
  );
};

export default MotorwayGuide;