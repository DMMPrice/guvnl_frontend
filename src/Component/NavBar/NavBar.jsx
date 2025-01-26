import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Logo from "@/assets/logo.svg";
import "./NavBar.css";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef();
  const location = useLocation(); // Get the current location

  const navigation = [
    { title: "Procurement", path: "/purchase" },
    { title: "Block Wise Demand", path: "/demand" },
    { title: "Plant List", path: "/plants" },
    { title: "Generation Plant", path: "/generation-plants" },
    { title: "Consumers List", path: "/consumers" },
    { title: "Banking Data", path: "/banking" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        navRef.current.classList.add("sticky", "shadow-lg");
      } else {
        navRef.current.classList.remove("sticky", "shadow-lg");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="bg-white w-full top-0 z-50 transition-shadow duration-300">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={Logo} width={40} height={20} alt="Dashboard logo" />
          </a>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle menu">
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className={`lg:flex items-center ${
              isMenuOpen ? `block` : `hidden`
            } w-full lg:w-auto`}>
            <ul className="flex flex-col lg:flex-row lg:space-x-6 mt-4 lg:mt-0">
              {navigation.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className={`block py-2 ${
                      location.pathname === item.path
                        ? "font-bold text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
