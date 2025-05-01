import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const transmissionTypes = ['Auto', 'Manual'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck', 'Minivan', 'Pickup'];
const featureOptions = [
  'AC', 'Heating', 'Bluetooth', 'Navigation', 'Sunroof', 
  'Backup Camera', 'Keyless Entry', 'Leather Seats', 'Child Seat',
  'Android Auto', 'Apple CarPlay', 'USB Ports', 'WiFi', 'Premium Sound'
];

const VehicleForm = ({ onClose, company, vehicle, onVehicleAdded, onVehicleUpdated }) => {
  const [formData, setFormData] = useState(vehicle || {
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    numberPlate: '',
    carImageUrls: [],
    trips: 0,
    rent: '',
    capacity: '',
    transmission: 'Auto',
    fuelType: 'Petrol',
    vehicleType: 'Sedan',
    features: [],
    mileage: '',
    insuranceExpiry: '',
    company: '',
    availability: {
      days: [],
      startTime: '08:00',
      endTime: '20:00'
    },
    cities: [],
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    blackoutDates: [],
    minimumRentalHours: 4,
    maximumRentalDays: 30
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    additionalFee: 0
  });
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedInputChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value
      }
    }));
  };

  const handleAvailabilityChange = (e) => {
    handleNestedInputChange('availability', e);
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      currentLocation: {
        ...prev.currentLocation,
        coordinates: name === 'longitude' 
          ? [parseFloat(value), prev.currentLocation.coordinates[1]]
          : [prev.currentLocation.coordinates[0], parseFloat(value)]
      }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const newDays = prev.availability.days.includes(day)
        ? prev.availability.days.filter(d => d !== day)
        : [...prev.availability.days, day];
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          days: newDays
        }
      };
    });
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
      const newFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const mockImageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        carImageUrls: [...prev.carImageUrls, mockImageUrl]
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setError('Image upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddCity = () => {
    if (!newCity.name) return;
    
    setFormData(prev => ({
      ...prev,
      cities: [...prev.cities, newCity]
    }));
    
    setNewCity({
      name: '',
      additionalFee: 0
    });
  };

  const handleRemoveCity = (index) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index)
    }));
  };

  const handleCityChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newCities = [...prev.cities];
      newCities[index] = {
        ...newCities[index],
        [name]: name === 'additionalFee' ? Number(value) : value
      };
      return {
        ...prev,
        cities: newCities
      };
    });
  };

  const handleAddBlackoutDate = () => {
    if (!newBlackoutDate) return;
    
    setFormData(prev => ({
      ...prev,
      blackoutDates: [...prev.blackoutDates, newBlackoutDate]
    }));
    
    setNewBlackoutDate('');
  };

  const handleRemoveBlackoutDate = (index) => {
    setFormData(prev => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const companyData = Cookies.get('company');
          if (!companyData) {
            throw new Error('Company information not found. Please refresh the page.');
          }
          
          const company = JSON.parse(companyData);
          if (!company?.id) {
            throw new Error('Invalid company information. Please refresh the page.');
          }
      
    try {
      const url = vehicle 
        ? `https://car-rental-backend-black.vercel.app/vehicles/${vehicle._id}`
        : 'https://car-rental-backend-black.vercel.app/vehicles/postVehicle';
      
      const method = vehicle ? 'PUT' : 'POST';
      
      // Prepare form data for submission
      const submissionData = {
        ...formData,
        company: company.id,
        manufacturer: formData.manufacturer.toLowerCase(),
        model: formData.model.toLowerCase(),
        numberPlate: formData.numberPlate.toUpperCase(),
        rent: Number(formData.rent),
        capacity: Number(formData.capacity),
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        year: Number(formData.year),
        minimumRentalHours: Number(formData.minimumRentalHours),
        maximumRentalDays: Number(formData.maximumRentalDays),
        carImageUrls: formData.carImageUrls || []
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      
      const result = await response.json();
      
      if (vehicle) {
        onVehicleUpdated(result);
      } else {
        onVehicleAdded(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
      setError(error.message || 'Failed to submit vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm font-medium mb-1">Manufacturer*</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Model*</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Year*</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Number Plate*</label>
              <input
                type="text"
                name="numberPlate"
                value={formData.numberPlate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Daily Rent (PKR)*</label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Seating Capacity*</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Transmission*</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                {transmissionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Fuel Type*</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                {fuelTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Vehicle Type*</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                min="0"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Insurance Expiry*</label>
              <input
                type="date"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Minimum Rental Hours</label>
              <input
                type="number"
                name="minimumRentalHours"
                value={formData.minimumRentalHours}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Maximum Rental Days</label>
              <input
                type="number"
                name="maximumRentalDays"
                value={formData.maximumRentalDays}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    formData.features.includes(feature)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setShowAvailability(!showAvailability)}
            >
              <label className="block text-black text-sm font-medium">Availability Settings*</label>
              {showAvailability ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {showAvailability && (
              <div className="border p-4 rounded-lg">
                <div className="mb-3">
                  <label className="block text-black text-sm font-medium mb-1">Available Days*</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          formData.availability.days.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black text-sm font-medium mb-1">Start Time*</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.availability.startTime}
                      onChange={handleAvailabilityChange}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black text-sm font-medium mb-1">End Time*</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.availability.endTime}
                      onChange={handleAvailabilityChange}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setShowLocation(!showLocation)}
            >
              <label className="block text-black text-sm font-medium">Current Location</label>
              {showLocation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {showLocation && (
              <div className="border p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black text-sm font-medium mb-1">Longitude (-180 to 180)</label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.currentLocation.coordinates[0]}
                      onChange={handleLocationChange}
                      className="w-full p-2 border rounded text-black"
                      min="-180"
                      max="180"
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <label className="block text-black text-sm font-medium mb-1">Latitude (-90 to 90)</label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.currentLocation.coordinates[1]}
                      onChange={handleLocationChange}
                      className="w-full p-2 border rounded text-black"
                      min="-90"
                      max="90"
                      step="0.000001"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-2">Cities with Additional Fees</label>
            <div className="border p-4 rounded-lg">
              {formData.cities.map((city, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 mb-3 items-center">
                  <input
                    type="text"
                    name="name"
                    value={city.name}
                    onChange={(e) => handleCityChange(e, index)}
                    placeholder="City name"
                    className="p-2 border rounded text-black"
                  />
                  <input
                    type="number"
                    name="additionalFee"
                    value={city.additionalFee}
                    onChange={(e) => handleCityChange(e, index)}
                    placeholder="Additional fee"
                    className="p-2 border rounded text-black"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(index)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="name"
                  value={newCity.name}
                  onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                  placeholder="City name"
                  className="p-2 border rounded text-black"
                />
                <input
                  type="number"
                  name="additionalFee"
                  value={newCity.additionalFee}
                  onChange={(e) => setNewCity({...newCity, additionalFee: Number(e.target.value)})}
                  placeholder="Additional fee"
                  className="p-2 border rounded text-black"
                  min="0"
                />
                <button
                  type="button"
                  onClick={handleAddCity}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                >
                  <Plus size={16} className="mr-1" /> Add
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <label className="block text-black text-sm font-medium">Advanced Settings</label>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {showAdvanced && (
              <div className="border p-4 rounded-lg">
                <label className="block text-black text-sm font-medium mb-2">Blackout Dates</label>
                <div className="mb-3">
                  {formData.blackoutDates.map((date, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <span className="mr-2 text-black">{new Date(date).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlackoutDate(index)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="p-2 border rounded text-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlackoutDate}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Date
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-1">Vehicle Images*</label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer text-black bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center">
                <Upload className="mr-2" size={18} />
                Upload Image
                <input 
                  type="file" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </label>
              {imageUploading && <span className="text-black">Uploading...</span>}
            </div>
            <div className="flex flex-wrap mt-2 gap-2">
              {formData.carImageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt="Vehicle" className="w-16 h-12 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      const newUrls = [...formData.carImageUrls];
                      newUrls.splice(index, 1);
                      setFormData(prev => ({
                        ...prev,
                        carImageUrls: newUrls
                      }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-white border rounded hover:bg-gray-100 text-black"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;