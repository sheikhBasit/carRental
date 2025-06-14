import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CarList from "./pages/CarList";
import BookNow from "./pages/BookNow";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CarDetail from "./pages/CarDetail";
import Service from "./pages/Service";
import Contact from "./pages/Contact";
import VerificationScreen from "./pages/Verification";
import CarRentalMarket from "./pages/CarMarket";
import AboutUs from "./pages/AboutUs";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import CarRentalMarketWrapper from "./components/CarRentalMarketWrapper";
import RentalCompanyDashboard from './pages/RentalCompanyDashboard';
import LandingPage from "./pages/Landing";
import ChatApplication from "./pages/Inbox";
import FavoritesPage from "./pages/Favorites";
import UserTripsPage from "./pages/Trips";
import RentalCompanySignUp from "./pages/RentalSignUp";
import CompanyLogin from "./pages/RentalLogin";
import DriveFleetHomepage from "./pages/Work";
import LegalMattersPage from "./pages/Legal";
import AccountPage from "./pages/Account";
import { CookiesProvider } from 'react-cookie';
import BookingDetail from "./pages/BookingDetail";
import MotorwayGuide from "./pages/Guide";
import NorthernGuide from "./pages/ReadMore";
import ExploreRoadTrips from "./pages/Explore";
import BookingDetails from "./pages/BookingDetails";
import CompanyVerificationScreen from "./pages/RentalVerification";
import ForgotPassword from "./pages/ForgotPassword";

function Layout() {
  const location = useLocation();
  // Updated condition to include rental-login and rental-signup pages
  const hideHeaderFooter = [
    "/login", 
    "/signup", 
    "/rental-login", 
    "/rental-signup",
    "/auth/reset-password",
    "/company-dashboard",
  ].some(path => location.pathname.includes(path));

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
          <Route path="/car-detail/:vehicleId" element={<CarDetail />} />
          <Route path="/car-rental/:brand" element={<CarRentalMarketWrapper />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/company-dashboard" element={<RentalCompanyDashboard />} />
          <Route path="/inbox" element={<ChatApplication />} />
          <Route path="/trips" element={<UserTripsPage />} />
          <Route path="/verify-email" element={<VerificationScreen />} />
          <Route path="/rental-signup" element={<RentalCompanySignUp />} />
          <Route path="/rental-login" element={<CompanyLogin />} />
          <Route path="/how-it-works" element={<DriveFleetHomepage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/legal" element={<LegalMattersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/rental-verification" element={<CompanyVerificationScreen />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingDetail />} />
          <Route path="/service" element={<Service />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/guide" element={<MotorwayGuide />} />
          <Route path="/explore" element={<ExploreRoadTrips />} />
          <Route path="/readmore" element={<NorthernGuide />} />
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