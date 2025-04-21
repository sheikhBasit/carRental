// src/pages/Favorites.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ErrorBoundary from '../components/ErrorBoundary';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      const userId = Cookies.get('userId') || '67d338f3f22c60ec8701405a';
      const url = `https://car-rental-backend-black.vercel.app/likes/liked-vehicles/${userId}`;

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
        console.error('Error fetching liked vehicles:', err);
        setError('Unable to load your favorites. Please try again later.');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (vehicleId, event) => {
    event?.stopPropagation();
    if (!vehicleId) return;

    const userId = Cookies.get('userId') || '67d338f3f22c60ec8701405a';
    
    // Optimistic update
    const previousFavorites = [...favorites];
    setFavorites(prev => prev.filter(item => item?._id !== vehicleId));
    
    try {
      const res = await fetch(
        `https://car-rental-backend-black.vercel.app/likes/unlike/${vehicleId}/${userId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        throw new Error('Failed to unlike vehicle');
      }
    } catch (error) {
      console.error('Error unliking vehicle:', error);
      // Restore previous state if operation failed
      setFavorites(previousFavorites);
      setError('Failed to remove from favorites. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const navigateToDetails = (vehicleId) => {
    if (!vehicleId) return;
    console.log(`Navigating to details for vehicle: ${vehicleId}`);
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
    
    return (
      <div
        key={item._id || Math.random().toString(36).substr(2, 9)}
        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all bg-white cursor-pointer transform hover:scale-[1.02] duration-300"
        onClick={() => navigateToDetails(item._id)}
      >
        <div className="relative h-52">
          <img
            src={item.imageUrl || '/placeholder-car.jpg'}
            alt={item.name || 'Car image'}
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
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                {item.name || 'Unnamed Vehicle'}
              </h3>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.category || 'Unknown'}
                </span>
              </div>
            </div>
            {item.rating && (
              <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {item.rating}
                </span>
              </div>
            )}
          </div>
          {item.features?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 mb-3">
              {item.features.slice(0, 3).map((feature, index) => (
                <span 
                  key={`feature-${index}`} 
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Added {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'N/A'}
          </p>
          <div className="mt-4">
            <button className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md py-2 px-3 text-sm font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              View Details
            </button>
          </div>
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

        <div className="flex flex-col sm:flex-row justify-between mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="mb-4 sm:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by category:</label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

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
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
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