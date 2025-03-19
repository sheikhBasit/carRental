import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import Cookies from "js-cookie"; // Import js-cookie to handle cookies
import "../style/Login.css"; // Import CSS file for media queries

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Email validation regex
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Clear previous errors
    setError("");

    try {
      // Send login request to the server
      const response = await fetch("http://192.168.100.17:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Store userId in localStorage
      if (data.user._id) {
        localStorage.setItem("userId", data.user._id); // Store userId in localStorage
        console.log("User ID stored in localStorage:", localStorage.getItem("userId"));
      }

      // Store city in cookies
      if (data.user.city) {
        Cookies.set("city", data.user.city, { expires: 7 }); // Store city for 7 days
        console.log("City stored in cookies:", Cookies.get("city"));
      }

      // Redirect to dashboard or home page
      navigate("/");
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="login-left">
        <img src="./assets/login.jpg" alt="Car Rental" className="login-image" />
        <h1 className="text-primary fw-bold">Car Rental</h1>
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-box">
          <h2 className="fw-bold mb-2">Welcome back</h2>
          <p className="text-muted">Please enter your login details below to use Name</p>

          {/* Login Form */}
          <div className="p-4 rounded bg-white w-100">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  className="form-control p-3"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <small className="text-danger">{error}</small>}
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  className="form-control p-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <input type="checkbox" id="remember" className="me-2" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#" className="text-primary text-decoration-none">Forgot Password?</a>
              </div>
              <button type="submit" className="btn btn-primary w-100 p-3 mb-3">Log in</button>
              <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center p-3">
                <FaGoogle className="me-2 text-danger" />
                Continue with Google
              </button>
            </form>
          </div>

          {/* Sign Up & Terms */}
          <p className="text-center text-muted mt-3">
            Don't have an account? <a href="/signup" className="text-primary text-decoration-none">Sign Up</a>
          </p>
          <div className="form-check text-center mt-3">
            <input type="checkbox" className="form-check-input" id="terms" required />
            <label className="form-check-label ms-2" htmlFor="terms">
              I agree to the <a href="#" className="text-primary">Terms & Conditions</a> and 
              <a href="#" className="text-primary"> Privacy Policy</a>.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;