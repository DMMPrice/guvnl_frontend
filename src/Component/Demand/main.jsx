import React, { useState } from "react";
import CommonTable from "../Utils/CommonTable";
import CustomDatePicker from "../Utils/CustomDatePicker";
import CustomSelect from "../Utils/CustomSelect";
import SummaryInfoCards from "./SummaryInfoCards";
import { Loader2 } from "lucide-react";
import { format, addDays, subDays, addMinutes, subMinutes } from "date-fns";

export default function SingleDemand() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = String(Math.floor(i / 4)).padStart(2, "0");
    const minutes = String((i % 4) * 15).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const mustRunColumns = [
    { header: "Plant Code", key: "plant_code" },
    {
      header: "Rated Capacity (MW)",
      key: "Rated_Capacity",
      className: "text-right",
      render: (row) => row.Rated_Capacity?.toFixed(2),
    },
    {
      header: "Generated Energy (KWh)",
      key: "generated_energy",
      className: "text-right",
      render: (row) => row.generated_energy?.toFixed(2),
    },
    {
      header: "Variable Cost (₹/kWh)",
      key: "Variable_Cost",
      className: "text-right",
      render: (row) => row.Variable_Cost?.toFixed(2),
    },
    {
      header: "Net Cost (₹)",
      key: "net_cost",
      className: "text-right",
      render: (row) =>
        row.net_cost?.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    },
  ];

  const remainingColumns = [
    { header: "Plant Code", key: "plant_code" },
    {
      header: "Rated Capacity (MW)",
      key: "rated_capacity",
      className: "text-right",
      render: (row) => row.rated_capacity?.toFixed(2),
    },
    {
      header: "Generation (KWh)",
      key: "generated_energy",
      className: "text-right",
      render: (row) => row.generated_energy?.toFixed(2),
    },
    {
      header: "PLF",
      key: "plf",
      className: "text-right",
      render: (row) => (row.plf * 100)?.toFixed(2) + "%",
    },
    {
      header: "Variable Cost (₹/kWh)",
      key: "Variable_Cost",
      className: "text-right",
      render: (row) => row.Variable_Cost?.toFixed(2),
    },
    {
      header: "Net Cost (₹)",
      key: "net_cost",
      className: "text-right",
      render: (row) =>
        row.net_cost?.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !startTime) {
      alert("Please select both date and time");
      return;
    }

    setLoading(true);
    try {
      // Increase the day by one
      const adjustedDate = addDays(startDate, 1);
      const dateTimeString = `${format(
        adjustedDate,
        "yyyy-MM-dd"
      )} ${startTime}:00`;

      // Manually adjust to IST by adding 5 hours and 30 minutes
      const dateTime = new Date(dateTimeString);
      const istDateTime = addMinutes(dateTime, 330); // 330 minutes = 5 hours 30 minutes
      const formattedZonedDate = format(istDateTime, "yyyy-MM-dd HH:mm:ssXXX");

      // Subtract 5 hours and 30 minutes and one day
      const finalDateTime = subMinutes(subDays(istDateTime, 1), 330);
      const finalFormattedDate = format(
        finalDateTime,
        "yyyy-MM-dd HH:mm:ssXXX"
      );

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }plant/?start_date=${finalFormattedDate}&price_cap=10`
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

  return (
    <div className="p-4 m-4">
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex flex-col mb-4 md:mb-0">
            <label className="mb-2 font-semibold">Start Date:</label>
            <CustomDatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholder="Select start date"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Start Time:</label>
            <CustomSelect
              options={timeOptions}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Select start time"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>

      {data.Must_Run && (
        <>
          <SummaryInfoCards data={data} />
          <CommonTable
            title="Must Run Plants"
            columns={mustRunColumns}
            data={data.Must_Run}
          />
          <CommonTable
            title="Remaining Plants"
            columns={remainingColumns}
            data={data.Remaining_Plants}
          />
        </>
      )}
    </div>
  );
}
