import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const Header = () => {
  const [expanded, setExpanded] = useState(false);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".navbar") && expanded) {
        setExpanded(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [expanded]);

  return (
    <Navbar
      bg="primary"
      variant="dark"
      expand="lg"
      expanded={expanded}
      fixed="top"
      className="shadow"
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand href="/">Car Rental Service</Navbar.Brand>

        {/* Mobile Toggle Button */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(expanded ? false : true)}
        />

        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/" onClick={() => setExpanded(false)}>
              Home
            </Nav.Link>
            <Nav.Link href="/about" onClick={() => setExpanded(false)}>
              About
            </Nav.Link>
            <Nav.Link href="/services" onClick={() => setExpanded(false)}>
              Services
            </Nav.Link>
            <Nav.Link href="/contact" onClick={() => setExpanded(false)}>
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
