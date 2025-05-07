import Cookies from "js-cookie";

// utils/auth.js
export const getAuthToken = () => {
    try {
        const token = localStorage.getItem('token');
        
        // Handle cases where token is null, undefined, or empty string
        if (!token?.trim()) {
            return null;
        }
        
        // Simple validation - check if token is a valid JWT format (xxx.yyy.zzz)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log("Invalid token format, clearing token");
            localStorage.removeItem('token');
            return null;
        }
        
        return token;
    } catch (error) {
        console.log("Error accessing token:", error);
        localStorage.removeItem('token');
        return null;
    }
};

export const getCompanyFromCookies = () => {
    try {
        const companyData = Cookies.get('company');
        return companyData ? JSON.parse(companyData) : null;
    } catch (error) {
        console.log("Error parsing company data:", error);
        return null;
    }
};