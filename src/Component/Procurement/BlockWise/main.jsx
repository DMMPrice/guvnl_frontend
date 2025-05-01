import React, {useState} from "react";
import ProcurementForm from "./procurementForm.jsx";
import ShowData from "./ShowData.jsx";
import {format, addDays} from "date-fns";
import {API_URL} from "../../../config.js";
import * as XLSX from "xlsx";
import LineChartComponent from "@/Component/Utils/LineChartComponent.jsx";

export default function Procurement() {
    const [responseData, setResponseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState("");

    const timeOptions = Array.from({length: 96}, (_, i) => {
        const hours = String(Math.floor(i / 4)).padStart(2, "0");
        const minutes = String((i % 4) * 15).padStart(2, "0");
        return `${hours}:${minutes}`;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !startTime || !endDate || !endTime) {
            alert("Please select start and end date and time");
            return;
        }

        setLoading(true);
        try {
            const adjustedStartDate = addDays(startDate, 1);
            const startDateTimeString = `${format(
                adjustedStartDate,
                "yyyy-MM-dd"
            )} ${startTime}:00`;
            const adjustedEndDate = addDays(endDate, 1);
            const endDateTimeString = `${format(
                adjustedEndDate,
                "yyyy-MM-dd"
            )} ${endTime}:00`;

            const response = await fetch(
                `${API_URL}plant/demand-output?start_date=${startDateTimeString}&end_date=${endDateTimeString}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();

            const formattedData = result.map((entry) => {
                const totalMustRunGenerated = entry.Must_Run?.reduce(
                    (sum, plant) => sum + (plant.generated_energy || 0),
                    0
                );

                const totalRemainingGenerated = entry.Remaining_Plants?.reduce(
                    (sum, plant) => sum + (plant.generated_energy || 0),
                    0
                );

                const totalMustRunCost = entry.Must_Run?.reduce(
                    (sum, plant) => sum + (plant.net_cost || 0),
                    0
                );

                const totalRemainingCost = entry.Remaining_Plants?.reduce(
                    (sum, plant) => sum + (plant.net_cost || 0),
                    0
                );

                const totalIEXGenerated = entry.IEX_Data?.Qty_Pred || 0;

                const totalCost =
                    (entry.IEX_Cost || 0) + totalMustRunCost + totalRemainingCost;

                return {
                    "Time Stamp": entry.TimeStamp,
                    "Cost Per Block": entry.Cost_Per_Block,
                    "Demand Actual": entry.Demand_Actual,
                    "Demand Predicted": entry.Demand_Pred,
                    "IEX Cost": entry.IEX_Cost,
                    "Last Price": entry.Last_Price,
                    "Total Must Run Generated (kWh)": parseFloat(
                        totalMustRunGenerated.toFixed(2)
                    ),
                    "Total Remaining Generated (kWh)": parseFloat(
                        totalRemainingGenerated.toFixed(2)
                    ),
                    "Total IEX Data Generated (kWh)": parseFloat(
                        totalIEXGenerated.toFixed(2)
                    ),
                    "Total Must Run Generated Cost (Rs)": totalMustRunCost.toFixed(2),
                    "Total Remaining Generated Cost (Rs)": totalRemainingCost.toFixed(2),
                    "Total Cost (Rs)": totalCost.toFixed(2),
                    "IEX Data": entry.IEX_Data
                        ? JSON.stringify(
                            {
                                "Withdrawal Price (Rs)": entry.IEX_Data.Pred_Price.toFixed(2),
                                "Withdrawal Quantity (KWh)":
                                    entry.IEX_Data.Qty_Pred.toFixed(3),
                            },
                            null,
                            2
                        )
                        : "N/A",
                    "Must Run Data": JSON.stringify(
                        entry.Must_Run?.map((plant) => ({
                            "Plant Code": plant.plant_code,
                            "Plant Name": plant.plant_name,
                            "Generated Energy (KWh)": plant.generated_energy.toFixed(3),
                            "Net Cost (RS)": plant.net_cost.toFixed(2),
                        })),
                        null,
                        2
                    ),
                    "Remaining Plant": JSON.stringify(
                        entry.Remaining_Plants?.map((plant) => ({
                            "Plant Code": plant.plant_code,
                            "Plant Name": plant.plant_name,
                            "Generated Energy (KWh)": plant.generated_energy.toFixed(3),
                            "Net Cost (Rs)": plant.net_cost.toFixed(2),
                            PLF: plant.plf.toFixed(2),
                        })),
                        null,
                        2
                    ),
                };
            });
            setResponseData(formattedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!responseData.length) {
            alert("No data available to export!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(responseData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BlockWise Data");
        XLSX.writeFile(workbook, "Procurement_Data.xlsx");
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen pt-6">
            <div className="w-full max-w-4xl">
                <ProcurementForm
                    loading={loading}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    timeOptions={timeOptions}
                    handleSubmit={handleSubmit}
                />
            </div>
            <div className="w-full max-w-7xl mt-6">
                <button
                    onClick={exportToExcel}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Export to Excel
                </button>
                {responseData.length > 0 ? (
                    <div className="flex gap-1 mt-6 justify-center">
                        <div className="w-1/2">
                            <LineChartComponent
                                data={responseData}
                                xAxisKey="Time Stamp"
                                chartTitle="Generated Energy Line Chart"
                                lines={[
                                    {
                                        dataKey: "Total Must Run Generated (kWh)",
                                        color: "#82ca9d",
                                        label: "Must Run Generation (kWh)",
                                    },
                                    {
                                        dataKey: "Total Remaining Generated (kWh)",
                                        color: "#8884d8",
                                        label: "Remaining Plants Generation (kWh)",
                                    },
                                    {
                                        dataKey: "Total IEX Data Generated (kWh)",
                                        color: "#ff7300",
                                        label: "IEX Page Data Generation (kWh)",
                                    },
                                ]}
                            />
                        </div>
                        <div className="w-1/2">
                            <LineChartComponent
                                data={responseData}
                                xAxisKey="Time Stamp"
                                chartTitle="Generated Energy Cost Line Chart"
                                lines={[
                                    {
                                        dataKey: "Total Must Run Generated Cost (Rs)",
                                        color: "#82ca9d",
                                        label: "Must Run Cost (Rs)",
                                    },
                                    {
                                        dataKey: "Total Remaining Generated Cost (Rs)",
                                        color: "#8884d8",
                                        label: "Remaining Plants Cost (Rs)",
                                    },
                                    {
                                        dataKey: "Total Cost (Rs)",
                                        color: "#ff7300",
                                        label: "Total Cost (Rs)",
                                    },
                                ]}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        No data available for the selected date and time range.
                    </p>
                )}
                <ShowData data={responseData}/>
            </div>
        </div>
    );
}
