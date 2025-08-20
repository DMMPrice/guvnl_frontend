import React, {useEffect, useMemo, useState} from "react";
import {API_URL} from "@/config.js";
import PowerTheftForm from "./PowerTheftForm.jsx";
import TheftPanel from "./TheftPanel.jsx";
import {TimerReset} from "lucide-react"; // ⬅️ import it

export default function PowerTheft() {
    // defaults requested
    const [customerId, setCustomerId] = useState("DTR1_USER1");
    const [startDateTime, setStartDateTime] = useState("2021-04-01 00:00:00");
    const [endDateTime, setEndDateTime] = useState("2021-04-02 00:00:00");
    const [overuseMargin, setOveruseMargin] = useState(0.15);

    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [filtersEcho, setFiltersEcho] = useState(null);

    const fetchPowerTheft = async () => {
        if (!startDateTime || !endDateTime) return;
        setLoading(true);
        try {
            const qp = new URLSearchParams();
            qp.set("customer_id", customerId || "");
            qp.set("start", startDateTime.split(" ")[0]); // send date-only
            qp.set("end", endDateTime.split(" ")[0]);
            qp.set("overuse_margin", String(overuseMargin));
            qp.set("limit", "500");

            // NOTE: change to 'power_theft' if your backend uses underscore
            const url = `${API_URL}power-theft?${qp.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setRecords(Array.isArray(data.records) ? data.records : []);
            setFiltersEcho(data.filters || null);
        } catch (e) {
            console.error(e);
            alert("Error fetching power theft data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPowerTheft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once with defaults

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchPowerTheft();
    };

    // KPIs (TheftPanel can read either avgLossPct/maxLossPct OR avgLoss/maxLoss)
    const kpis = useMemo(() => {
        if (!records.length) {
            return {intervals: 0, avgLoss: 0, maxLoss: 0, critical: 0};
        }
        const losses = records
            .map((r) => (typeof r.Loss_Percent === "number" ? r.Loss_Percent : null))
            .filter((v) => v !== null);
        const avgLoss = losses.length
            ? losses.reduce((a, b) => a + b, 0) / losses.length
            : 0;
        const maxLoss = losses.length ? Math.max(...losses) : 0;
        const critical = records.filter((r) => r.Priority === "Critical").length;
        return {intervals: records.length, avgLoss, maxLoss, critical};
    }, [records]);

    return (
        <div className="flex flex-col items-center pt-6">

            <div className="w-full max-w-7xl">
                {/* Header strip */}
                <div
                    className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-white p-4 border border-indigo-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100">
                            <TimerReset className="w-5 h-5 text-indigo-700"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-indigo-900">Power Theft Analytics</h2>
                            <p className="text-sm text-indigo-700/80">Visual overview of loss patterns, risk mix, and
                                critical windows</p>
                        </div>
                    </div>
                </div>
                <PowerTheftForm
                    loading={loading}
                    customerId={customerId}
                    setCustomerId={setCustomerId}
                    startDateTime={startDateTime}
                    setStartDateTime={setStartDateTime}
                    endDateTime={endDateTime}
                    setEndDateTime={setEndDateTime}
                    overuseMargin={overuseMargin}
                    setOveruseMargin={setOveruseMargin}
                    handleSubmit={handleSubmit}
                />
            </div>
            <div className="w-full max-w-7xl mt-6 space-y-6">
                {/* ⬇️ Use TheftPanel here */}
                <TheftPanel loading={loading} records={records} kpis={kpis}/>
            </div>
        </div>
    );
}
