// src/Component/Dashboards/SubstationFeederDashboard/Page.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import dayjs from "dayjs";
import FilterBar from "./FilterBar.jsx";               // relative import
import DashboardCards from "./InfoCardsPanel.jsx";     // relative import
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {API_URL} from "@/config.js";

export default function FeederSubstationDashboard() {
    // 1) Local filter inputs
    const [startDate, setStartDate] = useState("2023-04-01 00:00");
    const [endDate, setEndDate] = useState("2023-04-02 00:00");
    const [feederName, setFeederName] = useState("All");
    const [substationId, setSubstationId] = useState("SUBSTATION_1");

    // 2) Applied filters
    const [applied, setApplied] = useState({
        startDate, endDate, feederName, substationId
    });

    const [feederList, setFeederList] = useState([]);
    const [feederData, setFeederData] = useState([]);
    const [substationData, setSubstationData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 3) Load feeder dropdown options
    useEffect(() => {
        axios.get(`${API_URL}feeder/`)
            .then(res => setFeederList(res.data || []))
            .catch(console.error);
    }, []);

    // 4) Derive feeder_id
    const selectedFeederId = applied.feederName === "All"
        ? ""
        : feederList.find(f => f.feeder_name === applied.feederName)?.feeder_id || "";

    // 5) Fetch data on applied change
    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(
                `${API_URL}feeder/consumption?start_date=${encodeURIComponent(applied.startDate)
                }&end_date=${encodeURIComponent(applied.endDate)
                }${selectedFeederId ? `&feeder_id=${selectedFeederId}` : ""}`
            ),
            axios.get(
                `${API_URL}substation/consumption?start_date=${encodeURIComponent(applied.startDate)
                }&end_date=${encodeURIComponent(applied.endDate)
                }&substation_id=${applied.substationId}`
            ),
        ])
            .then(([fRes, sRes]) => {
                setFeederData(fRes.data || []);
                setSubstationData(sRes.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [applied, selectedFeederId]);

    // 6) Single‐feeder aggregates
    const totalFeederEnergy = feederData.reduce((sum, r) => sum + (r.Energy_consumption_kWh || 0), 0);
    const totalTheoretical = feederData.reduce((sum, r) => sum + (r.Theoretical_Consumption_kWh || 0), 0);
    const lossKWh = totalTheoretical - totalFeederEnergy;
    const lossPercent = totalTheoretical ? (lossKWh / totalTheoretical) * 100 : 0;

    // 7) Pivot+merge for “All” feeders
    let mergedData = [];
    if (applied.feederName === "All") {
        const map = {};
        substationData.forEach(s => {
            map[s.Timestamp] = {
                Timestamp: s.Timestamp,
                Substation_Supply_kWh: s.Substation_Supply_kWh
            };
        });
        feederData.forEach(r => {
            const key = r.Timestamp;
            const feederKey = `${r.FEEDER_ID}_Actual_kWh`;
            map[key] = map[key] || {Timestamp: key};
            map[key][feederKey] = r.Energy_consumption_kWh;
        });
        mergedData = Object.values(map)
            .sort((a, b) => a.Timestamp.localeCompare(b.Timestamp));
    }

    // 8) Chart data (+5.5h)
    const chartData = applied.feederName === "All"
        ? mergedData.map(r => {
            const ts = dayjs(r.Timestamp).add(5.5, "hour");
            const obj = {timestamp: ts.format("YYYY-MM-DDTHH:mm:ss")};
            feederList.forEach(f => {
                obj[`${f.feeder_id}_Actual_kWh`] = r[`${f.feeder_id}_Actual_kWh`];
            });
            obj.Substation_Supply_kWh = r.Substation_Supply_kWh;
            return obj;
        })
        : feederData.map(r => {
            const ts = dayjs(r.Timestamp).add(5.5, "hour");
            return {
                timestamp: ts.format("YYYY-MM-DDTHH:mm:ss"),
                Actual: r.Energy_consumption_kWh,
                Theoretical: r.Theoretical_Consumption_kWh
            };
        });

    // 9) Table data & columns
    const tableData = applied.feederName === "All"
        ? mergedData
        : feederData.map(r => ({
            ...r,
            Loss_kWh: parseFloat(
                ((r.Theoretical_Consumption_kWh || 0) - (r.Energy_consumption_kWh || 0))
                    .toFixed(3)
            )
        }));

    const tableColumns = applied.feederName === "All"
        ? [
            {header: "Timestamp", accessor: "Timestamp"},
            ...feederList.map(f => ({
                header: `${f.feeder_id} Actual (kWh)`,
                accessor: `${f.feeder_id}_Actual_kWh`,
            })),
            {header: "Substation Supply (kWh)", accessor: "Substation_Supply_kWh"}
        ]
        : [
            {header: "Timestamp", accessor: "Timestamp"},
            {header: "Feeder ID", accessor: "FEEDER_ID"},
            {header: "Substation ID", accessor: "SUBSTATION_ID"},
            {header: "Actual (kWh)", accessor: "Energy_consumption_kWh"},
            {header: "Theoretical (kWh)", accessor: "Theoretical_Consumption_kWh"},
            {header: "Loss (kWh)", accessor: "Loss_kWh"},
        ];

    // 10) Series palette
    const COLOR_MAP = {
        FEEDER1_Actual_kWh: "#1f77b4",
        FEEDER2_Actual_kWh: "#ff7f0e",
        FEEDER3_Actual_kWh: "#2ca02c",
        Substation_Supply_kWh: "#d62728",
    };

    const series = applied.feederName === "All"
        ? [
            ...feederList.map(f => ({
                key: `${f.feeder_id}_Actual_kWh`,
                label: `${f.feeder_id} Actual`,
                type: "area",
                color: COLOR_MAP[`${f.feeder_id}_Actual_kWh`]
            })),
            {
                key: "Substation_Supply_kWh",
                label: "Substation Supply",
                type: "line",
                color: COLOR_MAP.Substation_Supply_kWh
            }
        ]
        : [
            {key: "Actual", label: "Actual Feeder", type: "line", color: "#1f77b4"},
            {key: "Theoretical", label: "Theoretical Supp", type: "line", color: "#d62728"},
        ];

    // 11) Handlers
    const handleApply = () =>
        setApplied({startDate, endDate, feederName, substationId});
    const handleClear = () => {
        const defaults = {
            startDate: "2023-04-01 00:00",
            endDate: "2023-04-02 00:00",
            feederName: "All",
            substationId: "SUBSTATION_1",
        };
        setStartDate(defaults.startDate);
        setEndDate(defaults.endDate);
        setFeederName(defaults.feederName);
        setSubstationId(defaults.substationId);
        setApplied(defaults);
    };
    const handleDownload = () => { /* your CSV logic */
    };

    // 12) bundle the two metrics objects
    const metricsAll = {
        actualAll: feederData.reduce((s, r) => s + (r.Energy_consumption_kWh || 0), 0),
        theoryAll: substationData.reduce((s, sr) => s + (sr.Substation_Supply_kWh || 0), 0),
        lossAll: null,           // you can recompute here or reference above
        lossAllPct: null
    };
    // recompute lossAll/lossAllPct inline or pull from above if you saved
    metricsAll.lossAll = metricsAll.theoryAll - metricsAll.actualAll;
    metricsAll.lossAllPct = metricsAll.theoryAll
        ? (metricsAll.lossAll / metricsAll.theoryAll) * 100
        : 0;

    const metricsSingle = {
        totalFeederEnergy,
        totalTheoretical,
        lossKWh,
        lossPercent
    };

    // ─── Render ─────────────────────────
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">
                Substation to Feeder Loss Dashboard
            </h2>

            <FilterBar
                startDate={startDate}
                endDate={endDate}
                feederName={feederName}
                substationId={substationId}
                feederList={feederList}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFeederChange={setFeederName}
                onSubstationChange={setSubstationId}
                onApply={handleApply}
                onClear={handleClear}
                onDownload={handleDownload}
            />

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600
                          border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : (
                <>
                    <DashboardCards
                        mode={applied.feederName === "All" ? "all" : "single"}
                        metricsAll={metricsAll}
                        metricsSingle={metricsSingle}
                    />

                    <CommonComposedChart
                        data={chartData}
                        title={`${applied.feederName === "All" ? "All Feeders" : applied.feederName}
                   vs Substation Supply Over Time`}
                        series={series}
                        height={300}
                    />

                    <div className="mt-8">
                        <CommonTable
                            title={applied.feederName === "All"
                                ? "All Feeders / Substation Supply"
                                : "Feeder Consumption Details"}
                            columns={tableColumns}
                            data={tableData}
                        />
                    </div>
                </>
            )}
        </div>
    );
}