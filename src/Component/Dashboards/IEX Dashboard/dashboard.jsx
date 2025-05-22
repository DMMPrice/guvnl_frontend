import React, {useState, useEffect} from "react";
import DashboardCards from "./DashboardCards.jsx";
import IEXLineChart from "./IEXLineChart.jsx";
import BasicDateTimePicker from "@/Component/Utils/DateTimePicker.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {API_URL, POWERBI_URL} from "@/config.js";
import {Loader2} from "lucide-react";
import {CSVLink} from "react-csv";
import PowerBIModal from "@/Component/Utils/PowerBIModal.jsx";

export default function IEXDashboard() {

    const [dashboardStats, setDashboardStats] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [demandData, setDemandData] = useState([]);
    const [filteredRawData, setFilteredRawData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [defaultStartDate, setDefaultStartDate] = useState(null);
    const [defaultEndDate, setDefaultEndDate] = useState(null);

    const [loading, setLoading] = useState(true);
    const [rawLoading, setRawLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load dashboard stats immediately
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}iex/dashboard`);
                if (!res.ok) throw new Error("Failed to load dashboard stats");
                const data = await res.json();
                setDashboardStats({
                    avgPredictedPrice: data.Avg_Pred_Price,
                    avgPrice: data.Avg_Price,
                });
            } catch (err) {
                setError(err.message);
            }
        };
        fetchStats();
    }, []);

    // Lazy-load raw data after delay
    useEffect(() => {
        const delayRawDataFetch = () => {
            setRawLoading(true);
            setTimeout(fetchRawData, 400); // small delay
        };
        delayRawDataFetch();
    }, []);

    const fetchRawData = async () => {
        try {
            const res = await fetch(`${API_URL}iex/all`);
            if (!res.ok) throw new Error("Failed to load raw IEX data");
            const data = await res.json();

            const formatted = data.map((entry) => {
                const timeObj = new Date(entry.TimeStamp);
                return {
                    timestamp: entry.TimeStamp,
                    dateTime: timeObj.toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: false,
                    }),
                    day: timeObj.toISOString().slice(0, 10),
                    actual: Number(entry.Actual).toFixed(2),
                    predicted: Number(entry.Pred).toFixed(2),
                };
            });

            setRawData(formatted);
            setRawLoading(false);
            setLoading(false);

            // Also build daily aggregates
            const aggregates = {};
            formatted.forEach((item) => {
                const day = item.day;
                if (!aggregates[day]) {
                    aggregates[day] = {
                        day,
                        actualSum: 0,
                        predictedSum: 0,
                        count: 0,
                    };
                }
                aggregates[day].actualSum += Number(item.actual);
                aggregates[day].predictedSum += Number(item.predicted);
                aggregates[day].count += 1;
            });

            const dailyAvg = Object.entries(aggregates).map(([day, sums]) => ({
                day,
                actual: (sums.actualSum / sums.count).toFixed(2),
                predicted: (sums.predictedSum / sums.count).toFixed(2),
            }));

            setDemandData(dailyAvg);
            setDefaultStartDate(new Date(dailyAvg[0].day));
            setDefaultEndDate(new Date(dailyAvg[dailyAvg.length - 1].day));
        } catch (err) {
            setError(err.message);
            setRawLoading(false);
            setLoading(false);
        }
    };

    const shiftRawDataByFiveThirty = (dataArray) => {
        return dataArray.map((item) => {
            const dateObj = new Date(item.timestamp);
            dateObj.setMinutes(dateObj.getMinutes() - 330);
            return {
                ...item,
                timestamp: dateObj.toISOString(),
                dateTime: dateObj.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour12: false,
                }),
            };
        });
    };

    const handleApplyFilters = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        // Aggregated filter
        const filtered = demandData.filter((entry) => {
            const entryDate = new Date(entry.day);
            return (
                entryDate >= startDate &&
                entryDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
            );
        });
        setFilteredData(filtered);

        // Raw data filter and shift to IST
        let rawFiltered = rawData.filter((entry) => {
            const rowDate = new Date(entry.timestamp);
            return rowDate >= startDate && rowDate <= endDate;
        });
        rawFiltered = shiftRawDataByFiveThirty(rawFiltered);
        setFilteredRawData(rawFiltered);

        // Page stats for filtered
        if (filtered.length > 0) {
            const avgPredictedPrice = (
                filtered.reduce((sum, e) => sum + Number(e.predicted), 0) /
                filtered.length
            ).toFixed(2);
            const avgPrice = (
                filtered.reduce((sum, e) => sum + Number(e.actual), 0) / filtered.length
            ).toFixed(2);

            setDashboardStats((prev) => ({
                ...prev,
                avgPredictedPrice,
                avgPrice,
            }));
        }

        setIsFilterApplied(true);
    };

    const handleClearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setFilteredData([]);
        setFilteredRawData([]);
        setIsFilterApplied(false);
    };

    const rawCSVData = [
        ["Date & Time (IST)", "Actual Price", "Predicted Price"],
        ...filteredRawData.map((entry) => [
            entry.dateTime,
            entry.actual,
            entry.predicted,
        ]),
    ];

    const tableColumns = [
        {accessor: "dateTime", header: "Date & Time"},
        {
            accessor: "actual",
            header: "Actual Price",
            render: (row) => row.actual,
        },
        {
            accessor: "predicted",
            header: "Predicted Price",
            render: (row) => row.predicted,
        },
    ];

    const chartConfig = {
        actual: {label: "Actual Price", color: "rgba(14, 165, 233, 1)"},
        predicted: {label: "Predicted Price", color: "rgb(248, 8, 76)"},
    };

    if (loading && !dashboardStats) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-6 w-6 animate-spin mr-2"/>
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
    }

    return (
        <div className="mx-8 p-6 animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
                IEX Market Overview
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-6 mb-6 items-center p-4">
                <div className="flex flex-col">
                    <BasicDateTimePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                    />
                </div>
                <div className="flex flex-col">
                    <BasicDateTimePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                    />
                </div>
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={handleApplyFilters}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg">
                        Apply
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg">
                        Clear
                    </button>
                    <CSVLink
                        data={rawCSVData}
                        filename={`iex_raw_${new Date().toISOString().slice(0, 10)}.csv`}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-center">
                        Download Raw Data CSV
                    </CSVLink>
                    <PowerBIModal/>
                </div>
            </div>

            {/* Only show after filter */}
            {isFilterApplied && (
                <>
                    {dashboardStats && (
                        <DashboardCards
                            stats={dashboardStats}
                            startDate={startDate?.toISOString().slice(0, 10)}
                            endDate={endDate?.toISOString().slice(0, 10)}
                        />
                    )}
                    {filteredRawData.length > 0 && (
                        <IEXLineChart data={filteredRawData} chartConfig={chartConfig}/>
                    )}
                    {filteredRawData.length > 0 && (
                        <CommonTable
                            title="Raw IEX Data"
                            caption="Filtered Non-Aggregated IEX Data (Shifted to IST)"
                            columns={tableColumns}
                            data={filteredRawData}
                        />
                    )}
                </>
            )}

            {rawLoading && !isFilterApplied && (
                <p className="text-sm text-gray-500 mt-4">Fetching raw market data. Please wait...</p>
            )}
        </div>
    );
}