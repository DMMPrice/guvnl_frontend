import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/assets/logo.svg";
import "./NavBar.css";

export default function NavBar({ setIsAuthenticated }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(false);
    }
    navigate("/signin");
  };

  return (
    <nav
      ref={navRef}
      className="bg-white w-full top-0 z-50 transition-shadow duration-300">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <a href="/menu" className="flex items-center">
            <img src={Logo} width={100} height={10} alt="Dashboard logo" />
          </a>

          {/* Buttons: Menu and Logout */}
          <div className="flex space-x-4">
            {/* Menu Button */}
            <Link
              to="/menu"
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Menu
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-black text-white rounded hover:bg-gray-900 transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
