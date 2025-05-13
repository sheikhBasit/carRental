import React from "react";
import "../style/AboutUs.css"; // Import the CSS file for styling

const AboutUs = () => {
  return (
    <div className="about-container text-black">
      <div className="hero-section">
        <h1 className="about-title text-black">About Us</h1>
        <p className="about-subtitle text-black">Your Journey, Our Pakistan</p>
      </div>
      
      <div className="about-content">
        <p className="text-black">
          Welcome to <strong>Pakistan Car Rental</strong>, your trusted partner for car rentals across Pakistan. We are dedicated to providing you with the best car rental experience, offering a wide range of vehicles to suit your needs while exploring the beautiful landscapes of Pakistan.
        </p>
        <p className="text-black">
          Our mission is to make car rental simple, affordable, and convenient for both locals and tourists. Whether you're traveling for business in bustling Karachi, exploring the historical sites of Lahore, or venturing to the northern areas, we have the perfect vehicle for your journey.
        </p>
        <p className="text-black">
          With years of experience in the Pakistani automotive industry, we pride ourselves on our excellent customer service and commitment to quality. Our team understands the unique road conditions and travel requirements across Pakistan's diverse regions.
        </p>
        <p className="text-black">
          Founded in 2010, Pakistan Car Rental has grown from a small local business in Islamabad to a nationwide service with locations in over 15 major cities including Karachi, Lahore, Islamabad, Peshawar, Quetta, and Multan. Our success is built on our commitment to customer satisfaction and our passion for showcasing Pakistan's beauty through reliable transportation solutions.
        </p>
      </div>

      <div className="our-values-section">
        <h2 className="text-black">Our Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3 className="text-black">Mehman Nawazi</h3>
            <p className="text-black">We embody Pakistani hospitality, treating each customer as an honored guest.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">✅</div>
            <h3 className="text-black">Quality Service</h3>
            <p className="text-black">We maintain our vehicles to the highest standards for your safety on all Pakistani roads.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💰</div>
            <h3 className="text-black">Affordable Pricing</h3>
            <p className="text-black">We offer competitive rates in Pakistani Rupees without compromising on quality.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🌱</div>
            <h3 className="text-black">Sustainability</h3>
            <p className="text-black">We're committed to protecting Pakistan's natural beauty by reducing our environmental footprint.</p>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h2 className="text-black">Our Leadership Team</h2>
        <div className="team-members">
          <div className="team-member">
            <img src="/assets/team1.jpg" alt="Team Member 1" />
            <h3 className="text-black">Bilal Xaighum</h3>
            <p className="text-black">CEO</p>
            <p className="member-bio text-black">With over 15 years of experience in the Pakistani automotive industry, Ahmed leads our company with vision and dedication to excellence.</p>
          </div>
          <div className="team-member">
            <img src="/assets/team2.jpg" alt="Team Member 2" />
            <h3 className="text-black">Tayyaba Tahira</h3>
            <p className="text-black">COO</p>
            <p className="member-bio text-black">Tayyaba ensures our operations run smoothly across all Pakistani cities, with a focus on customer satisfaction and cultural sensitivity.</p>
          </div>
          <div className="team-member">
            <img src="/assets/team3.jpg" alt="Team Member 3" />
            <h3 className="text-black">Mudassir</h3>
            <p className="text-black">CTO</p>
            <p className="member-bio text-black">Mudassar leads our technological initiatives, developing systems optimized for Pakistan's unique travel conditions and connectivity challenges.</p>
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
              <p className="text-black">Pakistan Car Rental was established with a small fleet of 10 vehicles in Islamabad.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2015</div>
            <div className="timeline-content">
              <h3 className="text-black">Expansion</h3>
              <p className="text-black">Expanded to 5 major cities including Karachi, Lahore, and Rawalpindi with a fleet of over 50 vehicles.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2018</div>
            <div className="timeline-content">
              <h3 className="text-black">Digital Transformation</h3>
              <p className="text-black">Launched our mobile app with Urdu language support and online booking system with local payment options.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year text-black">2022</div>
            <div className="timeline-content">
              <h3 className="text-black">Nationwide Coverage</h3>
              <p className="text-black">Reached the milestone of 15+ locations across Pakistan, including tourist destinations in Northern Areas.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="services-section">
        <h2 className="text-black">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <h3 className="text-black">City Exploration</h3>
            <p className="text-black">Comfortable vehicles for exploring Pakistan's vibrant cities with optional local drivers.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Northern Areas Tours</h3>
            <p className="text-black">Specialized 4x4 vehicles for trips to Hunza, Swat, Kaghan, and other northern destinations.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Corporate Accounts</h3>
            <p className="text-black">Tailored solutions for Pakistani businesses with regular transportation needs.</p>
          </div>
          <div className="service-card">
            <h3 className="text-black">Airport Transfers</h3>
            <p className="text-black">Convenient pickup and drop-off services at all major Pakistani airports.</p>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <h2 className="text-black">What Our Customers Say</h2>
        <div className="testimonials-carousel">
          <div className="testimonial">
            <p className="testimonial-text text-black">"Pakistan Car Rental made my business trips between Karachi and Islamabad so much more convenient. Their service is professional and reliable."</p>
            <p className="testimonial-author text-black">- Usman A., Business Executive</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text text-black">"We rented a 4x4 for our family trip to Gilgit-Baltistan and were impressed with the vehicle quality and customer support throughout our journey."</p>
            <p className="testimonial-author text-black">- Ayesha H., Family Traveler</p>
          </div>
          <div className="testimonial">
            <p className="testimonial-text text-black">"As a foreign tourist exploring Pakistan, their English-speaking staff and knowledge of tourist destinations made my experience exceptional!"</p>
            <p className="testimonial-author text-black">- Daud M., International Tourist</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2 className="text-black">Ready to Explore Pakistan?</h2>
        <p className="text-black">Join thousands of satisfied customers who trust Pakistan Car Rental for their transportation needs across the country.</p>
       </div>
    </div>
  );
};

export default AboutUs;