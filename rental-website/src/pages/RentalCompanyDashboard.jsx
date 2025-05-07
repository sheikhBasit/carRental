import React, { useState, useEffect } from 'react';
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
  
    // Fetch company from cookies on component mount
    useEffect(() => {
      const companyData = getCompanyFromCookies();
      if (companyData) {
        setCompany(companyData);
      }
    }, []);
  
    // Fetch dashboard data
    useEffect(() => {
      const fetchDashboardData = async () => {
        if (!company?.id) {
          return;
        }

        console.log("company",company)
  
        try {
          setDashboardData(prev => ({ ...prev, loading: true, error: null }));
          
          // Use the API utility for fetching data with authentication
          const [
            vehiclesRes, 
            driversRes, 
            bookingsRes,
            transactionsRes
          ] = await Promise.allSettled([
            api.getVehicles(company.id),
            api.getDrivers(company.id),
            api.getBookings(company.id),
            fetch(`https://car-rental-backend-black.vercel.app/api/transaction/company/${company.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }).then(res => res.json())
          ]);
          console.log("vehiclesRes",vehiclesRes)
          console.log("driversRes",driversRes)
          console.log("bookingsRes",bookingsRes)
          console.log("transactionsRes",transactionsRes)
          
          const vehiclesData = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.data?.vehicles || [] : [];
          const driversData = driversRes.status === 'fulfilled' ? driversRes.value.data.data || [] : [];
          const bookingsData = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data || [] : [];
          const transactionsData = transactionsRes.status === 'fulfilled' ? transactionsRes.value || [] : [];
          console.log("transactionsData",transactionsData)
          console.log("bookingsData",bookingsData)
          console.log("vehiclesData",vehiclesData)
          console.log("driversData",driversData)




          // Calculate statistics
          const activeBookings = bookingsData.filter(b => b.status === 'active');
          
          // Calculate revenue from completed transactions
          const transactionRevenue = transactionsData
            .filter(t => t.paymentStatus === 'completed')
            .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
            
          // Fall back to bookings calculation if no transactions exist
          const totalRevenue = transactionsData.length > 0 
            ? transactionRevenue
            : bookingsData.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
          
          const occupancyRate = vehiclesData.length > 0 
            ? (activeBookings.length / vehiclesData.length) * 100
            : 0;
        
          const stats = {
            totalVehicles: vehiclesData.length,
            totalDrivers: driversData.length,
            activeTrips: activeBookings.length,
            revenue: totalRevenue,
            occupancyRate: occupancyRate
          };
          
          // Update state
          setDashboardData({
            stats,
            vehicles: vehiclesData,
            drivers: driversData,
            bookings: bookingsData,
            transactions: transactionsData, // Store transactions in state
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
      };
  
      if (company) {
        fetchDashboardData();
      }
    }, [company]);
  
    return (
      <DashboardLayout 
        company={company} 
        dashboardData={dashboardData} 
        error={dashboardData.error}
        loading={dashboardData.loading}
      />
    );
};

export default RentalCompanyDashboard;