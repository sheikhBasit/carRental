import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../style/BookNow.css";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51RCixfPOwJcw4TunDpaIvFjYc3FWO69gD7ivHSBQKgR4vPWWzhIy0oqfvnilYSe3dlkdwQCvGMUvikRPAWw1BKYX00NnJmVGqW");

const API_URL = "https://car-rental-backend-black.vercel.app/bookings/postBooking";

const PaymentForm = ({ handleConfirmBooking }) => {
  const _stripe = useStripe();
  const _elements = useElements();

  return (
    <div className="payment-form">
      <CardElement />
      <button className="confirm-button" onClick={handleConfirmBooking}>
        Confirm Booking
      </button>
    </div>
  );
};

const BookNow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [intercity, setIntercity] = useState(false);
  const [cityName, setCityName] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`https://car-rental-backend-black.vercel.app/vehicles/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        setError("Failed to fetch car details.");
        console.error(error);
      }
    };

    fetchCarDetails();
  }, [id]);

  // Fetch drivers for the car's company
  useEffect(() => {
    if (!car?.company?._id) return;

    const fetchDrivers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://car-rental-backend-black.vercel.app/drivers/company?company=${car.company._id}`
        );
        const result = await response.json();

        if (response.ok) {
          setDrivers(result.drivers || []);
        } else {
          setError("Failed to fetch drivers.");
        }
      } catch (error) {
        setError("Error fetching drivers. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [car]);

  // Handle date pickers
  const handleFromDateChange = (event) => {
    setFromDate(new Date(event.target.value));
  };

  const handleToDateChange = (event) => {
    setToDate(new Date(event.target.value));
  };

  // Handle driver selection
  const handleDriverSelect = (driverId) => {
    setSelectedDriver(driverId === selectedDriver ? "" : driverId);
  };

  const handlePaymentInitiation = () => {
    setShowPaymentForm(true);
  };

  const handleConfirmBooking = async () => {
    if (!car) {
      alert("Car details are missing!");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    // Calculate total amount (days * rent)
    const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) || 1;
    const amount = days * car.rent;

    try {
      // 1. First create the booking
      const bookingResponse = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idVehicle: car._id,
          user: userId,
          company: car.company._id || null,
          driver: selectedDriver || null,
          from: fromDate.toISOString().split("T")[0],
          to: toDate.toISOString().split("T")[0],
          intercity,
          cityName: intercity ? "" : cityName,
          status: "pending",
          amount
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingResult.error || "Booking failed!");
      }

      // 2. Create payment intent
      const paymentResponse = await fetch("https://car-rental-backend-black.vercel.app/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingResult._id,
          amount,
          currency: "usd"
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment setup failed");
      }

      // 3. Confirm payment with Stripe
      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: Elements.getElement(CardElement),
          billing_details: {
            name: "Customer Name",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // 4. Confirm payment on backend
        await fetch("https://car-rental-backend-black.vercel.app/stripe/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId: bookingResult._id,
            userId
          }),
        });

        alert("Booking and payment confirmed!");
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert(error.message || "Failed to complete booking. Please try again.");
    }
  };

  if (!car) return <div>Loading car details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-now-container">
      <div className="book-now-content">
        {/* Car Image */}
        <img src={car.carImageUrl} alt={car.model} className="car-image" />

        {/* Car Details */}
        <div className="car-details">
          <h1>
            {car.manufacturer.charAt(0).toUpperCase() + car.manufacturer.slice(1)}{" "}
            {car.model.charAt(0).toUpperCase() + car.model.slice(1)}
          </h1>
          <p>${car.rent}/day</p>
        </div>

        {/* Date Pickers */}
        <div className="date-pickers">
          <label>
            From Date:
            <input
              type="date"
              value={fromDate.toISOString().split("T")[0]}
              onChange={handleFromDateChange}
            />
          </label>
          <label>
            To Date:
            <input
              type="date"
              value={toDate.toISOString().split("T")[0]}
              onChange={handleToDateChange}
            />
          </label>
        </div>

        {/* Intercity Switch */}
        <div className="intercity-switch">
          <label>
            Intercity:
            <input
              type="checkbox"
              checked={intercity}
              onChange={(e) => setIntercity(e.target.checked)}
            />
          </label>
        </div>

        {/* City Name Input */}
        {!intercity && (
          <div className="city-name-input">
            <input
              type="text"
              placeholder="City Name"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
          </div>
        )}

        {/* Driver Selection */}
        {loading ? (
          <p>Loading drivers...</p>
        ) : drivers.length > 0 ? (
          <div className="driver-selection">
            <h3>Select a Driver</h3>
            <div className="drivers-list">
              {drivers.map((driver) => (
                <div
                  key={driver._id}
                  className={`driver-card ${selectedDriver === driver._id ? "selected" : ""}`}
                  onClick={() => handleDriverSelect(driver._id)}
                >
                  <img src={driver.profileimg} alt={driver.name} className="driver-image" />
                  <p>{driver.name}</p>
                  <p>Age: {driver.age}</p>
                  <p>Experience: {driver.experience} years</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No drivers available.</p>
        )}

        {/* Payment Section */}
        {showPaymentForm ? (
          <Elements stripe={stripePromise}>
            <PaymentForm handleConfirmBooking={handleConfirmBooking} />
          </Elements>
        ) : (
          <button className="confirm-button" onClick={handlePaymentInitiation}>
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default BookNow;