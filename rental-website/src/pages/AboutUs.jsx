import React from "react";
import "../style/AboutUs.css"; // Import the CSS file for styling

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>
      <div className="about-content">
        <p>
          Welcome to <strong>Car Rental</strong>, your trusted partner for car rentals. We are dedicated to providing you with the best car rental experience, offering a wide range of vehicles to suit your needs.
        </p>
        <p>
          Our mission is to make car rental simple, affordable, and convenient. Whether you're traveling for business or leisure, we have the perfect vehicle for you.
        </p>
        <p>
          With years of experience in the industry, we pride ourselves on our excellent customer service and commitment to quality. Our team is always here to help you find the right car for your journey.
        </p>
      </div>
      <div className="team-section">
        <h2>Our Team</h2>
        <div className="team-members">
          <div className="team-member">
            <img src="/assets/team1.jpg" alt="Team Member 1" />
            <h3>John Doe</h3>
            <p>CEO</p>
          </div>
          <div className="team-member">
            <img src="/assets/team2.jpg" alt="Team Member 2" />
            <h3>Jane Smith</h3>
            <p>COO</p>
          </div>
          <div className="team-member">
            <img src="/assets/team3.jpg" alt="Team Member 3" />
            <h3>Mike Johnson</h3>
            <p>CTO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;