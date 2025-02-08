import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiUsers, FiUserCheck } from "react-icons/fi";
import { TbSolarElectricity } from "react-icons/tb";
import { GiPowerLightning } from "react-icons/gi";
import { PiNuclearPlantDuotone } from "react-icons/pi";
import { GiNuclearPlant } from "react-icons/gi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";

const menuItems = [
  {
    title: "Demand",
    icon: <GiPowerLightning className="h-10 w-10 text-blue-600" />,
    submenu: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <GiPowerLightning className="h-6 w-6 text-green-600" />,
      },
    ],
  },
  {
    title: "Procurement",
    icon: <FiShoppingCart className="h-10 w-10 text-green-600" />,
    submenu: [
      {
        title: "Procurement",
        path: "/purchase",
        icon: <FiShoppingCart className="h-6 w-6 text-green-600" />,
      },
      {
        title: "Block Wise Procurement",
        path: "/block-purchase",
        icon: <GiPowerLightning className="h-6 w-6 text-purple-600" />,
      },
    ],
  },
  {
    title: "IEX Data",
    icon: <TbSolarElectricity className="h-10 w-10 text-red-600" />,
    submenu: [
      {
        title: "Dashboard",
        path: "/iex-dashboard",
        icon: <TbSolarElectricity className="h-10 w-10 text-red-600" />,
      },
    ],
  },
  {
    title: "Generators",
    icon: <PiNuclearPlantDuotone className="h-10 w-10 text-red-600" />,
    submenu: [
      {
        title: "Generator Plant List",
        path: "/plants",
        icon: <PiNuclearPlantDuotone className="h-6 w-6 text-red-600" />,
      },
      {
        title: "Plant Data",
        path: "/generation-plants",
        icon: <GiNuclearPlant className="h-6 w-6 text-yellow-600" />,
      },
    ],
  },
  {
    title: "Open Access",
    icon: <FiUsers className="h-10 w-10 text-pink-600" />,
    submenu: [
      {
        title: "Consumer List",
        path: "/consumers",
        icon: <FiUsers className="h-6 w-6 text-pink-600" />,
      },
      {
        title: "Consumer Data",
        path: "/banking",
        icon: <FiUserCheck className="h-6 w-6 text-indigo-600" />,
      },
    ],
  },
  {
    title: "Upload Data",
    icon: <FaFileAlt className="h-10 w-10 text-green-600" />,
    submenu: [
      {
        title: "Demand Data",
        path: "/upload-demand",
        icon: <FaFileAlt className="h-6 w-6 text-green-600" />,
      },
      {
        title: "IEX Data",
        path: "/upload-iex",
        icon: <FaFileAlt className="h-6 w-6 text-green-600" />,
      },
      {
        title: "Plant Data",
        path: "/upload-demand",
        icon: <FaFileAlt className="h-6 w-6 text-green-600" />,
      },
      {
        title: "Open Access Data",
        path: "/upload-demand",
        icon: <FaFileAlt className="h-6 w-6 text-green-600" />,
      },
    ],
  },
];

const Menu = () => {
  const [openMenus, setOpenMenus] = useState({});
  const menuRef = useRef(null);

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ✅ Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenus({}); // Closes all menus when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col max-h-screen">
      <div className="flex flex-col items-center flex-grow p-6" ref={menuRef}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative">
          {menuItems.map((item, index) => (
            <div key={index} className="relative w-full">
              {item.path ? (
                <Link to={item.path}>
                  <div className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105">
                    {item.icon}
                    <p className="mt-2 text-lg font-semibold text-gray-800 text-center group-hover:text-blue-500">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  onClick={() => toggleMenu(index)}
                  className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 cursor-pointer">
                  {item.icon}
                  <p className="mt-2 text-lg font-semibold text-gray-800 text-center flex items-center">
                    {item.title}
                    {openMenus[index] ? (
                      <MdKeyboardArrowUp className="ml-1" />
                    ) : (
                      <MdKeyboardArrowDown className="ml-1" />
                    )}
                  </p>
                </div>
              )}

              {/* ✅ Submenu Fix: Ensuring Click Outside Works Properly */}
              {item.submenu && openMenus[index] && (
                <div
                  className="absolute left-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-full min-w-[180px] p-2 space-y-2"
                  onClick={(e) => e.stopPropagation()} // ✅ Prevents click inside from closing it
                >
                  {item.submenu.map((subItem, subIndex) => (
                    <Link key={subIndex} to={subItem.path} className="block">
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                        {subItem.icon}
                        <p className="text-md font-medium text-gray-700">
                          {subItem.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;
