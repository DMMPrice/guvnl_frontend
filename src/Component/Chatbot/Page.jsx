import React, {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {Info, Maximize} from "lucide-react";

import {ChatbotSheet} from "./ChatbotSheet.jsx";
import {ChatPanel} from "./ChatPanel.jsx";
import {ChatInput} from "./ChatInput.jsx";
import {ARADHYA_VERSION, CHATBOT_URL, CONSUMER_CHATBOT_URL} from "@/config.js";

/* -------- shared role helpers (same as Menu) -------- */
const DEFAULT_ROLE = "GUEST";
const normalizeRole = (v) => {
    if (!v) return DEFAULT_ROLE;
    let r = String(v).trim().replace(/\s+|_/g, "-").toUpperCase();
    return r === "SUPERADMIN" ? "SUPER-ADMIN" : r;
};
const getStoredUser = () => {
    const raw = localStorage.getItem("userData") || localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
};
/* ---------------------------------------------------- */

export default function ChatbotPage() {
    // Sheet & dialogs
    const [open, setOpen] = useState(false);
    const [fullOpen, setFullOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(true);

    // Chat
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);

    // user + role
    const {user, role, isConsumer} = useMemo(() => {
        const u = getStoredUser();
        const r = normalizeRole(u?.role);
        return {user: u, role: r, isConsumer: r === "USER" || r === "GUEST"};
    }, []);

    async function sendMessage() {
        const trimmed = message.trim();
        if (!trimmed) return;

        setChatMessages((prev) => [...prev, {sender: "user", text: trimmed}]);
        setMessage("");

        try {
            if (isConsumer) {
                // consumer flow → POST { message, customer_id: <full_name> }
                const customer_id = user?.full_name || "DTR1_USER1";
                console.log(customer_id)// as requested: use full_name from localStorage
                const res = await fetch(`${CONSUMER_CHATBOT_URL}msg`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json", Accept: "application/json"},
                    body: JSON.stringify({message: trimmed, customer_id: customer_id}),
                });
                console.log(res)
                const json = await res.json();
                const botText = json.response || json.message || "No response";
                setChatMessages((prev) => [...prev, {sender: "bot", text: botText}]);
            } else {
                // internal/admin flow → existing GET
                const params = new URLSearchParams({msg: trimmed});
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${CHATBOT_URL}get?${params.toString()}`, {
                    method: "GET",
                    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
                    credentials: "include",
                });
                const json = await res.json();
                setChatMessages((prev) => [
                    ...prev,
                    {sender: "bot", text: json.response || "No response"},
                ]);
            }
        } catch (e) {
            setChatMessages((prev) => [
                ...prev,
                {sender: "bot", text: "Error fetching response."},
            ]);
        }
    }

    return (
        <>
            <ChatbotSheet triggerOpen={{open, setOpen}} hasNewMessage={hasNewMessage}>
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-[#0052cc] text-white px-4 py-2 flex justify-between items-center rounded-t-xl">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-lg">ARADHYA</span>
                            <span className="text-sm opacity-80">v{ARADHYA_VERSION}</span>
                            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">{role || DEFAULT_ROLE}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setInfoOpen(true)} className="text-white" aria-label="About">
                                <Info className="w-5 h-5"/>
                            </button>
                            <button onClick={() => setFullOpen(true)} className="text-white" aria-label="Maximize">
                                <Maximize className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    setHasNewMessage(false);
                                }}
                                className="text-2xl leading-none text-white"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-auto p-3">
                        <ChatPanel chatMessages={chatMessages}/>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t bg-white">
                        <ChatInput message={message} setMessage={setMessage} onSend={sendMessage}/>
                        <div className="text-center text-sm text-gray-400 mt-2">
                            Powered by ARADHYA v{ARADHYA_VERSION}
                        </div>
                    </div>
                </div>
            </ChatbotSheet>

            {/* Info dialog */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>About ARADHYA</DialogTitle>
                        <DialogDescription>
                            ARADHYA is your intelligent assistant for accessing demand, IEX, and MOD price data.
                            Version <strong>{ARADHYA_VERSION}</strong> supports both tile-based selection and chat
                            interaction.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => window.open("https://yourdomain.com/aradhya-docs", "_blank")}
                        >
                            Learn More
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Full-screen dialog */}
            <Dialog open={fullOpen} onOpenChange={setFullOpen}>
                <DialogContent className="p-0 w-full max-w-[768px] h-[90vh] overflow-hidden flex flex-col">
                    <div className="bg-[#0052cc] text-white px-4 py-2 flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-lg">ARADHYA</span>
                            <span className="text-sm opacity-80">v{ARADHYA_VERSION}</span>
                            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">{role || DEFAULT_ROLE}</span>
                        </div>
                        <button onClick={() => setFullOpen(false)} className="text-2xl leading-none"
                                aria-label="Close fullscreen">
                            ×
                        </button>
                    </div>

                    <div className="p-4 border-t">
                        <ChatPanel chatMessages={chatMessages}/>
                        <ChatInput message={message} setMessage={setMessage} onSend={sendMessage}/>
                        <div className="text-center text-sm text-gray-400 mt-2">
                            Powered by ARADHYA v{ARADHYA_VERSION}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
