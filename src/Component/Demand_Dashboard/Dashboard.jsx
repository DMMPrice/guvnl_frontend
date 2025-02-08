import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import { API_URL } from "../../config";
import DemandLineChart from "./DemandLineChart";
import { Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";
import BasicDateTimePicker from "../Utils/DateTimePicker"; // ✅ Updated to use DateTimePicker

export default function Dashboard() {
  const [demandData, setDemandData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchDemandData = async () => {
      try {
        const response = await fetch(`${API_URL}demand/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDemandData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_URL}demand/dashboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDashboardStats({
          totalDemand: `${(data.demand_actual / 1e6).toFixed(2)} MW`,
          totalSupply: `${(data.demand_predicted / 1e6).toFixed(2)} MW`,
          averagePrice: `₹${data.avg_price.toFixed(2)}/unit`,
          totalPlants: data.plant_count.toString(),
        });
      } catch (error) {
        setError(error.message);
      }
    };

    fetchDemandData();
    fetchDashboardStats();
  }, []);

  const getDailyAggregates = () => {
    if (!demandData || !Array.isArray(demandData)) return [];

    const dailyMap = {};
    for (const entry of demandData) {
      const dateObj = new Date(entry.TimeStamp);
      const dayKey = dateObj.toISOString().slice(0, 10);

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { actualSum: 0, predSum: 0, count: 0 };
      }
      dailyMap[dayKey].actualSum += Number(entry["Demand(Actual)"] || 0);
      dailyMap[dayKey].predSum += Number(entry["Demand(Pred)"] || 0);
      dailyMap[dayKey].count += 1;
    }

    return Object.entries(dailyMap).map(([day, sums]) => ({
      day,
      actual: sums.count > 0 ? (sums.actualSum / sums.count).toFixed(2) : null,
      pred: sums.count > 0 ? (sums.predSum / sums.count).toFixed(2) : null,
    }));
  };

  const dailyData = getDailyAggregates();

  const filteredData = dailyData.filter((entry) => {
    const entryDate = new Date(entry.day);
    if (startDate && entryDate < new Date(startDate)) return false;
    if (endDate && entryDate > new Date(endDate)) return false;
    return true;
  });

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const chartConfig = {
    actual: { label: "Actual Demand", color: "rgba(14, 165, 233, 1)" },
    pred: { label: "Predicted Demand", color: "rgb(248, 8, 76)" },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  return (
    <div className="mx-8 p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
        Dashboard Overview
      </h1>

      {/* ✅ Start Date, End Date, and Buttons */}
      <div className="flex flex-wrap gap-4 items-center mb-6 px-4 py-3 bg-white shadow-md rounded-lg">
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">Start Date</label>
          <BasicDateTimePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">End Date</label>
          <BasicDateTimePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
          />
        </div>

        {/* ✅ Buttons Section */}
        <div className="flex gap-4 mt-5">
          <button
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-200 shadow">
            Clear
          </button>

          <CSVLink
            data={
              demandData
                ? demandData.map((entry) => ({
                    timestamp: entry.TimeStamp,
                    demand_actual: entry["Demand(Actual)"],
                    demand_predicted: entry["Demand(Pred)"],
                  }))
                : []
            }
            filename={`raw_demand_data_${new Date()
              .toISOString()
              .slice(0, 10)}.csv`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200 text-center shadow">
            Download Raw Data CSV
          </CSVLink>
        </div>
      </div>

      {/* ✅ Updated Cards with Start & End Date */}
      {dashboardStats && (
        <DashboardCards
          stats={dashboardStats}
          startDate={
            startDate ? new Date(startDate).toISOString().slice(0, 10) : null
          }
          endDate={
            endDate ? new Date(endDate).toISOString().slice(0, 10) : null
          }
        />
      )}

      {/* ✅ Updated Line Chart with Filtered Data */}
      {filteredData.length > 0 && (
        <DemandLineChart dailyData={filteredData} chartConfig={chartConfig} />
      )}
    </div>
  );
}
