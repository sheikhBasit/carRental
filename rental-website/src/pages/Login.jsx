import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import Cookies from "js-cookie";
import "../style/Login.css";
import { useGoogleAuth } from "../components/GoogleAuth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCompanyLogin, setIsCompanyLogin] = useState(false);
  const { isLoading, renderGoogleButton, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Render the Google sign-in button
    if (googleButtonRef.current) {
      renderGoogleButton("google-login-button");
    }
  }, [renderGoogleButton]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");

    try {
      // First try user login
      let response = await fetch("https://car-rental-backend-black.vercel.app/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();

      if (!response.ok) {
        // If user login fails, try company login
        response = await fetch("https://car-rental-backend-black.vercel.app/rental-companies/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed. Please try again.");
        }

        // Company login successful
        setIsCompanyLogin(true);
      }

      // Store user/company data in cookies with 7-day expiration
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
      } else if (data.company?._id) {
        Cookies.set("company", JSON.stringify({
          id: data.company._id,
          email: data.company.email,
          companyName: data.company.companyName,
          isCompany: true
        }), { expires: 7 });
        
        if (data.token) {
          Cookies.set("token", data.token, { expires: 7 });
        }
      }

      // Redirect based on user type
      if (isCompanyLogin) {
        navigate("/company-dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="login-left">
        <img src="./assets/login.jpg" alt="Car Rental" className="login-image" />
      </div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-box text-black">
          <h2 className="fw-bold mb-3">Welcome back</h2>
          <p className="text-secondary mb-4">Please enter your login details below</p>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control text-black"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <small className="text-danger">{error}</small>}
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control text-black"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-between text-black align-items-center mb-4">
              <a href="#" className="text-primary text-decoration-none">Forgot Password?</a>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary text-white py-2 mb-3"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Log in"}
            </button>
            
            {/* Google Sign In */}
            <div 
              id="google-login-button" 
              ref={googleButtonRef}
              className="mb-3"
            >
              <button 
                type="button"
                className="btn btn-outline-secondary py-2 d-flex align-items-center justify-content-center"
                onClick={signInWithGoogle}
              >
                <FaGoogle className="me-2 text-danger" />
                Continue with Google
              </button>
            </div>
          </form>

          {/* Sign Up & Terms */}
          <div className="mt-4">
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-primary text-decoration-none">
                Sign Up as User
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;