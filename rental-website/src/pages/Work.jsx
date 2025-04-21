import React from "react";
import { CheckCircle, X, Plane, User, Shield, ChevronLeft, ChevronRight, ChevronDown, Handshake, Lock, Smartphone } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function DriveFleetHomepage() {
     const navigate = useNavigate();
    
      const carMakes = [
        { name: 'Toyota', image: './assets/toyotasuv.jpeg' },
        { name: 'Audi', image: './assets/signup.jpg' },
        { name: 'Jaguar', image: './assets/toyotasuv.jpeg' },
        { name: 'Jeep', image: './assets/login.jpg' },
        { name: 'Ford', image: './assets/login.jpg' }
      ];
    
    const handleMakeClick = (make) => {
        navigate(`/car-rental/${make.name.toLowerCase()}`, { 
          state: { brandName: make.name } 
        });
      };
    return (
    <div className="max-w-6xl mx-auto px-4 font-sans">
      {/* How Drive Fleet Works Section */}
      <div className="flex text-black flex-col md:flex-row items-center justify-between py-12 gap-8">
        <div className="w-full md:w-1/2">
          <img 
            src="./assets/login.jpg" 
            alt="Person looking at Drive Fleet app near car" 
            className="rounded-lg w-full"
          />
        </div>
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">How Drive Fleet works</h1>
          <p className="text-lg text-gray-700">Skip the rental car counter and rent just about any car, just about anywhere</p>
          <button className="bg-black text-white px-6 py-3 rounded-md font-medium">Find the perfect car</button>
        </div>
      </div>

      {/* Drive Fleet vs. Car Rental Comparison */}
      <div className="bg-gray-50 p-8  text-black rounded-lg my-12">
        <h2 className="text-3xl font-bold text-center mb-8">Drive Fleet vs. car rental</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Drive Fleet</h3>
            <div className="space-y-3">
              {[
                "App-based experience",
                "No waiting in line",
                "1,600+ unique makes & models",
                "Get the exact car you choose",
                "Delivery options & thousands of pickup locations",
                "Cars shared by local small businesses",
                "Vehicles and hosts rated by guests"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 h-5 w-5 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-black">
            <h3 className="text-xl font-medium">Car rental</h3>
            <div className="space-y-3">
              {[
                "Standard rental counter experience",
                "Waiting in line",
                "Limited car selection",
                "Get one type of car \"or similar\"",
                "Pickup at retail locations",
                "Cars owned by large corporations",
                "No vehicle ratings"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <X className="text-red-500 h-5 w-5 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How to Book Section */}
      <div className="my-12 text-black">
        <h2 className="text-3xl font-bold text-center mb-8">How to book a car</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-amber-50 p-4 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-4">
              <img src="./assets/carIll.png" alt="Find car illustration" className="h-20 w-20" />
            </div>
            <h3 className="text-xl font-medium mb-2">1. Find the perfect car</h3>
            <p className="text-gray-700">Just enter where and when you need a car, filter to find the best one for you, and read reviews from previous renters.</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-50 p-4 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-4">
              <img src="./assets/pickup.png" alt="Pickup location illustration" className="h-20 w-20" />
            </div>
            <h3 className="text-xl font-medium mb-2">2. Select a pickup location</h3>
            <p className="text-gray-700">Grab a car nearby or get one delivered to various destinations, including many airports, train stations, hotels, or maybe even your home.</p>
            <a href="#" className="text-indigo-600 font-medium">More about pickup & dropoff</a>
          </div>
          <div className="text-center">
            <div className="bg-amber-50 p-4 rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-4">
              <img src="./assets/hitR.png" alt="Car illustration" className="h-20 w-20" />
            </div>
            <h3 className="text-xl font-medium mb-2">3. Rent & hit the road</h3>
            <p className="text-gray-700">Your host sends you pickup details, and you're all set! If you have questions, you can easily chat with your host or contact support.</p>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-black text-white px-6 py-3 rounded-md font-medium">Browse cars</button>
        </div>
      </div>

      {/* Why Choose Drive Fleet */}
      <div className="bg-purple-50 p-8 text-black rounded-lg my-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why choose Drive Fleet?</h2>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 flex-shrink-0">
              <Plane className="w-16 h-16 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-1">Enjoy a streamlined airport experience</h3>
              <p className="text-gray-700">100+ airports across the US and Canada let Drive Fleet hosts bring cars to airport parking lots and garages. Some smaller airports even allow curbside pickup at the terminal.*</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 flex-shrink-0 bg-indigo-100 rounded-full flex justify-center items-center">
              <User className="w-10 h-10 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-1">Get personalized service from a local host</h3>
              <p className="text-gray-700">Drive Fleet hosts are everyday entrepreneurs who share cars in their communities.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 flex-shrink-0 bg-indigo-100 rounded-full flex justify-center items-center">
              <Shield className="w-10 h-10 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-1">Relax with support & damage protection</h3>
              <p className="text-gray-700">24/7 support and roadside assistance mean help is just a call away, plus you can choose from a range of protection plans.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-black text-white px-6 py-3 rounded-md font-medium">Find the perfect car</button>
        </div>
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div key={dot} className={`h-2 w-2 rounded-full ${dot === 3 ? 'bg-indigo-500' : 'bg-indigo-200'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Pickup & Dropoff Section */}
      <div className="my-12 text-black">
        <h2 className="text-3xl font-bold text-center mb-8">How pickup & drop-off work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <img 
              src="./assets/signup.jpg" 
              alt="Car key handoff" 
              className="rounded-lg h-100 w-full"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Every time you rent a car on Drive Fleet, you'll:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="bg-gray-200 text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">•</span>
                <span> Receive pickup and drop-off instructions from your host once you book</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-gray-200 text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">•</span>
                <span>Check in, check out, and chat with your host through the Drive Fleet app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-gray-200 text-gray-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">•</span>
                <span>  Upload your driver's license or show it to your host in person</span>
              </li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl  font-bold text-center mb-4">Multiple pickup & drop-off options</h3>
        <p className="text-center text-gray-700 mb-8">Some hosts meet guests in person, while others opt for remote handoffs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Handshake className="h-12 w-12 text-indigo-500" />
            </div>
            <h4 className="text-lg font-medium mb-2">In person</h4>
            <p className="text-gray-700">Your host meets you at your chosen pickup location and hands you the keys.</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-indigo-500" />
            </div>
            <h4 className="text-lg font-medium mb-2">With a lockbox</h4>
            <p className="text-gray-700">Your host sends you a lockbox code, then you unlock the box to get the key.</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-12 w-12 text-indigo-500" />
            </div>
            <h4 className="text-lg font-medium mb-2">With an app</h4>
            <p className="text-gray-700">Your host unlocks the car remotely with their car manufacturer's app.</p>
          </div>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="p-8 text-black">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Browse by make</h2>
                  <div className="flex space-x-2">
                    <ChevronLeft size={24} className="text-gray-400" />
                    <ChevronRight size={24} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex space-x-4 overflow-x-auto">
                  {carMakes.map((make) => (
                    <div 
                      key={make.name} 
                      className="text-center flex-shrink-0 w-[250px] cursor-pointer"
                      onClick={() => handleMakeClick(make)}
                    >
                      <img 
                        src={make.image} 
                        alt={make.name} 
                        className="w-full h-[170px] object-cover rounded-lg mb-2" 
                      />
                      <p className="text-center">{make.name}</p>
                    </div>
                  ))}
                </div>
              </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-3xl font-bold  text-black text-center mb-8">
          <span className="bg-purple-100 px-4 py-1 rounded">Frequently asked questions</span>
        </h2>
        <div className="space-y-4">
          {[
            "Where is Drive Fleet available?",
            "What do I need to book a car on Drive Fleet?",
            "Do I need my own insurance?",
            "Can other people drive a car that I booked?",
            "What is the cancellation policy on Drive Fleet?",
            "What happens if I have an emergency or issue with the car?",
            "Can I get my car delivered to me?",
            "How do I get discounts when booking a car?"
          ].map((question, i) => (
            <div key={i} className="border-b border-gray-200 py-4">
              <button className="flex justify-between items-center w-full text-left">
                <span className="text-lg font-medium">{question}</span>
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}