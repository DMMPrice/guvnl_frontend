import React, {useState} from "react";
import {Sheet, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Bot} from "lucide-react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import {API_URL, DURGA_VERSION} from "@/config.js";

function Page() {
    const [open, setOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(true);
    const [step, setStep] = useState(0);

    const [selectedDemandType, setSelectedDemandType] = useState(null);
    const [singleDateTemp, setSingleDateTemp] = useState(null);
    const [rangeStartTemp, setRangeStartTemp] = useState(null);
    const [rangeEndTemp, setRangeEndTemp] = useState(null);
    const [isRangeMode, setIsRangeMode] = useState(false);

    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);

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
            setIsRangeMode(false);
            setData([]);
            setSummary({});
            setLoading(false);
        }
    };

    const onRestart = () => handleOpen(true);

    const fetchAPI = async (type, start, end) => {
        setLoading(true);
        let endpoint = "";

        if (type === "Demand") {
            endpoint = `demand/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        } else if (type === "IEX Price") {
            endpoint = `iex/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        } else if (type === "MOD Price") {
            endpoint = `procurement/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            const json = await res.json();
            setData(json.data || []);
            setSummary(json.summary || {});
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
        setStep(2);
    };

    const onSelectDemandType = (type) => {
        setSelectedDemandType(type);
        setStep(1);
    };

    const onConfirmSingleDate = () => {
        if (!singleDateTemp) return;
        fetchAPI(selectedDemandType, singleDateTemp, singleDateTemp);
    };

    const onConfirmRange = () => {
        if (!rangeStartTemp || !rangeEndTemp) return;
        fetchAPI(selectedDemandType, rangeStartTemp, rangeEndTemp);
    };

    const downloadCsv = () => {
        let header = "";
        let rows = "";
        if (selectedDemandType === "Demand") {
            header = "TimeStamp,actual,predicted\n";
            rows = data.map((r) => `${r.TimeStamp},${r.actual},${r.predicted}`).join("\n");
        } else if (selectedDemandType === "IEX Price") {
            header = "TimeStamp,predicted\n";
            rows = data.map((r) => `${r.TimeStamp},${r.predicted}`).join("\n");
        } else if (selectedDemandType === "MOD Price") {
            header = "TimeStamp,cost_per_block,last_price\n";
            rows = data.map((r) => `${r.timestamp},${r.cost_per_block},${r.last_price}`).join("\n");
        }
        const blob = new Blob([header + rows], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = `${selectedDemandType.replace(/\s/g, "_")}.csv`;
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        switch (step) {
            case 0:
                return (<div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-800 mb-1">1. Select Demand Type:</p>
                    {DEMAND_TYPES.map((t) => (<Button
                        key={t}
                        onClick={() => onSelectDemandType(t)}
                        size="sm"
                        className="justify-start bg-blue-100 hover:bg-blue-200 text-gray-800 w-full"
                    >
                        {t}
                    </Button>))}
                </div>);

            case 1:
                return (<div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-800 mb-1">
                        Select {selectedDemandType === "MOD Price" ? "single" : "single or range"} date and time
                        for{" "}
                        <strong>{selectedDemandType}</strong>:
                    </p>

                    {selectedDemandType !== "MOD Price" && (<div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => setIsRangeMode(false)}
                            className={`w-1/2 transition ${!isRangeMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-100 text-gray-800 hover:bg-blue-300"}`}
                        >
                            Single
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsRangeMode(true)}
                            className={`w-1/2 transition ${isRangeMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-100 text-gray-800 hover:bg-blue-300"}`}
                        >
                            Range
                        </Button>
                    </div>)}

                    {!isRangeMode ? (<>
                        <BasicDateTimePicker label="Select Date & Time" value={singleDateTemp}
                                             onChange={setSingleDateTemp}/>
                        <Button
                            onClick={onConfirmSingleDate}
                            size="sm"
                            disabled={!singleDateTemp}
                            className="bg-[#0052cc] text-white hover:bg-[#0041a8]"
                        >
                            Confirm
                        </Button>
                    </>) : (<>
                        <BasicDateTimePicker label="Start" value={rangeStartTemp} onChange={setRangeStartTemp}/>
                        <BasicDateTimePicker label="End" value={rangeEndTemp} onChange={setRangeEndTemp}/>
                        <Button
                            onClick={onConfirmRange}
                            size="sm"
                            disabled={!rangeStartTemp || !rangeEndTemp}
                            className="bg-[#0052cc] text-white hover:bg-[#0041a8]"
                        >
                            Confirm Range
                        </Button>
                    </>)}

                    <Button onClick={onRestart} size="sm"
                            className="bg-red-500 text-white mt-2 h-10 hover:bg-red-600">
                        Start Over
                    </Button>
                </div>);

            case 2:
                return (<div className="flex flex-col gap-3">
                    {loading ? (<p>Loading data…</p>) : (<>
                        <p className="font-semibold">Summary:</p>
                        {selectedDemandType === "Demand" && (<>
                            <p>Total Actual: <strong>{summary.total_actual} MW</strong></p>
                            <p>Total Predicted: <strong>{summary.total_predicted} MW</strong></p>
                        </>)}
                        {selectedDemandType === "IEX Price" && (<>
                            <p>Total Predicted: <strong>₹{summary.total_predicted}</strong></p>
                            <p>Average Predicted: <strong>₹{summary.average_predicted}</strong></p>
                        </>)}
                        {selectedDemandType === "MOD Price" && (<>
                            <p>Total MOD: <strong>₹{summary.total_mod}</strong></p>
                            <p>Total Cost per Block: <strong>₹{summary.total_cost_per_block}</strong></p>
                        </>)}

                        <Button onClick={downloadCsv} size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white mt-2">
                            Download CSV
                        </Button>
                    </>)}

                    <Button onClick={onRestart} size="sm" className="bg-[#0052cc] text-white">
                        Start Over
                    </Button>
                </div>);

            default:
                return null;
        }
    };

    return (<div className="fixed bottom-6 right-6 z-50 group">
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetTrigger asChild>
                <Button
                    className="relative rounded-full h-16 w-16 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg hover:scale-105 transition-transform">
                    <Bot className="w-7 h-7 text-white"/>
                    {hasNewMessage && (<span
                        className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-ping"/>)}
                    <div
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity">
                        DURGA <span className="text-[10px] italic text-gray-300 ml-1">v{DURGA_VERSION}</span>
                    </div>
                </Button>
            </SheetTrigger>

            {open && (<div
                className="fixed bottom-24 right-6 w-[340px] sm:w-[380px] h-[480px] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col border">
                <div className="bg-[#0052cc] text-white px-4 py-3 flex justify-between items-start">
                    <div className="flex flex-row leading-tight">
                        <span className="font-semibold text-base">DURGA</span>
                        <span className="text-[10px] italic text-gray-300 mt-[10px] ml-2">v{DURGA_VERSION}</span>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-xl">
                        &times;
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-700">
                    {renderContent()}
                </div>
            </div>)}
        </Sheet>
    </div>);
}

export default Page;