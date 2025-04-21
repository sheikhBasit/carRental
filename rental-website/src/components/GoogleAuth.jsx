import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google OAuth
  useEffect(() => {
    // Load the Google API script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
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
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
    }
  };

  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    try {
      // Send the ID token to your backend
      const googleResponse = await fetch("http://192.168.1.4:5000/users/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          idToken: response.credential 
        }),
      });

      const data = await googleResponse.json();

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

  const renderGoogleButton = (customId = "google-login-button") => {
    if (window.google) {
      setTimeout(() => {
        window.google.accounts.id.renderButton(
          document.getElementById(customId),
          { 
            type: "standard", 
            theme: "outline", 
            size: "large",
            width: "100%",
            text: "continue_with",
            logo_alignment: "center"
          }
        );
      }, 100);
    }
  };

  const signInWithGoogle = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return { isLoading, renderGoogleButton, signInWithGoogle };
};