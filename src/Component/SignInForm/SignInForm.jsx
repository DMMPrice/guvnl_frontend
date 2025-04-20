import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import InputField from "@/Component/Utils/InputField";
import ErrorModal from "@/Component/Utils/ErrorModal";

const SignInForm = ({setIsAuthenticated}) => {
    const [userType, setUserType] = useState(""); // From dropdown, if needed
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // ✅ Redirect if already authenticated
    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (isAuthenticated === "true") {
            navigate("/menu");
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setError("Username is required.");
            setShowModal(true);
            return;
        }

        if (!password.trim()) {
            setError("Password is required.");
            setShowModal(true);
            return;
        }

        // Basic mock auth logic
        if (username === "super-admin" && password === "super-admin") {
            localStorage.setItem("userType", "super-admin");
        } else if (username === "admin" && password === "admin") {
            localStorage.setItem("userType", "admin");
        } else {
            localStorage.setItem("userType", "guest");
        }

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);
        setIsAuthenticated(true);
        navigate("/menu");
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg border border-gray-300"
            >
                <InputField
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-400 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />

                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-400 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4 transition"
                >
                    Sign In
                </Button>
            </form>

            {showModal && <ErrorModal message={error} onClose={() => setShowModal(false)}/>}
        </div>
    );
};

export default SignInForm;