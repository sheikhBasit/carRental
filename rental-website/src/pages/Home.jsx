import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import Cookies from "js-cookie"; // Import js-cookie to handle cookies

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carousel, setCarousel] = useState([]);
  const scrollRefs = useRef({});

  // Static banner images
  const banners = [
    "/assets/login.jpg",
    "/assets/signup.jpg",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const city = Cookies.get("city"); // Get city from cookies
        const response = await fetch(`https://car-rental-backend-black.vercel.app/api/vehicles/getVehicle?city=${city}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCars(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    setCarousel(banners); // Set the carousel images
    fetchData(); // Fetch car data
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      document.querySelector(".carousel-control-next").click();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredCars = cars.filter(
    (car) =>
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const carsByManufacturer = filteredCars.reduce((acc, car) => {
    acc[car.manufacturer] = acc[car.manufacturer] || [];
    acc[car.manufacturer].push(car);
    return acc;
  }, {});

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container-fluid w-100 m-0 p-0">
      {/* Carousel */}
      <div id="carCarousel" className="carousel  slide" data-bs-ride="carousel" style={{ height: "300px" }}>
        <div className="carousel-inner">
          {carousel.map((banner, index) => (
            <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
              <img src={banner} className="d-block w-100" alt={`Banner ${index + 1}`} style={{ height: "300px", objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="row justify-content-center mt-5">
        <input
          type="text"
          placeholder="Search by car name or manufacturer..."
          className="form-control w-75"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Car List */}
      <div className="mt-5">
        {Object.keys(carsByManufacturer).map((manufacturer) => (
          <div key={manufacturer} className="mb-4">
            <h3 className="text-center text-primary">{manufacturer}</h3>
            <div className="position-relative">
              <div
                ref={(el) => (scrollRefs.current[manufacturer] = el)}
                className="d-flex gap-3 overflow-auto flex-nowrap px-5"
                style={{ width: "100%" }}
              >
                {carsByManufacturer[manufacturer].map((car) => (
                  <Link key={car._id} to={`/car/${car._id}`} className="text-decoration-none">
                    <div className="card shadow-sm car-card" style={{ minWidth: "300px" }}>
                      <img src={car.carImageUrl} alt={car.model} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                      <div className="card-body">
                        <h5 className="card-title" style={{ color: "#007BFF" }}>{car.model}</h5>
                        <p className="card-text" style={{ color: "#6C757D" }}>
                          <strong>Company:</strong> {car.company.companyName}<br />
                          <strong>Rent:</strong> ${car.rent}<br />
                          <strong>Capacity:</strong> {car.capacity}<br />
                          <strong>Transmission:</strong> {car.transmission}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;