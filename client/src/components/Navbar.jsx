import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import "./Navbar.css";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Selalu terbuka di desktop
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="navbar">
        {/* Tampilkan tombol hamburger hanya di mobile */}
        {isMobile && (
          <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
        )}
      </nav>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
