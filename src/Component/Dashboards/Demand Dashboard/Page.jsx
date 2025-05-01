import React, {useState, useEffect} from "react";
import DashboardCards from "./DashboardCards.jsx";
import {API_URL, POWERBI_URL} from "@/config.js";
import DemandLineChart from "./DemandLineChart.jsx";
import {Loader2} from "lucide-react";
import {CSVLink} from "react-csv";
import BasicDateTimePicker from "../../Utils/DateTimePicker";
import CommonTable from "../../Utils/CommonTable";
import ErrorModal from "../../Utils/ErrorModal";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function Page() {
    const [demandData, setDemandData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [dynamicStats, setDynamicStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [showChart, setShowChart] = useState(false);
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [rawRes, statsRes] = await Promise.all([
                    fetch(`${API_URL}demand/all`),
                    fetch(`${API_URL}demand/dashboard`)
                ]);

                if (!rawRes.ok) throw new Error(`Demand fetch failed: ${rawRes.status}`);
                if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);

                const rawJson = await rawRes.json();
                const statsJson = await statsRes.json();

                setDemandData(rawJson);
                setFilteredData(rawJson);
                setDashboardStats({
                    totalDemand: `${(statsJson.demand_actual).toFixed(2)} MW`,
                    totalSupply: `${(statsJson.demand_predicted).toFixed(2)} MW`,
                    averagePrice: `₹${statsJson.avg_price.toFixed(2)}/unit`,
                    totalPlants: statsJson.plant_count.toString(),
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        if (!loading && demandData.length && !error) {
            const timer = setTimeout(() => setShowChart(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [loading, demandData, error]);

    useEffect(() => {
        if (!dashboardStats) return;

        if (filteredData.length === 0) {
            setDynamicStats(dashboardStats);
        } else {
            const totalActual = filteredData.reduce(
                (sum, e) => sum + Number(e["Demand(Actual)"] || 0),
                0
            );
            const totalPred = filteredData.reduce(
                (sum, e) => sum + Number(e["Demand(Pred)"] || 0),
                0
            );

            setDynamicStats({
                ...dashboardStats,
                totalDemand: `${(totalActual).toFixed(2)} MW`,
                totalSupply: `${(totalPred).toFixed(2)} MW`,
            });
        }
    }, [filteredData, dashboardStats]);

    const handleApplyFilters = () => {
        if (!startDate || !endDate) {
            setErrorMessage("Please select both Start and End date with time.");
            setShowErrorModal(true);
            return;
        }

        const filtered = demandData
            .filter((entry) => {
                const entryDate = new Date(entry.TimeStamp);
                return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
            })
            .map((entry) => ({
                ...entry,
                TimeStampIST: dayjs(entry.TimeStamp)
                    .tz("Asia/Kolkata")
                    .format("DD MMM YYYY, HH:mm"),
            }));

        setFilteredData(filtered);
        setIsFilterApplied(true);
    };

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setFilteredData(demandData);
        setIsFilterApplied(false);
    };

    const rawCSVData = [
        ["Timestamp (IST)", "Actual Demand", "Predicted Demand"],
        ...filteredData.map((entry) => [
            entry.TimeStampIST,
            entry["Demand(Actual)"],
            entry["Demand(Pred)"],
        ]),
    ];

    const chartConfig = {
        actual: {label: "Actual Demand", color: "rgba(14, 165, 233, 1)"},
        pred: {label: "Predicted Demand", color: "rgb(248, 8, 76)"},
    };

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
                Demand Dashboard Overview
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end mb-6 px-4 py-3 bg-white shadow-md rounded-lg">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Start Date</label>
                    <BasicDateTimePicker
                        label="Start DateTime"
                        value={startDate}
                        onChange={setStartDate}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">End Date</label>
                    <BasicDateTimePicker
                        label="End DateTime"
                        value={endDate}
                        onChange={setEndDate}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleApplyFilters}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow"
                    >
                        Apply
                    </button>

                    <button
                        onClick={handleClearFilters}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => window.open(POWERBI_URL, "_blank", "noopener,noreferrer")}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-200 shadow"
                    >
                        Show in PowerBI
                    </button>
                </div>
            </div>

            {/* Page Content */}
            {isFilterApplied && (
                <>
                    {dynamicStats && (
                        <DashboardCards
                            stats={dynamicStats}
                            startDate={startDate ? new Date(startDate).toISOString().slice(0, 10) : null}
                            endDate={endDate ? new Date(endDate).toISOString().slice(0, 10) : null}
                        />
                    )}

                    {showChart && filteredData.length > 0 ? (
                        <DemandLineChart data={filteredData} chartConfig={chartConfig}/>
                    ) : (
                        <p className="text-gray-500 mt-4">Chart is loading or no data to display.</p>
                    )}

                    <div className="mt-4 text-right">
                        <CSVLink
                            data={rawCSVData}
                            filename={`raw_demand_data_${new Date().toISOString().slice(0, 10)}.csv`}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow"
                        >
                            Download CSV
                        </CSVLink>
                    </div>

                    {filteredData.length > 0 && (
                        <CommonTable
                            title="Raw Demand Data"
                            caption="Non-Aggregated Demand Data (Raw API Data)"
                            columns={[
                                {
                                    accessor: "TimeStamp",
                                    header: "Timestamp",
                                    render: (row) =>
                                        new Date(row.TimeStamp).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            hour12: false,
                                        }),
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
                            data={filteredData}
                        />
                    )}
                </>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
}