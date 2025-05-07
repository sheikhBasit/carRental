// src/pages/Favorites.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      const user = Cookies.get('user')
      const userId = JSON.parse(user).id
      const url = `https://car-rental-backend-black.vercel.app/api/likes/liked-vehicles/${userId}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch favorite vehicles');
        
        const data = await res.json();
        // Validate and clean the data
        const validatedData = Array.isArray(data) 
          ? data.filter(item => item && typeof item === 'object')
          : [];
        setFavorites(validatedData);
      } catch (err) {
        setError('Unable to load your favorites. Please try again later.');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const goToHome = () => {
    navigate('/');
  };

  const removeFavorite = async (vehicleId, event) => {
    event?.stopPropagation();
    if (!vehicleId) return;
  
    const user = Cookies.get('user');
    const userId = JSON.parse(user).id || '67d338f3f22c60ec8701405a';
    
    const previousFavorites = [...favorites];
    setFavorites(prev => prev.filter(item => item?._id !== vehicleId));
    
    try {
      const res = await fetch(
        `https://car-rental-backend-black.vercel.app/api/likes/unlike/${vehicleId}/${userId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        throw new Error('Failed to unlike vehicle');
      }
    } catch (error) {
      setFavorites(previousFavorites);
      setError('Failed to remove from favorites. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };
  

  const navigateToDetails = (vehicleId) => {
    if (!vehicleId) return;
    // Example with React Router: history.push(`/vehicles/${vehicleId}`);
  };

  const sortedFavorites = [...favorites]
    .filter(item => item && typeof item === 'object')
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (sortBy === 'date') {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'name') {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'rating') {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      }
      return 0;
    });

  const filteredFavorites =
    filterCategory === 'all'
      ? sortedFavorites
      : sortedFavorites.filter(item => item?.category === filterCategory);

  const categories = ['all', ...new Set(
    favorites
      .filter(item => item && typeof item === 'object')
      .map(item => item?.category || 'Unknown')
      .filter(Boolean)
  )];

  const renderFavoriteItem = (item) => {
    if (!item || typeof item !== 'object') return null;
  
    const imageUrl = item.carImageUrls?.[0] || '/placeholder-car.jpg';
    const name = `${item.manufacturer || 'Unknown'} ${item.model || ''}`.trim();
    const rent = item.rent ? `Rs. ${item.rent}/day` : 'Price not available';
    const transmission = item.transmission || 'N/A';
  
    return (
      <div
        key={item._id}
        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white cursor-pointer transform hover:scale-[1.02] duration-300"
        onClick={() => navigateToDetails(item._id)}
      >
        <div className="relative h-52">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-car.jpg';
            }}
          />
          <button
            onClick={(e) => removeFavorite(item._id, e)}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label="Remove from favorites"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">Transmission: {transmission}</p>
          <p className="text-sm text-gray-700 font-medium mt-2">{rent}</p>
          <p className="mt-2 text-xs text-gray-500">
            Added: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 text-gray-800 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Your Favorite Cars</h1>
        <p className="text-gray-600 mb-6">Manage and explore your saved vehicles</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}


        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse space-y-8 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <div key={`skeleton-${item}`} className="border rounded-lg overflow-hidden shadow-sm bg-white">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-gray-50 inline-flex rounded-full p-4 mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-gray-900">No favorite cars yet</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">Start exploring our selection of vehicles and add your favorites to this list.</p>
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={goToHome}
              >
                Explore Cars
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredFavorites.length} {filteredFavorites.length === 1 ? 'vehicle' : 'vehicles'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(renderFavoriteItem)}
            </div>
            
            {filteredFavorites.length > 6 && (
              <div className="flex justify-center mt-10">
                <button 
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span>Back to Top</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FavoritesPage;