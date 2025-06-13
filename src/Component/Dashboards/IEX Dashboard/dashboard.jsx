import React, {useState, useEffect} from "react";
import DashboardCards from "./DashboardCards.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {API_URL} from "@/config.js";
import {Loader2} from "lucide-react";
import {CSVLink} from "react-csv";
import PowerBIModal from "@/Component/Utils/PowerBIModal.jsx";
import dayjs from "dayjs";

// 👉 Used for chart and dashboard grouping logic (accurate IST conversion)
const getISTDateInfo = (iso) => {
    const d = new Date(iso);
    const ist = new Date(d.getTime() + 330 * 60000); // +5:30
    return {
        timestamp: iso, // keep UTC original
        day: ist.toISOString().slice(0, 10), // "YYYY-MM-DD"
    };
};

const getISTDisplayData = (iso) => {
    const d = new Date(iso);
    return d.toISOString().replace("T", " ").slice(0, 19);  // NO 5:30 shift
};

export default function IEXDashboard() {
    const [dashboardStats, setDashboardStats] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [filteredRawData, setFilteredRawData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to map and format a single IEX entry
    const mapIEXEntry = (entry) => {
        const dateInfo = getISTDateInfo(entry.TimeStamp);
        return {
            timestamp: dateInfo.timestamp,
            day: dateInfo.day,
            dateTime: getISTDisplayData(entry.TimeStamp),
            Actual: Number(entry.Actual).toFixed(2),
            Pred: Number(entry.Pred).toFixed(2),
        };
    };

    useEffect(() => {
        (async () => {
            try {
                const defaultStart = "2023-03-01 00:00";
                const defaultEnd = "2023-03-31 00:00";

                const res = await fetch(`${API_URL}dashboard?start_date=${encodeURIComponent(defaultStart)}&end_date=${encodeURIComponent(defaultEnd)}`);
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const json = await res.json();

                if (json.iex?.length) {
                    const acts = json.iex.map((e) => Number(e.Actual));
                    const preds = json.iex.map((e) => Number(e.Pred));
                    const avgAct = (acts.reduce((s, x) => s + x, 0) / acts.length).toFixed(2);
                    const avgPred = (preds.reduce((s, x) => s + x, 0) / preds.length).toFixed(2);
                    setDashboardStats({avgPrice: avgAct, avgPredictedPrice: avgPred});
                }

                const iexFormatted = json.iex.map(mapIEXEntry);

                setRawData(iexFormatted);
                setFilteredRawData(iexFormatted);

                const byDay = {};
                iexFormatted.forEach((e) => {
                    if (!byDay[e.day]) byDay[e.day] = {day: e.day, sumA: 0, sumP: 0, count: 0};
                    byDay[e.day].sumA += Number(e.Actual);
                    byDay[e.day].sumP += Number(e.Pred);
                    byDay[e.day].count += 1;
                });

                const daily = Object.values(byDay).map((d) => ({
                    day: d.day,
                    Actual: (d.sumA / d.count).toFixed(2),
                    Pred: (d.sumP / d.count).toFixed(2),
                }));
                setFilteredData(daily);

                setStartDate(new Date(daily[0].day + "T00:00:00"));
                setEndDate(new Date(daily[daily.length - 1].day + "T00:00:00"));
                setIsFilterApplied(true);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const series = [
        {key: "Actual", label: "Actual Price", type: "line", color: "rgba(14,165,233,1)"},
        {key: "Pred", label: "Predicted Price", type: "line", color: "rgb(248,8,76)"},
    ];

    const handleApplyFilters = async () => {
        if (!startDate || !endDate) {
            alert("Select both start & end dates");
            return;
        }
        try {
            setLoading(true);
            const formattedStart = dayjs(startDate).format("YYYY-MM-DD HH:mm");
            const formattedEnd = dayjs(endDate).format("YYYY-MM-DD HH:mm");

            const res = await fetch(
                `${API_URL}dashboard?start_date=${encodeURIComponent(formattedStart)}&end_date=${encodeURIComponent(formattedEnd)}`
            );
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const json = await res.json();

            const iexFormatted = json.iex.map(mapIEXEntry);
            setFilteredRawData(iexFormatted);

            const byDay = {};
            iexFormatted.forEach((e) => {
                if (!byDay[e.day]) byDay[e.day] = {day: e.day, sumA: 0, sumP: 0, count: 0};
                byDay[e.day].sumA += Number(e.Actual);
                byDay[e.day].sumP += Number(e.Pred);
                byDay[e.day].count += 1;
            });

            const daily = Object.values(byDay).map((d) => ({
                day: d.day,
                Actual: (d.sumA / d.count).toFixed(2),
                Pred: (d.sumP / d.count).toFixed(2),
            }));
            setFilteredData(daily);

            const priceArr = daily.map((d) => Number(d.Actual));
            const predArr = daily.map((d) => Number(d.Pred));
            const avgAct = priceArr.length ? (priceArr.reduce((s, x) => s + x, 0) / priceArr.length).toFixed(2) : dashboardStats?.avgPrice;
            const avgPred = predArr.length ? (predArr.reduce((s, x) => s + x, 0) / predArr.length).toFixed(2) : dashboardStats?.avgPredictedPrice;
            setDashboardStats({avgPrice: avgAct, avgPredictedPrice: avgPred});

            setIsFilterApplied(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setStartDate(new Date(filteredData[0]?.day + "T00:00:00"));
        setEndDate(new Date(filteredData[filteredData.length - 1]?.day + "T00:00:00"));
        setFilteredRawData(rawData);
        setIsFilterApplied(true);
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-6 w-6 animate-spin mr-2"/>
                Loading…
            </div>
        );

    if (error) return <div className="text-red-500 text-center mt-4">Error: {error}</div>;

    const rawCSV = [["Date & Time (IST)", "Actual Price", "Predicted Price"], ...filteredRawData.map(e => [e.dateTime, e.Actual, e.Pred])];
    const tableCols = [
        {accessor: "dateTime", header: "Date & Time"},
        {accessor: "Actual", header: "Actual Price"},
        {accessor: "Pred", header: "Predicted Price"},
    ];

    return (
        <div className="mx-8 p-6 animate-fadeIn">
            <h1 className="text-2xl font-bold mb-6">IEX Market Overview</h1>

            <div className="flex gap-4 mb-6 items-end">
                <BasicDateTimePicker label="Start Date" value={startDate} onChange={setStartDate}/>
                <BasicDateTimePicker label="End Date" value={endDate} onChange={setEndDate}/>
                <button onClick={handleApplyFilters}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Apply
                </button>
                <button onClick={handleClearFilters}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Clear
                </button>
                <CSVLink data={rawCSV} filename={`iex_raw_${new Date().toISOString().slice(0, 10)}.csv`}
                         className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                    Download Raw CSV
                </CSVLink>
                <PowerBIModal/>
            </div>

            {isFilterApplied && (
                <>
                    {dashboardStats && (
                        <DashboardCards
                            stats={{
                                avgPrice: `${dashboardStats.avgPrice} ₹`,
                                avgPredictedPrice: `${dashboardStats.avgPredictedPrice} ₹`,
                            }}
                            startDate={
                                startDate instanceof Date && !isNaN(startDate)
                                    ? dayjs(startDate).format("YYYY-MM-DD")
                                    : ""
                            }
                            endDate={
                                endDate instanceof Date && !isNaN(endDate)
                                    ? dayjs(endDate).format("YYYY-MM-DD")
                                    : ""
                            }
                        />
                    )}

                    {filteredRawData.length > 0 && (
                        <CommonComposedChart
                            data={filteredRawData}
                            title="IEX Actual & Predicted Prices"
                            series={series}
                            height={300}
                            maxWidthClass="max-w-4xl"
                            modalHeight="70vh"
                        />
                    )}

                    {filteredRawData.length > 0 && (
                        <CommonTable
                            title="Raw IEX Data"
                            caption="Actual vs Predicted Prices (IST)"
                            columns={tableCols}
                            data={filteredRawData}
                        />
                    )}
                </>
            )}
        </div>
    );
}