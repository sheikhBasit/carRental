import React from "react";
import "../style/AboutUs.css"; // Import the CSS file for styling

const AboutUs = () => {
  return (
    <div className="about-container text-black">
      <div className="hero-section">
        <h1 className="about-title text-black">About Us</h1>
        <p className="about-subtitle text-black">Your Journey, Our Priority</p>
      </div>
      
      <div className="about-content">
        <p className="text-black">
          Welcome to <strong>Car Rental</strong>, your trusted partner for car rentals. We are dedicated to providing you with the best car rental experience, offering a wide range of vehicles to suit your needs.
        </p>
        <p className="text-black">
          Our mission is to make car rental simple, affordable, and convenient. Whether you're traveling for business or leisure, we have the perfect vehicle for you.
        </p>
        <p className="text-black">
          With years of experience in the industry, we pride ourselves on our excellent customer service and commitment to quality. Our team is always here to help you find the right car for your journey.
        </p>
        <p className="text-black">
          Founded in 2010, Car Rental has grown from a small local business to a nationwide service with locations in over 50 cities. Our success is built on our commitment to customer satisfaction and our passion for providing reliable transportation solutions.
        </p>
      </div>

      <div className="our-values-section">
        <h2 className="text-black">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3 className="text-black">Customer First</h3>
            <p className="text-black">We prioritize your needs and preferences above all else.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">✅</div>
            <h3 className="text-black">Quality Service</h3>
            <p className="text-black">We maintain our vehicles to the highest standards for your safety.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💰</div>
            <h3 className="text-black">Affordable Pricing</h3>
            <p className="text-black">We offer competitive rates without compromising on quality.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌱</div>
            <h3 className="text-black">Sustainability</h3>
            <p className="text-black">We're committed to reducing our environmental footprint.</p>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h2 className="text-black">Our Leadership Team</h2>
        <div className="team-members">
          <div className="team-member">
            <img src="/assets/team1.jpg" alt="Team Member 1" />
            <h3 className="text-black">John Doe</h3>
            <p className="text-black">CEO</p>
            <p className="member-bio text-black">With over 15 years of experience in the automotive industry, John leads our company with vision and dedication.</p>
          </div>
          <div className="team-member">
            <img src="/assets/team2.jpg" alt="Team Member 2" />
            <h3 className="text-black">Jane Smith</h3>
            <p className="text-black">COO</p>
            <p className="member-bio text-black">Jane ensures our operations run smoothly and efficiently, with a focus on customer satisfaction.</p>
          </div>
          <div className="team-member">
            <img src="/assets/team3.jpg" alt="Team Member 3" />
            <h3 className="text-black">Mike Johnson</h3>
            <p className="text-black">CTO</p>
            <p className="member-bio text-black">Mike leads our technological initiatives, constantly improving our booking systems and digital experience.</p>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h2 className="text-black">Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year text-black">2010</div>
            <div className="timeline-content">
              <h3 className="text-black">Founded</h3>
              <p className="text-black">Car Rental was established with a small fleet of 10 vehicles in a single location.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2015</div>
            <div className="timeline-content">
              <h3 className="text-black">Expansion</h3>
              <p className="text-black">Expanded to 10 major cities with a fleet of over 100 vehicles.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2018</div>
            <div className="timeline-content">
              <h3 className="text-black">Digital Transformation</h3>
              <p className="text-black">Launched our mobile app and online booking system for seamless reservations.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2022</div>
            <div className="timeline-content">
              <h3 className="text-black">Nationwide Coverage</h3>
              <p className="text-black">Reached the milestone of 50+ locations across the country.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="services-section">
        <h2 className="text-black">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3 className="text-black">Short-Term Rentals</h3>
            <p className="text-black">Flexible daily and weekly rental options for business trips or vacations.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Long-Term Leasing</h3>
            <p className="text-black">Extended rental solutions for individuals and businesses.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Corporate Accounts</h3>
            <p className="text-black">Tailored solutions for businesses with regular transportation needs.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Airport Transfers</h3>
            <p className="text-black">Convenient pickup and drop-off services at major airports.</p>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <h2 className="text-black">What Our Customers Say</h2>
        <div className="testimonials-carousel">
          <div className="testimonial">
            <p className="testimonial-text text-black">"Car Rental made my business trip so much easier. The car was clean, comfortable, and the service was excellent."</p>
            <p className="testimonial-author text-black">- Robert J., Business Traveler</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text text-black">"We rented an SUV for our family vacation and couldn't be happier with the experience. Will definitely use Car Rental again!"</p>
            <p className="testimonial-author text-black">- Maria L., Family Traveler</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text text-black">"The online booking process was straightforward, and the staff was friendly and professional. Highly recommended!"</p>
            <p className="testimonial-author text-black">- David M., Frequent Customer</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2 className="text-black">Ready to Hit the Road?</h2>
        <p className="text-black">Join thousands of satisfied customers who trust Car Rental for their transportation needs.</p>
        <button className="cta-button text-white">Book Your Car Now</button>
      </div>
    </div>
  );
};

export default AboutUs;