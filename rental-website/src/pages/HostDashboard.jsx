import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Car, Users, Truck, DollarSign, Calendar, 
  BarChart2, Shield, FileText, MessageCircle, 
  RefreshCw, AlertCircle, Edit, Trash2, X, Check,
  Plus, Upload, ChevronDown
} from 'lucide-react';

// Base URL for API calls
const BASE_URL = 'https://car-rental-backend-black.vercel.app';

const RentalCompanyDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    vehicles: [],
    drivers: [],
    bookings: [],
    loading: true,
    error: null
  });
  const [company, setCompany] = useState(null);

  // Fetch company from cookies on component mount
  useEffect(() => {
    const companyData = Cookies.get('company');
    if (companyData) {
      setCompany(JSON.parse(companyData));
    }
  }, []);

  // Form states
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [formData, setFormData] = useState({
    // Vehicle form
    manufacturer: '',
    model: '',
    numberPlate: '',
    carImageUrls: [],
    rent: '',
    capacity: '',
    transmission: 'Auto',
    companyId: '',
    // Driver form
    name: '',
    profileimg: '',
    license: '',
    phNo: '',
    age: '',
    experience: '',
    cnic: '',
  });
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const companyData = Cookies.get('company');
    if (companyData) {
      const parsedData = JSON.parse(companyData);
      // Ensure we have a company ID, fallback to default if empty
      setCompany({
        ...parsedData,
        _id: parsedData._id || '67d35fd70dd2e0010e615f4b'
      });
    } else {
      // If no company data in cookies, use the default ID
      setCompany({
        _id: '67d35fd70dd2e0010e615f4b',
        companyName: 'Default Company'
      });
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Ensure we always have a company ID to work with
      const companyId = company?._id || '67d35fd70dd2e0010e615f4b';

      try {
        const [vehiclesRes, driversRes, bookingsRes] = await Promise.all([
          axios.get(`${BASE_URL}/vehicles/company`, { 
            params: { company: companyId }
          }),
          axios.get(`${BASE_URL}/drivers/company`, { 
            params: { company: companyId }
          }),
          axios.get(`${BASE_URL}/bookings/companyBookings`, { 
            params: { company: companyId }
          })
        ]);
        
        // Extract the actual data from the responses
        const vehiclesData = vehiclesRes.data.vehicles || [];
        const driversData = driversRes.data.drivers || [];
        const bookingsData = bookingsRes.data.bookings || [];

        console.log('API responses:', {
          vehicles: vehiclesData,
          drivers: driversData,
          bookings: bookingsData
        });

        setDashboardData({
          stats: {
            totalVehicles: vehiclesData.length,
            totalDrivers: driversData.length,
            activeTrips: bookingsData.filter(b => b.status === 'active').length,
            revenue: bookingsData.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
            occupancyRate: vehiclesData.length > 0 
              ? (bookingsData.filter(b => b.status === 'active').length / vehiclesData.length) * 100
              : 0
          },
          vehicles: vehiclesData,
          drivers: driversData,
          bookings: bookingsData,
          loading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: `Failed to fetch dashboard data: ${error.response?.data?.message || error.message}`
        }));
      }
    };

    if (company) {
      fetchDashboardData();
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // In a real app, you would upload to a cloud service like AWS S3
      // This is a mock implementation
      const mockImageUrl = URL.createObjectURL(file);
      
      if (activeSection === 'vehicles') {
        setFormData(prev => ({
          ...prev,
          carImageUrls: [...prev.carImageUrls, mockImageUrl]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          profileimg: mockImageUrl
        }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        ...formData,
        companyId: company._id
      };

      if (activeSection === 'vehicles') {
        await axios.post(`${BASE_URL}/vehicles`, requestData);
        setShowVehicleForm(false);
      } else {
        await axios.post(`${BASE_URL}/drivers`, requestData);
        setShowDriverForm(false);
      }
      
      // Refresh data
      const response = await axios.get(
        activeSection === 'vehicles' 
          ? `${BASE_URL}/vehicles/company?company=${company._id}`
          : `${BASE_URL}/drivers/company?company=${company._id}`
      );
      
      // Extract the actual data from the response
      const updatedData = activeSection === 'vehicles' 
        ? response.data.vehicles || []
        : response.data.drivers || [];
      
      setDashboardData(prev => ({
        ...prev,
        [activeSection === 'vehicles' ? 'vehicles' : 'drivers']: updatedData
      }));
      
      // Reset form
      setFormData({
        manufacturer: '',
        model: '',
        numberPlate: '',
        carImageUrls: [],
        rent: '',
        capacity: '',
        transmission: 'Auto',
        name: '',
        profileimg: '',
        license: '',
        phNo: '',
        age: '',
        experience: '',
        cnic: '',
        companyId: ''
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setDashboardData(prev => ({
        ...prev,
        error: `Submission failed: ${error.response?.data?.message || error.message}`
      }));
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeSection === 'vehicles') {
        await axios.delete(`${BASE_URL}/vehicles/${id}`, {
          params: { company: company._id }
        });
        setDashboardData(prev => ({
          ...prev,
          vehicles: prev.vehicles.filter(v => v._id !== id)
        }));
      } else {
        await axios.delete(`${BASE_URL}/drivers/${id}`, {
          params: { company: company._id }
        });
        setDashboardData(prev => ({
          ...prev,
          drivers: prev.drivers.filter(d => d._id !== id)
        }));
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      setDashboardData(prev => ({
        ...prev,
        error: `Deletion failed: ${error.response?.data?.message || error.message}`
      }));
    }
  };

  // Render loading state
  if (dashboardData.loading || !company) {
    return (     
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Render error state
  if (dashboardData.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-red-700">Dashboard Error</h2>
          <p className="text-red-500">{dashboardData.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="bg-gray-900 text-white w-64 p-6 space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">{company.companyName}</h2>
        <p className="text-gray-400">Enterprise Dashboard</p>
      </div>

      <nav className="space-y-2">
        {[
          { icon: BarChart2, label: 'Overview', section: 'overview' },
          { icon: Car, label: 'Vehicles', section: 'vehicles' },
          { icon: Users, label: 'Drivers', section: 'drivers' },
          { icon: DollarSign, label: 'Bookings', section: 'bookings' },
          { icon: Shield, label: 'Maintenance', section: 'maintenance' },
          { icon: FileText, label: 'Reports', section: 'reports' }
        ].map((item) => (
          <button
            key={item.section}
            onClick={() => setActiveSection(item.section)}
            className={`w-full flex items-center p-3 rounded transition-colors ${
              activeSection === item.section 
                ? 'bg-blue-100 text-white' 
                : 'hover:bg-gray-200 text-gray-300'
            }`}
          >
            <item.icon className="mr-3" size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderOverview = () => {
    const { stats } = dashboardData;
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Car size={36} className="text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">
              {stats.totalVehicles}
            </span>
          </div>
          <div>
            <p className="text-black text-gray-600">Total Vehicles</p>
            <div className="mt-2 h-2 bg-blue-200 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full" 
                style={{width: `${(stats.totalVehicles > 0 ? (stats.totalVehicles / stats.totalVehicles) * 100 : 0)}%`}}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Users size={36} className="text-green-600" />
            <span className="text-3xl font-bold text-green-600">
              {stats.totalDrivers}
            </span>
          </div>
          <div>
            <p className="text-black text-gray-600">Total Drivers</p>
            <div className="mt-2 h-2 bg-green-200 rounded-full">
              <div 
                className="h-2 bg-green-600 rounded-full" 
                style={{width: '80%'}}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <DollarSign size={36} className="text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">
              ${stats.revenue.toLocaleString()}
            </span>
          </div>
          <div>
            <p className="text-black text-gray-600">Total Revenue</p>
            <div className="mt-2 h-2 bg-purple-200 rounded-full">
              <div 
                className="h-2 bg-purple-600 rounded-full" 
                style={{width: `${stats.occupancyRate}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="col-span-3 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
            <MessageCircle className="mr-3 text-gray-600" />
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {dashboardData.bookings.slice(0, 5).map((booking) => (
              <div 
                key={booking._id} 
                className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
              >
                <div>
                  <p className="font-medium text-black">
                    Booking #{booking._id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div 
                  className={`w-3 h-3 rounded-full ${
                    booking.status === 'active' ? 'bg-green-500' :
                    booking.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVehicleForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Add New Vehicle</h2>
          <button onClick={() => setShowVehicleForm(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm font-medium mb-1">Manufacturer</label>
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
              <label className="block text-black text-sm font-medium mb-1">Model</label>
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
              <label className="block text-black text-sm font-medium mb-1">Number Plate</label>
              <input
                type="text"
                name="numberPlate"
                value={formData.numberPlate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Rent (per day)</label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Transmission</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                <option value="Auto">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-black text-sm font-medium mb-1">Vehicle Images</label>
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
                <img key={index} src={url} alt="Vehicle" className="w-16 h-12 object-cover rounded" />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowVehicleForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDriverForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Add New Driver</h2>
          <button onClick={() => setShowDriverForm(false)} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-black text-sm font-medium mb-1">Full Name</label>
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
              <label className="block text-black text-sm font-medium mb-1">Profile Image</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer text-black bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center">
                  <Upload className="mr-2" size={18} />
                  Upload Photo
                  <input 
                    type="file" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
                {formData.profileimg && (
                  <img src={formData.profileimg} alt="Driver" className="w-12 h-12 rounded-full object-cover" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">License Number</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phNo"
                value={formData.phNo}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm font-medium mb-1">CNIC</label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowDriverForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Vehicle Fleet</h2>
        <button 
          onClick={() => setShowVehicleForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Vehicle
        </button>
      </div>
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
              <th className="p-3 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.vehicles.map((vehicle) => (
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
                <td className="p-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
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
    </div>
  );

  const renderDrivers = () => (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Driver Management</h2>
        <button 
          onClick={() => setShowDriverForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Driver
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-black text-left">Profile</th>
              <th className="p-3 text-black text-left">Name</th>
              <th className="p-3 text-black text-left">License</th>
              <th className="p-3 text-black text-left">Phone</th>
              <th className="p-3 text-black text-left">Age</th>
              <th className="p-3 text-black text-left">Experience</th>
              <th className="p-3 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.drivers.map((driver) => (
              <tr key={driver._id} className="border-b text-black hover:bg-gray-50">
                <td className="p-3">
                  {driver.profileimg ? (
                    <img 
                      src={driver.profileimg} 
                      alt={driver.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{driver.name}</td>
                <td className="p-3">{driver.license}</td>
                <td className="p-3">{driver.phNo}</td>
                <td className="p-3">{driver.age} Years</td>
                <td className="p-3">{driver.experience} Years</td>
                <td className="p-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(driver._id)}
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
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {renderSidebar()}
      
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-black">
            {activeSection === 'overview' && 'Dashboard Overview'}
            {activeSection === 'vehicles' && 'Vehicle Fleet Management'}
            {activeSection === 'drivers' && 'Driver Management'}
            {activeSection === 'bookings' && 'Booking Management'}
          </h1>
          
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'vehicles' && renderVehicles()}
          {activeSection === 'drivers' && renderDrivers()}
        </div>
      </main>

      {showVehicleForm && renderVehicleForm()}
      {showDriverForm && renderDriverForm()}
    </div>
  );
};

export default RentalCompanyDashboard;