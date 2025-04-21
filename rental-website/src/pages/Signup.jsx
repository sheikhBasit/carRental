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

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cnic: "",
    licenseNumber: "",
    address: "",
  });

  const [files, setFiles] = useState({
    cnicFront: null,
    cnicBack: null,
    licenseFront: null,
    licenseBack: null,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    for (let key in formData) {
      if (!formData[key]) {
        setError("All fields are required.");
        return;
      }
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be between 8 to 20 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError("Phone number must be exactly 11 digits and start with '03'.");
      return;
    }

    if (!validateCNIC(formData.cnic)) {
      setError("Invalid CNIC format. Must be XXXXX-XXXXXXX-X.");
      return;
    }

    // Check if all required files are uploaded
    if (!files.cnicFront || !files.cnicBack || !files.licenseFront || !files.licenseBack) {
      setError("All required images (CNIC & License) must be uploaded.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions to continue.");
      return;
    }

    setError("");

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      
      for (const key in files) {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      }

      const response = await fetch("https://car-rental-backend-black.vercel.app/users/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="signup-container">
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
              
              <div className="form-row ">
                <div className="file-group half-width">
                  <label htmlFor="cnicFront">CNIC Front:</label>
                  <div className="file-input-container text-black">
                    <input 
                      type="file" 
                      id="cnicFront"
                      name="cnicFront" 
                      onChange={handleFileChange} 
                      required 
                    />
                    {files.cnicFront && <span className="file-selected">✓ File Selected</span>}
                  </div>
                </div>
                
                <div className="file-group half-width">
                  <label htmlFor="cnicBack">CNIC Back:</label>
                  <div className="file-input-container text-black">
                    <input 
                      type="file" 
                      id="cnicBack"
                      name="cnicBack" 
                      onChange={handleFileChange} 
                      required 
                    />
                    {files.cnicBack && <span className="file-selected">✓ File Selected</span>}
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="file-group half-width">
                  <label htmlFor="licenseFront">License Front:</label>
                  <div className="file-input-container text-black">
                    <input 
                      type="file" 
                      id="licenseFront"
                      name="licenseFront" 
                      onChange={handleFileChange} 
                      required 
                    />
                    {files.licenseFront && <span className="file-selected">✓ File Selected</span>}
                  </div>
                </div>
                
                <div className="file-group half-width">
                  <label htmlFor="licenseBack">License Back:</label>
                  <div className="file-input-container text-black">
                    <input 
                      type="file" 
                      id="licenseBack"
                      name="licenseBack" 
                      onChange={handleFileChange} 
                      required 
                    />
                    {files.licenseBack && <span className="file-selected">✓ File Selected</span>}
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

            <button type="submit" className="signup-button" disabled={isLoading}>
              {isLoading ? "Please wait..." : "Sign Up"}
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