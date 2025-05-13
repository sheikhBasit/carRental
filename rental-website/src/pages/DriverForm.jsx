import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Cookies from 'js-cookie';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DriverForm = ({ onClose, company, driver, onDriverAdded, onDriverUpdated }) => {
  const [formData, setFormData] = useState(driver || {
    name: '',
    profileimg: '',
    license: '',
    phNo: '',
    age: '',
    experience: '',
    cnic: '',
    company: company ? company._id : '',
    
    baseDailyRate: '',
    availability: {
      days: [],
      startTime: '08:00',
      endTime: '20:00'
    },
    pricingTiers: [],
    currentPromotion: null,
    blackoutDates: [],
    rating: 0,
    completedTrips: 0,
    currentAssignment: null,
    profileFile: null
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Check file type and extension
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) || !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setError('Please upload a JPG, JPEG, PNG, or WEBP file with the proper extension');
      return;
    }
  
    setImageUploading(true);
    try {
      const mockImageUrl = URL.createObjectURL(file);
      console.log('Selected file:', file.name, file.type, file.size);
      
      // Verify file is not too large (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
      
      // Ensure the file has a proper named extension
      const imageFileWithExtension = new File(
        [file], 
        `driver_profile_${Date.now()}.${fileExtension}`, 
        { type: file.type }
      );
      
      setFormData(prev => ({
        ...prev,
        profileimg: mockImageUrl,
        profileFile: imageFileWithExtension // Store the renamed file object for later submission
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      setError(error.message || 'Image upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate CNIC format
      if (!/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(formData.cnic)) {
        throw new Error('CNIC must be in format XXXXX-XXXXXXX-X');
      }
  
      // Validate phone number format (strict Pakistani format)
      const cleanPhNo = formData.phNo.replace(/\s/g, '').replace(/-/g, '');
      if (!/^((\+92|0)3[0-9]{9})$/.test(cleanPhNo)) {
        throw new Error('Phone number must be in format +923XXXXXXXXXX or 03XXXXXXXXXX');
      }
  
      // Validate age
      if (formData.age < 18 || formData.age > 70) {
        throw new Error('Age must be between 18 and 70');
      }
  
      // Validate experience
      if (formData.experience < 0 || formData.experience > 50) {
        throw new Error('Experience must be between 0 and 50 years');
      }
  
      // Validate profile image
      if (!driver && !formData.profileFile) {
        throw new Error('Profile image is required');
      }
      
      if (formData.profileFile && !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(formData.profileFile.type)) {
        throw new Error('Profile image must be a JPG, JPEG, PNG, or WEBP file');
      }
  
      // Validate required fields
      if (!formData.name || !formData.license || !formData.phNo || !formData.age || 
          !formData.experience || !formData.cnic || 
          !formData.baseDailyRate || formData.availability.days.length === 0) {
        throw new Error('Please fill in all required fields');
      }
  
      const companyData = Cookies.get('company');
      if (!companyData) {
        throw new Error('Company information not found. Please refresh the page.');
      }
      
      const company = JSON.parse(companyData);
      if (!company?.id) {
        throw new Error('Invalid company information. Please refresh the page.');
      }
  
      // Create FormData object for submission
    // Replace the entire form data construction section with this code
// To ensure we're using the correct format

// Create FormData object for submission
const formDataToSend = new FormData();

// Append all regular fields
formDataToSend.append('name', formData.name);
formDataToSend.append('license', formData.license.toUpperCase());
formDataToSend.append('phNo', cleanPhNo); // Send the cleaned phone number
formDataToSend.append('age', formData.age);
formDataToSend.append('experience', formData.experience);
formDataToSend.append('cnic', formData.cnic);
formDataToSend.append('company', company.id);
formDataToSend.append('baseDailyRate', formData.baseDailyRate);

// Availability - IMPORTANT: Use bracket notation as strings in the key name
// Note that the key strings have '[' and ']' characters in them
// Replace your current availability FormData append with this:
// Alternative approach - stringify the entire availability object
formDataToSend.append('availability', JSON.stringify({
  days: formData.availability.days,
  startTime: formData.availability.startTime,
  endTime: formData.availability.endTime
}));// Pricing Tiers
if (formData.pricingTiers && formData.pricingTiers.length > 0) {
  formData.pricingTiers.forEach((tier, index) => {
    Object.entries(tier).forEach(([key, value]) => {
      formDataToSend.append(`pricingTiers[${index}][${key}]`, value);
    });
  });
} else {
  // Send an empty array indicator
  formDataToSend.append('pricingTiers', '');
}

// Blackout Dates
if (formData.blackoutDates && formData.blackoutDates.length > 0) {
  formData.blackoutDates.forEach((date, index) => {
    formDataToSend.append(`blackoutDates[${index}]`, date);
  });
} else {
  // Send an empty array indicator
  formDataToSend.append('blackoutDates', '');
}

// Current Promotion
if (formData.currentPromotion) {
  formDataToSend.append('currentPromotion[discountPercentage]', formData.currentPromotion.discountPercentage);
  if (formData.currentPromotion.validUntil) {
    formDataToSend.append('currentPromotion[validUntil]', formData.currentPromotion.validUntil);
  }
} else {
  formDataToSend.append('currentPromotion', '');
}

// Append the profile image file if it exists
if (formData.profileFile) {
  // Make sure we only send an image file with proper extension
  const fileExtension = formData.profileFile.name.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension)) {
    throw new Error('Profile image must have a valid image extension (.jpg, .jpeg, .png, or .webp)');
  }
  
  // Rename the file to ensure it has a proper extension in the uploaded filename
  const renamedFile = new File(
    [formData.profileFile], 
    `driver_profile_${Date.now()}.${fileExtension}`, 
    { type: formData.profileFile.type }
  );
  
  formDataToSend.append('profileimg', renamedFile);
}

// Add debugging
console.log('Form data to send (check key format):');
setTimeout(() => {
  formDataToSend.forEach((value, key) => {
    console.log(`${key} => ${value}`);
  });
}, 10);

      const url = driver 
        ? `https://car-rental-backend-black.vercel.app/api/drivers/${driver._id}`
        : 'https://car-rental-backend-black.vercel.app/api/drivers/postDriver';
      
      const method = driver ? 'PUT' : 'POST';
  
      console.log('Submitting form data with file:', formData.profileFile ? formData.profileFile.name : 'No file');
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
        // Don't set Content-Type header - it will be set automatically with the correct boundary
        // for multipart/form-data
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Something went wrong');
      }
      
      const result = await response.json();
      
      if (driver) {
        console.log('Driver updated:', result);
        onDriverUpdated(result);

      } else {
        console.log('Driver added:', result);
        onDriverAdded(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
      setError(error.message || 'Failed to submit driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">
            {driver ? 'Edit Driver' : 'Add New Driver'}
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
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-black text-sm font-medium mb-1">Profile Image*</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer text-black bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center">
                  <Upload className="mr-2" size={18} />
                  {formData.profileimg ? 'Change Photo' : 'Upload Photo'}
                  <input 
                    type="file" 
                    name="profileimg"
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.webp"
                    required={!driver && !formData.profileimg}
                  />
                </label>
                {imageUploading ? (
                  <span className="text-black">Uploading...</span>
                ) : formData.profileimg ? (
                  <img 
                    src={formData.profileimg} 
                    alt="Driver" 
                    className="w-12 h-12 rounded-full object-cover border" 
                  />
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">License Number*</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                placeholder="DL-1234567890"
              />
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">Phone Number*</label>
              <input
                type="tel"
                name="phNo"
                value={formData.phNo}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                placeholder="+923001234567 or 03001234567"
              />
              <p className="text-xs text-gray-500 mt-1">Format: +923XXXXXXXXXX or 03XXXXXXXXXX</p>
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">Age*</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="18"
                max="70"
              />
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">Experience (years)*</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">CNIC*</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                maxLength={15}
                placeholder="42201-1234567-8"
                pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
                title="CNIC must be in the format XXXXX-XXXXXXX-X"
              />
            </div>

            {/* <div>
              <label className="block text-black text-sm font-medium mb-1">Base Hourly Rate (PKR)*</label>
              <input
                type="number"
                name="baseHourlyRate"
                value={formData.baseHourlyRate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="0"
                step="0.01"
              />
            </div> */}

            <div>
              <label className="block text-black text-sm font-medium mb-1">Base Daily Rate (PKR)*</label>
              <input
                type="number"
                name="baseDailyRate"
                value={formData.baseDailyRate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* <div className="mb-4">
            <div 
              className="flex text-black justify-between items-center cursor-pointer mb-2"
              onClick={() => setShowAvailability(!showAvailability)}
            >
              <label className="block text-black text-sm font-medium">Enter Availability*</label>
              {showAvailability ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {showAvailability && (
              <div className="border text-black p-4 rounded-lg">
                <div className="mb-3">
                  <label className="block text-black text-sm font-medium mb-1">Available Days*</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 text-white py-1 text-sm rounded-full ${
                          formData.availability.days.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {formData.availability.days.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select at least one day</p>
                  )}
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
          </div> */}
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

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-white border rounded hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (driver ? 'Update Driver' : 'Add Driver')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverForm;