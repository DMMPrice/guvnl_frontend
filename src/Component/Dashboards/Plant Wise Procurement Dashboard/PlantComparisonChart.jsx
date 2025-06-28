// src/Component/Dashboards/Plant Wise Procurement Dashboard/PlantComparisonChart.jsx
import React, {useState, useMemo, useEffect} from "react";
import CommonComposedChart from "@/Component/Utils/CommonComposedChart.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";

export default function PlantComparisonChart({procurementData}) {
    const categories = [
        {key: "must_run", label: "Must Run"},
        {key: "remaining_plants", label: "Other Plants"},
    ];
    const [category, setCategory] = useState("must_run");

    // Map plant_name → static max_power
    const capacityMap = useMemo(() => {
        const map = {};
        procurementData.forEach((entry) => {
            categories.forEach(({key}) =>
                (entry[key] || []).forEach((p) => {
                    if (p.plant_name && p.max_power != null && map[p.plant_name] == null) {
                        map[p.plant_name] = p.max_power;
                    }
                })
            );
        });
        return map;
    }, [procurementData]);

    // Map plant_name → variable cost
    const costMap = useMemo(() => {
        const map = {};
        procurementData.forEach((entry) => {
            categories.forEach(({key}) =>
                (entry[key] || []).forEach((p) => {
                    const cost =
                        p.Variable_Cost ?? p.variable_cost ?? 0;
                    if (p.plant_name && map[p.plant_name] == null) {
                        map[p.plant_name] = cost;
                    }
                })
            );
        });
        return map;
    }, [procurementData]);

    // Names in selected category, sorted by cost
    const plantNames = useMemo(() => {
        const names = new Set();
        procurementData.forEach((entry) => {
            (entry[category] || []).forEach((p) => {
                if (p.plant_name) names.add(p.plant_name);
            });
        });
        return Array.from(names).sort((a, b) => (costMap[a] || 0) - (costMap[b] || 0));
    }, [procurementData, category, costMap]);

    const [selectedName, setSelectedName] = useState("");
    useEffect(() => {
        if (plantNames.length && !plantNames.includes(selectedName)) {
            setSelectedName(plantNames[0]);
        }
    }, [plantNames, selectedName]);

    // Chart data
    const chartData = useMemo(
        () =>
            procurementData.map((entry) => {
                const list = entry[category] || [];
                const plant = list.find((p) => p.plant_name === selectedName) || {};
                return {
                    timestamp: entry.timestamp,
                    generated_energy: plant.generated_energy ?? 0,
                    max_power:
                        plant.max_power != null
                            ? plant.max_power
                            : capacityMap[selectedName] ?? 0,
                };
            }),
        [procurementData, category, selectedName, capacityMap]
    );

    // Table data: timestamp + selected plant fields
    const tableData = useMemo(
        () =>
            procurementData.map((entry) => {
                const list = entry[category] || [];
                const plant = list.find((p) => p.plant_name === selectedName) || {};
                return {
                    timestamp: entry.timestamp,
                    plant_name: plant.plant_name,
                    plant_code: plant.plant_code,
                    generated_energy: plant.generated_energy,
                    max_power: plant.max_power,
                    net_cost: plant.net_cost,
                    // include any other fields you need
                };
            }),
        [procurementData, category, selectedName]
    );

    // Columns ordered: Timestamp, Plant Name, Plant Code, then others
    const columns = useMemo(() => [
        {header: "Timestamp", accessor: "timestamp", filterType: "text"},
        {header: "Plant Name", accessor: "plant_name", filterType: "text"},
        {header: "Plant Code", accessor: "plant_code", filterType: "text"},
        {header: "Generated Energy (kWh)", accessor: "generated_energy", filterType: "text"},
        {header: "Max Power (kW)", accessor: "max_power", filterType: "text"},
        {header: "Net Cost (Rs)", accessor: "net_cost", filterType: "text"},
    ], []);

    return (
        <div className="mt-8 space-y-6">
            {/* Dropdowns side by side */}
            <div className="flex flex-wrap items-center gap-8 mb-4">
                <div className="flex items-center gap-2">
                    <label className="font-medium">Plant Type:</label>
                    <CustomSelect
                        options={categories.map((c) => c.label)}
                        value={categories.find((c) => c.key === category)?.label}
                        placeholder="Select Type"
                        onChange={(lbl) => {
                            const found = categories.find((c) => c.label === lbl);
                            if (found) {
                                setCategory(found.key);
                                setSelectedName("");
                            }
                        }}
                        className="w-48"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-medium">Plant Name:</label>
                    <CustomSelect
                        options={plantNames}
                        value={selectedName}
                        placeholder="Select Plant"
                        onChange={setSelectedName}
                        className="w-64"
                    />
                </div>
            </div>

            {/* Chart */}
            <CommonComposedChart
                data={chartData}
                title={`${categories.find((c) => c.key === category)?.label}: ${selectedName}`}
                series={[
                    {
                        key: "generated_energy",
                        label: "Generated Energy (kWh)",
                        type: "area",
                        color: "#82ca9d",
                    },
                    {
                        key: "max_power",
                        label: "Max Power (kW)",
                        type: "line",
                        color: "#8884d8",
                    },
                ]}
                height={300}
            />

            {/* Table */}
            <AdvancedTable
                title={`Details for ${selectedName}`}
                caption={`Timestamped data for ${selectedName}`}
                columns={columns}
                data={tableData}
            />
        </div>
    );
}