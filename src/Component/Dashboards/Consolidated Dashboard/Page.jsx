// src/Component/Dashboard/Dashboard.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import dayjs from "dayjs";
import DashboardFilters from "./DashboardFilters.jsx";
import ProcurementTable from "./ProcurementTable.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import CSVResponseHandler from "@/Component/Utils/CSVResponseHandler.jsx";  // ← import the CSV handler
import {API_URL} from "@/config.js";

// 1️⃣ Generation series: stack areas + line
const generationSeries = [
    {key: "must_run_total_gen", type: "area", label: "Must-Run Gen [kWh]", color: "#10B981"},
    {key: "remaining_plants_total_gen", type: "area", label: "Other Plants Gen [kWh]", color: "#F59E0B"},
    {key: "iex_gen", type: "area", label: "Power Exchange Qty [kWh]", color: "#3B82F6"},
    {key: "demand_banked", type: "line", label: "Demand Banked [kWh]", color: "#EF4444"},
];

// 2️⃣ Cost series: all areas
const costSeries = [
    {key: "must_run_total_cost", type: "area", label: "Total Cost Must-Run Gen [Rs]", color: "#DA8506"},
    {key: "iex_cost", type: "area", label: "Power Exchange Cost [Rs]", color: "#19D3C3"},
    {key: "remaining_plants_total_cost", type: "area", label: "Total Cost Others Plant [Rs]", color: "#C11BD3"},
    {key: "backdown_total_cost", type: "area", label: "Backdown Cost [Rs]", color: "#6A96D2"},
];

export default function Dashboard() {
    // default range: May 1 → May 2
    const defaultStart = dayjs("2023-04-01T00:00:00").format("YYYY-MM-DD HH:mm:ss");
    const defaultEnd = dayjs("2023-04-02T00:00:00").format("YYYY-MM-DD HH:mm:ss");

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [csvResponses, setCsvResponses] = useState(null);  // ← state for CSV download

    // single API call
    const fetchData = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end date/time");
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

    // on mount, load default
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // download full CSV…
    const downloadFullData = () => {
        if (!data?.procurement?.length) {
            toast.error("No data to download – please Load first");
            return;
        }
        setCsvResponses(data.procurement);  // ← trigger CSV modal
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
                onDownloadFull={downloadFullData}
                loading={loading}
            />

            {loading && (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                </div>
            )}

            {!loading && data?.procurement && (
                <>
                    {/* ─── Two‐column charts ─────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CommonComposedChart
                            data={data.procurement}
                            title="Generation Composition"
                            series={generationSeries}
                            height={340}
                            maxWidthClass="max-w-9xl"
                        />
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

            {/* ─── CSV Download Modal ─────────────────────────────────── */}
            {csvResponses && (
                <CSVResponseHandler
                    responses={csvResponses}
                    onClose={() => setCsvResponses(null)}
                />
            )}
        </div>
    );
}