import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Vehicles from './Vehicles';
import Drivers from './Drivers';
import Bookings from './Bookings';
import LoadingIndicator from './LoadingIndicator';
import ErrorDisplay from './ErrorDisplay';

const DashboardLayout = ({ company, dashboardData, error, loading }) => {
    const [activeSection, setActiveSection] = useState('overview');
  
    const renderActiveSection = () => {
      if (loading) {
        return <LoadingIndicator />;
      }
  
      if (error) {
        return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
      }
  
      switch (activeSection) {
        case 'overview':
          return <Overview dashboardData={dashboardData} />;
        case 'vehicles':
          return <Vehicles 
            vehicles={dashboardData.vehicles} 
            company={company} 
          />;
        case 'drivers':
          return <Drivers 
            drivers={dashboardData.drivers} 
            company={company} 
          />;
        case 'bookings':
          return <Bookings 
            bookings={dashboardData.bookings} 
            vehicles={dashboardData.vehicles} 
          />;
        default:
          return <Overview dashboardData={dashboardData} />;
      }
    };
  
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          company={company} 
        />
        
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-black">
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'vehicles' && 'Vehicle Fleet Management'}
              {activeSection === 'drivers' && 'Driver Management'}
              {activeSection === 'bookings' && 'Booking Management'}
            </h1>
            
            {renderActiveSection()}
          </div>
        </main>
      </div>
    );
  };
export default DashboardLayout;