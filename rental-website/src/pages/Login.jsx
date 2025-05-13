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
  const { isLoading, renderGoogleButton, signInWithGoogle } = useGoogleAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (googleButtonRef.current && window.google) {
        renderGoogleButton("google-login-button");
        clearInterval(interval);
      }
    }, 300);
  
    return () => clearInterval(interval);
  }, []);
  
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
      const response = await fetch("https://car-rental-backend-black.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("respnose",response);  
      console.log(data);
      if (!response.ok) {
        throw new Error(`Error ${data.message}` || "Login failed. Please try again.");
      }

      // Store user/company data in cookies with 7-day expiration
      if (data.user?._id) {
        Cookies.set("user", JSON.stringify({
          id: data.user._id,
          email: data.user.email,
          name: data.user.name,
          city: data.user.city,
          token: data.token
        }), { expires: 7 });
        console.log("token", data.token);
        localStorage.setItem("token", data.token);
        if (data.token) {
          Cookies.set("token", data.token, { expires: 7 });
        }

       }

      // Redirect after login
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
              <a href="/forgot-password" className="text-primary text-decoration-none">Forgot Password?</a>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary text-white py-2 mb-3"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Log in"}
            </button>
          </form>

          {/* Google Sign In */}
          <div 
            id="google-login-button" 
            ref={googleButtonRef}
            className="mb-3"
          ></div>


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
