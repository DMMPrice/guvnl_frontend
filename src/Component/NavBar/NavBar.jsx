import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiX, FiGrid, FiLogOut } from "react-icons/fi"; // Import icons
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg";
import CommonConfirmModal from "@/Component/Utils/ConfirmModal.jsx"; // Import the reusable confirmation modal

export default function NavBar({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Track confirm modal state
  const navRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    setIsConfirmModalOpen(true); // Open confirmation modal
  };

  const confirmLogout = () => {
    // ✅ Remove user authentication details
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("password"); // Remove stored password

    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(false);
    }

    setIsConfirmModalOpen(false); // Close modal
    navigate("/signin"); // Redirect to login
  };

  return (
      <>
        <nav ref={navRef} className="bg-transparent w-full top-0 z-50 transition-shadow duration-300 px-4">
          <div className="max-w-screen-xl mx-auto flex justify-between items-center py-3">

            {/* Logo */}
            <Link to="/menu" className="flex items-center">
              <img src={Logo} className="w-24" alt="Page logo"/>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
                variant="ghost"
                className="text-white text-2xl sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX className="text-white"/> : <FiMenu className="text-white"/>}
            </Button>

            {/* Mobile Menu (Full Screen Overlay) */}
            <div
                className={`fixed top-0 left-0 w-full h-screen text-white backdrop-blur-2xl flex flex-col items-center justify-center gap-6 transition-all duration-300 ${
                    isMobileMenuOpen ? "flex" : "hidden"
                } sm:hidden`}
            >
              {/* Close Button */}
              <button onClick={() => setIsMobileMenuOpen(false)}
                      className="absolute top-4 right-6 text-2xl text-white">
                <FiX/>
              </button>

              {username && (
                  <span className="text-white text-lg font-semibold">
                                Hi, {username}
                            </span>
              )}

              {/* Menu Button with Icon */}
              <Button
                  asChild
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white hover:text-blue-900 transition duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Link to="/menu">
                  <FiGrid className="text-lg"/> Menu
                </Link>
              </Button>

              {/* Logout Button with Icon */}
              <Button
                  className="bg-red-600 text-white hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2"
                  onClick={handleLogout}>
                <FiLogOut className="text-lg"/> Logout
              </Button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:items-center gap-4">
              {username && (
                  <span className="text-sm md:text-base font-semibold">
                                Hi, {username}
                            </span>
              )}

              {/* Menu Button with Icon */}
              <Button
                  asChild
                  variant="outline"
                  className="border-blue-600 text-black hover:bg-blue-600 hover:text-white transition duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Link to="/menu">
                  <FiGrid className="text-lg"/> Menu
                </Link>
              </Button>

              {/* Logout Button with Icon */}
              <Button
                  className="bg-red-600 text-white hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2"
                  onClick={handleLogout}>
                <FiLogOut className="text-lg"/> Logout
              </Button>
            </div>
          </div>
        </nav>

        {/* 🔹 Reusable Confirmation Modal for Logout */}
        <CommonConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmLogout}
            title="Confirm Logout"
            message="Are you sure you want to log out?"
        />
      </>
  );
}