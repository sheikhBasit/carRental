import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import DashboardLayout from './DashboardLayout';
import LoadingIndicator from './LoadingIndicator';
import ErrorDisplay from './ErrorDisplay';

const BASE_URL = 'https://car-rental-backend-black.vercel.app';

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
      const companyData = Cookies.get('company');
      console.log('Company data from cookies:', companyData);
      if (companyData) {
        const parsedCompany = JSON.parse(companyData);
        console.log('Parsed company data:', parsedCompany);
        setCompany(parsedCompany);
      }
    }, []);
  
    // Fetch dashboard data
    useEffect(() => {
      const fetchDashboardData = async () => {
        if (!company?.id) {
          console.log('No company ID found, skipping data fetch');
          return;
        }
  
        try {
          console.log('Starting to fetch dashboard data for company ID:', company.id);
          setDashboardData(prev => ({ ...prev, loading: true, error: null }));
          
          const queryParams = { company: company.id };
          
          console.log('API request URLs:', {
            vehicles: `${BASE_URL}/vehicles/company?company=${company.id}`,
            drivers: `${BASE_URL}/drivers/company?company=${company.id}`,
            bookings: `${BASE_URL}/bookings/companyBookings?company=${company.id}`,
            transactions: `${BASE_URL}/transaction/company/${company.id}`
          });
        
          const [
            vehiclesRes, 
            driversRes, 
            bookingsRes,
            transactionsRes
          ] = await Promise.all([
            axios.get(`${BASE_URL}/vehicles/company`, { params: queryParams }),
            axios.get(`${BASE_URL}/drivers/company`, { params: queryParams }),
            axios.get(`${BASE_URL}/bookings/companyBookings`, { params: queryParams }),
            axios.get(`${BASE_URL}/transaction/company/${company.id}`)
          ]);
          
          console.log("booking",bookingsRes.data)
          // Process responses
          const vehiclesData = vehiclesRes.data?.vehicles || [];
          const driversData = driversRes.data.data || [];
          const bookingsData = bookingsRes.data || [];
          const transactionsData = transactionsRes.data || []; // This is now an array of transactions
          
          console.log('API Responses:', {
            vehicles: vehiclesData,
            drivers: driversData,
            bookings: bookingsData,
            transactions: transactionsData
          });
        
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
          console.error('Error fetching dashboard data:', {
            message: error.message,
            config: error.config,
            response: error.response?.data
          });
          
          setDashboardData(prev => ({
            ...prev,
            loading: false,
            error: `Failed to fetch data: ${error.response?.data?.message || error.message}`
          }));
        }
      };
  
      if (company) {
        console.log('Company detected, fetching dashboard data');
        fetchDashboardData();
      }
    }, [company]);
    
    useEffect(() => {
      console.log('Current dashboard data state:', dashboardData);
    }, [dashboardData]);
    
    useEffect(() => {
      console.log('Current company state:', company);
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