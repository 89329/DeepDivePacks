import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaLayerGroup, FaExchangeAlt, FaUser } from 'react-icons/fa';
import '../styles/Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaHome className="nav-icon" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/collection" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaLayerGroup className="nav-icon" />
        <span>Collection</span>
      </NavLink>
      <NavLink to="/trading" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaExchangeAlt className="nav-icon" />
        <span>Trade</span>
      </NavLink>
      <NavLink to="/account" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <FaUser className="nav-icon" />
        <span>Account</span>
      </NavLink>
    </nav>
  );
};

export default Navigation; 