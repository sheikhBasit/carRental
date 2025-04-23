import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock, FaBuilding } from "react-icons/fa";
import Cookies from "js-cookie";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
            <FaBuilding className="text-indigo-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Company Portal</h2>
          <p className="text-indigo-200 mt-1">Manage your rental business</p>
        </div>
        
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">Welcome back</h3>
          <p className="text-gray-500 mb-6 text-sm">Please enter your company credentials</p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                className="pl-10 pr-3 py-3 w-full text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Company Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                className="pl-10 pr-3 py-3 text-black w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end mb-6">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                Forgot Password?
              </a>
            </div>
            
            <button
              type="submit"
              className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Sign In"}
            </button>
            
            <div className="my-6 flex items-center">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>
            
            <div id="google-login-button" ref={googleButtonRef}>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full text-black bg-white flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="text-red-500" />
                <span className="text-gray-700">Continue with Google</span>
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/rental-signup" className="text-indigo-600 hover:underline font-medium">
                Register your company
              </a>
            </p>
            <p className="text-gray-600 mt-3 text-sm">
              Are you a user?{" "}
              <button
                className="text-white  hover:underline font-medium bg-black border-0 p-0 cursor-pointer"
                onClick={() => navigate('/login')}
              >
                User Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;