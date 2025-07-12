import React, {useState, useRef, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    FiShoppingCart,
} from "react-icons/fi";
import {TbBrandCarbon, TbSolarElectricity} from "react-icons/tb";
import {
    GiPowerLightning,
    GiNuclearPlant, GiSwordsPower,
} from "react-icons/gi";
import {PiNuclearPlantDuotone} from "react-icons/pi";
import {
    MdArrowBack,
    MdKeyboardArrowRight,
    MdSpaceDashboard,
    MdPerson, MdLock, MdLogout, MdElectricMeter,
} from "react-icons/md";
import {FaCartArrowDown, FaFileAlt} from "react-icons/fa";
import {PiPiggyBankDuotone} from "react-icons/pi";
import CommonConfirmModal from "@/Component/Utils/ConfirmModal";
import {LuChartNoAxesCombined, LuPiggyBank, LuWallpaper} from "react-icons/lu";
import {BsDatabaseAdd} from "react-icons/bs";
import {MdGroups} from "react-icons/md";
import {RiFontSize2, RiUserSettingsLine} from "react-icons/ri";
import {FaGears} from "react-icons/fa6";

const menuItems = [
    {
        title: "Dashboards",
        icon: <MdSpaceDashboard className="h-10 w-10 text-cyan-800 rotate-90"/>,
        allowedRoles: ["admin", "guest", "super-admin"],
        submenu: [
            {
                title: "Demand Dashboard",
                path: "/demand-dashboard",
                icon: <GiPowerLightning className="h-6 w-6 text-green-600"/>,
            },
            {
                title: "IEX Dashboard",
                path: "/iex-dashboard",
                icon: <TbSolarElectricity className="h-6 w-6 text-red-600"/>,
            },
            {
                title: "Plant Wise Procurement Dashboard",
                path: "/purchase",
                icon: <FiShoppingCart className="h-6 w-6 text-blue-600"/>,
                allowedRoles: ["super-admin", "admin", "guest"],
            },
            {
                title: "Consolidated Dashboard",
                path: "/dashboard",
                icon: <LuChartNoAxesCombined className="h-6 w-6 text-indigo-600"/>,
                allowedRoles: ["admin", "guest", "super-admin"],
            },
            {
                title: "Substation Feeder Dashboard",
                path: "/substation-feeder-dashboard",
                icon: <MdElectricMeter className="h-6 w-6 text-orange-600"/>,
                allowedRoles: ["admin", "guest", "super-admin"],
            }, {
                title: "Feeder DTR Dashboard",
                path: "/feeder-dtr-dashboard",
                icon: <GiSwordsPower className="h-6 w-6 text-cyan-800"/>,
                allowedRoles: ["admin", "guest", "super-admin"],
            }, {
                title: "DTR Consumer Dashboard",
                path: "/dtr-consumer-dashboard",
                icon: <GiPowerLightning className="h-6 w-6 text-yellow-600"/>,
                allowedRoles: ["admin", "guest", "super-admin"],
            },
        ],
    },
    {
        title: "Carbon Footprints Section",
        icon: <MdSpaceDashboard className="h-10 w-10 text-orange-600 rotate-90"/>,
        allowedRoles: ["admin", "guest", "super-admin"],
        submenu: [
            {
                title: "Carbon Footprints Page",
                path: "/dev",
                icon: <TbBrandCarbon className="h-6 w-6 text-cyan-800"/>,
            },
        ],
    },
    {
        title: "Procurement Section",
        icon: <FiShoppingCart className="h-10 w-10 text-green-600"/>,
        allowedRoles: ["admin", "guest", "super-admin"],
        submenu: [
            {
                title: "Generate Plant-Wise Procurement Output",
                path: "/mass-plant-output",
                icon: <FiShoppingCart className="h-6 w-6 text-pink-600"/>,
            },
        ],
    },
    {
        title: "Generator Plant Section",
        icon: <PiNuclearPlantDuotone className="h-10 w-10 text-red-600"/>,
        allowedRoles: ["admin", "guest", "super-admin"],
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
            {
                title: "Plant Availability Factor",
                path: "/plant-availability-factor",
                icon: <PiNuclearPlantDuotone className="h-6 w-6 text-blue-600"/>,
            },
            {
                title: "Plant Backdown Rates",
                path: "/backdown-table",
                icon: <FaCartArrowDown className="h-6 w-6 text-orange-600"/>,
            }
        ],
    },
    {
        title: "Banking Data",
        icon: <LuPiggyBank className="h-10 w-10 text-pink-600"/>,
        allowedRoles: ["admin", "guest", "super-admin"],
        submenu: [
            {
                title: "Banking Data",
                path: "/banking",
                icon: <PiPiggyBankDuotone className="h-6 w-6 text-pink-600"/>,
            },
        ],
    },
    {
        title: "Add Data",
        icon: <BsDatabaseAdd className="h-10 w-10 text-blue-600"/>,
        allowedRoles: ["super-admin"],
        submenu: [
            {
                title: "Demand Data",
                path: "/demand/add",
                icon: <GiPowerLightning className="h-6 w-6 text-orange-600"/>,
            },
            {
                title: "IEX Data",
                path: "/iex/add",
                icon: <TbSolarElectricity className="h-6 w-6 text-red-600"/>,
            },
            {
                title: "Plant Data",
                path: "/plant/add",
                icon: <PiNuclearPlantDuotone className="h-6 w-6 text-red-600"/>,
            },
            {
                title: "Procurement Data",
                path: "/procurement-viewer",
                icon: <FiShoppingCart className="h-6 w-6 text-red-600"/>,
            },
            {
                title: "Feeder Data",
                path: "/feeder-dtr-consumer-table",
                icon: <MdElectricMeter className="h-6 w-6 text-orange-600"/>,
            },
            {
                title: "DTR Data",
                path: "/feeder-dtr-table",
                icon: <GiSwordsPower className="h-6 w-6 text-cyan-800"/>,
            },
            {
                title: "Consumer Data",
                path: "/feeder-dtr-consumer-table",
                icon: <MdGroups className="h-6 w-6 text-yellow-600"/>,
            },
        ],
    },
    {
        title: "Settings",
        icon: <FaGears className="h-10 w-10 text-cyan-500"/>,
        allowedRoles: ["super-admin", "admin", "guest"],
        submenu: [
            {title: "Change Theme", path: "/theme", icon: <LuWallpaper className="h-6 w-6 text-cyan-600"/>},
            {title: "Change Font", path: "/dev", icon: <RiFontSize2 className="h-6 w-6 text-indigo-800"/>},
        ],
    },
    {
        title: "Profile",
        icon: <RiUserSettingsLine className="h-10 w-10 text-red-500"/>,
        allowedRoles: ["super-admin", "admin", "guest"],
        submenu: [
            {title: "Full Profile", path: "/dev", icon: <MdPerson className="h-6 w-6 text-red-500"/>},
            {title: "Change Password", path: "/dev", icon: <MdLock className="h-6 w-6 text-red-500"/>},
        ],
    },
];

const Menu = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const role = localStorage.getItem("userType") || "guest";

    const filteredMenuItems = menuItems.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(role)
    );

    const handleMenuClick = (index) => setActiveMenu(index);
    const goBackToMainMenu = () => setActiveMenu(null);
    const handleLogout = () => setIsConfirmModalOpen(true);

    const confirmLogout = () => {
        localStorage.clear();
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

    const handleMenuItemClick = (path) => {
        navigate(path);
    };

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
                            : filteredMenuItems[activeMenu]?.submenu
                                ?.filter(
                                    (subItem) =>
                                        !subItem.allowedRoles || subItem.allowedRoles.includes(role)
                                )
                                .map((subItem, subIndex) => (
                                    <div key={subIndex} className="relative w-full">
                                        <Link to={subItem.path} className="block w-full">
                                            <div
                                                className="flex flex-col items-center bg-white p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105">
                                                {subItem.icon}
                                                <p className="mt-2 text-md font-medium text-gray-700 text-center">
                                                    {subItem.title}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                    </div>
                </div>
            </div>

            {/* Confirm Modal (optional trigger from top bar) */}
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