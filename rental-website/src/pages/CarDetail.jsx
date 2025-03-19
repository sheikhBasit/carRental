import React, { useState, useEffect } from "react";
import { useParams, Link,  } from "react-router-dom";
import "../style/CarDetail.css"; // Import the CSS file for media queries

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://192.168.100.17:5000/vehicles/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        setCar(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!car) return <div>Car not found.</div>;

  return (
    <div className="car-detail-container">
      

      <div className="car-detail-content">
        {/* Left Side - Car Image */}
        <div className="car-image-container">
          <img
            src={car.carImageUrl}
            alt={car.model}
            className="car-image"
            style={{ height: "500px" }} // Set image height to 500px
          />
        </div>

        {/* Right Side - Car Details & Company Info */}
        <div className="car-details">
          <h1 className="car-model">{car.model}</h1>
          <p className="car-manufacturer">
            🚗 Manufacturer: <span>{car.manufacturer}</span>
          </p>
          <p className="car-speed">
            ⚡ Capacity: <span>{car.capacity || "N/A"}</span>
          </p>
          <p className="car-fuel">
            ⛽ Transmission: <span>{car.transmission || "N/A"}</span>
          </p>
          <p className="car-rating">★★★★★</p>

          {/* Rental Price & Booking */}
          <div className="rental-price">
            <p className="price">${car.rent}</p>
            <Link to={`/booking/${car._id}`}>
              <button className="book-now-button">Book Now</button>
            </Link>
          </div>

          {/* Company Info */}
          <div className="company-info">
            <h3 className="company-name">🏢 {car.company.companyName}</h3>
            <p className="company-location">📍 Location: {car.company.address}</p>
            <p className="company-contact">📞 Contact: {car.company.phNum || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;