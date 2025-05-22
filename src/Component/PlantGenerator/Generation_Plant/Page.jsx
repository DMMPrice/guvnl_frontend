// src/Component/Dashboard/CodeDetails.jsx
import React, {useEffect, useState, useMemo} from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import CustomSelect from "@/Component/Utils/MultiCustomSelect.jsx";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import {API_URL} from "@/config.js";
import {GiNuclearPlant} from "react-icons/gi";

export default function CodeDetails() {
    const [options, setOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // ── NEW: date‐range state ───────────────────────
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // two selection states: pending (in dropdown), applied (after click)
    const [pendingCodes, setPendingCodes] = useState([]);
    const [appliedCodes, setAppliedCodes] = useState([]);

    // raw data state
    const [loadingData, setLoadingData] = useState(false);
    const [tableData, setTableData] = useState([]);

    // 1️⃣ load all plants once
    useEffect(() => {
        setLoadingOptions(true);
        fetch(`${API_URL}plant/all`)
            .then((r) => r.json())
            .then(setOptions)
            .catch(console.error)
            .finally(() => setLoadingOptions(false));
    }, []);

    // 2️⃣ whenever appliedCodes OR date‐range changes, refetch
    useEffect(() => {
        if (
            appliedCodes.length === 0 ||
            !startDate ||
            !endDate
        ) {
            setTableData([]);
            return;
        }

        setLoadingData(true);

        Promise.all(
            appliedCodes.map((code) =>
                fetch(
                    `${API_URL}plant/${code}` +
                    `?start_date=${encodeURIComponent(startDate)}` +
                    `&end_date=${encodeURIComponent(endDate)}`
                )
                    .then((r) => r.json())
                    .then((rows) =>
                        rows.map((row) => ({
                            TimeStamp: row.TimeStamp,
                            Pred: row.Pred ?? 0,
                            Code: code,
                        }))
                    )
            )
        )
            .then((chunks) => setTableData(chunks.flat()))
            .catch(console.error)
            .finally(() => setLoadingData(false));
    }, [appliedCodes, startDate, endDate]);

    // only "Must run" appear in dropdown
    const mustRunOptions = options
        .filter((p) => p.Type === "Must run")
        .map((p) => ({label: `${p.Code} — ${p.name}`, value: p.Code}));
    const COLORS = [
        "#8884d8", // purple
        "#82ca9d", // green
        "#ff7300", // orange
        "#413ea0", // dark purple
        "#d0ed57", // lime
        "#a4de6c", // light green
        "#ffc658", // yellow
        "#00C49F", // teal
        "#FF6384", // pink
        "#36A2EB", // sky blue
    ];
    // series config for the chart
    const series = appliedCodes.map((code, i) => ({
        key: code,
        label: code,
        type: "line",
        color: COLORS[i % COLORS.length],
    }));

    // 3️⃣ pivot your tableData into one object per timestamp
    const combinedData = useMemo(() => {
        const byTs = {};
        tableData.forEach((r) => {
            if (!byTs[r.TimeStamp]) byTs[r.TimeStamp] = {timestamp: r.TimeStamp};
            byTs[r.TimeStamp][r.Code] = r.Pred;
        });
        return Object.values(byTs).sort((a, b) =>
            a.timestamp.localeCompare(b.timestamp)
        );
    }, [tableData]);

    const handleApply = () => {
        // only apply if we have codes AND both dates
        if (pendingCodes.length && startDate && endDate) {
            setAppliedCodes(pendingCodes);
        }
    };
    const handleClear = () => {
        setPendingCodes([]);
        setAppliedCodes([]);
        setTableData([]);
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <div className="max-w-7xl mx-auto mt-6 px-2">
            <h1 className="text-2xl font-bold mb-4">
                Generation Plant Details (Must-Run Only)
            </h1>

            {loadingOptions ? (
                <div className="flex items-center mb-6">
                    <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"/>
                    <p className="ml-4">Loading plant list…</p>
                </div>
            ) : (
                <>
                    {/* ── date pickers + dropdown + buttons ───────────────────────────── */}
                    <div className="flex flex-wrap gap-2 items-end mb-6">
                        <BasicDateTimePicker
                            label="Start Date & Time"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <BasicDateTimePicker
                            label="End Date & Time"
                            value={endDate}
                            onChange={setEndDate}
                        />
                        <CustomSelect
                            options={mustRunOptions}
                            value={pendingCodes}
                            onChange={setPendingCodes}
                            placeholder="Select must-run plant codes"
                            multi
                            className="flex-1 min-w-[200px]"
                        />
                        <button
                            onClick={handleApply}
                            disabled={
                                pendingCodes.length === 0 ||
                                !startDate ||
                                !endDate
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Clear
                        </button>
                    </div>

                    {/* info cards */}
                    {appliedCodes.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                            {appliedCodes.map((code) => {
                                const p = options.find((o) => o.Code === code);
                                return (
                                    p && (
                                        <InfoCard
                                            key={code}
                                            header={p.Code}
                                            value={p.name}
                                            icon={<GiNuclearPlant className="text-blue-500"/>}
                                            bgColor="bg-blue-50"
                                        />
                                    )
                                );
                            })}
                        </div>
                    )}

                    {/* combined chart for 1+ plants */}
                    <div className="mb-6">
                        {appliedCodes.length > 0 && (
                            <CommonComposedChart
                                title={
                                    appliedCodes.length === 1
                                        ? `Predicted Generation: ${appliedCodes[0]}`
                                        : "Combined Predicted Generation"
                                }
                                data={combinedData}
                                series={series}
                                height={400}
                                maxWidthClass="max-w-5xl"
                                modalHeight="70vh"
                                showAxes
                                showLegend
                            />
                        )}
                    </div>

                    {/* loading overlay while fetching data */}
                    {loadingData && (
                        <div className="mt-4 flex items-center">
                            <div className="animate-spin h-6 w-6 border-t-2 border-gray-600 rounded-full"/>
                            <span className="ml-2">Loading data…</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}