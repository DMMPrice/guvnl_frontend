// src/Component/Dashboard/ProcurementViewer.jsx
import React, {useState, useEffect} from "react";
import axios from "axios";
import dayjs from "dayjs";
import {toast} from "react-toastify";
import DashboardFilters from "./DashboardFilters.jsx";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import {API_URL, SAVE_URL} from "@/config.js";

export default function ProcurementViewer() {
    const defaultStart = "2023-04-01 00:00";
    const defaultEnd = "2023-04-02 00:00";
    const IST_OFFSET = 5.5; // hours

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch procurement data
    const fetchProcurement = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end date/time");
            return;
        }
        setLoading(true);
        try {
            const resp = await axios.get(`${API_URL}/dashboard`, {
                params: {
                    start_date: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
                    end_date: dayjs(endDate).format("YYYY-MM-DD HH:mm:ss"),
                },
            });
            setData(resp.data.procurement || []);
        } catch {
            toast.error("Failed to fetch procurement data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcurement();
    }, []);

    // Table columns
    const columns = [
        {
            accessor: "timestamp",
            header: "TimeStamp (IST)",
            render: (row) =>
                dayjs(row.timestamp)
                    .subtract(IST_OFFSET, "hour")
                    .format("DD/MM/YYYY HH:mm"),
        },
        {accessor: "demand_banked", header: "Demand (Pred) [kWh]"},
        {accessor: "banking_unit", header: "Banking Unit [kWh]"},
        {accessor: "last_price", header: "Block-wise Max Price [Rs]"},
        {accessor: "must_run_total_gen", header: "Must-Run Gen [kWh]"},
        {accessor: "remaining_plants_total_gen", header: "Other Gen [kWh]"},
        {accessor: "iex_gen", header: "Exchange Qty [kWh]"},
        {accessor: "must_run_total_cost", header: "Must-Run Cost [Rs]"},
        {accessor: "remaining_plants_total_cost", header: "Other Cost [Rs]"},
        {accessor: "iex_cost", header: "Exchange Cost [Rs]"},
        {accessor: "backdown_total_cost", header: "Backdown Cost [Rs]"},
        // Actions column removed
    ];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-3">MOD Detailed Table</h1>
            <DashboardFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onLoad={fetchProcurement}
                onDownloadFull={fetchProcurement}
                loading={loading}
            />

            <AdvancedTable
                title="Procurement Data"
                columns={columns}
                data={data}
                loading={loading}
            />
        </div>
    );
}