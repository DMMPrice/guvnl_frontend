import React, {useState, useEffect} from "react";
import DashboardCards from "./DashboardCards";
import {API_URL} from "@/config.js";
import DemandLineChart from "./DemandLineChart";
import {Loader2} from "lucide-react";
import {CSVLink} from "react-csv";
import BasicDateTimePicker from "../Utils/DateTimePicker";
import CommonTable from "../Utils/CommonTable";

export default function Dashboard() {
    const [demandData, setDemandData] = useState(null); // Raw data from API
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Control delayed appearance of the chart
    const [showChart, setShowChart] = useState(false);

    // -----------------------------
    // 1) Fetch demand data & stats on mount
    // -----------------------------
    useEffect(() => {
        const fetchDemandData = async () => {
            try {
                const response = await fetch(`${API_URL}demand/all`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDemandData(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchDashboardStats = async () => {
            try {
                const response = await fetch(`${API_URL}demand/dashboard`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                setDashboardStats({
                    totalDemand: `${(data.demand_actual / 1e6).toFixed(2)} MW`,
                    totalSupply: `${(data.demand_predicted / 1e6).toFixed(2)} MW`,
                    averagePrice: `₹${data.avg_price.toFixed(2)}/unit`,
                    totalPlants: data.plant_count.toString(),
                });
            } catch (error) {
                setError(error.message);
            }
        };

        fetchDemandData();
        fetchDashboardStats();
    }, []);

    // -----------------------------
    // 2) Once data is loaded, set a 2-second timer (was 5s) to show chart
    // -----------------------------
    useEffect(() => {
        if (!loading && demandData && !error) {
            const timer = setTimeout(() => {
                setShowChart(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [loading, demandData, error]);

    // -----------------------------
    // 3) Filter raw data by date range (NO +5:30 shift)
    // -----------------------------
    let filteredRaw = [];
    if (demandData && Array.isArray(demandData)) {
        filteredRaw = demandData.filter((entry) => {
            const entryDate = new Date(entry.TimeStamp);

            if (startDate && entryDate < new Date(startDate)) return false;
            if (endDate && entryDate > new Date(endDate)) return false;

            return true;
        });
    }

    // -----------------------------
    // 4) Compute dynamic dashboard stats from filtered raw data
    // -----------------------------
    let dynamicStats = dashboardStats;
    if (filteredRaw.length > 0 && dashboardStats) {
        const totalActual = filteredRaw.reduce(
            (sum, entry) => sum + Number(entry["Demand(Actual)"] || 0),
            0
        );
        const totalPredicted = filteredRaw.reduce(
            (sum, entry) => sum + Number(entry["Demand(Pred)"] || 0),
            0
        );

        dynamicStats = {
            ...dashboardStats,
            totalDemand: `${(totalActual / 1e6).toFixed(2)} MW`,
            totalSupply: `${(totalPredicted / 1e6).toFixed(2)} MW`,
        };
    }

    // -----------------------------
    // 5) CSV data (raw, filtered)
    // -----------------------------
    const rawCSVData = [
        ["Timestamp", "Actual Demand", "Predicted Demand"],
        ...filteredRaw.map((entry) => [
            entry.TimeStamp,
            entry["Demand(Actual)"],
            entry["Demand(Pred)"],
        ]),
    ];

    // -----------------------------
    // 6) Clear filters
    // -----------------------------
    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };

    // Chart config
    const chartConfig = {
        actual: {label: "Actual Demand", color: "rgba(14, 165, 233, 1)"},
        pred: {label: "Predicted Demand", color: "rgb(248, 8, 76)"},
    };

    // -----------------------------
    // 7) UI rendering
    // -----------------------------
    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                Loading...
            </div>
        );
    }
    if (error) {
        return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
    }

    return (
        <div className="mx-8 p-6 animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
                Dashboard Overview
            </h1>

            {/* Date Filters & Button Row */}
            <div className="flex flex-wrap gap-4 items-center mb-6 px-4 py-3 bg-white shadow-md rounded-lg">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Start Date</label>
                    <BasicDateTimePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">End Date</label>
                    <BasicDateTimePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                    />
                </div>

                <div className="flex gap-4 mt-5">
                    <button
                        onClick={handleClearFilters}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow">
                        Clear
                    </button>

                    {/* Single CSV Download Link (Raw) */}
                    <CSVLink
                        data={rawCSVData}
                        filename={`raw_demand_data_${new Date()
                            .toISOString()
                            .slice(0, 10)}.csv`}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 text-center shadow">
                        Download Raw Data CSV
                    </CSVLink>
                </div>
            </div>

            {/* Dashboard Stats Cards */}
            {dynamicStats && (
                <DashboardCards
                    stats={dynamicStats}
                    startDate={
                        startDate ? new Date(startDate).toISOString().slice(0, 10) : null
                    }
                    endDate={
                        endDate ? new Date(endDate).toISOString().slice(0, 10) : null
                    }
                />
            )}

            {/* Line Chart after 2s */}
            {showChart && filteredRaw.length > 0 && (
                <DemandLineChart data={filteredRaw} chartConfig={chartConfig}/>
            )}
            {!showChart && !loading && (
                <p className="text-gray-500 mt-4">
                    The chart is being prepared in the background. It will appear
                    shortly...
                </p>
            )}

            {/* Raw Data Table */}
            {filteredRaw.length > 0 && (
                <CommonTable
                    title="Raw Demand Data"
                    caption="Non-Aggregated Demand Data (Raw API Data)"
                    columns={[
                        {
                            accessor: "TimeStamp",
                            header: "Timestamp",
                            render: (row) => new Date(row.TimeStamp).toLocaleString(),
                        },
                        {
                            accessor: "Demand(Actual)",
                            header: "Actual Demand",
                            render: (row) => Number(row["Demand(Actual)"]).toFixed(2),
                        },
                        {
                            accessor: "Demand(Pred)",
                            header: "Predicted Demand",
                            render: (row) => Number(row["Demand(Pred)"]).toFixed(2),
                        },
                    ]}
                    data={filteredRaw}
                />
            )}
        </div>
    );
}
