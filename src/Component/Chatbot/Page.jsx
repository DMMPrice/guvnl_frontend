// File: src/pages/ChatbotPage.jsx
import React, {useState} from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
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
import {API_URL, DURGA_VERSION, CHATBOT_URL} from "@/config.js";
import {GiPowerLightning} from "react-icons/gi";
import {TbSolarElectricity} from "react-icons/tb";
import {FiShoppingCart} from "react-icons/fi";

export default function ChatbotPage() {
    // Side-sheet, full-screen and info dialog visibility
    const [open, setOpen] = useState(false);
    const [fullOpen, setFullOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(true);

    // Step control & data states
    const [step, setStep] = useState(0);
    const [selectedDemandType, setSelectedDemandType] = useState(null);
    const [singleDateTemp, setSingleDateTemp] = useState(null);
    const [rangeStartTemp, setRangeStartTemp] = useState(null);
    const [rangeEndTemp, setRangeEndTemp] = useState(null);
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);

    // Chat input & history
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);

    // Menu items
    const DEMAND_TYPES = [
        {label: "Demand", icon: <GiPowerLightning size={24} className="text-green-600"/>},
        {label: "IEX Price", icon: <TbSolarElectricity size={24} className="text-red-600"/>},
        {label: "MOD Price", icon: <FiShoppingCart size={24} className="text-blue-600"/>},
    ];

    // Reset to step 0
    function resetState() {
        setStep(0);
        setSelectedDemandType(null);
        setSingleDateTemp(null);
        setRangeStartTemp(null);
        setRangeEndTemp(null);
        setIsRangeMode(false);
        setData([]);
        setSummary({});
        setLoading(false);
        setMessage("");
        setChatMessages([]);
    }

    // Handlers for opening/closing
    function handleOpen(next) {
        if (next) setHasNewMessage(false);
        setOpen(next);
        if (next) resetState();
    }

    function openFull() {
        setFullOpen(true);
    }

    function openInfo() {
        setInfoOpen(true);
    }

    function onRestart() {
        setFullOpen(false);
        setOpen(true);
        resetState();
    }

    // Fetch API data
    async function fetchAPI(type, start, end) {
        setLoading(true);
        let endpoint = "";
        if (type === "Demand")
            endpoint = `demand/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        if (type === "IEX Price")
            endpoint = `iex/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        if (type === "MOD Price")
            endpoint = `procurement/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            const json = await res.json();
            setData(json.data || []);
            setSummary(json.summary || {});
            setStep(2);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        setLoading(false);
    }

    // Send chat message
    async function sendMessage() {
        if (!message.trim()) return;
        setChatMessages((prev) => [...prev, {sender: "user", text: message}]);
        setMessage("");
        try {
            const res = await fetch(`${CHATBOT_URL}get?msg=${encodeURIComponent(message)}`);
            const json = await res.json();
            setChatMessages((prev) => [...prev, {sender: "bot", text: json.response || "No response"}]);
        } catch {
            setChatMessages((prev) => [...prev, {sender: "bot", text: "Error fetching response."}]);
        }
    }

    // Render step-wise content
    function renderContent() {
        if (step === 0) {
            return (
                <div>
                    <p className="text-base text-gray-800 mb-3">1. Choose your requirement:</p>
                    <div className="grid grid-cols-2 gap-3">
                        {DEMAND_TYPES.map(({label, icon}) => (
                            <Button
                                key={label}
                                onClick={() => {
                                    setSelectedDemandType(label);
                                    setStep(1);
                                }}
                                className="flex flex-col items-center justify-center h-24 bg-blue-50 hover:bg-blue-100 text-gray-800 rounded-lg shadow"
                            >
                                {icon}
                                <span className="text-sm font-semibold mt-1">{label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }
        if (step === 1) {
            return (
                <div className="flex flex-col gap-2">
                    <p className="text-base text-gray-800">
                        Select {selectedDemandType === "MOD Price" ? "single" : "single or range"} date/time for{" "}
                        <strong>{selectedDemandType}</strong>:
                    </p>
                    {selectedDemandType !== "MOD Price" && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => setIsRangeMode(false)}
                                className={`w-1/2 ${!isRangeMode ? "bg-blue-600 text-white" : "bg-blue-100 text-gray-800"}`}
                            >
                                Single
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIsRangeMode(true)}
                                className={`w-1/2 ${isRangeMode ? "bg-blue-600 text-white" : "bg-blue-100 text-gray-800"}`}
                            >
                                Range
                            </Button>
                        </div>
                    )}
                    {!isRangeMode ? (
                        <>
                            <BasicDateTimePicker
                                label="Select Date & Time"
                                value={singleDateTemp}
                                onChange={setSingleDateTemp}
                            />
                            <Button
                                onClick={() => fetchAPI(selectedDemandType, singleDateTemp, singleDateTemp)}
                                size="sm"
                                disabled={!singleDateTemp}
                                className="bg-[#0052cc] text-white hover:bg-[#0041a8]"
                            >
                                Confirm
                            </Button>
                        </>
                    ) : (
                        <>
                            <BasicDateTimePicker label="Start" value={rangeStartTemp} onChange={setRangeStartTemp}/>
                            <BasicDateTimePicker label="End" value={rangeEndTemp} onChange={setRangeEndTemp}/>
                            <Button
                                onClick={() => fetchAPI(selectedDemandType, rangeStartTemp, rangeEndTemp)}
                                size="sm"
                                disabled={!rangeStartTemp || !rangeEndTemp}
                                className="bg-[#0052cc] text-white hover:bg-[#0041a8]"
                            >
                                Confirm Range
                            </Button>
                        </>
                    )}
                    <Button onClick={onRestart} size="sm" className="bg-red-500 text-white hover:bg-red-600">
                        Start Over
                    </Button>
                </div>
            );
        }
        if (step === 2) {
            return (
                <div className="flex flex-col gap-3">
                    {!loading ? (
                        <>
                            <p className="text-base font-semibold">Summary:</p>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                Download CSV
                            </Button>
                        </>
                    ) : (
                        <p className="text-base">Loading data…</p>
                    )}
                    <Button onClick={onRestart} size="sm" className="bg-[#0052cc] text-white">
                        Start Over
                    </Button>
                </div>
            );
        }
        return null;
    }

    return (
        <>
            {/* Side sheet trigger */}
            <ChatbotSheet triggerOpen={{open, setOpen}} hasNewMessage={hasNewMessage}>
                <div className="w-[360px] h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-[#0052cc] text-white px-4 py-2 flex justify-between items-center">
                        <div>
                            <span className="font-semibold text-lg">ARADHYA</span>
                            <span className="ml-2 text-sm opacity-80">v{DURGA_VERSION}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={openInfo} className="text-white">
                                <Info className="w-5 h-5"/>
                            </button>
                            <button onClick={openFull} className="text-white">
                                <Maximize className="w-5 h-5"/>
                            </button>
                            <button onClick={() => setOpen(false)} className="text-2xl leading-none">
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-4 py-3 text-base">{renderContent()}</div>

                    {/* Chat */}
                    <div className="mt-1 p-3 border-t">
                        <ChatPanel chatMessages={chatMessages}/>
                        <ChatInput message={message} setMessage={setMessage} onSend={sendMessage}/>
                        <div className="text-center text-sm text-gray-400 mt-1">
                            Powered by ARADHYA v{DURGA_VERSION}
                        </div>
                    </div>
                </div>
            </ChatbotSheet>

            {/* Info Dialog */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>About ARADHYA</DialogTitle>
                        <DialogDescription>
                            ARADHYA is your intelligent assistant for accessing demand, IEX, and MOD price data.
                            Version{" "}
                            <strong>{DURGA_VERSION}</strong> supports both tile-based selection and chat interaction.
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

            {/* Fullscreen Dialog */}
            <Dialog open={fullOpen} onOpenChange={setFullOpen}>
                <DialogContent className="p-0 w-full max-w-[768px] h-[90vh] overflow-hidden flex flex-col">
                    {/* Fullscreen Header */}
                    <div className="bg-[#0052cc] text-white px-4 py-2 flex justify-between items-center">
                        <div>
                            <span className="font-semibold text-lg">ARADHYA</span>
                            <span className="ml-2 text-sm opacity-80">v{DURGA_VERSION}</span>
                        </div>
                        <button onClick={() => setFullOpen(false)} className="text-2xl leading-none">
                            ×
                        </button>
                    </div>
                    {/* Fullscreen Body */}
                    <div className="flex-1 overflow-auto px-4 py-3 text-base">{renderContent()}</div>
                    {/* Fullscreen Chat */}
                    <div className="p-4 border-t">
                        <ChatPanel chatMessages={chatMessages}/>
                        <ChatInput message={message} setMessage={setMessage} onSend={sendMessage}/>
                        <div className="text-center text-sm text-gray-400 mt-1">
                            Powered by ARADHYA v{DURGA_VERSION}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}