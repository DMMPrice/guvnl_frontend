// src/Component/Dashboards/DtrConsumerDashboard/Page.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import dayjs from "dayjs";

import FilterBar from "./FilterBar.jsx";
import InfoCardsPanel from "./InfoCardsPanel.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {API_URL} from "@/config.js";

export default function DtrConsumerDashboard() {
    /* 1 ▪ local (un-applied) filter inputs */
    const [startDate, setStartDate] = useState("2023-04-01 00:00");
    const [endDate, setEndDate] = useState("2023-04-02 00:00");
    const [dtrId, setDtrId] = useState("");          // filled after list load
    const [consumerId, setConsumerId] = useState("");          // filled after list load

    /* 2 ▪ applied filters (drive data fetch) */
    const [applied, setApplied] = useState({
        startDate, endDate, dtrId: "", consumerId: ""
    });
    const [initialApplied, setInitialApplied] = useState(false);

    /* 3 ▪ master dropdown lists */
    const [dtrList, setDtrList] = useState([]);
    const [consumerList, setConsumerList] = useState([]);

    /* 4 ▪ payload + ui state */
    const [consData, setConsData] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ─────── 5 ▪ load DTR list once ─────── */
    useEffect(() => {
        axios.get(`${API_URL}dtr/`)
            .then(res => setDtrList(res.data || []))
            .catch(console.error);
    }, []);

    /* ─────── 6 ▪ when DTR list arrives, choose first DTR (local only) */
    useEffect(() => {
        if (dtrList.length && !dtrId) {
            setDtrId(dtrList[0].dtr_id);
        }
    }, [dtrList]);

    /* ─────── 7 ▪ load consumer list each time dtrId changes ─────── */
    useEffect(() => {
        if (!dtrId) return;
        axios.get(`${API_URL}consumer/by-dtr/${dtrId}`)
            .then(res => setConsumerList(res.data || []))
            .catch(console.error);
    }, [dtrId]);

    /* pick first consumer when list arrives */
    useEffect(() => {
        if (consumerList.length && !consumerId) {
            setConsumerId(consumerList[0].consumer_id);
        }
    }, [consumerList]);

    /* ─────── 8 ▪ one-time auto-apply when dtrId & consumerId ready ─────── */
    useEffect(() => {
        if (!initialApplied && dtrId && consumerId) {
            setApplied({startDate, endDate, dtrId, consumerId});
            setInitialApplied(true);
        }
    }, [dtrId, consumerId, startDate, endDate, initialApplied]);

    /* ─────── 9 ▪ fetch consumption whenever *applied* changes ─────── */
    useEffect(() => {
        if (!applied.consumerId) return;           // nothing to fetch yet
        setLoading(true);

        const url = `${API_URL}consumer/consumption?`
            + `start_date=${encodeURIComponent(applied.startDate)}`
            + `&end_date=${encodeURIComponent(applied.endDate)}`
            + `&consumer_id=${applied.consumerId}`;

        axios.get(url)
            .then(r => setConsData(r.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [applied]);

    /* 10 ▪ KPI metrics */
    const totalActual = consData.reduce((s, r) => s + (r.Energy_consumption_kWh || 0), 0);
    const totalTheo = consData.reduce((s, r) => s + (r.Theoretical_kWh || 0), 0);
    const lossKWh = totalTheo - totalActual;
    const lossPct = totalTheo ? (lossKWh / totalTheo) * 100 : 0;

    const metricSet = {totalActual, totalTheo, lossKWh, lossPct};

    /* 11 ▪ chart + table rows */
    const chartData = consData.map(r => ({
        timestamp: dayjs(r.Timestamp).add(5.5, "hour").format("YYYY-MM-DDTHH:mm:ss"),
        Actual: r.Energy_consumption_kWh,
        Theoretical: r.Theoretical_kWh
    }));

    const tableData = consData.map(r => ({
        ...r,
        Loss_kWh: parseFloat(
            ((r.Theoretical_kWh || 0) - (r.Energy_consumption_kWh || 0)).toFixed(3)
        )
    }));

    const tableColumns = [
        {header: "Timestamp", accessor: "Timestamp"},
        {header: "Actual (kWh)", accessor: "Energy_consumption_kWh"},
        {header: "Theoretical (kWh)", accessor: "Theoretical_kWh"},
        {header: "Loss (kWh)", accessor: "Loss_kWh"}
    ];

    const series = [
        {key: "Actual", label: "Actual", type: "area", color: "#1f77b4"},
        {key: "Theoretical", label: "Theoretical", type: "line", color: "#d62728"}
    ];

    /* 12 ▪ button handlers */
    const handleApply = () =>
        setApplied({startDate, endDate, dtrId, consumerId});

    const handleClear = () => {
        const def = {
            startDate: "2023-04-01 00:00",
            endDate: "2023-04-02 00:00",
            dtrId: dtrList[0]?.dtr_id || "",
            consumerId: ""
        };
        setStartDate(def.startDate);
        setEndDate(def.endDate);
        setDtrId(def.dtrId);
        setConsumerId(def.consumerId);
        setApplied({...def});
    };

    const handleDownload = () => {
        if (!tableData.length) {
            alert("No data to download. Click Apply first.");
            return;
        }
        const csv = [
            tableColumns.map(c => `"${c.header}"`).join(","),
            ...tableData.map(row =>
                tableColumns.map(c => {
                    const v = row[c.accessor] ?? "";
                    return typeof v === "number" ? v : `"${v}"`;
                }).join(",")
            )
        ].join("\n");

        const blob = new Blob([csv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${consumerId}_consumption.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    /* ─── render ─────────────────────────────── */
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">
                DTR → Consumer Loss Dashboard
            </h2>

            <FilterBar
                startDate={startDate}
                endDate={endDate}
                dtrId={dtrId}
                consumerId={consumerId}
                dtrList={dtrList}
                consumerList={consumerList}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onDtrChange={setDtrId}
                onConsumerChange={setConsumerId}
                onApply={handleApply}
                onClear={handleClear}
                onDownload={handleDownload}
            />

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600
                          border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : applied.consumerId ? (
                <>
                    <InfoCardsPanel metrics={metricSet}/>

                    <CommonComposedChart
                        data={chartData}
                        title={`${consumerId} – Actual vs Theoretical`}
                        series={series}
                        height={300}
                    />

                    <div className="mt-8">
                        <CommonTable
                            title="Consumer Consumption Details"
                            columns={tableColumns}
                            data={tableData}
                        />
                    </div>
                </>
            ) : (
                <p className="text-gray-500 mt-8">
                    Select filters and click <strong>Apply</strong> to load data.
                </p>
            )}
        </div>
    );
}