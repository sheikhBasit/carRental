import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const BASE_URL = 'https://car-rental-backend-black.vercel.app/api';

// Reusable Edit Modal Component
const EditModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

// Edit User Form
export const EditUserForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNo: '',
    address: '',
    profilePic: '',
    accountNo: '',
    city: '',
    province: '',
    license: '',
    licenseFrontUrl: '',
    licenseBackUrl: '',
    cnic: '',
    cnicFrontUrl: '',
    cnicBackUrl: '',
    age: '',
    role: '',
    fcmToken: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phoneNo: user.phoneNo || '',
        address: user.address || '',
        profilePic: user.profilePic || '',
        accountNo: user.accountNo || '',
        city: user.city || '',
        province: user.province || '',
        license: user.license || '',
        licenseFrontUrl: user.licenseFrontUrl || '',
        licenseBackUrl: user.licenseBackUrl || '',
        cnic: user.cnic || '',
        cnicFrontUrl: user.cnicFrontUrl || '',
        cnicBackUrl: user.cnicBackUrl || '',
        age: user.age || '',
        role: user.role || '',
        fcmToken: user.fcmToken || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = user?._id 
        ? { ...formData, ...(formData.password === '' && { password: undefined }) }
        : formData;

      const response = user?._id
        ? await axios.put(`${BASE_URL}/users/${user._id}`, payload)
        : await axios.post(`${BASE_URL}/users/register`, payload);
      
      setLoading(false);
      if (onSave) onSave(response.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Personal Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Personal Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {user?._id && '(Leave blank to keep current)'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={!user?._id ? 6 : undefined}
            {...(!user?._id && { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Address Information</h4>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Profile Picture */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Profile Picture</h4>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture URL
          </label>
          <input
            type="url"
            name="profilePic"
            value={formData.profilePic}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* License Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">License Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            name="license"
            value={formData.license}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Front URL
          </label>
          <input
            type="url"
            name="licenseFrontUrl"
            value={formData.licenseFrontUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Back URL
          </label>
          <input
            type="url"
            name="licenseBackUrl"
            value={formData.licenseBackUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* CNIC Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">CNIC Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Number
          </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Front URL
          </label>
          <input
            type="url"
            name="cnicFrontUrl"
            value={formData.cnicFrontUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Back URL
          </label>
          <input
            type="url"
            name="cnicBackUrl"
            value={formData.cnicBackUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Role */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Role</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* FCM Token */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            FCM Token (Optional)
          </label>
          <input
            type="text"
            name="fcmToken"
            value={formData.fcmToken}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Saving...' : (user?._id ? 'Update User' : 'Create User')}
        </button>
      </div>
    </form>
  );
};

EditUserForm.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

// Edit Company Form
export const EditCompanyForm = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    phNum: '',
    bankName: '',
    bankTitle: '',
    accountNo: '',
    cnic: '',
    cnicFrontUrl: '',
    cnicBackUrl: '',
    address: '',
    city: '',
    province: '',
    fcmToken: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        email: company.email || '',
        password: '',
        phNum: company.phNum || '',
        bankName: company.bankName || '',
        bankTitle: company.bankTitle || '',
        accountNo: company.accountNo || '',
        cnic: company.cnic || '',
        cnicFrontUrl: company.cnicFrontUrl || '',
        cnicBackUrl: company.cnicBackUrl || '',
        address: company.address || '',
        city: company.city || '',
        province: company.province || '',
        fcmToken: company.fcmToken || ''
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = company?._id 
        ? { ...formData, ...(formData.password === '' && { password: undefined }) }
        : formData;

      const response = company?._id
        ? await axios.put(`${BASE_URL}/rental-companies/${company._id}`, payload)
        : await axios.post(`${BASE_URL}/rental-companies/register`, payload);
      
      setLoading(false);
      if (onSave) onSave(response.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Company Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Company Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {company?._id && '(Leave blank to keep current)'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={!company?._id ? 6 : undefined}
            {...(!company?._id && { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phNum"
            value={formData.phNum}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Address Information</h4>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Bank Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Bank Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Title
          </label>
          <input
            type="text"
            name="bankTitle"
            value={formData.bankTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            type="text"
            name="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* CNIC Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">CNIC Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Number
          </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Front URL
          </label>
          <input
            type="url"
            name="cnicFrontUrl"
            value={formData.cnicFrontUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC Back URL
          </label>
          <input
            type="url"
            name="cnicBackUrl"
            value={formData.cnicBackUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* FCM Token */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            FCM Token (Optional)
          </label>
          <input
            type="text"
            name="fcmToken"
            value={formData.fcmToken}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Saving...' : (company?._id ? 'Update Company' : 'Create Company')}
        </button>
      </div>
    </form>
  );
};

EditCompanyForm.propTypes = {
  company: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

// Edit Vehicle Form
export const EditVehicleForm = ({ vehicle, onClose, onSave, companies }) => {
  const [formData, setFormData] = useState({
    company: '',
    manufacturer: '',
    model: '',
    year: '',
    numberPlate: '',
    vin: '',
    carImageUrls: [''],
    trips: 0,
    rent: '',
    features: {
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      luggage: 2,
      ac: true,
      bluetooth: false,
      gps: false
    },
    mileage: '',
    lastServiceDate: '',
    insurance: {
      policyNumber: '',
      provider: '',
      documentUrl: '',
      expiry: ''
    },
    status: 'available',
    maintenanceLogs: [],
    dynamicPricing: {
      baseRate: 0,
      weekendRate: 0,
      seasonalRate: 0,
      surgeMultiplier: 1
    },
    discount: {
      percent: 0,
      validUntil: ''
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '08:00',
      endTime: '20:00'
    },
    cities: [{
      name: '',
      additionalFee: 0
    }],
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    blackoutDates: [],
    bookings: [],
    rating: 0,
    minimumRentalHours: 4,
    maximumRentalDays: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        company: vehicle.company?._id || vehicle.company || '',
        manufacturer: vehicle.manufacturer || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        numberPlate: vehicle.numberPlate || '',
        vin: vehicle.vin || '',
        carImageUrls: vehicle.carImageUrls?.length ? vehicle.carImageUrls : [''],
        trips: vehicle.trips || 0,
        rent: vehicle.rent || '',
        features: {
          transmission: vehicle.features?.transmission || 'automatic',
          fuelType: vehicle.features?.fuelType || 'petrol',
          seats: vehicle.features?.seats || 5,
          luggage: vehicle.features?.luggage || 2,
          ac: vehicle.features?.ac || true,
          bluetooth: vehicle.features?.bluetooth || false,
          gps: vehicle.features?.gps || false
        },
        mileage: vehicle.mileage || '',
        lastServiceDate: vehicle.lastServiceDate || '',
        insurance: {
          policyNumber: vehicle.insurance?.policyNumber || '',
          provider: vehicle.insurance?.provider || '',
          documentUrl: vehicle.insurance?.documentUrl || '',
          expiry: vehicle.insurance?.expiry || ''
        },
        status: vehicle.status || 'available',
        maintenanceLogs: vehicle.maintenanceLogs || [],
        dynamicPricing: {
          baseRate: vehicle.dynamicPricing?.baseRate || 0,
          weekendRate: vehicle.dynamicPricing?.weekendRate || 0,
          seasonalRate: vehicle.dynamicPricing?.seasonalRate || 0,
          surgeMultiplier: vehicle.dynamicPricing?.surgeMultiplier || 1
        },
        discount: {
          percent: vehicle.discount?.percent || 0,
          validUntil: vehicle.discount?.validUntil || ''
        },
        availability: {
          days: vehicle.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          startTime: vehicle.availability?.startTime || '08:00',
          endTime: vehicle.availability?.endTime || '20:00'
        },
        cities: vehicle.cities || [{
          name: '',
          additionalFee: 0
        }],
        currentLocation: {
          type: vehicle.currentLocation?.type || 'Point',
          coordinates: vehicle.currentLocation?.coordinates || [0, 0]
        },
        blackoutDates: vehicle.blackoutDates || [],
        bookings: vehicle.bookings || [],
        rating: vehicle.rating || 0,
        minimumRentalHours: vehicle.minimumRentalHours || 4,
        maximumRentalDays: vehicle.maximumRentalDays || 30
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      // Handle nested objects by splitting the name by '.'
      const parts = name.split('.');
      let current = prev;
      
      // Update nested objects
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = current[parts[i]] || {};
        current = current[parts[i]];
      }

      // Handle number conversion
      if (type === 'number') {
        value = value === '' ? '' : Number(value);
      }

      // Handle boolean values (for checkboxes)
      if (type === 'checkbox') {
        value = e.target.checked;
      }

      // Update the final value
      current[parts[parts.length - 1]] = value;

      return prev;
    });
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.carImageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      carImageUrls: newImageUrls
    }));
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      carImageUrls: [...prev.carImageUrls, '']
    }));
  };

  const removeImageUrl = (index) => {
    if (formData.carImageUrls.length > 1) {
      const newImageUrls = [...formData.carImageUrls];
      newImageUrls.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        carImageUrls: newImageUrls
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Filter out empty image URLs
    const filteredImageUrls = formData.carImageUrls.filter(url => url.trim() !== '');

    if (filteredImageUrls.length === 0) {
      setError('At least one image URL is required');
      setLoading(false);
      return;
    }

    const dataToSubmit = {
      ...formData,
      carImageUrls: filteredImageUrls,
      rent: Number(formData.rent),
      capacity: Number(formData.capacity),
      trips: Number(formData.trips)
    };

    try {
      const response = vehicle?._id
        ? await axios.put(`${BASE_URL}/vehicles/${vehicle._id}`, dataToSubmit)
        : await axios.post(`${BASE_URL}/vehicles/addVehicle`, dataToSubmit);
      
      setLoading(false);
      if (onSave) onSave(response.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Basic Vehicle Information */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2">Basic Information</h4>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rental Company
          </label>
          <select
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Company</option>
            {companies?.map((company) => (
              <option key={company._id} value={company._id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer
          </label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1990"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VIN
          </label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number Plate
          </label>
          <input
            type="text"
            name="numberPlate"
            value={formData.numberPlate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Features */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Features</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transmission
          </label>
          <select
            name="features.transmission"
            value={formData.features.transmission}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type
          </label>
          <select
            name="features.fuelType"
            value={formData.features.fuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seats
          </label>
          <input
            type="number"
            name="features.seats"
            value={formData.features.seats}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="2"
            max="15"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Luggage Capacity
          </label>
          <input
            type="number"
            name="features.luggage"
            value={formData.features.luggage}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Air Conditioning
          </label>
          <select
            name="features.ac"
            value={formData.features.ac}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bluetooth
          </label>
          <select
            name="features.bluetooth"
            value={formData.features.bluetooth}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GPS
          </label>
          <select
            name="features.gps"
            value={formData.features.gps}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Pricing and Availability */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Pricing & Availability</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rent (per day)
          </label>
          <input
            type="number"
            name="rent"
            value={formData.rent}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Rate
          </label>
          <input
            type="number"
            name="dynamicPricing.baseRate"
            value={formData.dynamicPricing.baseRate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weekend Rate
          </label>
          <input
            type="number"
            name="dynamicPricing.weekendRate"
            value={formData.dynamicPricing.weekendRate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seasonal Rate
          </label>
          <input
            type="number"
            name="dynamicPricing.seasonalRate"
            value={formData.dynamicPricing.seasonalRate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Surge Multiplier
          </label>
          <input
            type="number"
            name="dynamicPricing.surgeMultiplier"
            value={formData.dynamicPricing.surgeMultiplier}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Percentage
          </label>
          <input
            type="number"
            name="discount.percent"
            value={formData.discount.percent}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Valid Until
          </label>
          <input
            type="date"
            name="discount.validUntil"
            value={formData.discount.validUntil}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Availability */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Availability</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Days
          </label>
          <div className="space-y-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  name={`availability.days.${day}`}
                  checked={formData.availability.days.includes(day)}
                  onChange={(e) => {
                    const days = formData.availability.days;
                    if (e.target.checked) {
                      days.push(day);
                    } else {
                      days.splice(days.indexOf(day), 1);
                    }
                    setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        days: days.sort()
                      }
                    }));
                  }}
                  className="mr-2"
                />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            name="availability.startTime"
            value={formData.availability.startTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            name="availability.endTime"
            value={formData.availability.endTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Status and Maintenance */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Status & Maintenance</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mileage
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Service Date
          </label>
          <input
            type="date"
            name="lastServiceDate"
            value={formData.lastServiceDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Trips
          </label>
          <input
            type="number"
            name="trips"
            value={formData.trips}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Insurance */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Insurance</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Policy Number
          </label>
          <input
            type="text"
            name="insurance.policyNumber"
            value={formData.insurance.policyNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <input
            type="text"
            name="insurance.provider"
            value={formData.insurance.provider}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document URL
          </label>
          <input
            type="url"
            name="insurance.documentUrl"
            value={formData.insurance.documentUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            name="insurance.expiry"
            value={formData.insurance.expiry}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Location & Cities</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Latitude
          </label>
          <input
            type="number"
            name="currentLocation.coordinates.0"
            value={formData.currentLocation.coordinates[0]}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.000001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Longitude
          </label>
          <input
            type="number"
            name="currentLocation.coordinates.1"
            value={formData.currentLocation.coordinates[1]}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.000001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City Name
          </label>
          <input
            type="text"
            name="cities[0].name"
            value={formData.cities[0].name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Fee
          </label>
          <input
            type="number"
            name="cities[0].additionalFee"
            value={formData.cities[0].additionalFee}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Car Images */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Car Images</h4>
        </div>

        {formData.carImageUrls.map((url, index) => (
          <div key={index} className="col-span-2 flex space-x-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Image URL"
              required={index === 0}
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeImageUrl(index)}
                className="px-3 py-2 border text-red-600 rounded-md hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="col-span-2">
          <button
            type="button"
            onClick={addImageUrl}
            className="px-3 py-2 border text-blue-600 rounded-md hover:bg-blue-50"
          >
            Add Another Image
          </button>
        </div>

        {/* Rental Limits */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Rental Limits</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rental Hours
          </label>
          <input
            type="number"
            name="minimumRentalHours"
            value={formData.minimumRentalHours}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Rental Days
          </label>
          <input
            type="number"
            name="maximumRentalDays"
            value={formData.maximumRentalDays}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="365"
          />
        </div>

        {/* Ratings */}
        <div className="col-span-2">
          <h4 className="text-lg font-medium text-gray-700 mb-2 mt-2">Ratings</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="5"
            step="0.1"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Saving...' : (vehicle?._id ? 'Update Vehicle' : 'Add Vehicle')}
        </button>
      </div>
    </form>
  );
};

EditVehicleForm.propTypes = {
  vehicle: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  companies: PropTypes.array
};

export default EditModal;