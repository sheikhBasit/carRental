import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Car, Filter, X } from 'lucide-react';
import VehicleForm from './VehicleForm';

const Vehicles = ({ vehicles, company }) => {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    manufacturer: '',
    model: '',
    year: '',
    transmission: '',
    fuelType: '',
    vehicleType: '',
    minRent: '',
    maxRent: '',
    minCapacity: '',
    maxCapacity: '',
    features: []
  });

  const featureOptions = [
    'AC', 'Heating', 'Bluetooth', 'Navigation', 'Sunroof', 
    'Backup Camera', 'Keyless Entry', 'Leather Seats', 'Child Seat',
    'Android Auto', 'Apple CarPlay', 'USB Ports', 'WiFi', 'Premium Sound'
  ];

  const transmissionOptions = ['Automatic', 'Manual'];
  const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const vehicleTypeOptions = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Truck', 'Van'];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      return (
        (!filters.manufacturer || vehicle.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase())) &&
        (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
        (!filters.year || vehicle.year.toString() === filters.year) &&
        (!filters.transmission || vehicle.transmission === filters.transmission) &&
        (!filters.fuelType || vehicle.fuelType === filters.fuelType) &&
        (!filters.vehicleType || vehicle.vehicleType === filters.vehicleType) &&
        (!filters.minRent || vehicle.rent >= Number(filters.minRent)) &&
        (!filters.maxRent || vehicle.rent <= Number(filters.maxRent)) &&
        (!filters.minCapacity || vehicle.capacity >= Number(filters.minCapacity)) &&
        (!filters.maxCapacity || vehicle.capacity <= Number(filters.maxCapacity)) &&
        (filters.features.length === 0 || 
          filters.features.every(feature => vehicle.features.includes(feature)))
  )});
  }, [vehicles, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => {
      if (prev.features.includes(feature)) {
        return {
          ...prev,
          features: prev.features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...prev.features, feature]
        };
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      manufacturer: '',
      model: '',
      year: '',
      transmission: '',
      fuelType: '',
      vehicleType: '',
      minRent: '',
      maxRent: '',
      minCapacity: '',
      maxCapacity: '',
      features: []
    });
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleForm(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Vehicle Fleet</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 text-white px-4 py-2 rounded hover:bg-gray-300 transition-colors flex items-center"
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {/* <button 
            onClick={() => {
              setSelectedVehicle(null);
              setShowVehicleForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add New Vehicle
          </button> */}
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-black font-semibold">Filters</h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <X size={16} className="mr-1" />
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 text-black lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={filters.manufacturer}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. Toyota"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. Corolla"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="text"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 2020"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                {transmissionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                {fuelTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                name="vehicleType"
                value={filters.vehicleType}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                {vehicleTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent ($)</label>
              <input
                type="number"
                name="minRent"
                value={filters.minRent}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent ($)</label>
              <input
                type="number"
                name="maxRent"
                value={filters.maxRent}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Capacity</label>
              <input
                type="number"
                name="minCapacity"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
              <input
                type="number"
                name="maxCapacity"
                value={filters.maxCapacity}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
                placeholder="e.g. 7"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.features.includes(feature)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-black text-left">Image</th>
              <th className="p-3 text-black text-left">Manufacturer</th>
              <th className="p-3 text-black text-left">Model</th>
              <th className="p-3 text-black text-left">Number Plate</th>
              <th className="p-3 text-black text-left">Capacity</th>
              <th className="p-3 text-black text-left">Transmission</th>
              <th className="p-3 text-black text-left">Rent ($/day)</th>
              <th className="p-3 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle._id} className="border-b text-black hover:bg-gray-50">
                <td className="p-3">
                  {vehicle.carImageUrls && vehicle.carImageUrls.length > 0 ? (
                    <img 
                      src={vehicle.carImageUrls[0]} 
                      alt={`${vehicle.manufacturer} ${vehicle.model}`} 
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Car size={24} className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{vehicle.manufacturer?.toUpperCase()}</td>
                <td className="p-3">{vehicle.model?.toUpperCase()}</td>
                <td className="p-3">{vehicle.numberPlate}</td>
                <td className="p-3">{vehicle.capacity} Seats</td>
                <td className="p-3">{vehicle.transmission}</td>
                <td className="p-3">${vehicle.rent}</td>
                <td className="p-3 flex space-x-2">
                  <button 
                    onClick={() => handleEdit(vehicle)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(vehicle._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showVehicleForm && (
        <VehicleForm 
          onClose={() => setShowVehicleForm(false)} 
          company={company}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
};

export default Vehicles;