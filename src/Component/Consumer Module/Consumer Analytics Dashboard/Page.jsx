import React, {useEffect, useMemo, useState} from "react";
import axios from "axios";
import ConsumerForm from "./ConsumerForm.jsx";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import {API_URL} from "@/config.js";
import {TimerReset, TrendingUp, AlertTriangle, Activity} from "lucide-react";
import {MdGroups} from "react-icons/md";

/** Helper to extract YYYY-MM-DD for the API */
const dateOnly = (s) => (s || "").split(" ")[0] || s || "";

export default function ConsumerAnalytics() {
    // Consumer selector
    const [consumerOptions, setConsumerOptions] = useState([]); // [{ value: id, label: name }]
    const [selectedConsumerId, setSelectedConsumerId] = useState(""); // consumer_id
    const selectedConsumerLabel =
        consumerOptions.find(o => o.value === selectedConsumerId)?.label || "";

    // Filters
    const [startDate, setStartDate] = useState("2021-04-01 00:00:00");
    const [endDate, setEndDate] = useState("2021-04-02 00:00:00");
    const [overuseMargin, setOveruseMargin] = useState(0.15);

    // Data
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [count, setCount] = useState(0);
    const [filtersEcho, setFiltersEcho] = useState(null);

    // ====== 1) GET {{API_URL}}consumer ======
    useEffect(() => {
        const fetchConsumers = async () => {
            try {
                const res = await axios.get(`${API_URL}consumer`);
                const arr = Array.isArray(res.data) ? res.data : [];
                const opts = arr.map(c => ({
                    value: c.consumer_id,
                    label: c.name || c.consumer_id,
                }));
                setConsumerOptions(opts);
                if (!selectedConsumerId && opts.length) setSelectedConsumerId(opts[0].value); // default to first
            } catch (e) {
                console.error("Failed to load consumers:", e);
                setConsumerOptions([]);
            }
        };
        fetchConsumers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ====== 2) GET {{API_URL}}power-theft?... ======
    const fetchPowerTheft = async () => {
        if (!selectedConsumerId || !startDate || !endDate) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                customer_id: selectedConsumerId,
                start: dateOnly(startDate),
                end: dateOnly(endDate),
                overuse_margin: String(overuseMargin),
                limit: "500",
            });
            const url = `${API_URL}power-theft?${params.toString()}`;
            const res = await axios.get(url);

            const data = res.data || {};
            const recs = Array.isArray(data.records) ? data.records : [];
            // stable keys for table rows
            setRecords(recs.map((r, i) => ({id: r.Period_15min || String(i), ...r})));
            setCount(Number(data.count || recs.length || 0));
            setFiltersEcho(data.filters || null);
        } catch (e) {
            console.error("Failed to load power theft:", e);
            setRecords([]);
            setCount(0);
            setFiltersEcho(null);
        } finally {
            setLoading(false);
        }
    };

    // Auto fetch once a consumer is ready
    useEffect(() => {
        if (selectedConsumerId) fetchPowerTheft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConsumerId]);

    // ===== KPIs from theft records =====
    const kpis = useMemo(() => {
        if (!records.length) return {intervals: 0, avgLoss: 0, maxLoss: 0, critical: 0};
        const lossVals = records
            .map((r) => (typeof r.Loss_Percent === "number" ? r.Loss_Percent : null))
            .filter((v) => v !== null);
        const avgLoss = lossVals.length ? lossVals.reduce((a, b) => a + b, 0) / lossVals.length : 0;
        const maxLoss = lossVals.length ? Math.max(...lossVals) : 0;
        const critical = records.filter((r) => (r.Priority || "").toLowerCase() === "critical").length;
        return {intervals: records.length, avgLoss, maxLoss, critical};
    }, [records]);

    // Chart-friendly series
    const lossSeries = useMemo(
        () => records.map((r) => ({timestamp: r.Period_15min, loss_pct: r.Loss_Percent})),
        [records]
    );

    const energySeries = useMemo(
        () => records.map((r) => ({
            timestamp: r.Period_15min,
            Actual_kWh: r.Actual_kWh,
            Theoretical_kWh: r.Theoretical_kWh,
        })),
        [records]
    );

    return (
        <div className="p-4 space-y-6">
            {/* Header strip */}
            <div
                className="rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-white p-4 border border-indigo-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-100">
                        <MdGroups className="w-5 h-5 text-indigo-700"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-indigo-900">Consumer Analytics</h2>
                        <p className="text-sm text-indigo-700/80">Visual overview of loss patterns, risk mix, and
                            critical windows</p>
                    </div>
                </div>
            </div>
            <ConsumerForm
                consumerOptions={consumerOptions}
                selectedConsumerId={selectedConsumerId}
                setSelectedConsumerId={setSelectedConsumerId}
                selectedConsumerLabel={selectedConsumerLabel}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                overuseMargin={overuseMargin}
                setOveruseMargin={setOveruseMargin}
                onApply={fetchPowerTheft}
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard
                    header="Intervals (API Count)"
                    value={count}
                    icon={<TimerReset className="w-5 h-5"/>}
                    bgColor="bg-blue-50"
                    textColor="text-blue-900"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-700"
                    className="ring-1 ring-blue-200/60 hover:ring-blue-300"
                />

                <InfoCard
                    header="Avg Loss %"
                    value={`${kpis.avgLoss.toFixed(2)}%`}
                    icon={<TrendingUp className="w-5 h-5"/>}
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-900"
                    iconBgColor="bg-emerald-100"
                    iconColor="text-emerald-700"
                    className="ring-1 ring-emerald-200/60 hover:ring-emerald-300"
                />

                <InfoCard
                    header="Max Loss %"
                    value={`${kpis.maxLoss.toFixed(2)}%`}
                    icon={<AlertTriangle className="w-5 h-5"/>}
                    bgColor="bg-rose-50"
                    textColor="text-rose-900"
                    iconBgColor="bg-rose-100"
                    iconColor="text-rose-700"
                    className="ring-1 ring-rose-200/60 hover:ring-rose-300"
                />

                <InfoCard
                    header="Critical Intervals"
                    value={kpis.critical}
                    icon={<Activity className="w-5 h-5"/>}
                    bgColor="bg-amber-50"
                    textColor="text-amber-900"
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-700"
                    className="ring-1 ring-amber-200/60 hover:ring-amber-300"
                />
            </div>

            {/* Filters echo (optional) */}
            {filtersEcho && (
                <div className="text-sm text-gray-600">
                    Using: <b>{filtersEcho.customer_id}</b>, {filtersEcho.start?.slice(0, 10)} → {filtersEcho.end?.slice(0, 10)},
                    margin {filtersEcho.overuse_margin}
                </div>
            )}

            {/* Charts (guarded) */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-3">Loss % Over Time</h2>
                <CommonComposedChart
                    data={Array.isArray(lossSeries) ? lossSeries : []}
                    title=""
                    series={[{key: "loss_pct", label: "Loss %", type: "line", color: "#5cec08"}]}
                    height={280}
                />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-3">Actual vs Theoretical (kWh)</h2>
                <CommonComposedChart
                    data={Array.isArray(energySeries) ? energySeries : []}
                    title=""
                    series={[
                        {key: "Actual_kWh", label: "Actual", type: "bar", color: "#08b8ec"},
                        {key: "Theoretical_kWh", label: "Theoretical", type: "bar", color: "#ad0440"},
                    ]}
                    height={320}
                />
            </div>

            {/* Table (stable keys) */}
            <AdvancedTable
                columns={[
                    {header: "Timestamp", accessor: "Period_15min"},
                    {header: "Actual (kWh)", accessor: "Actual_kWh"},
                    {header: "Theoretical (kWh)", accessor: "Theoretical_kWh"},
                    {header: "Energy Loss (kWh)", accessor: "Energy_Loss_kWh"},
                    {header: "Loss %", accessor: "Loss_Percent"},
                    {header: "Primary Event", accessor: "Primary_Event"},
                    {header: "Risk Level", accessor: "Risk_Level"},
                    {header: "Priority", accessor: "Priority"},
                    {header: "Recommended Action", accessor: "Recommended_Action"},
                ]}
                data={records}
                rowKey="id"      // if AdvancedTable reads this; otherwise it should use "id" as key internally
                loading={loading}
            />
        </div>
    );
}
