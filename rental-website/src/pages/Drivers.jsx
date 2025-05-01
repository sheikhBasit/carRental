import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Users, Filter, X } from 'lucide-react';
import DriverForm from './DriverForm';

const Drivers = ({ drivers, company }) => {
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    company: '',
    license: '',
    status: '',
    minAge: '',
    maxAge: '',
    minExperience: '',
    maxExperience: '',
    minRating: '',
    maxRating: '',
    hasCurrentAssignment: '',
    isOnPromotion: '',
    vehicleType: ''
  });

  const safeDrivers = Array.isArray(drivers) ? drivers : [];

  const filteredDrivers = useMemo(() => {
    return safeDrivers.filter(driver => {
      const driverName = driver.name?.toLowerCase() || '';
      const companyName = (driver.company?.companyName || driver.company || '').toLowerCase();
      const license = driver.license?.toLowerCase() || '';
      const age = driver.age || 0;
      const experience = driver.experience || 0;
      const rating = driver.rating || 0;
      const currentAssignment = driver.currentAssignment || false;
      const isOnPromotion = driver.isOnPromotion || false;
      const vehicleType = driver.vehicleType || '';
      const status = driver.status || '';
      
      return (
        (!filters.name || driverName.includes(filters.name.toLowerCase())) &&
        (!filters.company || companyName.includes(filters.company.toLowerCase())) &&
        (!filters.license || license.includes(filters.license.toLowerCase())) &&
        (!filters.status || status.toLowerCase() === filters.status.toLowerCase()) &&
        (!filters.minAge || age >= Number(filters.minAge)) &&
        (!filters.maxAge || age <= Number(filters.maxAge)) &&
        (!filters.minExperience || experience >= Number(filters.minExperience)) &&
        (!filters.maxExperience || experience <= Number(filters.maxExperience)) &&
        (!filters.minRating || rating >= Number(filters.minRating)) &&
        (!filters.maxRating || rating <= Number(filters.maxRating)) &&
        (filters.hasCurrentAssignment === '' || 
          (filters.hasCurrentAssignment === 'true' ? currentAssignment : !currentAssignment)) &&
        (filters.isOnPromotion === '' || 
          (filters.isOnPromotion === 'true' ? isOnPromotion : !isOnPromotion)) &&
        (!filters.vehicleType || vehicleType.toLowerCase() === filters.vehicleType.toLowerCase())
      );
    });
  }, [safeDrivers, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      company: '',
      license: '',
      status: '',
      minAge: '',
      maxAge: '',
      minExperience: '',
      maxExperience: '',
      minRating: '',
      maxRating: '',
      hasCurrentAssignment: '',
      isOnPromotion: '',
      vehicleType: ''
    });
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowDriverForm(true);
  };

  // You'll need to implement this function
  const handleDelete = (driverId) => {
    // Delete driver logic here
    console.log('Delete driver:', driverId);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Driver Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
          {/* <button 
            onClick={() => {
              setSelectedDriver(null);
              setShowDriverForm(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add New Driver
          </button> */}
        </div>
      </div>

      {isFilterModalOpen && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Filter Drivers</h3>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={filters.company}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License</label>
                  <input
                    type="text"
                    name="license"
                    value={filters.license}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <input
                    type="text"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    name="minAge"
                    value={filters.minAge}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    name="maxAge"
                    value={filters.maxAge}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience</label>
                  <input
                    type="number"
                    name="minExperience"
                    value={filters.minExperience}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience</label>
                  <input
                    type="number"
                    name="maxExperience"
                    value={filters.maxExperience}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Has Current Assignment</label>
                  <select
                    name="hasCurrentAssignment"
                    value={filters.hasCurrentAssignment}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={filters.vehicleType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={resetFilters}
                className="px-4 text-white py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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
              <th className="p-3 text-black text-left">Status</th>
              <th className="p-3 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
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
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    driver.status === 'active' ? 'bg-green-100 text-green-800' :
                    driver.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status || 'N/A'}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button 
                    onClick={() => handleEdit(driver)}
                    className="text-blue-600 hover:text-blue-800"
                  >
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

      {showDriverForm && (
        <DriverForm 
          onClose={() => setShowDriverForm(false)} 
          company={company}
          driver={selectedDriver}
        />
      )}
    </div>
  );
};

export default Drivers;