import React, {useState} from "react";
import axios from "axios";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import BankingFilter from "../Banking/BankingFilter.jsx";
import {API_URL, POWERBI_URL} from "@/config.js";

// 1️⃣ Day.js core + plugins
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// 2️⃣ Extend Day.js so we can use .utc() and .tz()
dayjs.extend(utc);
dayjs.extend(timezone);

export default function Banking() {
    const [bankingData, setBankingData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showTable, setShowTable] = useState(false);

    const columns = [
        {header: "Date", accessor: "Date"},
        {
            header: "Timestamp (IST)",
            accessor: "TimeStamp",
            render: row =>
                // parse as UTC, convert to IST, then format
                dayjs
                    .utc(row.TimeStamp)
                    .tz("Asia/Kolkata")
                    .subtract(330, "minute")
                    .format("YYYY-MM-DD HH:mm:ss"),
        },
        {header: "Total Consumption", accessor: "Total_Consumption"},
        {header: "Banking Cumulative", accessor: "Banking_Cumulative"},
        {header: "Injection Electricity", accessor: "Injection_Electricity"},
        {header: "Banking Unit", accessor: "Banking_Unit"},
        {header: "Net Injection", accessor: "Net_Injection"},
        {header: "Adjusted Unit", accessor: "Adjusted_Unit"},
        {header: "Adjustment Charges", accessor: "Adjustment_Charges"},
        {header: "Banking Charges", accessor: "Banking_Charges"},
    ];

    const fetchFilteredData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}banking/`, {
                params: {start_date: startDate, end_date: endDate},
            });
            setBankingData(response.data);
            setShowTable(true);
        } catch (err) {
            console.error("Error fetching banking data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!startDate || !endDate) return;
        fetchFilteredData();
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setBankingData([]);
        setShowTable(false);
    };

    // CSV download now respects custom renderers
    const downloadCSV = (data, filename) => {
        const csvRows = [];
        const headers = columns.map(col => col.header).join(",");
        csvRows.push(headers);

        data.forEach(row => {
            const values = columns.map(col => {
                const cell = col.render ? col.render(row) : row[col.accessor];
                return `"${cell ?? ""}"`;
            });
            csvRows.push(values.join(","));
        });

        const blob = new Blob([csvRows.join("\n")], {type: "text/csv"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadCSV = () => downloadCSV(bankingData, "banking_data.csv");
    const handleDownloadPowerBI = () =>
        window.open(POWERBI_URL, "_blank", "noopener,noreferrer");

    return (
        <div className="max-w-full mx-auto mt-5 p-3 rounded-lg bg-white">
            <h2 className="text-2xl font-bold mb-4 text-center">Banking Data</h2>

            <BankingFilter
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                handleApply={handleApply}
                handleClear={handleClear}
                handleDownloadCSV={handleDownloadCSV}
                handleDownloadPowerBI={handleDownloadPowerBI}
            />

            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
                    <p className="ml-4 text-blue-500 font-semibold">Loading data...</p>
                </div>
            )}

            {!loading && showTable && (
                <CommonTable
                    title="Banking Data Table"
                    caption="All 15-min Banking Records"
                    columns={columns}
                    data={bankingData}
                    footer={{totalLabels: [{}]}}
                />
            )}
        </div>
    );
}