import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import "../style/Signup.css";
import { useGoogleAuth } from "../components/GoogleAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { isLoading, renderGoogleButton, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",       // Maps to 'name' in the schema
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",          // Maps to 'phoneNo' in the schema
    cnic: "",
    licenseNumber: "",  // Maps to 'license' in the schema
    address: "",
    accountNo: "",      // Added missing field
    city: "",           // Added missing field
    province: "",       // Added missing field
    fcmToken: "",       // Added missing field (optional)
  });

  const [files, setFiles] = useState({
    cnicFront: null,    // Will be stored as 'cnicFrontUrl' in DB
    cnicBack: null,     // Will be stored as 'cnicBackUrl' in DB
    licenseFront: null, // Will be stored as 'licenseFrontUrl' in DB
    licenseBack: null,  // Will be stored as 'licenseBackUrl' in DB
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    setIsSubmitting(true);
    setError("");

    // Validate all required fields
    const requiredFields = [
      'fullName', 'email', 'password', 'confirmPassword', 'phone', 
      'cnic', 'licenseNumber', 'address', 'accountNo', 'city', 'province'
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError("Phone number must be exactly 11 digits and start with '03'.");
      setIsSubmitting(false);
      return;
    }

    if (!validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Must be XXXXX-XXXXXXX-X.");
      setIsSubmitting(false);
      return;
    }

    if (!validateAccountNo(formData.accountNo)) {
      setError("Account number must be 10-16 digits.");
      setIsSubmitting(false);
      return;
    }

    // Check file uploads
    const requiredFiles = ["cnicFront", "cnicBack", "licenseFront", "licenseBack", "profilePic"];
    for (let key of requiredFiles) {
      if (!files[key]) {
        setError(`All required images (CNIC, License & Profile Picture) must be uploaded.`);
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
        'licenseNumber': 'license'
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
      if (files.licenseFront) formDataToSend.append('licenseFront', files.licenseFront);
      if (files.licenseBack) formDataToSend.append('licenseBack', files.licenseBack);
      if (files.profilePic) formDataToSend.append('profilePic', files.profilePic);

      // Setup fetch options with credentials
      const fetchOptions = {
        method: "POST",
        body: formDataToSend,
        credentials: 'include', // Include cookies in the request
      };

      const response = await fetch("https://car-rental-backend-black.vercel.app/users/create", fetchOptions);
      // const response = await fetch("http://192.168.100.17:5000/users/create", fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed. Please try again.");
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      
      navigate("/", { state: { successMessage: "Registration successful! Please verify your email." } });
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container text-black">
      <div className="signup-left">
        <img src="/assets/signup.jpg" alt="Car Rental" className="signup-image" />
        <h1 className="signup-title">Car Rental</h1>
      </div>

      <div className="signup-right">
        <div className="signup-box">
          <h2 className="signup-heading">Create a New Account</h2>
          <p className="signup-subheading">Please enter your sign-up details</p>

          {error && <div className="signup-error">{error}</div>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                id="fullName"
                name="fullName" 
                className="form-control" 
                placeholder="Enter Full Name" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                className="form-control" 
                placeholder="Enter your email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  className="form-control" 
                  placeholder="8-20 characters" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword" 
                  className="form-control" 
                  placeholder="Re-enter password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="text" 
                id="phone"
                name="phone" 
                className="form-control" 
                placeholder="03XXXXXXXXX" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="city">City</label>
                <input 
                  type="text" 
                  id="city"
                  name="city" 
                  className="form-control" 
                  placeholder="Enter your city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="province">Province</label>
                <select 
                  id="province"
                  name="province" 
                  className="form-control" 
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

            <div className="form-group">
              <label htmlFor="accountNo">Bank Account Number</label>
              <input 
                type="text" 
                id="accountNo"
                name="accountNo" 
                className="form-control" 
                placeholder="Enter your bank account number" 
                value={formData.accountNo} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="cnic">CNIC Number</label>
              <input 
                type="text" 
                id="cnic"
                name="cnic" 
                className="form-control" 
                placeholder="XXXXX-XXXXXXX-X" 
                value={formData.cnic} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber">License Number</label>
              <input 
                type="text" 
                id="licenseNumber"
                name="licenseNumber" 
                className="form-control" 
                placeholder="Enter License Number" 
                value={formData.licenseNumber} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input 
                type="text" 
                id="address"
                name="address" 
                className="form-control" 
                placeholder="Enter complete address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="file-upload-section">
              <h3 className="upload-heading">Upload Documents</h3>
              
              <div className="form-row">
                <div className="file-group half-width">
                  <label htmlFor="cnicFront">CNIC Front:</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      id="cnicFront"
                      name="cnicFront" 
                      onChange={handleFileChange} 
                      accept="image/*,.pdf"
                      required 
                    />
                    {files.cnicFront && (
                      <span className="file-selected">
                        ✓ {files.cnicFront.name.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="file-group half-width">
                  <label htmlFor="cnicBack">CNIC Back:</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      id="cnicBack"
                      name="cnicBack" 
                      onChange={handleFileChange} 
                      accept="image/*,.pdf"
                      required 
                    />
                    {files.cnicBack && (
                      <span className="file-selected">
                        ✓ {files.cnicBack.name.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="file-group half-width">
                  <label htmlFor="licenseFront">License Front:</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      id="licenseFront"
                      name="licenseFront" 
                      onChange={handleFileChange} 
                      accept="image/*,.pdf"
                      required 
                    />
                    {files.licenseFront && (
                      <span className="file-selected">
                        ✓ {files.licenseFront.name.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="file-group half-width">
                  <label htmlFor="licenseBack">License Back:</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      id="licenseBack"
                      name="licenseBack" 
                      onChange={handleFileChange} 
                      accept="image/*,.pdf"
                      required 
                    />
                    {files.licenseBack && (
                      <span className="file-selected">
                        ✓ {files.licenseBack.name.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="file-group">
                  <label htmlFor="profilePic">Profile Picture:</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      id="profilePic"
                      name="profilePic" 
                      onChange={handleFileChange} 
                      accept="image/*"
                      required 
                    />
                    {files.profilePic && (
                      <span className="file-selected">
                        ✓ {files.profilePic.name.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="terms-container">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="terms" 
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  required 
                />
                <label className="form-check-label" htmlFor="terms">
                  I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="signup-button" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Processing..." : "Sign Up"}
            </button>

            <div className="signup-divider">
              <hr />
              <span>or</span>
              <hr />
            </div>

            <div 
              id="google-login-button" 
              ref={googleButtonRef}
              className="google-button-container"
            >
              <button 
                type="button"
                className="google-button"
                onClick={signInWithGoogle}
                disabled={isSubmitting || isLoading}
              >
                <FaGoogle className="google-icon" />
                Continue with Google
              </button>
            </div>

            <p className="signup-footer">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;