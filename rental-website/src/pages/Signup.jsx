import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import "../style/Signup.css"; // Import the external CSS file

const Signup = () => {
  const navigate = useNavigate();

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

  const [error, setError] = useState("");

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

    setError("");

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("cnic", formData.cnic);
      formDataToSend.append("licenseNumber", formData.licenseNumber);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("cnicFront", files.cnicFront);
      formDataToSend.append("cnicBack", files.cnicBack);
      formDataToSend.append("licenseFront", files.licenseFront);
      formDataToSend.append("licenseBack", files.licenseBack);

      // Send POST request to backend
      const response = await fetch("http://192.168.100.17:5000/users/create", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      // Redirect to login page on success
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
          <h2 className="fw-bold mb-2">Create a New Account</h2>
          <p className="text-muted">Please enter your sign-up details</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <input type="text" name="fullName" className="form-control" placeholder="Enter Full Name" value={formData.fullName} onChange={handleChange} required />
            <input type="email" name="email" className="form-control" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" className="form-control" placeholder="Password (8-20 characters)" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <input type="text" name="phone" className="form-control" placeholder="Enter your phone (03XXXXXXXXX)" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="cnic" className="form-control" placeholder="Enter CNIC (XXXXX-XXXXXXX-X)" value={formData.cnic} onChange={handleChange} required />
            <input type="text" name="licenseNumber" className="form-control" placeholder="Enter License Number" value={formData.licenseNumber} onChange={handleChange} required />
            <input type="text" name="address" className="form-control" placeholder="Enter address" value={formData.address} onChange={handleChange} required />

            {/* File Uploads */}
            <div className="file-upload-section">
              <label>CNIC Front:</label>
              <input type="file" name="cnicFront" onChange={handleFileChange} required />
              <label>CNIC Back:</label>
              <input type="file" name="cnicBack" onChange={handleFileChange} required />
              <label>License Front:</label>
              <input type="file" name="licenseFront" onChange={handleFileChange} required />
              <label>License Back:</label>
              <input type="file" name="licenseBack" onChange={handleFileChange} required />
            </div>

            <button type="submit" className="btn btn-primary">Sign Up</button>

            <div className="signup-divider">
              <hr />
              <span>or</span>
              <hr />
            </div>

            <button type="button" className="signup-google-btn">
              <FaGoogle /> Continue with Google
            </button>
          </form>

          <p className="signup-footer">
            Already have an account? <a href="/login">Login</a>
          </p>

          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="terms" required />
            <label className="form-check-label" htmlFor="terms">
              I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;