import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../style/BookNow.css"; // Import the CSS file for styling

const API_URL = "http://192.168.100.17:5000/bookings/postBooking";

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

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://192.168.100.17:5000/vehicles/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        setError("Failed to fetch car details.",error);
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
          `http://192.168.100.17:5000/drivers/company?company=${car.company._id}`
        );
        const result = await response.json();

        if (response.ok) {
          setDrivers(result.drivers || []);
        } else {
          setError("Failed to fetch drivers.");
        }
      } catch (error) {
        setError("Error fetching drivers. Please try again.",error);
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

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!car) {
      alert("Car details are missing!");
      return;
    }

    const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    const bookingData = {
      idVehicle: car._id,
      user: userId,
      company: car.company._id || null,
      driver: selectedDriver || null,
      from: fromDate.toISOString().split("T")[0],
      to: toDate.toISOString().split("T")[0],
      intercity,
      cityName: intercity ? "" : cityName,
      status: "pending",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Booking Confirmed!");
        navigate("/"); // Redirect to home page
      } else {
        alert(result.error || "Booking failed!");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to confirm booking. Try again.");
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
          <h1>{car.manufacturer} {car.model}</h1>
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

        {/* Confirm Booking Button */}
        <button className="confirm-button" onClick={handleConfirmBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BookNow;