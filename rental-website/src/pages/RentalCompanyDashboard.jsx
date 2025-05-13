import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import DashboardLayout from './DashboardLayout';
import { api } from '../../utils/api';
import { getCompanyFromCookies } from '../../utils/auth';

const RentalCompanyDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        stats: null,
        vehicles: [], 
        drivers: [],
        bookings: [],
        transactions: [],
        loading: true,
        error: null
    });
    const [company, setCompany] = useState(null);

    // Memoized fetch function
    const fetchDashboardData = useCallback(async (companyId) => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));
            
            // Parallel fetch with optimized requests
            const [vehicles, drivers, bookings, transactions] = await Promise.all([
                api.getVehicles(companyId).then(res => res.data?.vehicles || []).catch(() => []),
                api.getDrivers(companyId).then(res => res.data.data || []).catch(() => []),
                api.getBookings(companyId).then(res => res.data || []).catch(() => []),
                fetch(`https://car-rental-backend-black.vercel.app/api/transaction/company/${companyId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    cache: 'force-cache' // Enable browser caching
                })
                .then(res => res.json())
                .catch(() => [])
            ]);

            // Calculate statistics in parallel with state update
            const activeBookings = bookings.filter(b => b.status === 'active');
            const transactionRevenue = transactions
                .filter(t => t.paymentStatus === 'completed')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            
            const stats = {
                totalVehicles: vehicles.length,
                totalDrivers: drivers.length,
                activeTrips: activeBookings.length,
                revenue: transactions.length > 0 
                    ? transactionRevenue
                    : bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
                occupancyRate: vehicles.length > 0 
                    ? (activeBookings.length / vehicles.length) * 100
                    : 0
            };
            
            // Single state update with all data
            setDashboardData({
                stats,
                vehicles,
                drivers,
                bookings,
                transactions,
                loading: false,
                error: null
            });
            
        } catch (error) {
            console.error("Dashboard data fetch error:", error);
            setDashboardData(prev => ({
                ...prev,
                loading: false,
                error: `Failed to fetch data: ${error.response?.data?.message || error.message}`
            }));
        }
    }, []);

    // Initial data loading
    useEffect(() => {
        const companyData = getCompanyFromCookies();
        if (companyData) {
            setCompany(companyData);
            fetchDashboardData(companyData.id);
        }
    }, [fetchDashboardData]);

    return (
        <DashboardLayout 
            company={company} 
            dashboardData={dashboardData} 
            error={dashboardData.error}
            loading={dashboardData.loading}
        />
    );
};

export default React.memo(RentalCompanyDashboard);