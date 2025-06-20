import React, {useState, useEffect} from "react";
import DashboardCards from "./DashboardCards.jsx";
import {API_URL} from "@/config.js";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import {Loader2} from "lucide-react";
import {CSVLink} from "react-csv";
import BasicDateTimePicker from "../../Utils/DateTimeBlock.jsx";
import CommonTable from "../../Utils/CommonTable";
import ErrorModal from "../../Utils/ErrorModal";
import PowerBIModal from "@/Component/Utils/PowerBIModal.jsx";
import dayjs from "dayjs";

const getISTDisplayData = (iso) => {
    const d = new Date(iso);
    return d.toISOString().replace("T", " ").slice(0, 19);
};

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
                // Use full datetime format
                const defaultStart = "2023-05-01 00:00:00";
                const defaultEnd = "2023-05-31 23:59:59";

                const [rawRes, statsRes] = await Promise.all([
                    // Use new endpoint
                    fetch(`${API_URL}demand/data?start_date=${encodeURIComponent(defaultStart)}&end_date=${encodeURIComponent(defaultEnd)}`),
                    fetch(`${API_URL}demand/dashboard`),
                ]);

                if (!rawRes.ok) throw new Error(`Demand fetch failed: ${rawRes.status}`);
                if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);

                const rawJson = await rawRes.json();
                const statsJson = await statsRes.json();

                // Access 'demand' property from response
                const demandArray = rawJson.demand.map((entry) => ({
                    ...entry,
                    timestamp: entry.TimeStamp,
                    TimeStampIST: getISTDisplayData(entry.TimeStamp),
                }));

                setDemandData(demandArray);
                setFilteredData(demandArray);
                setIsFilterApplied(true);

                setDashboardStats({
                    totalDemand: `${statsJson.demand_actual.toFixed(2)} MW`,
                    totalSupply: `${statsJson.demand_predicted.toFixed(2)} MW`,
                    averagePrice: `₹${statsJson.avg_price.toFixed(2)}/unit`,
                    totalPlants: statsJson.plant_count.toString(),
                });
            } catch (err) {
                console.error("API Error:", err);
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
                totalDemand: `${totalActual.toFixed(2)} MW`,
                totalSupply: `${totalPred.toFixed(2)} MW`,
            });
        }
    }, [filteredData, dashboardStats]);

    const handleApplyFilters = async () => {
        if (!startDate || !endDate) {
            setErrorMessage("Please select both Start and End date with time.");
            setShowErrorModal(true);
            return;
        }

        try {
            setLoading(true);
            // Use new endpoint with formatted dates
            const formattedStart = dayjs(startDate).format("YYYY-MM-DD HH:mm:ss");
            const formattedEnd = dayjs(endDate).format("YYYY-MM-DD HH:mm:ss");
            
            const res = await fetch(
                `${API_URL}demand/data?start_date=${encodeURIComponent(formattedStart)}&end_date=${encodeURIComponent(formattedEnd)}`
            );
            
            if (!res.ok) throw new Error("Failed to fetch filtered data.");
            const json = await res.json();

            const filtered = json.demand.map((entry) => ({
                ...entry,
                timestamp: entry.TimeStamp,
                TimeStampIST: getISTDisplayData(entry.TimeStamp),
            }));

            setFilteredData(filtered);
            setIsFilterApplied(true);
        } catch (error) {
            console.error("Filter Error:", error);
            setErrorMessage(error.message);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
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
        actual: {label: "Actual Demand", color: "rgb(0,31,63)"},
        pred: {label: "Predicted Demand", color: "rgb(46,245,0)"},
    };

    const series = [
        {
            key: "Demand(Actual)",
            label: chartConfig.actual.label,
            type: "line",
            color: chartConfig.actual.color,
        },
        {
            key: "Demand(Pred)",
            label: chartConfig.pred.label,
            type: "line",
            color: chartConfig.pred.color,
        },
    ];

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

            <div className="flex flex-wrap gap-4 items-end mb-6 px-4 py-3 bg-white shadow-md rounded-lg">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Start Date</label>
                    <BasicDateTimePicker label="Start DateTime" value={startDate} onChange={setStartDate}/>
                </div>
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">End Date</label>
                    <BasicDateTimePicker label="End DateTime" value={endDate} onChange={setEndDate}/>
                </div>
                <div className="flex gap-4 flex-wrap">
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
                    <CSVLink
                        data={rawCSVData}
                        filename={`raw_demand_data_${new Date().toISOString().slice(0, 10)}.csv`}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow"
                    >
                        Download CSV
                    </CSVLink>
                    <PowerBIModal/>
                </div>
            </div>

            {isFilterApplied && (
                <>
                    {dynamicStats && (
                        <DashboardCards
                            stats={dynamicStats}
                            startDate={startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""}
                            endDate={endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""}
                        />
                    )}

                    {showChart && filteredData.length > 0 ? (
                        <CommonComposedChart
                            data={filteredData}
                            title="Raw Demand (Actual vs Predicted)"
                            series={series}
                            height={300}
                            maxWidthClass="max-w-4xl"
                            modalHeight="70vh"
                        />
                    ) : (
                        <p className="text-gray-500 mt-4">Chart is loading or no data to display.</p>
                    )}

                    {filteredData.length > 0 && (
                        <CommonTable
                            title="Raw Demand Data"
                            caption="Non-Aggregated Demand Data (Raw API Data)"
                            columns={[
                                {
                                    accessor: "TimeStampIST",
                                    header: "Timestamp (IST)",
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

            {showErrorModal && (
                <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)}/>
            )}
        </div>
    );
}