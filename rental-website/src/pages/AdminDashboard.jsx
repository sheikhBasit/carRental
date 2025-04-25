// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Users, Building, Truck, UserCircle, Home, 
//   ChevronDown, Search, Plus, Edit, Trash2, 
//   MoreHorizontal 
// } from 'lucide-react';

// const BASE_URL = 'https://car-rental-backend-black.vercel.app';

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [data, setData] = useState({
//     users: [],
//     companies: [],
//     vehicles: [],
//     drivers: []
//   });
//   const [editingItem, setEditingItem] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const [showEditModal, setShowEditModal] = useState(false);

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [usersRes, companiesRes, vehiclesRes, driversRes] = await Promise.all([
//           axios.get(`${BASE_URL}/users/all`),
//           axios.get(`${BASE_URL}/rental-companies/getRental`),
//           axios.get(`${BASE_URL}/vehicles/fetchVehicles`),
//           axios.get(`${BASE_URL}/drivers/getDriver`)
//         ]);

//         setData({
//           users: usersRes.data,
//           companies: companiesRes.data,
//           vehicles: vehiclesRes.data,
//           drivers: driversRes.data
//         });
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setOpenDropdown(null);
//   };

//   const toggleDropdown = (id) => {
//     setOpenDropdown(openDropdown === id ? null : id);
//   };

//   // Handle delete operations
//   const handleDelete = async (type, id) => {
//     try {
//       await axios.delete(`${BASE_URL}/${type}/${id}`);
//       setData(prev => ({
//         ...prev,
//         [type]: prev[type].filter(item => item._id !== id)
//       }));
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle edit operations
//   const handleEdit = (type, item) => {
//     setEditingItem({ type, id: item._id });
//     setEditFormData(item);
//     setShowEditModal(true);
//   };

//   const handleUpdate = async () => {
//     try {
//       const endpoint = editingItem.type === 'companies' ? 'rental-companies' : editingItem.type;
//       await axios.put(`${BASE_URL}/${endpoint}/${editingItem.id}`, editFormData);
      
//       // Update the local state
//       setData(prev => ({
//         ...prev,
//         [editingItem.type]: prev[editingItem.type].map(item => 
//           item._id === editingItem.id ? { ...item, ...editFormData } : item
//         )
//       }));
      
//       setShowEditModal(false);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Render content based on active tab
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="bg-red-50 p-4 rounded-lg text-red-600">
//           <p>Error: {error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Retry
//           </button>
//         </div>
//       );
//     }

//     switch (activeTab) {
//       case 'dashboard':
//         return <DashboardContent {...data} />;
//       case 'users':
//         return (
//           <UsersContent 
//             users={data.users} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('users', id)}
//             onEdit={(user) => handleEdit('users', user)}
//           />
//         );
//       case 'companies':
//         return (
//           <CompaniesContent 
//             companies={data.companies} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('rental-companies', id)}
//             onEdit={(company) => handleEdit('companies', company)}
//           />
//         );
//       case 'vehicles':
//         return (
//           <VehiclesContent 
//             vehicles={data.vehicles} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('vehicles', id)}
//             onEdit={(vehicle) => handleEdit('vehicles', vehicle)}
//           />
//         );
//       case 'drivers':
//         return (
//           <DriversContent 
//             drivers={data.drivers} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('drivers', id)}
//             onEdit={(driver) => handleEdit('drivers', driver)}
//           />
//         );
//       default:
//         return <DashboardContent {...data} />;
//     }
//   };

//   const EditModal = () => {
//     if (!showEditModal) return null;

//     const handleInputChange = (e) => {
//       const { name, value } = e.target;
//       setEditFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md">
//           <h3 className="text-lg font-semibold mb-4">
//             Edit {editingItem.type}
//           </h3>
          
//           {editingItem.type === 'users' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={editFormData.email || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Role</label>
//                 <select
//                   name="role"
//                   value={editFormData.role || 'user'}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 >
//                   <option value="user">User</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'companies' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={editFormData.companyName || editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full  text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Address</label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={editFormData.address || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <input
//                   type="text"
//                   name="phNum"
//                   value={editFormData.phNum || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'vehicles' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
//                 <input
//                   type="text"
//                   name="manufacturer"
//                   value={editFormData.manufacturer || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Model</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={editFormData.model || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Rent</label>
//                 <input
//                   type="number"
//                   name="rent"
//                   value={editFormData.rent || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'drivers' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">License</label>
//                 <input
//                   type="text"
//                   name="license"
//                   value={editFormData.license || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Status</label>
//                 <select
//                   name="status"
//                   value={editFormData.status || 'Available'}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 >
//                   <option value="Available">Available</option>
//                   <option value="On Trip">On Trip</option>
//                   <option value="Off Duty">Off Duty</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               onClick={() => setShowEditModal(false)}
//               className="px-4 py-2 border border-gray-300 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md"
//             >
//               Save Changes
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-white shadow-md">
//         <div className="p-6 border-b">
//           <h1 className="text-xl font-bold text-gray-800">Rental Admin</h1>
//         </div>
//         <nav className="mt-6">
//           <SidebarLink 
//             icon={<Home size={20} />} 
//             title="Dashboard" 
//             active={activeTab === 'dashboard'} 
//             onClick={() => handleTabChange('dashboard')} 
//           />
//           <SidebarLink 
//             icon={<Users size={20} />} 
//             title="Users" 
//             active={activeTab === 'users'} 
//             onClick={() => handleTabChange('users')} 
//           />
//           <SidebarLink 
//             icon={<Building size={20} />} 
//             title="Companies" 
//             active={activeTab === 'companies'} 
//             onClick={() => handleTabChange('companies')} 
//           />
//           <SidebarLink 
//             icon={<Truck size={20} />} 
//             title="Vehicles" 
//             active={activeTab === 'vehicles'} 
//             onClick={() => handleTabChange('vehicles')} 
//           />
//           <SidebarLink 
//             icon={<UserCircle size={20} />} 
//             title="Drivers" 
//             active={activeTab === 'drivers'} 
//             onClick={() => handleTabChange('drivers')} 
//           />
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 overflow-auto">
//         <header className="bg-white shadow-sm">
//           <div className="flex justify-between items-center px-6 py-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
//             </h2>
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} /> */}
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex items-center space-x-3">
//                 <img
//                   src="/api/placeholder/40/40" 
//                   alt="Admin"
//                   className="w-8 h-8 rounded-full"
//                 />
//                 <span className="font-medium">Admin User</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="p-6">
//           {renderContent()}
//         </main>
//       </div>

//       <EditModal />
//     </div>
//   );
// };

// // Sidebar link component
// const SidebarLink = ({ icon, title, active, onClick }) => (
//   <div
//     className={`flex items-center px-6 py-3 cursor-pointer ${
//       active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
//     }`}
//     onClick={onClick}
//   >
//     <span className="mr-3">{icon}</span>
//     <span className="font-medium">{title}</span>
//   </div>
// );

// // Dashboard content
// const DashboardContent = ({ users, companies, vehicles, drivers }) => (
//   <div>
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//       <StatCard title="Total Users" value={users.length} icon={<Users size={24} className="text-blue-500" />} />
//       <StatCard title="Companies" value={companies.length} icon={<Building size={24} className="text-green-500" />} />
//       <StatCard title="Vehicles" value={vehicles.length} icon={<Truck size={24} className="text-yellow-500" />} />
//       <StatCard title="Drivers" value={drivers.length} icon={<UserCircle size={24} className="text-purple-500" />} />
//     </div>

//     <div className="grid grid-cols-1 text-black lg:grid-cols-2 gap-6">
//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <h3 className="text-lg font-semibold mb-4">Recent Companies</h3>
//         <div className="space-y-4">
//           {companies.slice(0, 3).map(company => (
//             <div key={company._id} className="flex justify-between items-center p-3 border rounded-lg">
//               <div>
//                 <h4 className="font-medium">{company.companyName || company.name}</h4>
//                 <p className="text-sm text-gray-500">{company.address || company.location}</p>
//               </div>
//               <div>
//                 <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
//                   {company.vehicles?.length || company.vehicleCount} Vehicles
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white text-black rounded-lg shadow-sm p-6">
//         <h3 className="text-lg font-semibold mb-4">Vehicle Status</h3>
//         <div className="space-y-4">
//           {vehicles.slice(0, 3).map(vehicle => (
//             <div key={vehicle._id} className="flex justify-between items-center p-3 border rounded-lg">
//               <div>
//                 <h4 className="font-medium">{vehicle.model}</h4>
//                 <p className="text-sm text-gray-500">{vehicle.company?.companyName || vehicle.company}</p>
//               </div>
//               <StatusBadge status={vehicle.status || 'Available'} />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Users content
// const UsersContent = ({ users, onDelete, onEdit }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
//         <Plus size={16} className="mr-2" />
//         Add User
//       </button>
//     </div>

//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {users.map(user => (
//             <tr key={user._id}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
//                     <span className="text-gray-600 font-medium">{user.name?.charAt(0) || 'U'}</span>
//                   </div>
//                   <div className="ml-4">
//                     <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {user.email}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {user.role || 'User'}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <StatusBadge status={user.status || 'Active'} />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 <div className="flex space-x-2">
//                   <button 
//                     onClick={() => onEdit(user)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button 
//                     onClick={() => onDelete(user._id)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// // Companies content
// const CompaniesContent = ({ companies, onDelete, onEdit }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
//         <Plus size={16} className="mr-2" />
//         Add Company
//       </button>
//     </div>

//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drivers</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {companies.map(company => (
//             <tr key={company._id}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                     <Building size={18} className="text-blue-600" />
//                   </div>
//                   <div className="ml-4">
//                     <div className="text-sm font-medium text-gray-900">{company.companyName || company.name}</div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {company.address || company.location}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {company.vehicles?.length || company.vehicleCount}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {company.drivers?.length || company.driverCount}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 <div className="flex space-x-2">
//                   <button 
//                     onClick={() => onEdit(company)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button 
//                     onClick={() => onDelete(company._id)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// // Vehicles content
// const VehiclesContent = ({ vehicles, onDelete, onEdit }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
//         <Plus size={16} className="mr-2" />
//         Add Vehicle
//       </button>
//     </div>

//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {vehicles.map(vehicle => (
//             <tr key={vehicle._id}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
//                     <Truck size={18} className="text-yellow-600" />
//                   </div>
//                   <div className="ml-4">
//                     <div className="text-sm font-medium text-gray-900">
//                       {vehicle.manufacturer} {vehicle.model}
//                     </div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {vehicle.type || vehicle.transmission}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {vehicle.company?.companyName || vehicle.company}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <StatusBadge status={vehicle.status || 'Available'} />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 <div className="flex space-x-2">
//                   <button 
//                     onClick={() => onEdit(vehicle)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button 
//                     onClick={() => onDelete(vehicle._id)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// // Drivers content
// const DriversContent = ({ drivers, onDelete, onEdit }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
//         <Plus size={16} className="mr-2" />
//         Add Driver
//       </button>
//     </div>

//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {drivers.map(driver => (
//             <tr key={driver._id}>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
//                     <UserCircle size={18} className="text-purple-600" />
//                   </div>
//                   <div className="ml-4">
//                     <div className="text-sm font-medium text-gray-900">{driver.name}</div>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {driver.company?.companyName || driver.company}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 {driver.license}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <StatusBadge status={driver.status || 'Available'} />
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                 <div className="flex space-x-2">
//                   <button 
//                     onClick={() => onEdit(driver)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <Edit size={18} />
//                   </button>
//                   <button 
//                     onClick={() => onDelete(driver._id)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// // Stat card component
// const StatCard = ({ title, value, icon }) => (
//   <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
//     <div>
//       <p className="text-3xl font-medium text-gray-500">{title}</p>
//       <p className="text-6xl text-black font-semibold mt-1">{value}</p>
//     </div>
//     <div className="rounded-full bg-gray-100 p-3">
//       {icon}
//     </div>
//   </div>
// );

// // Status badge component
// const StatusBadge = ({ status }) => {
//   let bgColor = 'bg-gray-100 text-gray-800';
//   if (status === 'Active' || status === 'Available') bgColor = 'bg-green-100 text-green-800';
//   if (status === 'Inactive' || status === 'In Use' || status === 'On Trip') bgColor = 'bg-blue-100 text-blue-800';
//   if (status === 'Maintenance' || status === 'Off Duty') bgColor = 'bg-yellow-100 text-yellow-800';

//   return (
//     <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
//       {status}
//     </span>
//   );
// };

// export default AdminDashboard;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Users, Building, Truck, UserCircle, Home, 
//   ChevronDown, Search, Plus, Edit, Trash2, 
//   MoreHorizontal, X 
// } from 'lucide-react';

// const BASE_URL = 'https://car-rental-backend-black.vercel.app';

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [data, setData] = useState({
//     users: [],
//     companies: [],
//     vehicles: [],
//     drivers: []
//   });
//   const [editingItem, setEditingItem] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [addFormData, setAddFormData] = useState({});
//   const [successMessage, setSuccessMessage] = useState(null);

//   // Fetch all data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [usersRes, companiesRes, vehiclesRes, driversRes] = await Promise.all([
//           axios.get(`${BASE_URL}/users/all`),
//           axios.get(`${BASE_URL}/rental-companies/getRental`),
//           axios.get(`${BASE_URL}/vehicles/fetchVehicles`),
//           axios.get(`${BASE_URL}/drivers/getDriver`)
//         ]);

//         setData({
//           users: usersRes.data,
//           companies: companiesRes.data,
//           vehicles: vehiclesRes.data,
//           drivers: driversRes.data
//         });
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setOpenDropdown(null);
//   };

//   const toggleDropdown = (id) => {
//     setOpenDropdown(openDropdown === id ? null : id);
//   };

//   // Handle delete operations
//   const handleDelete = async (type, id) => {
//     try {
//       await axios.delete(`${BASE_URL}/${type}/${id}`);
//       setData(prev => ({
//         ...prev,
//         [type]: prev[type].filter(item => item._id !== id)
//       }));
//       setSuccessMessage(`${type.slice(0, -1)} deleted successfully!`);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle edit operations
//   const handleEdit = (type, item) => {
//     setEditingItem({ type, id: item._id });
//     setEditFormData(item);
//     setShowEditModal(true);
//   };

//   const handleUpdate = async () => {
//     try {
//       const endpoint = editingItem.type === 'companies' ? 'rental-companies' : editingItem.type;
//       await axios.put(`${BASE_URL}/${endpoint}/${editingItem.id}`, editFormData);
      
//       // Update the local state
//       setData(prev => ({
//         ...prev,
//         [editingItem.type]: prev[editingItem.type].map(item => 
//           item._id === editingItem.id ? { ...item, ...editFormData } : item
//         )
//       }));
      
//       setShowEditModal(false);
//       setSuccessMessage(`${editingItem.type.slice(0, -1)} updated successfully!`);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle add operations
//   const handleAdd = async () => {
//     try {
//       let endpoint = activeTab;
//       if (activeTab === 'companies') endpoint = 'rental-companies';
      
//       const response = await axios.post(`${BASE_URL}/${endpoint}`, addFormData);
      
//       // Update the local state
//       setData(prev => ({
//         ...prev,
//         [activeTab]: [...prev[activeTab], response.data]
//       }));
      
//       setShowAddModal(false);
//       setAddFormData({});
//       setSuccessMessage(`${activeTab.slice(0, -1)} added successfully!`);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Reset form when modal is closed
//   const resetAddForm = () => {
//     setAddFormData({});
//     setShowAddModal(false);
//   };

//   // Render content based on active tab
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="bg-red-50 p-4 rounded-lg text-red-600">
//           <p>Error: {error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
//           >
//             Retry
//           </button>
//         </div>
//       );
//     }

//     switch (activeTab) {
//       case 'dashboard':
//         return <DashboardContent {...data} />;
//       case 'users':
//         return (
//           <UsersContent 
//             users={data.users} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('users', id)}
//             onEdit={(user) => handleEdit('users', user)}
//             onAdd={() => setShowAddModal(true)}
//           />
//         );
//       case 'companies':
//         return (
//           <CompaniesContent 
//             companies={data.companies} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('rental-companies', id)}
//             onEdit={(company) => handleEdit('companies', company)}
//             onAdd={() => setShowAddModal(true)}
//           />
//         );
//       case 'vehicles':
//         return (
//           <VehiclesContent 
//             vehicles={data.vehicles} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('vehicles', id)}
//             onEdit={(vehicle) => handleEdit('vehicles', vehicle)}
//             onAdd={() => setShowAddModal(true)}
//           />
//         );
//       case 'drivers':
//         return (
//           <DriversContent 
//             drivers={data.drivers} 
//             toggleDropdown={toggleDropdown} 
//             openDropdown={openDropdown}
//             onDelete={(id) => handleDelete('drivers', id)}
//             onEdit={(driver) => handleEdit('drivers', driver)}
//             onAdd={() => setShowAddModal(true)}
//           />
//         );
//       default:
//         return <DashboardContent {...data} />;
//     }
//   };

//   const EditModal = () => {
//     if (!showEditModal) return null;

//     const handleInputChange = (e) => {
//       const { name, value } = e.target;
//       setEditFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">
//               Edit {editingItem.type.slice(0, -1)}
//             </h3>
//             <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
//               <X size={20} />
//             </button>
//           </div>
          
//           {editingItem.type === 'users' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={editFormData.email || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <input
//                   type="text"
//                   name="phoneNo"
//                   value={editFormData.phoneNo || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'companies' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Company Name</label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={editFormData.companyName || editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full  text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Address</label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={editFormData.address || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <input
//                   type="text"
//                   name="phNum"
//                   value={editFormData.phNum || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'vehicles' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
//                 <input
//                   type="text"
//                   name="manufacturer"
//                   value={editFormData.manufacturer || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Model</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={editFormData.model || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Rent</label>
//                 <input
//                   type="number"
//                   name="rent"
//                   value={editFormData.rent || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           {editingItem.type === 'drivers' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={editFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">License</label>
//                 <input
//                   type="text"
//                   name="license"
//                   value={editFormData.license || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone</label>
//                 <input
//                   type="text"
//                   name="phNo"
//                   value={editFormData.phNo || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                 />
//               </div>
//             </div>
//           )}

//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               onClick={() => setShowEditModal(false)}
//               className="px-4 py-2 border border-gray-300 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md"
//             >
//               Save Changes
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const AddModal = () => {
//     if (!showAddModal) return null;

//     const handleInputChange = (e) => {
//       const { name, value } = e.target;
//       setAddFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     };

//     const handleArrayInputChange = (field, index, value) => {
//       setAddFormData(prev => {
//         const newArray = [...(prev[field] || [])];
//         newArray[index] = value;
//         return {
//           ...prev,
//           [field]: newArray
//         };
//       });
//     };

//     const addArrayField = (field) => {
//       setAddFormData(prev => ({
//         ...prev,
//         [field]: [...(prev[field] || []), '']
//       }));
//     };

//     const removeArrayField = (field, index) => {
//       setAddFormData(prev => ({
//         ...prev,
//         [field]: prev[field].filter((_, i) => i !== index)
//       }));
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 w-full max-w-md">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">
//               Add {activeTab.slice(0, -1)}
//             </h3>
//             <button onClick={resetAddForm} className="text-gray-500 hover:text-gray-700">
//               <X size={20} />
//             </button>
//           </div>
          
//           {activeTab === 'users' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name*</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={addFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email*</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={addFormData.email || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Password*</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={addFormData.password || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone*</label>
//                 <input
//                   type="text"
//                   name="phoneNo"
//                   value={addFormData.phoneNo || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">CNIC*</label>
//                 <input
//                   type="text"
//                   name="cnic"
//                   value={addFormData.cnic || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Address*</label>
//                 <input
//                   type="text"
//                   name="address"
//                   value={addFormData.address || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//             </div>
//           )}

//           {activeTab === 'companies' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Company Name*</label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={addFormData.companyName || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email*</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={addFormData.email || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Password*</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={addFormData.password || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone*</label>
//                 <input
//                   type="text"
//                   name="phNum"
//                   value={addFormData.phNum || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Bank Name*</label>
//                 <input
//                   type="text"
//                   name="bankName"
//                   value={addFormData.bankName || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Account No*</label>
//                 <input
//                   type="text"
//                   name="accountNo"
//                   value={addFormData.accountNo || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//             </div>
//           )}

//           {activeTab === 'vehicles' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Manufacturer*</label>
//                 <input
//                   type="text"
//                   name="manufacturer"
//                   value={addFormData.manufacturer || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Model*</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={addFormData.model || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Number Plate*</label>
//                 <input
//                   type="text"
//                   name="numberPlate"
//                   value={addFormData.numberPlate || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Rent*</label>
//                 <input
//                   type="number"
//                   name="rent"
//                   value={addFormData.rent || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Capacity*</label>
//                 <input
//                   type="number"
//                   name="capacity"
//                   value={addFormData.capacity || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Transmission*</label>
//                 <select
//                   name="transmission"
//                   value={addFormData.transmission || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 >
//                   <option value="">Select Transmission</option>
//                   <option value="Auto">Auto</option>
//                   <option value="Manual">Manual</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Availability Days*</label>
//                 <div className="mt-1 flex flex-wrap gap-2">
//                   {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
//                     <label key={day} className="inline-flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={addFormData.availability?.days?.includes(day) || false}
//                         onChange={(e) => {
//                           const days = [...(addFormData.availability?.days || [])];
//                           if (e.target.checked) {
//                             days.push(day);
//                           } else {
//                             const index = days.indexOf(day);
//                             if (index > -1) {
//                               days.splice(index, 1);
//                             }
//                           }
//                           setAddFormData(prev => ({
//                             ...prev,
//                             availability: {
//                               ...prev.availability,
//                               days
//                             }
//                           }));
//                         }}
//                         className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//                       />
//                       <span className="ml-2">{day}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Start Time*</label>
//                   <input
//                     type="time"
//                     name="startTime"
//                     value={addFormData.availability?.startTime || ''}
//                     onChange={(e) => {
//                       setAddFormData(prev => ({
//                         ...prev,
//                         availability: {
//                           ...prev.availability,
//                           startTime: e.target.value
//                         }
//                       }));
//                     }}
//                     className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">End Time*</label>
//                   <input
//                     type="time"
//                     name="endTime"
//                     value={addFormData.availability?.endTime || ''}
//                     onChange={(e) => {
//                       setAddFormData(prev => ({
//                         ...prev,
//                         availability: {
//                           ...prev.availability,
//                           endTime: e.target.value
//                         }
//                       }));
//                     }}
//                     className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Cities</label>
//                 {(addFormData.cities || []).map((city, index) => (
//                   <div key={index} className="flex items-center space-x-2 mt-2">
//                     <input
//                       type="text"
//                       placeholder="City name"
//                       value={city.name || ''}
//                       onChange={(e) => handleArrayInputChange('cities', index, {
//                         ...city,
//                         name: e.target.value
//                       })}
//                       className="flex-1 block text-black border border-gray-300 rounded-md p-2"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Additional fee"
//                       value={city.additionalFee || ''}
//                       onChange={(e) => handleArrayInputChange('cities', index, {
//                         ...city,
//                         additionalFee: e.target.value
//                       })}
//                       className="w-24 block text-black border border-gray-300 rounded-md p-2"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeArrayField('cities', index)}
//                       className="p-2 text-red-600 hover:text-red-800"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={() => addArrayField('cities')}
//                   className="mt-2 flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
//                 >
//                   <Plus size={14} className="mr-1" /> Add City
//                 </button>
//               </div>
//             </div>
//           )}

//           {activeTab === 'drivers' && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name*</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={addFormData.name || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">License*</label>
//                 <input
//                   type="text"
//                   name="license"
//                   value={addFormData.license || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Phone*</label>
//                 <input
//                   type="text"
//                   name="phNo"
//                   value={addFormData.phNo || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Age*</label>
//                 <input
//                   type="number"
//                   name="age"
//                   value={addFormData.age || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Experience (years)*</label>
//                 <input
//                   type="number"
//                   name="experience"
//                   value={addFormData.experience || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">CNIC*</label>
//                 <input
//                   type="text"
//                   name="cnic"
//                   value={addFormData.cnic || ''}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
//                   required
//                 />
//               </div>
//             </div>
//           )}

//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               onClick={resetAddForm}
//               className="px-4 py-2 border border-gray-300 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleAdd}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md"
//             >
//               Add {activeTab.slice(0, -1)}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-white shadow-md">
//         <div className="p-6 border-b">
//           <h1 className="text-xl font-bold text-gray-800">Rental Admin</h1>
//         </div>
//         <nav className="mt-6">
//           <SidebarLink 
//             icon={<Home size={20} />} 
//             title="Dashboard" 
//             active={activeTab === 'dashboard'} 
//             onClick={() => handleTabChange('dashboard')} 
//           />
//           <SidebarLink 
//             icon={<Users size={20} />} 
//             title="Users" 
//             active={activeTab === 'users'} 
//             onClick={() => handleTabChange('users')} 
//           />
//           <SidebarLink 
//             icon={<Building size={20} />} 
//             title="Companies" 
//             active={activeTab === 'companies'} 
//             onClick={() => handleTabChange('companies')} 
//           />
//           <SidebarLink 
//             icon={<Truck size={20} />} 
//             title="Vehicles" 
//             active={activeTab === 'vehicles'} 
//             onClick={() => handleTabChange('vehicles')} 
//           />
//           <SidebarLink 
//             icon={<UserCircle size={20} />} 
//             title="Drivers" 
//             active={activeTab === 'drivers'} 
//             onClick={() => handleTabChange('drivers')} 
//           />
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 overflow-auto">
//         <header className="bg-white shadow-sm">
//           <div className="flex justify-between items-center px-6 py-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
//             </h2>
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex items-center space-x-3">
//                 <img
//                   src="/api/placeholder/40/40" 
//                   alt="Admin"
//                   className="w-8 h-8 rounded-full"
//                 />
//                 <span className="font-medium">Admin User</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="p-6">
//           {successMessage && (
//             <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
//               {successMessage}
//             </div>
//           )}
//           {renderContent()}
//         </main>
//       </div>

//       <EditModal />
//       <AddModal />
//     </div>
//   );
// };

// // Update your content components to include the onAdd prop
// const UsersContent = ({ users, toggleDropdown, openDropdown, onDelete, onEdit, onAdd }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button 
//         className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
//         onClick={onAdd}
//       >
//         <Plus size={16} className="mr-2" />
//         Add User
//       </button>
//     </div>

//     {/* Rest of the UsersContent component remains the same */}
//     {/* ... */}
//   </div>
// );

// const CompaniesContent = ({ companies, toggleDropdown, openDropdown, onDelete, onEdit, onAdd }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button 
//         className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
//         onClick={onAdd}
//       >
//         <Plus size={16} className="mr-2" />
//         Add Company
//       </button>
//     </div>

//     {/* Rest of the CompaniesContent component remains the same */}
//     {/* ... */}
//   </div>
// );

// const VehiclesContent = ({ vehicles, toggleDropdown, openDropdown, onDelete, onEdit, onAdd }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button 
//         className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
//         onClick={onAdd}
//       >
//         <Plus size={16} className="mr-2" />
//         Add Vehicle
//       </button>
//     </div>

//     {/* Rest of the VehiclesContent component remains the same */}
//     {/* ... */}
//   </div>
// );

// const DriversContent = ({ drivers, toggleDropdown, openDropdown, onDelete, onEdit, onAdd }) => (
//   <div>
//     <div className="flex justify-between items-center mb-6">
//       <button 
//         className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
//         onClick={onAdd}
//       >
//         <Plus size={16} className="mr-2" />
//         Add Driver
//       </button>
//     </div>

//     {/* Rest of the DriversContent component remains the same */}
//     {/* ... */}
//   </div>
// );

// // The rest of your components (SidebarLink, DashboardContent, StatCard, StatusBadge) remain the same
// // ...

// export default AdminDashboard;