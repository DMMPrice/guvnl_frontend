// src/Component/Dashboards/Plant Wise Procurement Module Dashboard/Procurement Module.jsx
import React, {useState, useEffect} from "react";
import {API_URL} from "@/config.js";
import ProcurementForm from "./ProcurementForm.jsx";
import PlantComparisonChart from "./PlantComparisonChart.jsx";

export default function Procurement() {
    // defaults: March 1 → April 1, 2024 at midnight
    const [startDateTime, setStartDateTime] = useState("2022-04-01 00:00:00");
    const [endDateTime, setEndDateTime] = useState("2022-04-03 00:00:00");

    const [loading, setLoading] = useState(false);
    const [procurementRaw, setProcurementRaw] = useState([]);

    // extract fetch logic so we can call on mount
    const fetchProcurement = async () => {
        if (!startDateTime || !endDateTime) return;
        setLoading(true);
        try {
            const url = `${API_URL}dashboard?start_date=${encodeURIComponent(
                startDateTime
            )}&end_date=${encodeURIComponent(endDateTime)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setProcurementRaw(data.procurement || []);
        } catch (err) {
            console.error(err);
            alert("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    // automatically fetch on first render with default dates
    useEffect(() => {
        fetchProcurement();
    }, []); // empty deps → runs once on mount

    // form submit handler just delegates to fetchProcurement
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchProcurement();
    };

    return (
        <div className="flex flex-col items-center pt-6">
            <div className="w-full max-w-7xl">
                <ProcurementForm
                    loading={loading}
                    startDateTime={startDateTime}
                    setStartDateTime={setStartDateTime}
                    endDateTime={endDateTime}
                    setEndDateTime={setEndDateTime}
                    handleSubmit={handleSubmit}
                />
            </div>

            <div className="w-full max-w-7xl mt-6 space-y-6">
                {procurementRaw.length > 0 && (
                    <PlantComparisonChart procurementData={procurementRaw}/>
                )}
            </div>
        </div>
    );
}