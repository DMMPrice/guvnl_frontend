// src/Component/Chatbot/Page.jsx

import React, { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import { API_URL } from "@/config.js";

function Page() {
    const [open, setOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(true);

    const [step, setStep] = useState(0);
    const [selectedDemandType, setSelectedDemandType] = useState(null);
    const [singleDateTemp, setSingleDateTemp] = useState(null);
    const [rangeStartTemp, setRangeStartTemp] = useState(null);
    const [rangeEndTemp, setRangeEndTemp] = useState(null);

    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [dateMode, setDateMode] = useState(null);

    const DEMAND_TYPES = ["Demand", "IEX Price", "MOD Price"];

    const handleOpen = (isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
            setHasNewMessage(false);
            setStep(0);
            setSelectedDemandType(null);
            setSingleDateTemp(null);
            setRangeStartTemp(null);
            setRangeEndTemp(null);
            setDateMode(null);
            setData([]);
            setSummary({});
            setLoading(false);
        }
    };

    const onRestart = () => handleOpen(true);

    const onSelectDemandType = (type) => {
        setSelectedDemandType(type);
        setStep(1);
    };

    const fetchDataRange = async (start, end) => {
        setLoading(true);
        try {
            let endpoint = "";
            if (selectedDemandType === "Demand") endpoint = "demand/range";
            else if (selectedDemandType === "IEX Price") endpoint = "iex/range";
            else if (selectedDemandType === "MOD Price") endpoint = "mod/range";

            const url = `${API_URL}${endpoint}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
            const res = await fetch(url);
            const json = await res.json();
            setData(json.data || []);
            setSummary(json.summary || {});
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        setStep(2);
    };

    const onConfirmSingleDate = () => {
        if (!singleDateTemp) return;
        fetchDataRange(singleDateTemp, singleDateTemp);
    };

    const onConfirmRangeDate = () => {
        if (!rangeStartTemp || !rangeEndTemp) return;
        fetchDataRange(rangeStartTemp, rangeEndTemp);
    };

    const renderContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-800 mb-1">1. Select Demand Type:</p>
                        {DEMAND_TYPES.map((t) => (
                            <Button key={t} onClick={() => onSelectDemandType(t)} size="sm" className="justify-start bg-blue-100 hover:bg-blue-200 text-gray-800 w-full">
                                {t}
                            </Button>
                        ))}
                    </div>
                );

            case 1:
                return (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-800 mb-1">
                            2. You chose <strong>{selectedDemandType}</strong>. Pick date mode:
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => setDateMode("single")} size="sm" className="bg-blue-100 hover:bg-blue-200 text-gray-800 w-full">Single Date</Button>
                            <Button onClick={() => setDateMode("range")} size="sm" className="bg-blue-100 hover:bg-blue-200 text-gray-800 w-full">Date Range</Button>
                            <Button onClick={onRestart} size="xs" className="bg-red-200 text-gray-800 hover:bg-gray-300 w-full">Start Over</Button>
                        </div>

                        {dateMode === "single" && (
                            <div className="flex flex-col gap-2">
                                <BasicDateTimePicker label="Select Date & Time" value={singleDateTemp} onChange={setSingleDateTemp} />
                                <Button onClick={onConfirmSingleDate} size="sm" disabled={!singleDateTemp}>Confirm</Button>
                            </div>
                        )}

                        {dateMode === "range" && (
                            <div className="flex flex-col gap-2">
                                <BasicDateTimePicker label="Start" value={rangeStartTemp} onChange={setRangeStartTemp} />
                                <BasicDateTimePicker label="End" value={rangeEndTemp} onChange={setRangeEndTemp} />
                                <Button onClick={onConfirmRangeDate} size="sm" className="bg-blue-500 text-white hover:bg-blue-600 w-full" disabled={!rangeStartTemp || !rangeEndTemp}>Confirm Range</Button>
                            </div>
                        )}
                    </div>
                );

            case 2:
                const downloadCsv = () => {
                    const keys = Object.keys(data[0] || {});
                    const header = keys.join(",") + "\n";
                    const rows = data.map((r) => keys.map(k => r[k]).join(",")).join("\n");
                    const blob = new Blob([header + rows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    const fileName = `${selectedDemandType.toLowerCase().replace(/ /g, '_')}_${rangeStartTemp || singleDateTemp}_to_${rangeEndTemp || singleDateTemp}.csv`;
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                return (
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <p>Loading data…</p>
                        ) : (
                            <>
                                <p className="font-semibold">Summary:</p>
                                {selectedDemandType === "Demand" && (
                                    <>
                                        <p>Total Actual: <strong>{summary.total_actual} MW</strong></p>
                                        <p>Total Predicted: <strong>{summary.total_predicted} MW</strong></p>
                                    </>
                                )}
                                {selectedDemandType === "IEX Price" && (
                                    <>
                                        <p>Total Predicted: <strong>₹ {summary.total_predicted}</strong></p>
                                        <p>Average Predicted: <strong>₹ {summary.average_predicted}</strong></p>
                                    </>
                                )}

                                <Button onClick={downloadCsv} size="sm" className="bg-green-600 hover:bg-green-700 text-white mt-2">Download CSV</Button>
                            </>
                        )}
                        <Button onClick={onRestart} size="sm" className="bg-[#0052cc] text-white hover:bg-blue-100 text-gray-800 w-full">Start Over</Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 group">
            <Sheet open={open} onOpenChange={handleOpen}>
                <SheetTrigger asChild>
                    <Button className="relative rounded-full h-16 w-16 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg hover:scale-105 transition-transform" variant="default">
                        <Bot className="w-7 h-7 text-white" />
                        {hasNewMessage && (
                            <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping" />
                        )}
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity">
                            Sophia 1.0
                        </div>
                    </Button>
                </SheetTrigger>

                {open && (
                    <div className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] h-[480px] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col border">
                        <div className="bg-[#0052cc] text-white px-4 py-3 flex justify-between items-center">
                            <span className="font-semibold text-base">Sophia 1.0</span>
                            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-xl">&times;</button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-700">
                            {renderContent()}
                        </div>
                    </div>
                )}
            </Sheet>
        </div>
    );
}

export default Page;