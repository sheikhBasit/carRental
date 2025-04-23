import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const navigate = useNavigate();

  const carMakes = [
    { name: 'Toyota', image: './assets/toyota.jpg' },
    { name: 'Honda', image: './assets/honda.jpeg' },
    { name: 'Suzuki', image: './assets/suzuki.jpeg' },
    { name: 'Kia', image: './assets/kia.jpeg' },
    { name: 'Hyundai', image: './assets/hyundai.jpeg' },
    { name: 'Changan', image: './assets/changan.jpeg' }
  ];

  const destinations = [
    { name: 'Lahore', icon: './assets/lahore.jpeg' },
    { name: 'Islamabad', icon: './assets/islamabad.jpg' },
    { name: 'Karachi', icon: './assets/karachi.jpeg' },
    { name: 'Faisalabad', icon: './assets/faislabad.jpeg' },
    { name: 'Rawalpindi', icon: './assets/rawalpindi.jpeg' },
    { name: 'Sialkot', icon: './assets/sialkot.jpeg' },
  ];

  const faqItems = [
    { 
      question: 'What do I need to book a car on Drive Fleet?', 
      answer: 'You need a valid CNIC or driver\'s license, must be over 18, and have an account. Payment can be made via JazzCash, Easypaisa, or credit/debit cards.'
    },
    { 
      question: 'Are there any age restrictions for renting?', 
      answer: 'Yes, you must be at least 18 years old with a valid Pakistani driver\'s license to rent a car in Pakistan.'
    },
    { 
      question: 'Can I pay in Pakistani Rupees?', 
      answer: 'Yes, all transactions are in PKR. We accept all major Pakistani payment methods including bank transfers, JazzCash, and Easypaisa.'
    },
    { 
      question: 'Is airport pickup available?', 
      answer: 'Yes, we offer convenient pickup options at all major Pakistani airports including Jinnah International (KHI), Allama Iqbal (LHE), and Islamabad International (ISB).'
    },
    { 
      question: 'Can I take the car to another city?', 
      answer: 'Yes, intercity travel is permitted. Please check the mileage policy and discuss with your host about any additional charges.'
    },
    { 
      question: 'What if the car breaks down?', 
      answer: 'We provide 24/7 roadside assistance across Pakistan. Emergency contact numbers will be provided at booking.'
    },
    { 
      question: 'Are there any seasonal discounts?', 
      answer: 'Yes, we offer special Eid, summer, and winter promotions. Check our website regularly for ongoing offers.'
    },
    { 
      question: 'Can I rent a car with a driver?', 
      answer: 'Absolutely! Many hosts offer chauffeur-driven options perfect for weddings or business trips.'
    },
    { 
      question: 'What\'s included in the rental price?', 
      answer: 'The base price includes the vehicle and basic insurance. Additional options like GPS or child seats may incur extra charges.'
    },
    { 
      question: 'How does fuel policy work?', 
      answer: 'Most rentals follow the "full-to-full" policy where you receive the car with a full tank and should return it full.'
    }
  ];

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted !== 'true') {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowCookieBanner(false);
  };

  const handleMakeClick = (make) => {
    navigate(`/car-rental/${make.name.toLowerCase()}`, { 
      state: { brandName: make.name } 
    });
  };

  const handleGuideMore = () => {
    navigate(`/guide`);
  };
  const handleReadMore = () => {
    navigate(`/readmore`);
  };
  const handleExplore = () => {
    navigate(`/explore`);
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="font-sans w-full">
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                We use cookies to enhance your experience on Drive Fleet. By continuing, you agree to our use of cookies.
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleDeclineCookies}
                className="px-4 py-2 border border-white rounded text-sm"
              >
                Decline
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-2 bg-purple-600 rounded text-sm"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative w-full">
        <img 
          src="./assets/hero-bg.png" 
          alt="Family road trip in Northern Pakistan" 
          className="w-full h-[700px] object-cover" 
        />
        <div className="absolute mt-110 inset-0 bg-opacity-30 flex flex-col justify-center items-center text-white">
          <h1 className="text-5xl font-bold mb-1 text-center">Explore Pakistan Your Way</h1>
          <p className="text-xl mb-8 text-center">Rent trusted vehicles across Pakistan's beautiful landscapes</p>
          <p className="bg-grey-800 text-white px-8 py-3 rounded-lg text-3xl font-medium">
            Find Your Perfect Ride
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Browse by Make */}
        <div className="p-8 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Car Brands in Pakistan</h2>
            <div className="flex space-x-2">
              <ChevronLeft size={24} className="text-gray-400 cursor-pointer" />
              <ChevronRight size={24} className="text-gray-400 cursor-pointer" />
            </div>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {carMakes.map((make) => (
              <div 
                key={make.name} 
                className="text-center flex-shrink-0 w-[250px] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleMakeClick(make)}
              >
                <img 
                  src={make.image} 
                  alt={make.name} 
                  className="w-full h-[170px] object-cover rounded-lg mb-2 border border-gray-200" 
                />
                <p className="text-center font-medium">{make.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Browse by Destination */}
        <div className="p-8 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Top Destinations in Pakistan</h2>
            <div className="flex space-x-2">
              <ChevronLeft size={24} className="text-gray-400 cursor-pointer" />
              <ChevronRight size={24} className="text-gray-400 cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-lg h-64">
                  <img
                    src={destination.icon}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="text-white text-xl font-bold">{destination.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Experience */}
        <div className="p-8 text-center text-black">
          <h2 className="text-4xl font-bold mb-4">Pakistani Road Trip Adventures</h2>
          <p className="mb-6 text-lg max-w-2xl mx-auto">
            Discover the beauty of Pakistan with Drive Fleet's curated road trip itineraries - from the Karakoram Highway to coastal drives along Gwadar.
          </p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
          onClick={handleExplore}
          >
            Explore Road Trips
          </button>
        </div>

        {/* Featured Post */}
        <div className="p-8">
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src="./assets/northern.jpeg" 
              alt="Hunza Valley landscape" 
              className="w-full h-[500px] object-cover" 
            />
            <div className="absolute top-0 left-0 bg-black text-white p-3 text-sm font-medium">
              <span>FEATURED DESTINATION</span>
            </div>
            <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-8 text-white w-full">
              <h3 className="text-3xl font-bold mb-4">Northern Pakistan Road Trip Guide</h3>
              <p className="text-lg mb-4 max-w-2xl">
                Everything you need to know for an unforgettable journey through Gilgit-Baltistan and KPK with Drive Fleet.
              </p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                onClick={handleGuideMore }
              >
                Read Guide
              </button>
            </div>
          </div>
        </div>

        {/* Blog Section */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="relative group rounded-xl overflow-hidden">
            <img 
              src="./assets/motorway.jpeg" 
              alt="Pakistan Motorway" 
              className="w-full h-[500px] object-cover" 
            />
            <div className="absolute top-0 left-0 p-4">
              <span className="bg-black text-white px-2 py-1 text-sm font-medium">TRAVEL TIPS</span>
            </div>
            <div className="absolute mt-3 bottom-0 left-0 p-6 bg-gradient-to-t from-black to-transparent text-white w-full">
              <h3 className="text-2xl mt-3 font-bold ">Pakistan's Motorway Network Guide</h3>
              <p className="mb-4">Navigate Pakistan's expanding motorway system like a pro with Drive Fleet</p>
              <button className="text-white underline" onClick={handleReadMore}>Read more</button>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-3xl text-black font-bold mb-4">2024 Car Rental Trends in Pakistan</h3>
              <p className="text-gray-700  mt-3">
                Discover how Pakistanis are embracing car sharing and what it means for your next Drive Fleet rental experience across major cities.
              </p>
            </div>
            <img 
              src="./assets/majorRoads.jpeg" 
              alt="Car rental trends" 
              className="w-full h-[300px] object-cover rounded-xl" 
            />
          </div>
        </div>

        {/* Book & Host Actions */}
        <div className="p-8 bg-gray-50 grid md:grid-cols-2 gap-8 text-black rounded-xl">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Book Your Perfect Ride</h3>
            <p className="text-gray-600 mb-6">
              From city commutes to cross-country adventures, find the ideal vehicle for your Pakistani journey with Drive Fleet.
            </p>
            <img 
              src="./assets/rentACar.png" 
              alt="Book a car" 
              className="w-full max-w-md mx-auto h-auto object-contain" 
            />
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Earn With Your Car</h3>
            <p className="text-gray-600 mb-6">
              Turn your idle car into income by sharing it with trusted travelers through Drive Fleet.
            </p>
            <img 
              src="./assets/becomeAHost.png" 
              alt="Become a host" 
              className="w-full max-w-md mx-auto h-auto object-contain" 
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="p-8">
          <h2 className="text-4xl text-black font-bold mb-12 text-center">
            <span className="bg-purple-100 px-4 py-2 rounded-lg">Drive Fleet Pakistan FAQs</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border text-black border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <p 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.question}</span>
                  <ChevronRight 
                    size={20} 
                    className={`transform transition-transform ${activeAccordion === index ? 'rotate-90' : ''}`} 
                  />
                </p>
                {activeAccordion === index && (
                  <div className="mt-4 text-gray-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;