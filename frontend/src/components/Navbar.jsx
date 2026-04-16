import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <motion.div
          className="navbar-logo"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Dumbbell size={26} className="logo-icon" />
          <span className="logo-text">TWC</span>
          <span className="logo-sub">FITNESS</span>
        </motion.div>

        {/* Desktop Links */}
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <motion.button
              key={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              {link.icon}
              <span>{link.label}</span>
            </motion.button>
          ))}
        </div>

        {/* User + Logout */}
        <div className="navbar-right desktop-only">
          <span className="nav-welcome">
            Hey, <strong>{user?.firstName}</strong> 👋
          </span>
          <motion.button
            className="btn-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </motion.button>
        </div>

        {/* Mobile Hamburger */}
        <button className="hamburger mobile-only" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <button
                key={link.path}
                className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
              >
                {link.icon} {link.label}
              </button>
            ))}
            <button className="mobile-nav-link logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
