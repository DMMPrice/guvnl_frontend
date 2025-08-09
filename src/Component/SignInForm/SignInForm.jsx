import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import InputField from "@/Component/Utils/InputField";
import ErrorModal from "@/Component/Utils/ErrorModal";
import {API_URL} from "@/config.js";

/* ─── cookie utils ─── */
const setCookie = (name, value, {maxAge, path = "/", secure, sameSite = "Lax"} = {}) => {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
    if (typeof maxAge === "number") cookie += `; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
    if (secure) cookie += "; Secure";
    document.cookie = cookie;
};
const getCookie = (name) => {
    return document.cookie
        .split("; ")
        .map(v => v.split("="))
        .reduce((acc, [k, ...vals]) => (acc[k] = vals.join("="), acc), {})[encodeURIComponent(name)]
        ? decodeURIComponent(document.cookie
            .split("; ")
            .find(row => row.startsWith(encodeURIComponent(name) + "="))
            .split("=")[1]) : null;
};
export const deleteCookie = (name, path = "/") => {
    document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0`;
};
/* decode JWT exp (seconds since epoch) */
const getJwtExpirySecondsFromNow = (jwt) => {
    try {
        const [, payload] = jwt.split(".");
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        if (!json.exp) return null;
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, json.exp - now);
    } catch {
        return null;
    }
};

const SignInForm = ({setIsAuthenticated}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (isAuthenticated === "true") navigate("/menu");
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Email is required.");
            setShowModal(true);
            return;
        }
        if (!password.trim()) {
            setError("Password is required.");
            setShowModal(true);
            return;
        }

        try {
            const res = await fetch(`${API_URL}auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Login failed");
            }

            const data = await res.json();

            // 1) access_token -> cookie (client-set; not HttpOnly)
            const access = data.access_token;
            const maxAge = getJwtExpirySecondsFromNow(access) ?? 60 * 15; // fallback 15m if no exp
            setCookie("access_token", access, {
                maxAge,
                sameSite: "Lax",
                secure: window.location.protocol === "https:",
                path: "/",
            });

            // 2) everything else -> localStorage
            localStorage.setItem("refresh_token", data.refresh_token || "");
            localStorage.setItem("token_type", data.token_type || "bearer");
            localStorage.setItem("user", JSON.stringify(data.user || {}));
            localStorage.setItem("isAuthenticated", "true");

            setIsAuthenticated(true);
            navigate("/menu");
        } catch (err) {
            setError(err.message || "Something went wrong");
            setShowModal(true);
        }
    };

    return (
        <div className="flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-300 placeholder-gray-500
           focus:ring-[#0E7A40] focus:border-[#0E7A40]"
                />
                <InputField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-gray-900 bg-white border border-gray-300 placeholder-gray-500
           focus:ring-[#0E7A40] focus:border-[#0E7A40]"
                />
                <Button
                    type="submit"
                    className="w-full font-semibold py-2 px-4 rounded-lg mt-2 transition
           bg-[#0E7A40] hover:bg-[#0c6a38] text-white
           focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E1302A]"
                >
                    Sign In
                </Button>
            </form>

            {showModal && <ErrorModal message={error} onClose={() => setShowModal(false)}/>}
        </div>
    );
};

export default SignInForm;
