import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import Cookies from "js-cookie";
import "../style/Login.css";
import { useGoogleAuth } from "../components/GoogleAuth";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isLoading, renderGoogleButton, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
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
      const response = await fetch("https://car-rental-backend-black.vercel.app/rental-companies/login", {
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

      // Company login successful
      Cookies.set("company", JSON.stringify({
        id: data.company._id,
        email: data.company.email,
        companyName: data.company.companyName,
        isCompany: true
      }), { expires: 7 });
      
      if (data.token) {
        Cookies.set("token", data.token, { expires: 7 });
      }

      navigate("/company-dashboard");

    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-box text-black">
      <h2 className="fw-bold mb-3">Company Login</h2>
      <p className="text-secondary mb-4">Please enter your company login details</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control text-black"
            placeholder="Enter company email"
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

      <div className="mt-4">
        <p>
          Don't have an account?{" "}
          <a href="/rental-signup" className="text-primary text-decoration-none">
            Register your company
          </a>
        </p>
      </div>
      <p>
        Are you a user?{" "}
        <button 
          className="text-primary text-white text-decoration-none btn btn-link p-0"
          onClick={() => navigate('login')}
        >
          User Login
        </button>
      </p>
    </div>
  );
};

export default CompanyLogin;