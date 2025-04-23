import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Shield, CreditCard } from 'lucide-react';

const RentalFleetCars = () => {
  const navigate = useNavigate();

  const rentalCars = [
    {
      id: 1,
      title: "Suzuki Alto",
      category: "Economy",
      price: "4,500/day",
      description: "Our most affordable option with great fuel efficiency.",
      image: "./assets/suzuki.jpeg",
      features: [
        "5 seats",
        "Manual transmission",
        "Air conditioning",
        "45 liters/tank"
      ]
    },
    {
      id: 2,
      title: "Toyota Corolla",
      category: "Standard",
      price: "7,500/day",
      description: "Popular mid-size sedan with balanced comfort and economy.",
      image: "./assets/toyota.jpg",
      features: [
        "5 seats",
        "Automatic transmission",
        "Bluetooth audio",
        "55 liters/tank"
      ]
    },
    {
      id: 3,
      title: "Toyota Fortuner",
      category: "SUV",
      price: "15,000/day",
      description: "Premium SUV with power and comfort for any terrain.",
      image: "./assets/toyotasuv.jpeg",
      features: [
        "7 seats",
        "4x4 drive",
        "Leather seats",
        "80 liters/tank"
      ]
    }
  ];

  return (
    <div className="max-w-7xl text-black mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Our Fleet</h1>
      <p className="text-xl mb-8">Quality vehicles for rent at competitive rates</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rentalCars.map((car) => (
          <div key={car.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={car.image} 
              alt={car.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{car.title}</h2>
              <div className="flex items-center text-gray-600 mb-3">
                <Car className="mr-1" size={16} />
                <span>{car.category} • Rs. {car.price}</span>
              </div>
              <p className="mb-4">{car.description}</p>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Includes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {car.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => navigate(`/reservations/new?carId=${car.id}`)}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reserve Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-purple-50 p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Rental Process</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <Calendar size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">1. Book Online</h3>
            <p className="text-sm">Select your dates and vehicle</p>
          </div>
          <div>
            <CreditCard size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">2. Confirm & Pay</h3>
            <p className="text-sm">Secure payment processing</p>
          </div>
          <div>
            <Car size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">3. Pick Up</h3>
            <p className="text-sm">At any of our locations</p>
          </div>
          <div>
            <Shield size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold mb-2">4. Drive Safely</h3>
            <p className="text-sm">With 24/7 roadside support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalFleetCars;