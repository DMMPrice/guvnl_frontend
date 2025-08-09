import React, {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {API_URL} from "@/config.js";

/* cookie utils */
const getCookie = (name) => {
    const row = document.cookie.split("; ").find(r => r.startsWith(encodeURIComponent(name) + "="));
    return row ? decodeURIComponent(row.split("=")[1]) : null;
};
const setCookie = (name, value, {maxAge, path = "/", secure, sameSite = "Lax"} = {}) => {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
    if (typeof maxAge === "number") cookie += `; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
    if (secure) cookie += "; Secure";
    document.cookie = cookie;
};
/* read exp from JWT (seconds since epoch) -> seconds from now */
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

export default function FullProfile() {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const token = getCookie("access_token") || localStorage.getItem("access_token");
    const base = API_URL.endsWith("/") ? API_URL : API_URL + "/";

    const fetchProfile = useCallback(async () => {
        if (!token) {
            navigate("/signin", {replace: true});
            return;
        }
        setStatus("loading");
        setError("");

        const url = base + "auth/me";
        const authHeader = token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;

        try {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": authHeader,
                    "Accept": "application/json",
                },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                if (res.status === 401) {
                    setStatus("error");
                    setError(txt || "Session expired. Please sign in again.");
                    setTimeout(() => navigate("/signin", {replace: true}), 900);
                    return;
                }
                throw new Error(txt || `Request failed with ${res.status}`);
            }

            const json = await res.json();
            setData(json);
            setStatus("success");
        } catch (e) {
            setError(e?.message || "Failed to fetch profile.");
            setStatus("error");
        }
    }, [token, navigate, base]);

    // 🔄 Manual refresh token then refetch profile
    const handleManualRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setError("");
        try {
            const refresh_token = localStorage.getItem("refresh_token");
            if (!refresh_token) throw new Error("Missing refresh token. Please sign in again.");

            const res = await fetch(base + "auth/refresh", {
                method: "POST",
                headers: {"Content-Type": "application/json", "Accept": "application/json"},
                body: JSON.stringify({refresh_token}),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Refresh failed (${res.status})`);
            }

            const json = await res.json(); // expect { access_token, refresh_token? }
            if (json.access_token) {
                // set new access token cookie with exp or 15m fallback
                const maxAge = getJwtExpirySecondsFromNow(json.access_token) ?? 60 * 15;
                setCookie("access_token", json.access_token, {
                    maxAge,
                    secure: window.location.protocol === "https:",
                    sameSite: "Lax",
                    path: "/",
                });
            }
            if (json.refresh_token) {
                localStorage.setItem("refresh_token", json.refresh_token);
            }

            // now refetch profile
            await fetchProfile();
        } catch (e) {
            setStatus("error");
            setError(e?.message || "Token refresh failed. Please sign in again.");
        } finally {
            setIsRefreshing(false);
        }
    }, [base, fetchProfile]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Full Profile</h1>
                <div className="flex gap-2">
                    <Button onClick={fetchProfile} variant="outline" disabled={status === "loading" || isRefreshing}>
                        Reload
                    </Button>
                    <Button onClick={handleManualRefresh} disabled={isRefreshing}
                            className="bg-[#0E7A40] hover:bg-[#0c6a38]">
                        {isRefreshing ? "Refreshing…" : "Refresh Token"}
                    </Button>
                </div>
            </div>

            {status === "loading" && (
                <Card className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"/>
                        <div className="h-40 bg-gray-200 rounded"/>
                    </div>
                </Card>
            )}

            {status === "error" && (
                <Card className="p-6 border-red-300">
                    <p className="text-red-600">{error}</p>
                </Card>
            )}

            {status === "success" && data && (
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <img
                            src={
                                data?.profile_photo
                                    ? data.profile_photo
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.full_name || "User")}`
                            }
                            onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.full_name || "User")}`;
                            }}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border"
                        />
                        <div>
                            <h2 className="text-xl font-semibold">{data?.full_name || "—"}</h2>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant={data?.is_active ? "default" : "secondary"}>
                                    {data?.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant={data?.email_verified ? "default" : "secondary"}>
                                    {data?.email_verified ? "Email Verified" : "Email Not Verified"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Field label="User ID" value={data?.user_id}/>
                        <Field label="Email" value={data?.email}/>
                    </div>
                </Card>
            )}
        </div>
    );
}

function Field({label, value}) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
            <span className="text-base font-medium text-gray-900">{value ?? "—"}</span>
        </div>
    );
}
