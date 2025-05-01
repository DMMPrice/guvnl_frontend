// src/Component/Dashboard/Dashboard.jsx
import React, {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import DashboardFilters from "./DashboardFilters.jsx";
import ProcurementTable from "./ProcurementTable.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import {API_URL} from "@/config.js";

// 1️⃣ Generation series: stack areas + line
const generationSeries = [
    {
        key: "must_run_total_gen",
        type: "area",
        label: "Must-Run Gen [kWh]",
        color: "#10B981",
    },
    {
        key: "remaining_plants_total_gen",
        type: "area",
        label: "Other Plants Gen [kWh]",
        color: "#F59E0B",
    },
    {
        key: "iex_gen",
        type: "area",
        label: "Power Exchange Qty [kWh]",
        color: "#3B82F6",
    },
    {
        key: "demand_banked",
        type: "line",
        label: "Demand Banked [kWh]",
        color: "#EF4444",
    },
];

// 2️⃣ Cost series: all lines
const costSeries = [
    {
        key: "must_run_total_cost",
        type: "area",
        label: "Total Cost Must-Run Gen [Rs]",
        color: "#da8506",
    },
    {
        key: "iex_cost",
        type: "area",
        label: "Power Exchange Cost [Rs]",
        color: "#19d3c3",
    },
    {
        key: "remaining_plants_total_cost",
        type: "area",
        label: "Total Cost Others Plant [Rs]",
        color: "#c11bd3",
    },

    {
        key: "backdown_total_cost",
        type: "area",
        label: "Backdown Cost [Rs]",
        color: "#6a96d2",
    },

];

export default function Dashboard() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both dates");
            return;
        }
        setLoading(true);
        try {
            const resp = await axios.get(`${API_URL}/dashboard`, {
                params: {start_date: startDate, end_date: endDate},
            });
            setData(resp.data);
            toast.success("Data loaded successfully");
        } catch {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Demand Generation Combined Dashboard</h1>

            <DashboardFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onLoad={fetchData}
                loading={loading}
            />

            {data?.procurement && (
                <>
                    {/* ─── Two‐column charts ─────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Generation Composition */}
                        <CommonComposedChart
                            data={data.procurement}
                            title="Generation Composition"
                            series={generationSeries}
                            height={340}
                            maxWidthClass="max-w-9xl"
                        />

                        {/* Cost Composition */}
                        <CommonComposedChart
                            data={data.procurement}
                            title="Cost Composition"
                            series={costSeries}
                            height={340}
                            maxWidthClass="max-w-9xl"
                        />
                    </div>

                    {/* ─── Table below ───────────────────────────────────── */}
                    <ProcurementTable
                        data={data.procurement}
                        userRole={JSON.parse(localStorage.userData || "{}").role}
                    />
                </>
            )}
        </div>
    );
}