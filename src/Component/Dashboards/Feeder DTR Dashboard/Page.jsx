import React, {useEffect, useState} from "react";
import axios from "axios";
import dayjs from "dayjs";

import FilterBarDTR from "./FilterBar.jsx";
import InfoCardsPanelDTR from "./InfoCardsPanel.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {API_URL} from "@/config.js";

export default function FeederDtrDashboard() {
    /* ───────────────────────── 1 ▪ Local, *unapplied* inputs ───────────────────────── */
    const [startDate, setStartDate] = useState("2023-04-01 00:00");
    const [endDate, setEndDate] = useState("2023-04-02 00:00");
    const [feederName, setFeederName] = useState("");
    const [dtrId, setDtrId] = useState("");

    /* ───────────────────────── 2 ▪ Applied filters (drive fetch) ───────────────────── */
    const [applied, setApplied] = useState({
        startDate, endDate, feederName: "", dtrId: ""
    });

    /* track whether we already did the one-time auto-apply */
    const [initialApplied, setInitialApplied] = useState(false);

    /* master lists & data */
    const [feederList, setFeederList] = useState([]);
    const [dtrList, setDtrList] = useState([]);
    const [consumptionData, setConsumptionData] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ───────── 3 ▪ Load feeder & DTR lists once ───────── */
    useEffect(() => {
        axios.get(`${API_URL}feeder/`).then(r => setFeederList(r.data || []));
        axios.get(`${API_URL}dtr/`).then(r => setDtrList(r.data || []));
    }, []);

    /* 3-A  pick first feeder (local only) */
    useEffect(() => {
        if (!feederName && feederList.length) {
            setFeederName(feederList[0].feeder_name);
        }
    }, [feederList]);

    /* 3-B  pick first DTR for current feeder (local only) */
    const feederId =
        feederList.find(f => f.feeder_name === feederName)?.feeder_id || "";

    useEffect(() => {
        if (feederName && dtrList.length && !dtrId) {
            const first = dtrList.find(d => d.feeder_id === feederId);
            if (first) setDtrId(first.dtr_id);
        }
    }, [feederName, feederId, dtrList]);

    /* 3-C  one-time auto-apply when both local feeder & DTR are ready */
    useEffect(() => {
        if (!initialApplied && feederName && dtrId) {
            setApplied({startDate, endDate, feederName, dtrId});
            setInitialApplied(true);      // prevent future auto-applies
        }
    }, [feederName, dtrId, startDate, endDate, initialApplied]);

    /* ───────── 4 ▪ Fetch data whenever *applied* changes ───────── */
    useEffect(() => {
        if (!applied.feederName || !applied.dtrId) return;   // nothing to fetch yet
        setLoading(true);

        const params = new URLSearchParams({
            start_date: applied.startDate,
            end_date: applied.endDate,
            feeder_id: feederId,
            dtr_id: applied.dtrId
        });

        axios.get(`${API_URL}dtr/consumption?${params}`)
            .then(r => setConsumptionData(r.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [applied, feederId]);

    /* ───────── 5 ▪ Metrics, chart, table ───────── */
    const actualAll = consumptionData.reduce((s, r) => s + (r.Energy_consumption_kWh || 0), 0);
    const theoryAll = consumptionData.reduce((s, r) => s + (r.Theoretical_Consumption_kWh || 0), 0);
    const lossAll = theoryAll - actualAll;
    const lossAllPct = theoryAll ? (lossAll / theoryAll) * 100 : 0;

    const metricSet = {
        totalFeederEnergy: actualAll,
        totalTheoretical: theoryAll,
        lossKWh: lossAll,
        lossPercent: lossAllPct
    };

    const chartData = consumptionData.map(r => ({
        timestamp: dayjs(r.Timestamp).add(5.5, "hour").format("YYYY-MM-DDTHH:mm:ss"),
        Actual: r.Energy_consumption_kWh,
        Theoretical: r.Theoretical_Consumption_kWh
    }));

    const tableData = consumptionData.map(r => ({
        ...r,
        Loss_kWh: parseFloat(
            ((r.Theoretical_Consumption_kWh || 0) -
                (r.Energy_consumption_kWh || 0)).toFixed(3)
        )
    }));

    const tableColumns = [
        {header: "Timestamp", accessor: "Timestamp"},
        {header: "Feeder ID", accessor: "FEEDER_ID"},
        {header: "DTR ID", accessor: "DTR_ID"},
        {header: "Actual (kWh)", accessor: "Energy_consumption_kWh"},
        {header: "Theoretical (kWh)", accessor: "Theoretical_Consumption_kWh"},
        {header: "Loss (kWh)", accessor: "Loss_kWh"}
    ];

    const series = [
        {key: "Actual", label: "Actual", type: "area", color: "#1f77b4"},
        {key: "Theoretical", label: "Theoretical", type: "line", color: "#d62728"}
    ];

    /* ───────── 6 ▪ Button handlers ───────── */
    const handleApply = () => {
        if (!feederName || !dtrId) return;
        setApplied({startDate, endDate, feederName, dtrId});
    };

    const handleClear = () => {
        setStartDate("2023-04-01 00:00");
        setEndDate("2023-04-02 00:00");
        setApplied({startDate: "", endDate: "", feederName: "", dtrId: ""});
    };

    const handleDownload = () => {
        if (!tableData.length) {
            alert("No data to download. Click Apply first.");
            return;
        }
        const header = tableColumns.map(c => c.header).join(",");
        const rows = tableData.map(r =>
            tableColumns.map(c => r[c.accessor]).join(",")
        );
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), {
            href: url, download: `${applied.dtrId}_consumption.csv`
        });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    /* ───────── 7 ▪ Render ───────── */
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Feeder to DTR Loss Dashboard</h2>

            <FilterBarDTR
                startDate={startDate} endDate={endDate}
                feederName={feederName} dtrId={dtrId}
                feederList={feederList}
                dtrList={dtrList.filter(d => d.feeder_id === feederId)}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFeederChange={setFeederName}
                onDtrChange={setDtrId}
                onApply={handleApply}
                onClear={handleClear}
                onDownload={handleDownload}
            />

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600
                          border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : applied.dtrId ? (
                <>
                    <InfoCardsPanelDTR mode="single" metricsSingle={metricSet}/>

                    <CommonComposedChart
                        data={chartData}
                        title={`${applied.dtrId} – Actual vs Theoretical`}
                        series={series}
                        height={300}
                    />

                    <div className="mt-8">
                        <CommonTable
                            title={`${applied.dtrId} Consumption`}
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