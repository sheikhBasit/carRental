import React, { useState, useEffect } from 'react';
import FAQItem from "../components/Faq";
import { useNavigate } from 'react-router-dom';

const CarRentalMarket = ({ 
  brandName, 
  carModels, 
}) => {
    const navigate = useNavigate();
    const [filteredCars, setFilteredCars] = useState(carModels);
    const [searchParams, setSearchParams] = useState({
        location: '',
        startDate: '2025-03-27',
        startTime: '08:00',
        endDate: '2025-03-30',
        endTime: '18:00'
    });

    const handleCarFavorites = (carId) => {
        console.log('fav ', carId);
    };

    const handleCarCardClick = (carId) => {
        navigate(`/car-detail/${carId}`);
    };

    // Function to check if a vehicle is available for the selected time
    const isVehicleAvailable = (vehicle, params) => {
        const { startDate, startTime, endDate, endTime } = params;
        
        // Convert dates to day names (e.g., "Monday")
        const startDay = new Date(startDate).toLocaleString('en-US', { weekday: 'long' });
        const endDay = new Date(endDate).toLocaleString('en-US', { weekday: 'long' });
        
        // Check if vehicle is available on the selected days
        const availableOnStartDay = vehicle.availability.days.includes(startDay);
        const availableOnEndDay = vehicle.availability.days.includes(endDay);
        
        if (!availableOnStartDay || !availableOnEndDay) {
            return false;
        }
        
        // Check if vehicle is available during the selected time slots
        const isStartTimeValid = vehicle.availability.startTime <= startTime && 
                               vehicle.availability.endTime >= startTime;
        const isEndTimeValid = vehicle.availability.startTime <= endTime && 
                             vehicle.availability.endTime >= endTime;
        
        return isStartTimeValid && isEndTimeValid;
    };

    const filterCars = () => {
      // If no search parameters are provided, show all cars
      if (!searchParams.location && 
          !searchParams.startDate && 
          !searchParams.startTime && 
          !searchParams.endDate && 
          !searchParams.endTime) {
          setFilteredCars(carModels);
          return;
      }
  
      const filtered = carModels.filter(car => {
          // Filter by location if specified
          const locationMatch = !searchParams.location || 
              car.cities.some(city => 
                  city.name.toLowerCase().includes(searchParams.location.toLowerCase())
              );
  
          // Check availability if dates/times are specified
          const availabilityMatch = isVehicleAvailable(car, searchParams);
  
          return locationMatch && availabilityMatch;
      });
  
      setFilteredCars(filtered);
  };
    // Handle search input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        filterCars();
    };

    // Initialize with all cars
    useEffect(() => {
        setFilteredCars(carModels);
    }, [carModels]);

    return (
        <div>
            {/* Header Section */}
            <div className="mb-8 text-black bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center mb-6">Rent a {brandName}</h1>
                    
                    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-2">
                        <div className="flex space-x-2">
                            <div className="flex-grow">
                                <input 
                                    type="text" 
                                    name="location"
                                    placeholder="City, airport, address or hotel" 
                                    className="w-full p-3 text-lg border-none focus:outline-none"
                                    value={searchParams.location}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        name="startDate"
                                        className="border-l pl-2 pr-4 py-2 text-gray-700 w-full appearance-none"
                                        value={searchParams.startDate}
                                        onChange={handleInputChange}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <select 
                                    name="startTime"
                                    className="border-l pl-2 pr-4 py-2 text-gray-700"
                                    value={searchParams.startTime}
                                    onChange={handleInputChange}
                                >
                                    {[...Array(24)].map((_, hour) => {
                                        const formattedHour = hour.toString().padStart(2, '0');
                                        const timeValue = `${formattedHour}:00`;
                                        return (
                                            <option key={hour} value={timeValue}>
                                                {timeValue}
                                            </option>
                                        );
                                    })}
                                </select>
                                
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        name="endDate"
                                        className="border-l pl-2 pr-4 py-2 text-gray-700 w-full appearance-none"
                                        value={searchParams.endDate}
                                        onChange={handleInputChange}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <select 
                                    name="endTime"
                                    className="border-l pl-2 pr-4 py-2 text-gray-700"
                                    value={searchParams.endTime}
                                    onChange={handleInputChange}
                                >
                                    {[...Array(24)].map((_, hour) => {
                                        const formattedHour = hour.toString().padStart(2, '0');
                                        const timeValue = `${formattedHour}:00`;
                                        return (
                                            <option key={hour} value={timeValue}>
                                                {timeValue}
                                            </option>
                                        );
                                    })}
                                </select>
                                
                                <button 
                                    type="submit"
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <div className="text-center mt-2 text-sm text-gray-500">
                        Home &gt; Car rental &gt; {brandName}
                    </div>
                </div>
            </div>

            {/* Car Rental Section */}
            <h4 className="text-4xl font-bold text-black mb-6">Rental {brandName}</h4>
            <div className="flex overflow-x-auto  space-x-4 px-4 py-4">
                {filteredCars.length > 0 ? (
                    filteredCars.map((car, index) => (
                        <div 
                            key={index} 
                            className="w-80 border rounded-lg overflow-hidden shadow-md shrink-0"
                        >
                            {car.carImageUrls?.length > 0 && (
                                <img 
                                    src={car.carImageUrls[0]} 
                                    alt={car.model} 
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-bold text-black text-lg">
                                        {car.manufacturer.charAt(0).toUpperCase() + car.manufacturer.slice(1).toLowerCase()} 
                                        {' '}
                                        {car.model.charAt(0).toUpperCase() + car.model.slice(1).toLowerCase()}
                                    </h2>
                                    <button 
                                        className="text-white-500 hover:text-gray-700"
                                        onClick={() => handleCarFavorites(car._id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500">★</span>
                                        <span className="ml-1 text-black text-sm">{car.rating} ({car.trips} trips)</span>
                                    </div>
                                    {car.isAllStarHost && (
                                        <span className="text-green-600 text-sm">All-Star Host</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                    {new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-black">Rs.{car.rent} total</span>
                                </div>
                                <button 
                                    className="w-full bg-purple-600 text-white py-2 rounded mt-4"
                                    onClick={() => handleCarCardClick(car._id)}
                                >
                                    {car.saveAmount ? `Save £${car.saveAmount}` : 'Book this car'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-gray-500">No vehicles found matching your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Rest of the component remains the same */}
            {/* Drive a [Brand] Section */}
            <div className=" text-black py-12">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Drive a {brandName}</h2>
                    <img 
  src="/assets/login.jpg"
  alt="Login"
  className="w-full h-78 object-cover"
/>

                    <div className="text-center mt-8">
                        <button className="bg-purple-600 text-white px-6 py-3 rounded">
                            Book a {brandName} today
                        </button>
                    </div>
                </div>
            </div>

            {/* New Jeep Article Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl text-black font-bold text-center mb-12">The {brandName} Experience: Adventure Awaits</h2>
                    
                    <div className="grid md:grid-cols-2 gap-10 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">A Legacy of Adventure</h3>
                            <p className="text-gray-700 mb-4">
                                Since its inception in 1941, {brandName} has built a reputation for creating vehicles that combine rugged capability with everyday versatility. Born from military necessity during World War II, {brandName} vehicles have evolved into the ultimate expression of freedom and adventure.
                            </p>
                            <p className="text-gray-700">
                                Today's {brandName} lineup continues this proud tradition with vehicles engineered to tackle the most challenging terrains while providing the comfort and technology modern drivers expect. When you rent a {brandName}, you're not just getting transportation – you're getting a ticket to exploration.
                            </p>
                        </div>
                        <div className="bg-white text-black p-6 rounded-lg shadow-md">
                            <h3 className="text-xl  font-bold mb-4">Why Choose a {brandName}?</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Legendary 4x4 capability for off-road adventures</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Convertible options for open-air freedom</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Spacious interiors for passengers and cargo</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Iconic styling that turns heads everywhere</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 text-purple-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Modern technology and comfort features</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-lg shadow-md mb-12">
                        <h3 className="text-2xl text-black font-bold mb-6">The {brandName} Community</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-gray-700 mb-4">
                                    When you drive a {brandName}, you join a worldwide community of enthusiasts bound by a shared passion for adventure and exploration. The {brandName} wave – that friendly acknowledgment between {brandName} drivers on the road – is just one example of this unique camaraderie.
                                </p>
                                <p className="text-gray-700">
                                    {brandName} clubs and events can be found across the globe, offering opportunities to connect with fellow adventurers, learn new driving techniques, and discover challenging trails. Renting a {brandName} gives you a taste of this exclusive community.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold mb-3">Popular {brandName} Activities:</h4>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        Trail riding and off-roading
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        Beach driving and coastal exploration
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        Camping and overlanding adventures
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        Scenic drives through national parks
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        Winter snow adventures
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-2xl text-black font-bold mb-6">Ready for Your {brandName} Adventure?</h3>
                        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                            Whether you're planning a weekend escape, a cross-country road trip, or simply want to experience the thrill of driving a {brandName}, we have the perfect vehicle for your needs. Our well-maintained fleet of {brandName} vehicles gives you the freedom to explore with confidence.
                        </p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300">
                            Book Your {brandName} Today
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQs Section */}
            <FAQItem/>
        </div>
    );
};

export default CarRentalMarket;