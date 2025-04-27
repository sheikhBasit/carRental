import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

// import axios from 'axios';

const RentalCompanySignUp = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phNum: '',
    bankName: '',
    bankTitle: '',
    accountNo: '',
    cnic: '',
    address: '',
    city: '',
    province: '',
  });
  
  // File state
  const [files, setFiles] = useState({
    cnicFront: null,
    cnicBack: null,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  // Preview images
  const [previews, setPreviews] = useState({
    cnicFront: null,
    cnicBack: null,
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name.trim()]: value, // Trim the name to remove any accidental spaces
    }));
  };
  
  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    
    if (fileList && fileList[0]) {
      // Validate file type and size
      if (!fileList[0].type.match('image.*')) {
        setError('Please upload an image file (JPEG, PNG)');
        return;
      }
      
      if (fileList[0].size > 2 * 1024 * 1024) {
        setError('File size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(fileList[0]);
      
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  };
  
  const validateForm = () => {
    setError('');

    if (step === 1) {
      if (!formData.companyName.trim()) {
        setError('Company name is required');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      const phoneRegex = /^03\d{2}-\d{7}$/;
      if (!phoneRegex.test(formData.phNum)) {
        setError('Phone number must be in format: 03XX-XXXXXXX');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicRegex.test(formData.cnic)) {
        setError('CNIC must be in format: 12345-1234567-1');
        return false;
      }
      
      if (!formData.address.trim()) {
        setError('Address is required');
        return false;
      }
      
      if (!formData.city.trim()) {
        setError('City is required');
        return false;
      }
      
      if (!formData.province) {
        setError('Please select a province');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.bankName.trim()) {
        setError('Bank name is required');
        return false;
      }
      
      if (!formData.bankTitle.trim()) {
        setError('Account title is required');
        return false;
      }
      
      if (!formData.accountNo.trim()) {
        setError('Account number is required');
        return false;
      }
      
      if (!files.cnicFront || !files.cnicBack) {
        setError('Please upload both sides of your CNIC');
        return false;
      }
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
  
    try {
      const formDataToSend = new FormData();
      
      // Append all form data except confirmPassword
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirmPassword' && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
  
      // Append files
      if (files.cnicFront) formDataToSend.append('cnicFront', files.cnicFront);
      if (files.cnicBack) formDataToSend.append('cnicBack', files.cnicBack);
  
      const response = await fetch(
        'https://car-rental-backend-black.vercel.app/rental-companies/postRental',
        {
          method: 'POST',
          body: formDataToSend,
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
  
      // Store company data in cookies
      const companyData = {
        id: data.company._id,
        name: data.company.companyName,
        email: data.company.email,
        status: data.company.status,
        // Add other relevant fields you want to store
      };
  
      // Set cookie with 7-day expiration
      Cookies.set('rentalCompany', JSON.stringify(companyData), {
        expires: 7, // days
        secure: true,
        sameSite: 'strict'
      });
  
      navigate('/company-dashboard', { 
        state: { 
          message: data.message || 'Registration successful!',
          success: true,
          company: data.company
        } 
      });
  
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  const provinceOptions = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Jammu & Kashmir',
    'Islamabad Capital Territory'
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Register as a Rental Company</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our network and start listing your rental properties
          </p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {step >= 1 ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">Company Details</span>
            </div>
            
            <div className="flex-1 h-0.5 mx-4 bg-gray-200">
              <div className={`h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {step >= 2 ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">Verification</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name*
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email*
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="phNum" className="block text-sm font-medium text-gray-700">
                    Phone Number*
                  </label>
                  <input
                    id="phNum"
                    name="phNum"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    required
                    value={formData.phNum}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password* (min 8 characters)
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength="8"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password*
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="cnic" className="block text-sm font-medium text-gray-700">
                    CNIC Number* (format: 12345-1234567-1)
                  </label>
                  <input
                    id="cnic"
                    name="cnic"
                    type="text"
                    placeholder="12345-1234567-1"
                    required
                    pattern="\d{5}-\d{7}-\d{1}"
                    value={formData.cnic}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address*
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City*
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                    Province*
                  </label>
                  <select
                    id="province"
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select Province</option>
                    {provinceOptions.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Step
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                    Bank Name*
                  </label>
                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={handleChange}
                    className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="bankTitle" className="block text-sm font-medium text-gray-700">
                    Account Title*
                  </label>
                  <input
                    id="bankTitle"
                    name="bankTitle"
                    type="text"
                    required
                    value={formData.bankTitle}
                    onChange={handleChange}
                    className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="accountNo" className="block text-sm font-medium text-gray-700">
                    Account Number*
                  </label>
                  <input
                    id="accountNo"
                    name="accountNo"
                    type="text"
                    required
                    value={formData.accountNo}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 text-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNIC Front Side*</label>
                  <div className="mt-1">
                    <label htmlFor="cnicFront" className="cursor-pointer block">
                      {previews.cnicFront ? (
                        <div className="relative">
                          <img 
                            src={previews.cnicFront} 
                            alt="CNIC Front Preview" 
                            className="h-40 w-full object-contain border rounded-md" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviews(prev => ({...prev, cnicFront: null}));
                              setFiles(prev => ({...prev, cnicFront: null}));
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="h-40 w-full border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-sm">Upload CNIC Front</span>
                          <span className="text-xs text-gray-500">(JPEG/PNG, max 2MB)</span>
                        </div>
                      )}
                    </label>
                    <input
                      id="cnicFront"
                      name="cnicFront"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNIC Back Side*</label>
                  <div className="mt-1">
                    <label htmlFor="cnicBack" className="cursor-pointer block">
                      {previews.cnicBack ? (
                        <div className="relative">
                          <img 
                            src={previews.cnicBack} 
                            alt="CNIC Back Preview" 
                            className="h-40 w-full object-contain border rounded-md" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviews(prev => ({...prev, cnicBack: null}));
                              setFiles(prev => ({...prev, cnicBack: null}));
                            }}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="h-40 w-full border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-sm">Upload CNIC Back</span>
                          <span className="text-xs text-gray-500">(JPEG/PNG, max 2MB)</span>
                        </div>
                      )}
                    </label>
                    <input
                      id="cnicBack"
                      name="cnicBack"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2 text-xs text-gray-500">
                  <p>
                    By registering, you agree to our Terms of Service and Privacy Policy.
                    Your CNIC information will be kept secure and used only for verification purposes.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center text-white px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/rental-login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentalCompanySignUp;