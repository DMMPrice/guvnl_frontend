import React, {useState} from "react";
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

        // In this example, if username is "guest" then role = "guest", else "admin"
        if (username === "guest" && password === "guest") {
            localStorage.setItem("userType", "guest");
            setError("");
            setIsAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", username);
            navigate("/menu");
        } else {
            // For any other valid credentials, set the role as admin.
            // (In a real application, validate credentials with your backend.)
            localStorage.setItem("userType", "admin");
            setError("");
            setIsAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("username", username);
            navigate("/menu");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg border border-gray-300"
            >

                {/* Username Input */}
                <InputField
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-400 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Password Input */}
                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-400 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4 transition"
                >
                    Sign In
                </Button>
            </form>

            {/* Error Modal (Overlay) */}
            {showModal && <ErrorModal message={error} onClose={() => setShowModal(false)}/>}
        </div>
    );
};

export default SignInForm;
