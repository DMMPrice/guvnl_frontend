import { useEffect, useRef, useState } from "react";
import Link from "@/assets/logo.svg";
import "./NavBar.css";
import path from "path";

export default function NavBar() {
  // State and refs
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef();

  // Navigation links
  const navigation = [
    { title: "Procurement", path: "/purchase" },
    { title: "Block Wise Demand", path: "/demand" },
    { title: "Plant List", path: "/plants" },
    { title: "Generation Plant", path: "/generation-plants" },
    { title: "Consumers List", path: "/consumers" },
    { title: "Banking Data", path: "/banking" },
  ];

  // Effect for handling scroll and menu state
  useEffect(() => {
    const body = document.body;

    // Toggle body overflow based on menu state
    const toggleBodyOverflow = () => {
      if (isMenuOpen) {
        body.classList.add("overflow-hidden");
      } else {
        body.classList.remove("overflow-hidden");
      }
    };

    toggleBodyOverflow();

    // Handle navbar stickiness on scroll
    const handleScroll = () => {
      if (window.scrollY > 80) {
        navRef.current.classList.add("sticky", "shadow-lg");
      } else {
        navRef.current.classList.remove("sticky", "shadow-lg");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listeners and classes
    return () => {
      window.removeEventListener("scroll", handleScroll);
      body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      className="bg-white w-full top-0 z-50 transition-shadow duration-300">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={Link} width={40} height={20} alt="Dashboard logo" />
          </a>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              aria-label="Toggle menu">
              {isMenuOpen ? (
                // Close Icon
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
                // Hamburger Icon
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
                <li
                  key={item.title}
                  className="text-gray-600 hover:text-blue-600">
                  <a href={item.path} className="block py-2">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
