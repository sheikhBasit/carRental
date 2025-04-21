import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CarList from "./pages/CarList";
import BookNow from "./pages/BookNow";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CarDetail from "./pages/CarDetail";
import Service from "./pages/Service";
import Contact from "./pages/Contact";
import CarRentalMarket from "./pages/CarMarket";
import AboutUs from "./pages/AboutUs";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import CarRentalMarketWrapper from "./components/CarRentalMarketWrapper";
import RentalCompanyDashboard from './pages/HostDashboard'
import LandingPage from "./pages/Landing";
import AdminDashboard  from "./pages/AdminDashboard";
import ChatApplication from "./pages/Inbox";
import FavoritesPage from "./pages/Favorites";
import UserTripsPage from "./pages/Trips";
import RentalCompanySignUp from "./pages/RentalSignUp";
import CompanyLogin from "./pages/RentalLogin";
import DriveFleetHomepage from "./pages/Work";
import LegalMattersPage from "./pages/Legal";
import AccountPage from "./pages/Account";
// import BookNow from "./pages/BookNow";
import { CookiesProvider } from 'react-cookie';
import BookingDetail from "./pages/BookingDetail";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="">
      {!hideHeaderFooter && <Header />}
      <main className="">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cars" element={<CarList />} />
          <Route path="/booking/:id" element={<BookNow />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/car-detail/:vehicleId" element={<CarDetail />} />
          <Route 
          path="/car-rental/:brand" 
          element={<CarRentalMarketWrapper />} />
          <Route path="/company-dashboard" element={<RentalCompanyDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/inbox" element={<ChatApplication />} />
          <Route path="/trips" element={<UserTripsPage />} />
          <Route path="/rental-signup" element={<RentalCompanySignUp />} />
          <Route path="/rental-login" element={<CompanyLogin />} />
          <Route path="/how-it-works" element={<DriveFleetHomepage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
             <Route path="/legal" element={<LegalMattersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingDetail />} />
          <Route path="/service" element={<Service />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/auth/reset-password/:token" element={<ResetPasswordScreen />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <CookiesProvider>
      <Layout />
      </CookiesProvider>
    </Router>
  );
}

export default App;
