import React, { useState, useEffect, useCallback } from 'react';
import FAQItem from "../components/Faq";
import { useNavigate } from 'react-router-dom';

const CarCard = ({ 
  car, 
  onClick, 
  onLike, 
  isLiked, 
  searchParams 
}) => (
  <div 
    className="w-80 border rounded-lg overflow-hidden shadow-md shrink-0 cursor-pointer hover:shadow-lg transition-shadow" 
    onClick={onClick}
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
          {car.manufacturer?.charAt(0).toUpperCase() + car.manufacturer?.slice(1).toLowerCase()} 
          {' '}
          {car.model?.charAt(0).toUpperCase() + car.model?.slice(1).toLowerCase()}
        </h2>
        <button 
          className={`${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
          onClick={(e) => {
            e.stopPropagation();
            onLike(car._id);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>{car.capacity || 'N/A'} seats</span>
        </div>
        <div className="flex items-center text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>{car.transmission || 'N/A'}</span>
        </div>
        {car.numberPlate && (
          <div className="flex items-center text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 104 0V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
            </svg>
            <span className="uppercase">{car.numberPlate.substr(0, 4)}...</span>
          </div>
        )}
        {car.isAvailable !== undefined && (
          <div className={`flex items-center ${car.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{car.isAvailable ? 'Available' : 'Unavailable'}</span>
          </div>
        )}
      </div>
      
      {car.availability?.days && (
        <div className="flex flex-wrap gap-1 mb-2">
          {['M','T','W','T','F','S','S'].map((day, i) => {
            const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const isAvailable = car.availability.days.includes(fullDays[i]);
            return (
              <span 
                key={i} 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}
              >
                {day}
              </span>
            );
          })}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-black text-sm">{car.rating || 'New'} ({car.trips || 0} trips)</span>
        </div>
        {car.isAllStarHost && (
          <span className="text-green-600 text-sm">All-Star Host</span>
        )}
      </div>
      
      {car.cities && car.cities.length > 0 && (
        <div className="mt-2 mb-2">
          <p className="text-xs text-gray-600">Available in:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {car.cities.slice(0, 2).map((city, idx) => (
              <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {city.name}
                {city.additionalFee > 0 && ` (+${city.additionalFee})`}
              </span>
            ))}
            {car.cities.length > 2 && (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                +{car.cities.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {searchParams.startDate && searchParams.endDate && (
        <div className="text-sm text-gray-600 mb-2">
          {new Date(searchParams.startDate).toLocaleDateString()} - {new Date(searchParams.endDate).toLocaleDateString()}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <span className="font-bold text-black">Rs.{car.rent || 'N/A'} total</span>
        {car.availability && (
          <span className="text-xs text-gray-600">
            {car.availability.startTime} - {car.availability.endTime}
          </span>
        )}
      </div>
      
      <button 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded mt-4 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClick(car._id);
        }}
      >
        {car.saveAmount ? `Save £${car.saveAmount}` : 'Book this car'}
      </button>
    </div>
  </div>
);

const useLikedVehicles = () => {
    const [likedVehicles, setLikedVehicles] = useState([]);
  
    useEffect(() => {
      const fetchLikedVehicles = async () => {
        try {
          // Parse cookies
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            acc[name] = value;
            return acc;
          }, {});
  
          console.log('Cookie data:', cookies);
  
          // Decode user data
          const userCookie = cookies.user;
          if (!userCookie) return;
  
          const user = JSON.parse(decodeURIComponent(userCookie));
          const userId = user.id;
  
          if (userId) {
            const response = await fetch(`https://car-rental-backend-black.vercel.app/likes/liked-vehicles/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch liked vehicles');
            const data = await response.json();
            setLikedVehicles(data.map(vehicle => vehicle._id));
          }
        } catch (error) {
          console.error('Error fetching liked vehicles:', error);
        }
      };
  
      fetchLikedVehicles();
    }, []);
  
    return { likedVehicles, setLikedVehicles };
  };
  

const CarRentalMarket = ({ brandName, carModels }) => {
  const navigate = useNavigate();
  const [filteredCars, setFilteredCars] = useState(carModels || []);
  const [searchParams, setSearchParams] = useState({
    location: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '18:00'
  });
  
  const { likedVehicles, setLikedVehicles } = useLikedVehicles();

  const handleCarFavorites = async (carId) => {
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        acc[name] = value;
        return acc;
      }, {});
  
      console.log("Parsed Cookies:", cookies);
  
      const userCookie = cookies.user;
      if (!userCookie) {
        console.error('User not logged in');
        return;
      }
  
      const user = JSON.parse(decodeURIComponent(userCookie));
      const userId = user.id;
  
      const isLiked = likedVehicles.includes(carId);
  
      if (isLiked) {
        await fetch(`https://car-rental-backend-black.vercel.app/likes/unlike/${carId}/${userId}`, {
          method: 'DELETE'
        });
        setLikedVehicles(likedVehicles.filter(id => id !== carId));
      } else {
        await fetch('https://car-rental-backend-black.vercel.app/likes/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicleId: carId,
            userId: userId
          })
        });
        setLikedVehicles([...likedVehicles, carId]);
      }
    } catch (error) {
      console.error('Error handling favorites:', error);
    }
  };
  
  
  const handleCarCardClick = (carId) => {
    navigate(`/car-detail/${carId}`);
  };

  const isVehicleAvailable = useCallback((vehicle, params) => {
    if (!params.startDate || !params.endDate) return true;
    
    try {
      const { startDate, startTime, endDate, endTime } = params;
      const startDay = new Date(startDate).toLocaleString('en-US', { weekday: 'long' });
      const endDay = new Date(endDate).toLocaleString('en-US', { weekday: 'long' });
      
      if (!vehicle.availability?.days?.includes(startDay) || 
          !vehicle.availability?.days?.includes(endDay)) {
        return false;
      }
      
      const isStartTimeValid = vehicle.availability.startTime <= startTime;
      const isEndTimeValid = vehicle.availability.endTime >= endTime;
      
      return isStartTimeValid && isEndTimeValid;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }, []);

  const filterCars = useCallback(() => {
    if (!carModels || carModels.length === 0) {
      setFilteredCars([]);
      return;
    }

    const filtered = carModels.filter(car => {
        const locationMatch = !searchParams.location || 
          (car.cities && car.cities.some(city => 
            city.name.toLowerCase().includes(searchParams.location.toLowerCase())
          )); // <- closed this one
      
        const datesProvided = searchParams.startDate && searchParams.endDate;
        const availabilityMatch = datesProvided ? isVehicleAvailable(car, searchParams) : true;
      
        return locationMatch && availabilityMatch;
      });
      

    setFilteredCars(filtered);
  }, [carModels, searchParams, isVehicleAvailable]);

  useEffect(() => {
    filterCars();
  }, [filterCars]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterCars();
  };

  const generateTimeOptions = () => {
    return [...Array(24)].map((_, hour) => {
      const formattedHour = hour.toString().padStart(2, '0');
      const timeValue = `${formattedHour}:00`;
      return (
        <option key={hour} value={timeValue}>
          {timeValue}
        </option>
      );
    });
  };

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
                  placeholder="City" 
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
                    min={new Date().toISOString().split('T')[0]}
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
                  {generateTimeOptions()}
                </select>
                
                <div className="relative">
                  <input 
                    type="date" 
                    name="endDate"
                    className="border-l pl-2 pr-4 py-2 text-gray-700 w-full appearance-none"
                    value={searchParams.endDate}
                    onChange={handleInputChange}
                    min={searchParams.startDate || new Date().toISOString().split('T')[0]}
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
                  {generateTimeOptions()}
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
      <div className="max-w-5xl mx-auto px-4">
        <h4 className="text-4xl font-bold text-black mb-6">Rental {brandName}</h4>
        <div className="flex overflow-x-auto space-x-4 py-4">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onClick={() => handleCarCardClick(car._id)}
                onLike={handleCarFavorites}
                isLiked={likedVehicles.includes(car._id)}
                searchParams={searchParams}
              />
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">No vehicles found matching your search criteria.</p>
              <p 
                className="mt-4 text-purple-600 hover:text-purple-800 cursor-pointer"
                onClick={() => {
                  setSearchParams({
                    location: '',
                    startDate: '',
                    startTime: '08:00',
                    endDate: '',
                    endTime: '18:00'
                  });
                }}
              >
                Clear filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drive a [Brand] Section */}
      <div className="text-black py-12">
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

      {/* Brand Experience Section */}
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
              <h3 className="text-xl font-bold mb-4">Why Choose a {brandName}?</h3>
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
            <button className="bg-black hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300">
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