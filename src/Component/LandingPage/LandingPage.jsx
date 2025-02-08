import React, { useState, useEffect } from "react";
import SignInForm from "../SignInForm/SignInForm";
import ImageCarousel from "../Utils/ImageCarousel"; // Import carousel
import Logo from "../../assets/logo.svg";

const LandingPage = ({ setIsAuthenticated }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#DED1BE] overflow-hidden flex-col md:flex-row">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Welcome to PowerCasting App</h1>

        {/* Logo */}
        <img src={Logo} alt="PowerCasting Logo" className="mb-6 w-48 h-auto" />

        {/* Sign-In Form */}
        <SignInForm setIsAuthenticated={setIsAuthenticated} />
      </div>

      {/* Right Side - Conditionally Render Image Carousel */}
      {!isMobile && (
        <div className="w-1/2 flex items-center justify-center overflow-hidden">
          <ImageCarousel />
        </div>
      )}
    </div>
  );
};

export default LandingPage;
