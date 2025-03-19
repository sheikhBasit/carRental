import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-primary text-white text-center py-3 mt-1 shadow">
      <Container>
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Car Rental Service. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
