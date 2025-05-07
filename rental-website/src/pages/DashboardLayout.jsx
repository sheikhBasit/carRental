import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Vehicles from './Vehicles';
import Drivers from './Drivers';
import Bookings from './Bookings';
import LoadingIndicator from './LoadingIndicator';
import ErrorDisplay from './ErrorDisplay';

const DashboardLayout = ({ company, dashboardData, error, loading }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (error) {
            setHasError(true);
        } else {
            setHasError(false);
        }
    }, [error]);

    const handleSectionChange = (section) => {
        // Remove the restriction that prevents navigation when there's an error
        setActiveSection(section);
    };

    const renderActiveSection = () => {
        if (loading) return <LoadingIndicator />;

        // Create empty data structure for new companies with no data
        const emptyData = {
            stats: { totalVehicles: 0, totalDrivers: 0, revenue: 0, occupancyRate: 0 },
            vehicles: [],
            drivers: [],
            bookings: []
        };
        
        // Use either the dashboardData or the empty data structure if there's an error
        const safeData = (!dashboardData && hasError) ? emptyData : dashboardData;

        switch (activeSection) {
            case 'overview':
                return (
                    <>
                        {hasError && <ErrorDisplay error={error} onRetry={() => window.location.reload()} />}
                        {safeData && <Overview dashboardData={safeData} loading={loading} error={null} />}
                    </>
                );
            case 'vehicles':
                return (
                    <>
                        {hasError && <div className="mb-4">
                            <ErrorDisplay error={{message: "No vehicle data found. You can add vehicles below."}} onRetry={() => window.location.reload()} />
                        </div>}
                        <Vehicles vehicles={safeData?.vehicles || []} company={company} />
                    </>
                );
            case 'drivers':
                return (
                    <>
                        {hasError && <div className="mb-4">
                            <ErrorDisplay error={{message: "No driver data found. You can add drivers below."}} onRetry={() => window.location.reload()} />
                        </div>}
                        <Drivers drivers={safeData?.drivers || []} company={company} />
                    </>
                );
            case 'bookings':
                return (
                    <>
                        {hasError && <div className="mb-4">
                            <ErrorDisplay error={{message: "No booking data found. Add vehicles and drivers first."}} onRetry={() => window.location.reload()} />
                        </div>}
                        <Bookings 
                            bookings={safeData?.bookings || []} 
                            vehicles={safeData?.vehicles || []} 
                        />
                    </>
                );
            default:
                return (
                    <>
                        {hasError && <ErrorDisplay error={error} onRetry={() => window.location.reload()} />}
                        {safeData && <Overview dashboardData={safeData} loading={loading} error={null} />}
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={handleSectionChange} 
                company={company}
                hasError={hasError}
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