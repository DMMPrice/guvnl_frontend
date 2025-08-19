import React, {useMemo} from "react";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import {PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer} from "recharts";
import {motion} from "framer-motion";
import {Activity, TrendingUp, AlertTriangle, TimerReset} from "lucide-react";
import InfoCard from "@/Component/Utils/InfoCard.jsx";

/* ---------- Small helpers ---------- */
const riskTone = (risk) => {
    switch ((risk || "").toLowerCase()) {
        case "critical":
        case "very high":
        case "high":
            return "bg-red-50 text-red-700 ring-red-200";
        case "medium":
            return "bg-amber-50 text-amber-700 ring-amber-200";
        case "low":
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        default:
            return "bg-slate-50 text-slate-700 ring-slate-200";
    }
};

const Badge = ({children, tone}) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}>
    {children}
  </span>
);

/* ---------- Main Panel ---------- */
export default function TheftPanel({loading, records, kpis}) {
    /* Charts (time ascending) */
    const timeSeries = useMemo(() => {
        const sorted = [...records].sort(
            (a, b) => new Date(a.Period_15min) - new Date(b.Period_15min)
        );
        return sorted.map((r) => ({
            timestamp: r.Period_15min,
            loss_pct: typeof r.Loss_Percent === "number" ? Number(r.Loss_Percent.toFixed(3)) : null,
            actual: typeof r.Actual_kWh === "number" ? Number(r.Actual_kWh.toFixed(6)) : 0,
            theoretical: typeof r.Theoretical_kWh === "number" ? Number(r.Theoretical_kWh.toFixed(6)) : 0,
        }));
    }, [records]);

    const energyBars = useMemo(
        () => timeSeries.map((d) => ({timestamp: d.timestamp, actual: d.actual, theoretical: d.theoretical})),
        [timeSeries]
    );

    /* Risk donut */
    const riskBreakdown = useMemo(() => {
        const counts = new Map();
        for (const r of records) counts.set(r.Risk_Level || "Unknown", (counts.get(r.Risk_Level || "Unknown") || 0) + 1);
        return Array.from(counts.entries()).map(([name, value]) => ({name, value}));
    }, [records]);

    const donutColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#F43F5E", "#14B8A6", "#A3E635"];

    /* Top 10 worst */
    const worstData = useMemo(() => {
        const scored = records
            .map((r) => ({
                ...r,
                _score:
                    typeof r.Severity_Score === "number"
                        ? r.Severity_Score
                        : typeof r.Loss_Percent === "number"
                            ? r.Loss_Percent
                            : 0,
            }))
            .sort((a, b) => b._score - a._score)
            .slice(0, 10)
            .map((r) => {
                const scoreLabel =
                    typeof r.Severity_Score === "number"
                        ? r.Severity_Score.toFixed(1)
                        : r.Loss_Percent != null
                            ? Number(r.Loss_Percent).toFixed(2)
                            : "-";
                return {
                    Timestamp: r.Period_15min,
                    Scenario: r.Scenario || r.Primary_Event || "-",
                    Priority: r.Priority || r.Risk_Level || "-",
                    "Loss %": r.Loss_Percent != null ? Number(r.Loss_Percent).toFixed(2) : "-",
                    "Severity Score": typeof r.Severity_Score === "number" ? scoreLabel : "-",
                    "Likely Appliance": r.Likely_Appliance || "-",
                    Action: r.Recommended_Action || "-",
                };
            });
        return scored;
    }, [records]);

    const worstColumns = useMemo(
        () => [
            {header: "Timestamp", accessor: "Timestamp", filterType: "text"},
            {header: "Scenario", accessor: "Scenario", filterType: "text"},
            {header: "Priority", accessor: "Priority", filterType: "text"},
            {header: "Loss %", accessor: "Loss %", filterType: "text"},
            {header: "Severity Score", accessor: "Severity Score", filterType: "text"},
            {header: "Likely Appliance", accessor: "Likely Appliance", filterType: "text"},
            {header: "Action", accessor: "Action", filterType: "text"},
        ],
        []
    );

    /* Full table columns (with Risk badge render) */
    const columns = useMemo(
        () => [
            {header: "Timestamp", accessor: "Period_15min", filterType: "text"},
            {header: "Actual (kWh)", accessor: "Actual_kWh", filterType: "text"},
            {header: "Theoretical (kWh)", accessor: "Theoretical_kWh", filterType: "text"},
            {header: "Energy Loss (kWh)", accessor: "Energy_Loss_kWh", filterType: "text"},
            {header: "Loss %", accessor: "Loss_Percent", filterType: "text"},
            {header: "Primary Event", accessor: "Primary_Event", filterType: "text"},
            {header: "Base Severity", accessor: "Base_Severity", filterType: "text"},
            {
                header: "Risk Level",
                accessor: "Risk_Level",
                filterType: "text",
                cell: (v) => <Badge tone={riskTone(v)}>{v || "-"}</Badge>,
            },
            // Optional enriched fields
            {header: "Likely Appliance", accessor: "Likely_Appliance", filterType: "text"},
            {header: "Overuse", accessor: "Overuse", filterType: "text"},
            {header: "Overuse Threshold (kWh)", accessor: "Overuse_Threshold_kWh", filterType: "text"},
            {header: "Overuse Ratio", accessor: "Overuse_Ratio", filterType: "text"},
            {header: "Scenario", accessor: "Scenario", filterType: "text"},
            {header: "Severity Score", accessor: "Severity_Score", filterType: "text"},
            {header: "Priority", accessor: "Priority", filterType: "text"},
            {header: "Action", accessor: "Recommended_Action", filterType: "text"},
            {header: "Rationale", accessor: "Rationale", filterType: "text"},
        ],
        []
    );

    /* Skeleton shimmer for loading */
    const Skeleton = () => (
        <div className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded bg-slate-100"/>
            <div className="h-40 w-full rounded-xl bg-slate-100"/>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard
                    header="Intervals"
                    value={kpis.intervals ?? 0}
                    icon={<TimerReset className="w-5 h-5 text-blue-600"/>}
                    bgColor="bg-blue-100"
                    textColor="text-blue-800"
                    iconBgColor="bg-blue-300"
                    iconColor="text-blue-900"
                    className="w-full"
                />
                <InfoCard
                    header="Avg Loss %"
                    value={`${(kpis.avgLossPct ?? kpis.avgLoss ?? 0).toFixed(2)}%`}
                    icon={<TrendingUp className="w-5 h-5 text-green-700"/>}
                    textColor="text-green-700"
                    iconBgColor="bg-white"
                    iconColor="text-green-900"
                    bgColor="bg-green-100"
                    className="w-full"
                />
                <InfoCard
                    header="Max Loss %"
                    value={`${(kpis.maxLossPct ?? kpis.maxLoss ?? 0).toFixed(2)}%`}
                    icon={<AlertTriangle className="w-5 h-5 text-red-700"/>}
                    bgColor="bg-red-50"
                    textColor="text-red-700"
                    iconBgColor="bg-red-100"
                    className="hover:-translate-y-1 hover:shadow-lg"
                />
                <InfoCard
                    header="Critical Intervals"
                    value={kpis.highRiskCount ?? kpis.critical ?? 0}
                    icon={<Activity className="w-5 h-5 text-orange-700"/>}
                    bgColor="bg-orange-50"
                    textColor="text-orange-700"
                    iconBgColor="bg-orange-100"
                    className="hover:-translate-y-1 hover:shadow-lg"
                />
            </div>

            {/* Loss % over time */}
            <motion.div whileHover={{y: -2}} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-2">Loss Percentage Over Time</h3>
                {loading ? (
                    <Skeleton/>
                ) : (
                    <CommonComposedChart
                        data={timeSeries}
                        title=""
                        series={[{key: "loss_pct", label: "Loss %", type: "line", color: "#08b8ec"}]}
                        height={280}
                    />
                )}
            </motion.div>

            {/* Actual vs Theoretical */}
            <motion.div whileHover={{y: -2}} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-2">Actual vs Theoretical Energy</h3>
                {loading ? (
                    <Skeleton/>
                ) : (
                    <CommonComposedChart
                        data={energyBars}
                        title=""
                        series={[
                            {key: "actual", label: "Actual (kWh)", type: "bar", color: "#10B981"},
                            {key: "theoretical", label: "Theoretical (kWh)", type: "bar", color: "#ad0440"},
                        ]}
                        height={320}
                    />
                )}
            </motion.div>

            {/* Risk Donut */}
            <motion.div whileHover={{y: -2}} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-3">Risk Breakdown</h3>
                {loading ? (
                    <Skeleton/>
                ) : (
                    <div style={{width: "100%", height: 280}}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={riskBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    isAnimationActive
                                >
                                    {riskBreakdown.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={donutColors[idx % donutColors.length]}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* Worst 10 */}
            <motion.div whileHover={{y: -2}}
                        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-2 md:p-4">
                <AdvancedTable
                    title="Top 10 Worst Intervals"
                    caption="Sorted by Severity Score (or Loss %) in descending order"
                    columns={worstColumns}
                    data={worstData}
                />
            </motion.div>

            {/* Full table */}
            <motion.div whileHover={{y: -2}}
                        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-2 md:p-4">
                <AdvancedTable
                    title="Power Theft Analysis — Intervals"
                    caption="15-minute aggregated intervals with loss classification and diagnosis"
                    columns={columns}
                    data={records}
                />
            </motion.div>
        </div>
    );
}
