import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const navigate = useNavigate();

  const carMakes = [
    { name: 'Toyota', image: './assets/toyotasuv.jpeg' },
    { name: 'Audi', image: './assets/signup.jpg' },
    { name: 'Suzuki', image: './assets/toyotasuv.jpeg' },
    { name: 'Jeep', image: './assets/login.jpg' },
    { name: 'Ford', image: './assets/login.jpg' }
  ];

  const destinations = [
    { name: 'Lahore', icon: './assets/lahore.jpeg' },
    { name: 'Islamabad', icon: './assets/islamabad.jpg' },
    { name: 'Karachi', icon: './assets/karachi.jpeg' },
    { name: 'Faislabad', icon: './assets/faislabad.jpeg' },
    { name: 'Rawalpindi', icon: './assets/rawalpindi.jpeg' },
    { name: 'Sialkot', icon: './assets/sialkot.jpeg' },
  ];

  const faqItems = [
    { 
      question: 'What do I need to book a car on Drive Fleet?', 
      answer: 'To book a car on drive fleet, you need a valid driver\'s license, meet age requirements, and have a verified profile. You\'ll also need a payment method on file.'
    },
    { 
      question: 'What are the cleaning and safety policies on Drive Fleet?', 
      answer: 'drive fleet hosts are required to clean and disinfect their vehicles before each trip. Our safety policies include regular maintenance checks and adherence to local regulations.'
    },
    { 
      question: 'Do I need my own insurance?',  
      answer: 'While you may use your own insurance, drive fleet offers protection plans that can be selected during the booking process. These plans provide varying levels of coverage.'
    },
    { 
      question: 'Can I get my car delivered to me?', 
      answer: 'Yes, many hosts offer delivery services to your location for an additional fee, which varies by host and delivery distance.'
    },
    { 
      question: 'Can other people drive a car that I rented?', 
      answer: 'Additional drivers must be approved and added to the trip before they can drive the car. They must meet the same eligibility requirements as the primary driver.'
    },
    { 
      question: 'How can I drive unlimited miles during my trip?', 
      answer: 'Some hosts offer unlimited mileage as an option. You can filter for cars with unlimited miles when searching or discuss custom mileage packages with the host.'
    },
    { 
      question: 'How do I get discounts when booking a car?', 
      answer: 'Discounts are automatically applied for weekly and monthly rentals. You may also find promotional offers or discount codes periodically.'
    },
    { 
      question: 'Are there cars available near the airport?', 
      answer: 'Yes, many hosts offer their cars near major airports. You can search by airport code to find available vehicles nearby.'
    },
    { 
      question: 'What payment methods does drive fleet accept?', 
      answer: 'drive fleet accepts major credit cards, debit cards, and some digital payment methods. Specific requirements may vary by region.'
    },
    { 
      question: 'Is drive fleet a rental car company?', 
      answer: 'drive fleet is a peer-to-peer car sharing marketplace that connects car owners with people who need a vehicle, rather than a traditional rental car company.'
    },
    { 
      question: 'What is the cancellation policy for guests on Drive Fleet?', 
      answer: 'Cancellation policies vary by host. Each listing displays the applicable policy, which may be flexible, moderate, or strict, with different refund schedules.'
    },
    { 
      question: 'What is the cancellation policy for guests on Drive Fleet?', 
      answer: 'Cancellation policies vary by host. Each listing displays the applicable policy, which may be flexible, moderate, or strict, with different refund schedules.'
    }
  ];


  useEffect(() => {
    // Check if user has already accepted cookies
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

  // const handleDestinationClick = (destination) => {
  //   navigate(`/car-rental/location/${destination.name.toLowerCase()}`, { 
  //     state: { locationName: destination.name } 
  //   });
  // };

  const handleReadMore = () => {
    navigate(`/about`);
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
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
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
          src="./assets/hero-bg.jpg" 
          alt="Couple holding hands by a red car" 
          className="w-full h-[600px] object-cover" 
        />
        <div className="inset-0 bg-opacity-30 flex flex-col justify-center items-center text-black">
          <h1 className="text-5xl font-bold mb-4 text-center">Skip the rental car counter</h1>
          <p className="text-xl mb-8 text-center">Rent just about any car, just about anywhere</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Browse by Make */}
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

        {/* Browse by Destination */}
<div className="p-8 text-black">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold">Browse by destination</h2>
    <div className="flex space-x-2">
      <ChevronLeft size={24} className="text-gray-400 cursor-pointer" />
      <ChevronRight size={24} className="text-gray-400 cursor-pointer" />
    </div>
  </div>
  <div className="flex space-x-4 overflow-x-auto pb-4">
    {destinations.map((destination) => (
      <div
        key={destination.name}
        className="text-center flex-shrink-0 w-[320px] cursor-pointer"
        // onClick={() => handleDestinationClick(destination)}
      >
        <div className="border border-gray-200 rounded-lg p-4 mb-2">
          <img
            src={destination.icon}
            alt={destination.name}
            className="w-full h-[200px] rounded-lg mb-2"
          />
        </div>
        <p className="text-center">{destination.name}</p>
      </div>
    ))}
  </div>
</div>

        {/* Get your gearhead fix */}
        <div className="p-8 text-center text-black">
          <h2 className="text-6xl font-bold mb-4">Get your gearhead fix</h2>
          <p className="mb-6">Peruse the latest features and photos of the best cars from around the marketplace.</p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded">
            Explore the blog
          </button>
        </div>

        {/* Featured Post */}
        <div className="p-8">
          <div className="relative">
            <img 
              src="./assets/vintages.jpeg" 
              alt="1956 Cadillac Coupe de Ville" 
              className="w-full h-[400px] object-cover" 
            />
            <div className="absolute top-0 left-0 bg-black text-white p-2">
              <span>FEATURED POST</span>
            </div>
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-75 p-6 text-white max-w-md">
              <h3 className="text-2xl font-bold mb-2">March car of the month: 1956 Cadillac Coupe de Ville</h3>
              <button className="text-white underline">Read more</button>
            </div>
          </div>
        </div>

        {/* Blog Section */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="relative group">
            <img 
              src="./assets/explore.jpg" 
              alt="Isle of Skye landscape" 
              className="w-full h-[600px] object-cover rounded" 
            />
            <div className="absolute top-0 left-0 p-4">
              <span className="bg-black text-white px-2 py-1 text-sm font-medium">FEATURED BLOG</span>
            </div>
            <div className="absolute bottom-0 left-0 p-6 bg-black bg-opacity-50 text-white w-full">
              <h3 className="text-xl font-bold mb-2">An epic Isle of Skye road trip</h3>
              <button className="text-white underline" onClick={handleReadMore}>Read more</button>
            </div>
          </div>
          <div className="relative group">
            <div className="bottom-0 left-0 p-6 text-black w-full">
              <h3 className="text-2xl font-bold mb-2">2024 car ownership Index</h3>
              <p className="text-gray-700 mb-4">Explore drive fleet's nationwide study, uncovering the key trends and opinions shaping the future of car ownership in the UK.</p>
              <button className="bg-black text-white px-4 py-2 rounded" onClick={handleReadMore}>Read more</button>
            </div>
            <img 
              src="./assets/blog-bg.jpg" 
              alt="Car ownership study" 
              className="w-full h-[500px] object-cover rounded" 
            />
          </div>
        </div>



        {/* Book & Host Actions */}
        <div className="p-8 bg-gray-50 grid md:grid-cols-2 gap-8 text-black">
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2 text-purple-600">Book a car &gt;</h3>
            <p className="text-gray-600">Down the street or across the country, find the perfect vehicle for your next adventure.</p>
            <div className="relative w-80 h-80 rounded-full mx-auto mb-4 flex items-center justify-end">
              <img 
                src="./assets/rentACar.png" 
                alt="Book a car" 
                className="w-80 h-80 object-contain" 
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="relative w-80 h-80 rounded-full mx-auto mb-4 flex items-center justify-start">
              <img 
                src="./assets/becomeAHost.png" 
                alt="Become a host" 
                className="w-80 h-80 object-contain" 
              />
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-600">Become a host &gt;</h3>
            <p className="text-gray-600">Accelerate your entrepreneurship and start building a small car sharing business on drive fleet.</p>
          </div>
        </div>

                {/* FAQ Section */}
                <div className="p-8 ">
          <h2 className="text-5xl text-black font-bold mb-12 text-center">
            <span className="bg-purple-100 px-4">Frequently asked questions</span>
          </h2>
          
          <div className="grid  md:grid-cols-2 gap-x-8">
            {faqItems.map((item, index) => (
              <div key={index} className="border-t  border-gray-200 py-4">
                <button 
                  className="flex  justify-between items-center w-full text-left font-medium"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{item.question}</span>
                  <ChevronRight 
                    size={20} 
                    className={`transform transition-transform ${activeAccordion === index ? 'rotate-90' : ''}`} 
                  />
                </button>
                {activeAccordion === index && (
                  <div className="mt-2 text-gray-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Info */}
        {/* <div className="p-8 text-xs text-gray-600 bg-gray-50">
          <p className="mb-4">* Any personal insurance you may have that covers damage to the host's vehicle would kick in before your protection plan, except in limited situations for trips booked in Maryland, but this protects your own wallet. In the US, liability insurance is provided under a policy issued to drive fleet by Travelers Excess and Surplus Lines Company. Terms, conditions, and exclusions apply. The policy does not provide coverage for damage to a host's vehicle.</p>
          <p className="mb-4">
            For questions or information about the third party liability insurance for trips in the US, consumers in Maryland and the licensed states listed 
            <a href="#" className="text-blue-600"> here </a>
            may contact drive fleet Insurance Agency at (415) 508-0283 or claims@drive fleet.agency. For questions about how damage to a host's vehicle is handled, visit the 
            <a href="#" className="text-blue-600"> drive fleet Support site</a>
            . When a trip is booked in the state of Washington, physical damage to the host's vehicle is covered by insurance purchased by drive fleet, but the drive fleet insurance does not change the contractual responsibilities of hosts or guests with respect to physical damage to a host's vehicle.
          </p>
        </div> */}

      </div>
    </div>
  );
};

export default LandingPage;