import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Cookies from 'js-cookie';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const transmissionTypes = ['automatic', 'manual'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'CNG'];
const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck', 'Minivan', 'Pickup'];
const featureOptions = [
  'AC', 'Heating', 'Bluetooth', 'Navigation', 'Sunroof', 
  'Backup Camera', 'Keyless Entry', 'Leather Seats', 'Child Seat',
  'Android Auto', 'Apple CarPlay', 'USB Ports', 'WiFi', 'Premium Sound'
];

const VehicleForm = ({ onClose, company, vehicle, onVehicleAdded, onVehicleUpdated }) => {
  const [formData, setFormData] = useState(vehicle || {
    company: company?._id || '',
    numberPlate: '',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    rent: '',
    transmission: 'automatic',
    capacity: '',
    fuelType: 'petrol',
    vehicleType: 'Sedan',
    features: [],
    mileage: '',
    lastServiceDate: '',
    insuranceExpiry: '',
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
    maximumRentalDays: 30,
    carImageUrls: []
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
      const newFeatures = {
        ...prev.features,
        [feature]: !prev.features[feature]
      };
      
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
  
    setImageUploading(true);
    setError(null);
  
    try {
      const newImageUrls = await Promise.all(
        files.map(async (file) => {
          // Check file type and extension for each file
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          const fileExtension = file.name.split('.').pop().toLowerCase();
  
          if (!validTypes.includes(file.type) || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
            throw new Error('Invalid file type. Please upload JPG, JPEG, PNG, or WEBP files.');
          }
  
          // Verify file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
          }
  
          // Create mock URL for preview
          const mockImageUrl = URL.createObjectURL(file);
          return {
            url: mockImageUrl,
            file: new File(
              [file], 
              `vehicle_image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`,
              { type: file.type }
            )
          };
        })
      );
  
      setFormData(prev => ({
        ...prev,
        carImageUrls: [...prev.carImageUrls, ...newImageUrls]
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setError(error.message || 'Image upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };
  
  const handleRemoveImage = (index) => {
    const newUrls = [...formData.carImageUrls];
    newUrls.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      carImageUrls: newUrls
    }));
  };
  const handleAddCity = () => {
    if (!newCity.name) {
      setError('City name is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      cities: [...prev.cities, {
        name: newCity.name.trim(),
        additionalFee: Number(newCity.additionalFee) || 0
      }]
    }));
    
    setNewCity({
      name: '',
      additionalFee: 0
    });
    setError(null);
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
    if (!newBlackoutDate) {
      setError('Please select a date');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      blackoutDates: [...prev.blackoutDates, newBlackoutDate]
    }));
    
    setNewBlackoutDate('');
    setError(null);
  };

  const handleRemoveBlackoutDate = (index) => {
    setFormData(prev => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'numberPlate', 'manufacturer', 'model', 'year', 'rent',
      'transmission', 'fuelType', 'vehicleType', 'insuranceExpiry'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!formData.availability.days.length) {
      setError('Please select at least one available day');
      return false;
    }

    if (!formData.availability.startTime || !formData.availability.endTime) {
      setError('Please set availability start and end times');
      return false;
    }

    if (formData.carImageUrls.length === 0) {
      setError('Please upload at least one vehicle image');
      return false;
    }

    if (formData.cities.length === 0) {
      setError('Please add at least one city');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
  
    try {
      const companyData = Cookies.get('company');
      if (!companyData) {
        throw new Error('Company information not found. Please refresh the page.');
      }
      
      const company = JSON.parse(companyData);
      if (!company?.id) {
        throw new Error('Invalid company information. Please refresh the page.');
      }
  
      const formDataToSend = new FormData();
  
      // Append all regular fields
      formDataToSend.append('companyId', company.id);
      formDataToSend.append('numberPlate', formData.numberPlate.toUpperCase());
      formDataToSend.append('manufacturer', formData.manufacturer.toLowerCase());
      formDataToSend.append('model', formData.model.toLowerCase());
      formDataToSend.append('year', formData.year);
      formDataToSend.append('rent', formData.rent);
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('fuelType', formData.fuelType);
      formDataToSend.append('vehicleType', formData.vehicleType);
      formDataToSend.append('mileage', formData.mileage || 0);
      formDataToSend.append('insuranceExpiry', new Date(formData.insuranceExpiry).toISOString());

      formDataToSend.append('minimumRentalHours', formData.minimumRentalHours);
      formDataToSend.append('maximumRentalDays', formData.maximumRentalDays);
      formDataToSend.append('capacity', formData.capacity);
  
      // Append features
      formDataToSend.append('features[seats]', '4'); // Add default or from form
      formDataToSend.append('features[fuelType]', formData.fuelType);
      formDataToSend.append('features[transmission]', formData.transmission);
  
      // Append availability days individually
      formData.availability.days.forEach((day, index) => {
        formDataToSend.append(`availability[days][${index}]`, day);
      });
      formDataToSend.append('availability[startTime]', formData.availability.startTime);
      formDataToSend.append('availability[endTime]', formData.availability.endTime);
  
      // Append cities
      formData.cities.forEach((city, index) => {
        formDataToSend.append(`cities[${index}][name]`, city.name.toLowerCase());
        formDataToSend.append(`cities[${index}][additionalFee]`, city.additionalFee.toString());
      });
  
      // Append blackout dates
      formData.blackoutDates.forEach((date, index) => {
        formDataToSend.append(`blackoutDates[${index}]`, date);
      });
  
      // Append location
      formDataToSend.append('currentLocation[type]', 'Point');
      formDataToSend.append('currentLocation[coordinates][0]', formData.currentLocation.coordinates[0].toString());
      formDataToSend.append('currentLocation[coordinates][1]', formData.currentLocation.coordinates[1].toString());
  
      // Append all image files
      formData.carImageUrls.forEach((img, index) => {
        formDataToSend.append('carImageUrls', img.file);
      });
  
      const url = vehicle 
        ? `https://car-rental-backend-black.vercel.app/api/vehicles/${vehicle._id}`
        : 'https://car-rental-backend-black.vercel.app/api/vehicles/postVehicle';
      
      const method = vehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
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
              <label className="block text-black text-sm font-medium mb-1">Transmission*</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                {transmissionTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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
              <label className="block text-black text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
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
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Last Service Date</label>
              <input
                type="date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                max={new Date().toISOString().split('T')[0]}
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
                    formData.features[feature]
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black'
                  }`}
                > 
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 text-black">
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

          

          <div className="mb-4 text-black">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <label className="block text-black text-sm font-medium">Advanced Settings*</label>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {showAdvanced && (
              <div className="border p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-black text-sm font-medium mb-2">Cities*</label>
                  <div className="mb-3 space-y-2">
                    {formData.cities.map((city, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          name="name"
                          value={city.name}
                          onChange={(e) => handleCityChange(e, index)}
                          className="flex-1 p-2 border rounded text-black"
                          placeholder="City name"
                        />
                        <input
                          type="number"
                          name="additionalFee"
                          value={city.additionalFee}
                          onChange={(e) => handleCityChange(e, index)}
                          className="w-24 p-2 border rounded text-black"
                          placeholder="Fee"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(index)}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCity.name}
                      onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                      className="flex-1 p-2 border rounded text-black"
                      placeholder="New city name"
                    />
                    <input
                      type="number"
                      value={newCity.additionalFee}
                      onChange={(e) => setNewCity({...newCity, additionalFee: e.target.value})}
                      className="w-24 p-2 border rounded text-black"
                      placeholder="Fee"
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={handleAddCity}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
{/* 
                <div>
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
                </div> */}
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
        accept="image/jpeg, image/jpg, image/png, image/webp"
        multiple
      />
    </label>
    {imageUploading && <span className="text-black">Uploading...</span>}
  </div>
  {formData.carImageUrls.length === 0 && (
    <p className="text-sm text-gray-500 mt-1">At least one image is required</p>
  )}
  <div className="flex flex-wrap mt-2 gap-2">
    {formData.carImageUrls.map((img, index) => (
      <div key={index} className="relative">
        <img 
          src={img.url} 
          alt="Vehicle" 
          className="w-16 h-12 object-cover rounded"
          onLoad={() => URL.revokeObjectURL(img.url)} // Clean up memory
        />
        <button
          type="button"
          onClick={() => handleRemoveImage(index)}
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
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-black"
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