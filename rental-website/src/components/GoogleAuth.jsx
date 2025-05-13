import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google OAuth
  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById('google-login-script')) {
        initializeGoogleAuth();
        return;
      }
    
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-login-script';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    };
    

    loadGoogleScript();
  }, []);

  const initializeGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "653881740326-ffik3jqv62v2t5iglbjigt63qdjvtn5c.apps.googleusercontent.com",
        callback: handleGoogleCallback,
      });
      
    }
  };

  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    try {
      // Send the ID token to your backend
      const googleResponse = await fetch("https://car-rental-backend-black.vercel.app/api/google/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          idToken: response.credential 
        }),
      });

      const data = await googleResponse.json();
      console.log(data)
      if (!googleResponse.ok) {
        throw new Error(data.message || "Google login failed");
      }

      // Store user data
      if (data.user?._id) {
        localStorage.setItem("userId", data.user._id);
        if (data.user.city) {
          Cookies.set("city", data.user.city, { expires: 7 });
        }
      }

      // Redirect to homepage
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoogleButton = (elementId) => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: "outline",
          size: "large",
          width: "100%",
        }
      );
    }
  };
  

  const signInWithGoogle = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return { isLoading, renderGoogleButton, signInWithGoogle };
};