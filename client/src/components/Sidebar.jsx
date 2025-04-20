import { Link, useNavigate } from "react-router-dom";
import { FaChartBar, FaBox, FaHandHoldingUsd, FaCashRegister } from "react-icons/fa";
import PropTypes from "prop-types";
import { useState, useContext } from "react";
import ProfileContext from "./ProfileContext";
import "./Sidebar.css";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const { profileImageUrl } = useContext(ProfileContext);

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={closeSidebar}>
        ✖
      </button>

      {/* Bagian Profile */}
      <div className="profile" onClick={() => navigate("/profile")}>
        <img src={profileImageUrl} alt="Profile" className="avatar" />
        <h3 className="username">Tenochtiltan</h3>
      </div>

      <nav className="menu">
        <Link to="/reports" className="menu-item" onClick={() => window.innerWidth < 768 && closeSidebar()}>
          <FaChartBar className="icon" /> Reports
        </Link>
        <Link to="/product" className="menu-item" onClick={() => window.innerWidth < 768 && closeSidebar()}>
          <FaBox className="icon" /> Product
        </Link>
        <Link to="/material" className="menu-item" onClick={() => window.innerWidth < 768 && closeSidebar()}>
          <FaHandHoldingUsd className="icon" /> Material
        </Link>

        {/* Cash Flow Dropdown */}
        <div className="menu-item cashflow" onClick={() => setIsCashFlowOpen(!isCashFlowOpen)}>
          <FaCashRegister className="icon" /> Cash Flow
          <span className={`dropdown-icon ${isCashFlowOpen ? "open" : ""}`}>&#9660;</span>
        </div>
        {isCashFlowOpen && (
          <div className="submenu">
            <Link to="/sales" className="submenu-item">
              Sales
            </Link>
            <Link to="/expense" className="submenu-item">
              Expense
            </Link>
          </div>
        )}
      </nav>

      <div className="logo">
        <img src="/images/logobaru.png" alt="Veytra Logo" className="logo-img" />
      </div>
    </aside>
  );
};

// Validasi Props
Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeSidebar: PropTypes.func.isRequired,
};

export default Sidebar;