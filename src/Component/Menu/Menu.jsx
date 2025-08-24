import React, {useState, useRef, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FiShoppingCart} from "react-icons/fi";
import {TbBrandCarbon, TbSolarElectricity} from "react-icons/tb";
import {GiPowerLightning, GiNuclearPlant, GiSwordsPower} from "react-icons/gi";
import {PiNuclearPlantDuotone} from "react-icons/pi";
import {
    MdArrowBack,
    MdKeyboardArrowRight,
    MdSpaceDashboard,
    MdElectricMeter,
    MdOutlineElectricBolt,
    MdOutlineCo2,
} from "react-icons/md";
import {FaCartArrowDown} from "react-icons/fa";
import CommonConfirmModal from "@/Component/Utils/ConfirmModal";
import {LuChartNoAxesCombined} from "react-icons/lu";
import {BsDatabaseAdd} from "react-icons/bs";
import {MdGroups} from "react-icons/md";
import {ArchiveRestore, BatteryFull} from "lucide-react";
import {BiTransfer} from "react-icons/bi";
import clsx from "clsx";

/** helper to normalize icon size + color */
const withIconClasses = (iconEl, classes) =>
    React.cloneElement(iconEl, {className: clsx("h-10 w-10", classes)});

/** ─────────────────────────────────────────────────────────────
 *  MENU DATA  (theme embedded with each module)
 *  gradient: tile bg, ring: border color, icon: icon text color
 *  ────────────────────────────────────────────────────────────*/
const menuItems = [
    {
        title: "Demand Module",
        icon: <MdSpaceDashboard className="rotate-90"/>,
        theme: {gradient: "from-cyan-50 to-cyan-100", ring: "ring-cyan-200", icon: "text-cyan-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN", "USER"],
        submenu: [
            {title: "Demand Dashboard", path: "/demand-dashboard", icon: <GiPowerLightning/>},
            {
                title: "Demand Generation Dashboard",
                path: "/dashboard",
                icon: <LuChartNoAxesCombined/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
        ],
    },
    {
        title: "IEX Module",
        icon: <TbSolarElectricity/>,
        theme: {gradient: "from-rose-50 to-rose-100", ring: "ring-rose-200", icon: "text-rose-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN", "USER"],
        submenu: [
            {title: "IEX Dashboard", path: "/iex-dashboard", icon: <TbSolarElectricity/>},
        ],
    },
    {
        title: "Power Distribution Module",
        icon: <BiTransfer/>,
        theme: {gradient: "from-amber-50 to-amber-100", ring: "ring-amber-200", icon: "text-amber-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {
                title: "Substation Feeder Dashboard",
                path: "/substation-feeder-dashboard",
                icon: <MdElectricMeter/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
            {
                title: "Feeder DTR Dashboard",
                path: "/feeder-dtr-dashboard",
                icon: <GiSwordsPower/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
            {
                title: "DTR Consumer Dashboard",
                path: "/dtr-consumer-dashboard",
                icon: <GiPowerLightning/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
            {
                title: "Power Theft Dashboard",
                path: "/power-theft-dashboard",
                icon: <MdOutlineElectricBolt/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
        ],
    },
    {
        title: "Carbon Footprints Module",
        icon: <MdOutlineCo2 className="rotate-0"/>,
        theme: {gradient: "from-emerald-50 to-emerald-100", ring: "ring-emerald-200", icon: "text-emerald-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {title: "Carbon Footprints Page", path: "/dev", icon: <TbBrandCarbon/>},
        ],
    },
    {
        title: "Procurement Module",
        icon: <FiShoppingCart/>,
        theme: {gradient: "from-pink-50 to-pink-100", ring: "ring-pink-200", icon: "text-pink-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {title: "Generate Plant-Wise Procurement Output", path: "/mass-plant-output", icon: <FiShoppingCart/>},
        ],
    },
    {
        title: "Power Plant Module",
        icon: <PiNuclearPlantDuotone/>,
        theme: {gradient: "from-indigo-50 to-indigo-100", ring: "ring-indigo-200", icon: "text-indigo-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {
                title: "Plant Wise Dashboard",
                path: "/purchase",
                icon: <PiNuclearPlantDuotone/>,
                allowedRoles: ["SUPER-ADMIN", "ADMIN", "GUEST"]
            },
            {title: "Generator Plant List", path: "/plants", icon: <PiNuclearPlantDuotone/>},
            {title: "Plant Data", path: "/generation-plants", icon: <GiNuclearPlant/>},
            {title: "Plant Availability Factor", path: "/plant-availability-factor", icon: <PiNuclearPlantDuotone/>},
            {title: "Plant Backdown Rates", path: "/backdown-table", icon: <FaCartArrowDown/>},
        ],
    },
    {
        title: "Consumer Module",
        icon: <MdGroups/>,
        theme: {gradient: "from-violet-50 to-violet-100", ring: "ring-violet-200", icon: "text-violet-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {
                title: "Consumer Analytics Dashboard",
                path: "/consumer-analytics-dashboard",
                icon: <MdGroups/>,
                allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"]
            },
        ],
    },
    {
        title: "Power Banking Module",
        icon: <ArchiveRestore/>,
        theme: {gradient: "from-fuchsia-50 to-fuchsia-100", ring: "ring-fuchsia-200", icon: "text-fuchsia-700"},
        allowedRoles: ["ADMIN", "GUEST", "SUPER-ADMIN"],
        submenu: [
            {title: "Generate Banking Data", path: "/banking", icon: <BatteryFull/>},
        ],
    },
    {
        title: "Data Upload Section",
        icon: <BsDatabaseAdd/>,
        theme: {gradient: "from-blue-50 to-blue-100", ring: "ring-blue-200", icon: "text-blue-700"},
        allowedRoles: ["SUPER-ADMIN"],
        submenu: [
            {title: "Demand Data", path: "/demand/add", icon: <GiPowerLightning/>},
            {title: "IEX Data", path: "/iex/add", icon: <TbSolarElectricity/>},
            {title: "Plant Data", path: "/plant/add", icon: <PiNuclearPlantDuotone/>},
            {title: "Procurement Module Data", path: "/procurement-viewer", icon: <FiShoppingCart/>},
            {title: "Feeder Data", path: "/feeder-dtr-consumer-table", icon: <MdElectricMeter/>},
            {title: "DTR Data", path: "/feeder-dtr-table", icon: <GiSwordsPower/>},
            {title: "Consumer Data", path: "/feeder-dtr-consumer-table", icon: <MdGroups/>},
        ],
    },
];

const Menu = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const role = user.role || "GUEST";

    const filteredMenuItems = menuItems.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(role)
    );

    const handleMenuClick = (index) => setActiveMenu(index);
    const goBackToMainMenu = () => setActiveMenu(null);

    const confirmLogout = () => {
        localStorage.clear();
        navigate("/signin");
        setIsConfirmModalOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setActiveMenu(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="flex flex-col min-h-screen pt-20 pb-20">
                <div className="flex flex-col items-center flex-grow p-6 w-full" ref={menuRef}>
                    {activeMenu !== null && (
                        <button
                            onClick={goBackToMainMenu}
                            className="
                                        self-center mb-8
                                        inline-flex items-center gap-2
                                        px-6 py-2.5
                                        rounded-full
                                        bg-gradient-to-r from-green-100 to-green-200
                                        text-gray-700 font-medium
                                        shadow-sm
                                        hover:from-green-200 hover:to-green-300 hover:text-green-900
                                        active:scale-95
                                        transition-all duration-200 ease-in-out
                                        "
                        >
                            <MdArrowBack className="text-xl text-gray-600"/>
                            Back to Menu
                        </button>
                    )}
                    {/* Responsive Grid */}
                    <div
                        className="grid w-full max-w-7xl mx-auto gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {activeMenu === null
                            ? filteredMenuItems.map((item, index) => {
                                const t = item.theme;
                                return (
                                    <div key={index} className="relative w-full">
                                        <div
                                            onClick={() => handleMenuClick(index)}
                                            className={clsx(
                                                "w-full aspect-square cursor-pointer flex flex-col justify-between",
                                                "bg-gradient-to-br", t.gradient,
                                                "p-4 md:p-5 rounded-2xl ring-1", t.ring,
                                                "shadow-xl hover:shadow-2xl transition-transform hover:scale-[1.02]"
                                            )}
                                        >
                                            <div
                                                className="flex flex-col items-center justify-center flex-grow text-center">
                                                <div
                                                    className="grid place-items-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/70 ring-1 ring-white/60">
                                                    {withIconClasses(item.icon, clsx(t.icon, "h-8 w-8 md:h-10 md:w-10"))}
                                                </div>
                                                <p className="mt-2 md:mt-3 text-sm md:text-base font-semibold text-gray-800">
                                                    {item.title}
                                                </p>
                                            </div>
                                            <div className="flex justify-center pb-1">
                                                <MdKeyboardArrowRight className="text-gray-700 text-xl md:text-2xl"/>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                            : filteredMenuItems[activeMenu]?.submenu
                                ?.filter((subItem) => !subItem.allowedRoles || subItem.allowedRoles.includes(role))
                                .map((subItem, subIndex) => {
                                    const parentTheme = filteredMenuItems[activeMenu]?.theme;

                                    // sub icon adopts parent theme color; ensure size matches small/large
                                    const subIcon = React.cloneElement(subItem.icon, {
                                        className: clsx("h-5 w-5 md:h-6 md:w-6", parentTheme.icon),
                                    });

                                    return (
                                        <div key={subIndex} className="relative w-full">
                                            <Link to={subItem.path} className="block w-full">
                                                <div
                                                    className={clsx(
                                                        "w-full aspect-square flex flex-col justify-between",
                                                        // Themed, softer card: gradient base + subtle white overlay via bg-opacity
                                                        "bg-gradient-to-br", parentTheme.gradient,
                                                        "p-4 md:p-5 rounded-2xl ring-1", parentTheme.ring,
                                                        "shadow-md hover:shadow-xl transition-transform hover:scale-[1.02]"
                                                    )}
                                                >
                                                    <div
                                                        className="flex flex-col items-center justify-center flex-grow text-center">
                                                        <div
                                                            className="grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/80 ring-1 ring-white/60">
                                                            {subIcon}
                                                        </div>
                                                        <p className="mt-2 md:mt-3 text-xs md:text-sm font-medium text-gray-800">
                                                            {subItem.title}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-center pb-1">
                                                        <MdKeyboardArrowRight
                                                            className="text-gray-600 text-lg md:text-xl"/>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
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