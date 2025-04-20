import React, {useState} from "react";
import CommonTable from "../Utils/CommonTable";
import CustomDatePicker from "../Utils/CustomDatePicker";
import CustomSelect from "../Utils/CustomSelect";
import SummaryInfoCards from "./SummaryInfoCards";
import PieChartCard from "../Utils/PieChartCard"; // <-- Import your PieChartCard
import {Loader2} from "lucide-react";
import {format, addDays, subDays, addMinutes, subMinutes} from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {API_URL} from "../../config";

export default function SingleDemand() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [showModal, setShowModal] = useState(false);

    // **Must Run Plants Columns**
    const mustRunColumns = [
        {header: "Plant Code", accessor: "plant_code"},
        {
            header: "Variable Cost (₹/MWh)",
            accessor: "Variable_Cost",
            render: (row) => row.Variable_Cost.toFixed(2),
        },
        {
            header: "Generated Energy (MWh)",
            accessor: "generated_energy",
            render: (row) => row.generated_energy.toFixed(3),
        },
        {
            header: "Net Cost (₹)",
            accessor: "net_cost",
            render: (row) => row.net_cost.toFixed(2),
        },
    ];

    const remainingColumns = [
        {header: "Plant Code", accessor: "plant_code"},
        {header: "PLF", accessor: "plf", render: (row) => row.plf.toFixed(2)},
        {header: "PAF", accessor: "paf", render: (row) => row.paf.toFixed(2)},
        {
            header: "Variable Cost (₹/KWh)",
            accessor: "Variable_Cost",
            render: (row) => row.Variable_Cost.toFixed(2),
        },
        {
            header: "Generated Energy (KWh)",
            accessor: "generated_energy",
            render: (row) => row.generated_energy.toFixed(3),
        },
        {
            header: "Net Cost (₹)",
            accessor: "net_cost",
            render: (row) => row.net_cost.toFixed(2),
        },
    ];

    // Time options and event handlers
    const timeOptions = Array.from({length: 96}, (_, i) => {
        const hours = String(Math.floor(i / 4)).padStart(2, "0");
        const minutes = String((i % 4) * 15).padStart(2, "0");
        return `${hours}:${minutes}`;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !startTime) {
            setShowModal(true);
            return;
        }

        setLoading(true);
        try {
            const adjustedDate = addDays(startDate, 1);
            const dateTimeString = `${format(
                adjustedDate,
                "yyyy-MM-dd"
            )} ${startTime}:00`;
            const dateTime = new Date(dateTimeString);
            const istDateTime = addMinutes(dateTime, 330);
            const finalFormattedDate = format(
                subMinutes(subDays(istDateTime, 1), 330),
                "yyyy-MM-dd HH:mm:ssXXX"
            );

            const response = await fetch(
                `${API_URL}procurement/?start_date=${finalFormattedDate}&price_cap=10`
            );
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setStartDate(null);
        setStartTime("");
    };

    // --- Prepare data for ALL plants pie charts ---
    let allPlantsEnergyData = [];
    let allPlantsCostData = [];

    if (data.Must_Run && data.Remaining_Plants) {
        // Combine must-run and remaining into one array
        const allPlants = [...data.Must_Run, ...data.Remaining_Plants];

        // Map each plant to { name, value } format for energy with 3 decimal places
        allPlantsEnergyData = allPlants.map((plant) => ({
            name: plant.plant_code || "Unknown",
            value: parseFloat((plant.generated_energy || 0).toFixed(3)), // Energy formatted to 3 decimal places
        }));

        // Map each plant to { name, value } format for cost with 2 decimal places
        allPlantsCostData = allPlants.map((plant) => ({
            name: plant.plant_code || "Unknown",
            value: parseFloat((plant.net_cost || 0).toFixed(2)), // Cost formatted to 2 decimal places
        }));
    }

    return (
        <div className="p-4 m-4">
            {/* FORM */}
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
                <div className="flex flex-col md:flex-row md:space-x-4 items-center">
                    {/* Start Date Picker */}
                    <div className="flex flex-col w-full md:w-1/3">
                        <label className="mb-2 font-semibold">Start Date:</label>
                        <CustomDatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            placeholder="Select start date"
                            className="h-12"
                        />
                    </div>

                    {/* Start Time Dropdown */}
                    <div className="flex flex-col w-full md:w-1/3">
                        <label className="mb-2 font-semibold">Start Time:</label>
                        <CustomSelect
                            options={timeOptions}
                            value={startTime}
                            onChange={setStartTime}
                            placeholder="Select start time"
                        />
                    </div>

                    {/* Submit & Clear Buttons */}
                    <div className="flex w-full md:w-1/3 justify-center mt-4 md:mt-0 space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400">
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin"/>
                            ) : (
                                "Submit"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                            Clear
                        </button>
                    </div>
                </div>
            </form>

            {/* MODAL for incomplete form */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Incomplete Form</DialogTitle>
                    </DialogHeader>
                    <div className="text-gray-600">
                        Please select both a start date and a start time before submitting.
                    </div>
                    <DialogFooter className="flex justify-center">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Render data if present */}
            {data.Must_Run && data.Remaining_Plants && (
                <>
                    <SummaryInfoCards data={data}/>

                    {/* TWO PIE CHARTS FOR ALL PLANTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <PieChartCard
                            title="Total Generated Energy Distribution"
                            data={allPlantsEnergyData}
                            dataKey="value"
                            nameKey="name"
                        />
                        <PieChartCard
                            title="Total Generated Cost Distribution"
                            data={allPlantsCostData}
                            dataKey="value"
                            nameKey="name"
                        />
                    </div>

                    {/* Must Run Table */}
                    <CommonTable
                        title="Must Run Plants"
                        caption="This table displays the must-run plants and their performance metrics."
                        columns={mustRunColumns}
                        data={data.Must_Run || []}
                    />

                    {/* Remaining Plants Table */}
                    <CommonTable
                        title="Remaining Plants"
                        caption="This table displays the remaining plants and their performance metrics."
                        columns={remainingColumns}
                        data={data.Remaining_Plants || []}
                    />
                </>
            )}
        </div>
    );
}
