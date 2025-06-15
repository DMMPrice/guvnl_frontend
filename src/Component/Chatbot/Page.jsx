import React, {useState} from "react";
import {Sheet, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Bot, Send} from "lucide-react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import {API_URL, DURGA_VERSION, CHATBOT_URL} from "@/config.js";

export default function Page() {
    const [open, setOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(true);
    const [step, setStep] = useState(0);

    // Demand states
    const [selectedDemandType, setSelectedDemandType] = useState(null);
    const [singleDateTemp, setSingleDateTemp] = useState(null);
    const [rangeStartTemp, setRangeStartTemp] = useState(null);
    const [rangeEndTemp, setRangeEndTemp] = useState(null);
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);

    // Chat states
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);

    const DEMAND_TYPES = ["Demand", "IEX Price", "MOD Price"];

    const handleOpen = (isOpen) => {
        if (isOpen) setHasNewMessage(false);
        setOpen(isOpen);
        if (isOpen) {
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
    };

    const onRestart = () => handleOpen(true);

    const fetchAPI = async (type, start, end) => {
        setLoading(true);
        let endpoint = "";
        if (type === "Demand") endpoint = `demand/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        if (type === "IEX Price") endpoint = `iex/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        if (type === "MOD Price") endpoint = `procurement/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            const json = await res.json();
            setData(json.data || []);
            setSummary(json.summary || {});
            setStep(2);
        } catch (err) {
            console.error("Error fetching demand:", err);
        }
        setLoading(false);
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        setChatMessages(prev => [...prev, {sender: 'user', text: message}]);
        setMessage("");
        try {
            const res = await fetch(`${CHATBOT_URL}get?msg=${encodeURIComponent(message)}`);
            const json = await res.json();
            setChatMessages(prev => [...prev, {sender: 'bot', text: json.response || 'No response'}]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, {sender: 'bot', text: 'Error fetching response.'}]);
        }
    };

    const renderContent = () => {
        if (step === 0) return (
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-800 mb-1">1. Choose your requirement:</p>
                {DEMAND_TYPES.map(t => (
                    <Button key={t} onClick={() => {
                        setSelectedDemandType(t);
                        setStep(1);
                    }} size="sm"
                            className="justify-start bg-blue-100 hover:bg-blue-200 text-gray-800 w-full">{t}</Button>
                ))}
            </div>
        );
        if (step === 1) return (
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-800 mb-1">Select {selectedDemandType === "MOD Price" ? "single" : "single or range"} date/time
                    for <strong>{selectedDemandType}</strong>:</p>
                {selectedDemandType !== "MOD Price" && (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setIsRangeMode(false)}
                                className={`w-1/2 ${!isRangeMode ? "bg-blue-600 text-white" : "bg-blue-100 text-gray-800"}`}>Single</Button>
                        <Button size="sm" onClick={() => setIsRangeMode(true)}
                                className={`w-1/2 ${isRangeMode ? "bg-blue-600 text-white" : "bg-blue-100 text-gray-800"}`}>Range</Button>
                    </div>
                )}
                {!isRangeMode ? (
                    <>
                        <BasicDateTimePicker label="Select Date & Time" value={singleDateTemp}
                                             onChange={setSingleDateTemp}/>
                        <Button onClick={onRestart} size="sm" disabled={!singleDateTemp}
                                className="bg-[#0052cc] text-white hover:bg-[#0041a8]">Confirm</Button>
                    </>
                ) : (
                    <>
                        <BasicDateTimePicker label="Start" value={rangeStartTemp} onChange={setRangeStartTemp}/>
                        <BasicDateTimePicker label="End" value={rangeEndTemp} onChange={setRangeEndTemp}/>
                        <Button onClick={onRestart} size="sm" disabled={!rangeStartTemp || !rangeEndTemp}
                                className="bg-[#0052cc] text-white hover:bg-[#0041a8]">Confirm Range</Button>
                    </>
                )}
                <Button onClick={onRestart} size="sm" className="bg-red-500 text-white hover:bg-red-600">Start
                    Over</Button>
            </div>
        );
        if (step === 2) return (
            <div className="flex flex-col gap-3">
                {!loading ? (
                    <><p className="font-semibold">Summary:</p><Button onClick={() => {
                    }} size="sm" className="bg-green-600 hover:bg-green-700 text-white">Download CSV</Button></>
                ) : <p>Loading data…</p>}
                <Button onClick={onRestart} size="sm" className="bg-[#0052cc] text-white">Start Over</Button>
            </div>
        );
        return null;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 group">
            <Sheet open={open} onOpenChange={handleOpen}>
                <SheetTrigger asChild>
                    <Button className="relative rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-700">
                        <Bot className="w-7 h-7 text-white"/>
                        {hasNewMessage &&
                            <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full animate-ping"/>}
                    </Button>
                </SheetTrigger>
                {open && (
                    <div
                        className="fixed bottom-24 right-6 w-[360px] h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-[#0052cc] text-white px-4 py-2 flex justify-between">
                            <span className="font-semibold">ARADHYA</span>
                            <button onClick={() => setOpen(false)} className="text-xl">×</button>
                        </div>
                        <div className="flex-1 p-4 overflow-auto text-sm">{renderContent()}</div>
                        <div className="mt-1 p-4 border-t">
                            <div className="max-h-48 overflow-auto mb-2">
                                {chatMessages.map((m, i) => (
                                    <div key={i} className={`${m.sender === 'user' ? 'text-right' : 'text-left'} mb-1`}>
                                        <span
                                            className={`inline-block px-2 py-1 rounded ${m.sender === 'user' ? 'bg-blue-100' : 'bg-blue-200'}`}>{m.text}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <textarea rows={1} value={message} onChange={e => setMessage(e.target.value)}
                                          className="flex-grow border rounded p-2 text-sm"
                                          placeholder="Type a message..."/>
                                <button onClick={sendMessage} disabled={!message.trim()}
                                        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                                    <Send size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Sheet>
        </div>
    );
}