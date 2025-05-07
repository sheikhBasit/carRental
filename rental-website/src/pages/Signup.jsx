import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaUpload, FaCheck } from "react-icons/fa";
import { useGoogleAuth } from "../components/GoogleAuth";
import Cookies from 'js-cookie';

const Signup = () => {
  const navigate = useNavigate();
  const { isLoading, renderGoogleButton, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",       // Maps to 'name' in the schema
    email: "",
    password: "",
    phoneNo: "",    // Use phoneNo instead of phone
    cnic: "",       // Added missing field
    address: "",
    accountNo: "",  // Added missing field
    city: "",       // Added missing field
    province: "",   // Added missing field
    age: "",        // Added missing field
    role: "customer",       // Added missing field
    fcmToken: "",   // Added missing field (optional)
    isVerified:true   // Added missing field (optional)
  });

  const [files, setFiles] = useState({
    cnicFront: null,    // Will be stored as 'cnicFrontUrl' in DB
    cnicBack: null,     // Will be stored as 'cnicBackUrl' in DB
    profilePic: null,   // Will be stored as 'profilePic' in DB
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (googleButtonRef.current) {
      renderGoogleButton("google-login-button");
    }
  }, [renderGoogleButton]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnic") {
      let numericCNIC = value.replace(/\D/g, "");
      if (numericCNIC.length > 5) {
        numericCNIC = numericCNIC.slice(0, 5) + "-" + numericCNIC.slice(5);
      }
      if (numericCNIC.length > 13) {
        numericCNIC = numericCNIC.slice(0, 13) + "-" + numericCNIC.slice(13, 14);
      }
      if (numericCNIC.length > 15) {
        numericCNIC = numericCNIC.slice(0, 15);
      }
      setFormData({ ...formData, cnic: numericCNIC });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles({ ...files, [name]: fileList[0] });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^03\d{9}$/.test(phone);
  const validateCNIC = (cnic) => /^\d{5}-\d{7}-\d{1}$/.test(cnic);
  const validatePassword = (password) => password.length >= 8 && password.length <= 20;
  const validateAccountNo = (accountNo) => /^\d{10,16}$/.test(accountNo); // Basic validation for account number
  const validateAge = (age) => /^\d+$/.test(age) && age >= 18 && age <= 100; // Validate age between 18 and 100

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate all required fields
    const requiredFields = [
      'name', 'email', 'password', 'phoneNo', 
      'cnic', 'address', 'city', 'province', 'age'
    ];
    
    for (let key of requiredFields) {
      if (!formData[key]) {
        setError(`${key === 'fullName' ? 'Full Name' : key} is required.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be between 8 to 20 characters.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phoneNo)) {
      setError("Phone number must be exactly 11 digits and start with '03'.");
      setIsSubmitting(false);
      return;
    }

    if (!validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Must be XXXXX-XXXXXXX-X.");
      setIsSubmitting(false);
      return;
    }

    if (formData.accountNo && !validateAccountNo(formData.accountNo)) {
      setError("Account number must be 10-16 digits.");
      setIsSubmitting(false);
      return;
    }

    if (!validateAge(formData.age)) {
      setError("Age must be between 18 and 100.");
      setIsSubmitting(false);
      return;
    }

    // Check file uploads
    const requiredFiles = ["cnicFront", "cnicBack", "profilePic"];
    for (let key of requiredFiles) {
      if (!files[key]) {
        setError(`All required images (CNIC & Profile Picture) must be uploaded.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions to continue.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Map form field names to database field names where they differ
      const fieldMappings = {
        'fullName': 'name',
        'phone': 'phoneNo',
      };
      
      // Append form data with proper field mappings
      for (const key in formData) {
        // Don't send confirmPassword to backend
        if (key !== 'confirmPassword') {
          const dbFieldName = fieldMappings[key] || key;
          formDataToSend.append(dbFieldName, formData[key]);
        }
      }
      
      // Append files with correct field names as expected by backend
      if (files.cnicFront) formDataToSend.append('cnicFront', files.cnicFront);
      if (files.cnicBack) formDataToSend.append('cnicBack', files.cnicBack);
      if (files.profilePic) formDataToSend.append('profilePic', files.profilePic);
      // Setup fetch options with credentials
      const fetchOptions = {
        method: "POST",
        body: formDataToSend,
        credentials: 'include', // Include cookies in the request
      };

      const response = await fetch("https://car-rental-backend-black.vercel.app/api/users/create", fetchOptions);
      
      if (!response.ok || response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes("image") || errorData.message?.includes("upload") || errorData.message?.includes("server") || errorData.message?.includes("FUNCTION_INVOCATION_FAILED") ) {
          throw new Error("Image upload failed. Please check your files and try again.");
        }
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }

      const data = await response.json();
      console.log(data)
      // ---------- SAVE USER DATA TO COOKIES ----------
  
  if (data.user?._id) {
        Cookies.set("user", JSON.stringify({
          id: data.user._id,
          email: data.user.email,
          name: data.user.name,
          city: data.user.city
        }), { expires: 7 });

        if (data.token) {
          Cookies.set("token", data.token, { expires: 7 });
        }

       }  
      // ---------- NAVIGATE TO HOME ----------
   
      Cookies.set('unverifiedEmail', formData.email, { expires: 1 }); // Store for 1 day
      navigate('/verify-email', { state: { email: formData.email } });} 
      catch (error) {
      if (error.message.includes("FUNCTION_INVOCATION_FAILED")) {
        setError("Server error occurred during image processing. Please try again with different images.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to truncate file names
  const truncateFileName = (fileName, maxLength = 18) => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative">
        <img src="/assets/signup.jpg" alt="Car Rental" className="w-full h-full object-cover absolute inset-0 opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Car Rental</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-2">Create a New Account</h2>
          <p className="text-gray-600 text-center mb-6">Please enter your sign-up details</p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8-20 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNo"
                name="phoneNo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="03XXXXXXXXX"
                value={formData.phoneNo}
                maxLength={11}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province
                </label>
                <select
                  id="province"
                  name="province"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.province}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Province</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  <option value="AJK">Azad Jammu & Kashmir</option>
                  <option value="ICT">Islamabad Capital Territory</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number
              </label>
              <input
                type="text"
                id="cnic"
                name="cnic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXX-XXXXXXX-X"
                value={formData.cnic}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            {/* <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div> */}

            {/* Document Upload Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* CNIC Front */}
                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">CNIC Front</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <label htmlFor="cnicFront" className="cursor-pointer block">
                      {files.cnicFront ? (
                        <div className="flex items-center text-green-600">
                          <FaCheck className="mr-2" />
                          <span className="text-sm">{truncateFileName(files.cnicFront.name)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <FaUpload className="text-xl mb-1" />
                          <span className="text-sm">Upload CNIC Front</span>
                        </div>
                      )}
                      <input
                        type="file"
                        id="cnicFront"
                        name="cnicFront"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
                
                {/* CNIC Back */}
                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">CNIC Back</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    <label htmlFor="cnicBack" className="cursor-pointer block">
                      {files.cnicBack ? (
                        <div className="flex items-center text-green-600">
                          <FaCheck className="mr-2" />
                          <span className="text-sm">{truncateFileName(files.cnicBack.name)}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <FaUpload className="text-xl mb-1" />
                          <span className="text-sm">Upload CNIC Back</span>
                        </div>
                      )}
                      <input
                        type="file"
                        id="cnicBack"
                        name="cnicBack"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Profile Picture */}
              <div className="border rounded-lg p-3 mb-6">
                <h4 className="text-sm font-medium mb-2">Profile Picture</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <label htmlFor="profilePic" className="cursor-pointer block">
                    {files.profilePic ? (
                      <div className="flex items-center text-green-600">
                        <FaCheck className="mr-2" />
                        <span className="text-sm">{truncateFileName(files.profilePic.name)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <FaUpload className="text-xl mb-1" />
                        <span className="text-sm">Upload Profile Picture</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="profilePic"
                      name="profilePic"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> and{" "}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Processing..." : "Sign Up"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google Login */}
            <div
              id="google-login-button"
              ref={googleButtonRef}
              className="mb-6"
            >
              <button
                type="button"
                className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-300"
                onClick={signInWithGoogle}
                disabled={isSubmitting || isLoading}
              >
                <FaGoogle className="mr-2 text-red-500" />
                Continue with Google
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;