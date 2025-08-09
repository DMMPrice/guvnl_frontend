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

const base = API_URL;

async function refreshAccessToken() {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) return null;

    const res = await fetch(base + "auth/refresh", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refresh_token}),
    });
    if (!res.ok) return null;
    const data = await res.json();

    // save new access (cookie) and anything else you return (optionally update refresh)
    if (data.access_token) {
        setCookie("access_token", data.access_token, {
            maxAge: 60 * 15, // 15 mins; or parse exp if you include it
            secure: window.location.protocol === "https:",
        });
    }
    if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
    }
    return data.access_token || null;
}

/**
 * apiFetch: attaches Authorization from cookie and retries once on 401 via refresh().
 */
export async function apiFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : base + path.replace(/^\/+/, "");
    const token = getCookie("access_token");
    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", token.toLowerCase().startsWith("bearer ")
            ? token
            : `Bearer ${token}`);
    }

    let res = await fetch(url, {...options, headers});
    if (res.status !== 401) return res;

    // try one refresh, then retry original once
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    headers.set("Authorization", `Bearer ${newToken}`);
    res = await fetch(url, {...options, headers});
    return res;
}

export async function getJson(path, options = {}) {
    const res = await apiFetch(path, options);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed with ${res.status}`);
    }
    return res.json();
}

export {refreshAccessToken};
