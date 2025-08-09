import {useRef, useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FiMenu, FiX, FiGrid, FiLogOut} from "react-icons/fi";
import {Button} from "@/components/ui/button";
import Logo from "@/assets/logo.svg";
import CommonConfirmModal from "@/Component/Utils/ConfirmModal.jsx";

export default function NavBar({setIsAuthenticated}) {
    const [username, setUsername] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const navRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) setUsername(storedUsername);
    }, []);

    // Optional: listen for logout from another tab
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "app:logout") {
                // local cleanup (avoid loops)
                if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);
                setIsMobileMenuOpen(false);
                navigate("/signin", {replace: true});
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [navigate, setIsAuthenticated]);

    const handleLogout = () => setIsConfirmModalOpen(true);

    const performLogout = () => {
        // Close UI
        setIsMobileMenuOpen(false);

        // Remove known auth/session keys
        const keysToRemove = [
            "isAuthenticated",
            "username",
            "password",
            "userType",
            "access_token",
            "refresh_token",
            "userData",
            "sophiaNotificationPlayed",
            "employeeId",
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // Clear any session-stored data
        try {
            sessionStorage.clear();
        } catch {
        }

        // Optional: notify other tabs
        try {
            localStorage.setItem("app:logout", String(Date.now()));
            window.dispatchEvent(new Event("app:logout"));
        } catch {
        }

        // Optional: call backend to invalidate cookie session
        // await fetch("/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});

        if (typeof setIsAuthenticated === "function") setIsAuthenticated(false);

        // Redirect and prevent back-navigation to protected page
        navigate("/signin", {replace: true});
    };

    const confirmLogout = () => {
        setIsConfirmModalOpen(false);
        performLogout();
    };

    return (
        <>
            <nav
                ref={navRef}
                className="bg-transparent w-full top-0 z-50 transition-shadow duration-300 px-4"
            >
                <div className="max-w-screen-xl mx-auto flex justify-between items-center py-3">
                    {/* Logo */}
                    <Link to="/menu" className="flex items-center">
                        <img src={Logo} className="w-24" alt="Page logo"/>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        className="text-white text-2xl sm:hidden"
                        onClick={() => setIsMobileMenuOpen((s) => !s)}
                    >
                        {isMobileMenuOpen ? (
                            <FiX className="text-white"/>
                        ) : (
                            <FiMenu className="text-white"/>
                        )}
                    </Button>

                    {/* Mobile Menu (Full Screen Overlay) */}
                    <div
                        className={`fixed top-0 left-0 w-full h-screen text-white backdrop-blur-2xl flex flex-col items-center justify-center gap-6 transition-all duration-300 ${
                            isMobileMenuOpen ? "flex" : "hidden"
                        } sm:hidden`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-6 text-2xl text-white"
                        >
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
                            <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)}>
                                <FiGrid className="text-lg"/> Menu
                            </Link>
                        </Button>

                        {/* Logout Button with Icon */}
                        <Button
                            className="bg-red-600 text-white hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center gap-2"
                            onClick={handleLogout}
                        >
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
                            onClick={handleLogout}
                        >
                            <FiLogOut className="text-lg"/> Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Reusable Confirmation Modal for Logout */}
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
