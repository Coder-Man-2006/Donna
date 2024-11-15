import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import Logo from '../public/logo/white_logo.png';

function App() {
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const logo = logoRef.current;
    if (logo) {
      const rect = logo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      logo.style.setProperty('--x', `${x}px`);
      logo.style.setProperty('--y', `${y}px`);
    }
  };

  const handleMouseLeave = () => {
    const logo = logoRef.current;
    if (logo) {
      logo.style.setProperty('--x', `50%`);
      logo.style.setProperty('--y', `50%`);
    }
  };

  return (
    <div className="wrapper">
      <div className="App">
        <div className="video-container">
          <video className="background-video" autoPlay loop muted>
            <source src="/video/background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="main-content">
          <div className="logo" ref={logoRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <img src={Logo} alt="Donna Logo" />
          </div>

          <ul className="nav-links">
            <li><Link to="/affiliate">Affiliate Program</Link></li>
            <li><Link to="/about">About Donna</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Login / Signup</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;