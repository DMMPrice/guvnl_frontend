import React, {useState, useRef, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FiShoppingCart, FiUsers, FiUserCheck} from "react-icons/fi";
import {TbSolarElectricity} from "react-icons/tb";
import {GiPowerLightning} from "react-icons/gi";
import {PiNuclearPlantDuotone} from "react-icons/pi";
import {GiNuclearPlant} from "react-icons/gi";
import {MdArrowBack, MdKeyboardArrowRight, MdSpaceDashboard} from "react-icons/md";
import {FaFileAlt} from "react-icons/fa";
import CommonConfirmModal from "@/Component/Utils/ConfirmModal";

const menuItems = [
    {
        title: "Dashboards",
        icon: <MdSpaceDashboard className="h-10 w-10 text-blue-600 rotate-90"/>,
        allowedRoles: ["admin", "guest"],
        submenu: [
            {
                title: "Demand Dashboard",
                path: "/dashboard",
                icon: <GiPowerLightning className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "IEX Dashboard",
                path: "/iex-dashboard",
                icon: <TbSolarElectricity className="h-10 w-10 text-red-600"/>,
            },
        ],
    },
    {
        title: "Procurement",
        icon: <FiShoppingCart className="h-10 w-10 text-green-600"/>,
        allowedRoles: ["admin", "guest"],
        submenu: [
            {
                title: "Procurement",
                path: "/purchase",
                icon: <FiShoppingCart className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "Block Wise Procurement",
                path: "/block-purchase",
                icon: <GiPowerLightning className="h-6 w-6 text-purple-600"/>,
            },
        ],
    },
    {
        title: "Mass Procurement Output",
        icon: <FiShoppingCart className="h-10 w-10 text-pink-600"/>,
        allowedRoles: ["admin"],
        submenu: [
            {
                title: "Generate Procurement Output",
                path: "/mass-plant-output",
                icon: <FiShoppingCart className="h-6 w-6 text-pink-600"/>,
            },
        ],
    },
    {
        title: "Plant Generator",
        icon: <PiNuclearPlantDuotone className="h-10 w-10 text-red-600"/>,
        allowedRoles: ["admin", "guest"],
        submenu: [
            {
                title: "Generator Plant List",
                path: "/plants",
                icon: <PiNuclearPlantDuotone className="h-6 w-6 text-red-600"/>,
            },
            {
                title: "Plant Data",
                path: "/generation-plants",
                icon: <GiNuclearPlant className="h-6 w-6 text-yellow-600"/>,
            },
        ],
    },
    {
        title: "Open Access",
        icon: <FiUsers className="h-10 w-10 text-pink-600"/>,
        allowedRoles: ["admin", "guest"],
        submenu: [
            {
                title: "Consumer List",
                path: "/consumers",
                icon: <FiUsers className="h-6 w-6 text-pink-600"/>,
            },
            {
                title: "Consumer Data",
                path: "/banking",
                icon: <FiUserCheck className="h-6 w-6 text-indigo-600"/>,
            },
        ],
    },
    {
        title: "Upload Data",
        icon: <FaFileAlt className="h-10 w-10 text-green-600"/>,
        allowedRoles: ["admin", "guest"],
        submenu: [
            {
                title: "Demand Data",
                path: "/dev",
                icon: <FaFileAlt className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "IEX Data",
                path: "/dev",
                icon: <FaFileAlt className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "Plant Data",
                path: "/dev",
                icon: <FaFileAlt className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "Open Access Data",
                path: "/dev",
                icon: <FaFileAlt className="h-6 w-6 text-green-600"/>,
            },
        ],
    },
];

const Menu = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Get user role from localStorage. Defaults to "guest" if not set.
    const role = localStorage.getItem("userType") || "guest";

    // Filter menu items based on allowed roles.
    const filteredMenuItems = menuItems.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(role)
    );

    const handleMenuClick = (index) => {
        setActiveMenu(index);
    };

    const goBackToMainMenu = () => {
        setActiveMenu(null);
    };

    const handleLogout = () => {
        setIsConfirmModalOpen(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/signin");
        setIsConfirmModalOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className="flex flex-col max-h-screen">
                <div className="flex flex-col items-center flex-grow p-6" ref={menuRef}>
                    {activeMenu !== null && (
                        <button
                            onClick={goBackToMainMenu}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition mb-4"
                        >
                            <MdArrowBack className="text-lg"/> Back
                        </button>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative">
                        {activeMenu === null
                            ? filteredMenuItems.map((item, index) => (
                                <div key={index} className="relative w-full">
                                    <div
                                        onClick={() => handleMenuClick(index)}
                                        className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                    >
                                        {item.icon}
                                        <p className="mt-2 text-lg font-semibold text-gray-800 text-center flex items-center">
                                            {item.title}
                                            <MdKeyboardArrowRight className="ml-1"/>
                                        </p>
                                    </div>
                                </div>
                            ))
                            : filteredMenuItems[activeMenu]?.submenu?.map((subItem, subIndex) => (
                                <div key={subIndex} className="relative w-full">
                                    {subItem.action === "logout" ? (
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105"
                                        >
                                            <div className="flex items-center gap-3">
                                                {subItem.icon}
                                                <p className="text-md font-medium text-gray-700">{subItem.title}</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <Link to={subItem.path} className="block w-full">
                                            <div
                                                className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105">
                                                {subItem.icon}
                                                <p className="mt-2 text-md font-medium text-gray-700 text-center">
                                                    {subItem.title}
                                                </p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            <CommonConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
            />
        </>
    );
};

export default Menu;
