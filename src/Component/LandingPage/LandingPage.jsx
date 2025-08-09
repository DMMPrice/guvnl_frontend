import React, {useState, useEffect} from "react";
import SignInForm from "../SignInForm/SignInForm";
import Logo from "../../assets/logo.svg";
import BgImage from "../../assets/background-image.png";

const LandingPage = ({setIsAuthenticated}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="flex h-screen w-screen overflow-hidden items-center justify-center"
            style={{
                backgroundImage: `url(${BgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* White outlined login card */}
            <div className="bg-white/85 rounded-2xl shadow-2xl p-8 max-w-md w-full z-20">
                {/* Logo + Name */}
                <div className="flex flex-col items-center gap-3 mb-4 text-center">
                    <img src={Logo} alt="PowerCasting Logo" className="w-20 h-20"/>
                    <h1 className="text-3xl font-bold text-black">
                        Welcome to Power Casting
                    </h1>
                </div>

                {/* Sign-in form */}
                <SignInForm setIsAuthenticated={setIsAuthenticated}/>
            </div>

        </div>
    );
};

export default LandingPage;
