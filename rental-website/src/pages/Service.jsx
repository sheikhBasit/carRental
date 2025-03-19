import React from "react";
import "../style/Service.css"; // Import the CSS file for styling

const Service = () => {
  return (
    <div className="service-container">
      <h1 className="service-title">Our Services</h1>
      <div className="service-list">
        <div className="service-item">
          <h2>Car Rentals</h2>
          <p>
            We offer a wide range of vehicles for rent, from economy cars to luxury vehicles. Whether you need a car for a day or a month, we have you covered.
          </p>
        </div>
        <div className="service-item">
          <h2>24/7 Support</h2>
          <p>
            Our customer support team is available 24/7 to assist you with any questions or issues you may have during your rental period.
          </p>
        </div>
        <div className="service-item">
          <h2>Flexible Booking</h2>
          <p>
            Book your car online or through our app. You can modify or cancel your booking anytime without any hassle.
          </p>
        </div>
        <div className="service-item">
          <h2>Insurance Options</h2>
          <p>
            We provide comprehensive insurance options to ensure your peace of mind while driving our vehicles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Service;