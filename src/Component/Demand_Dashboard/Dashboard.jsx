import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import { API_URL } from "../../config";
import DemandLineChart from "./DemandLineChart";
import { Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";
import BasicDateTimePicker from "../Utils/DateTimePicker"; // ✅ Updated to use DateTimePicker
import CommonTable from "../Utils/CommonTable"; // Added table component

export default function Dashboard() {
  const [demandData, setDemandData] = useState(null); // Raw data from API
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch raw demand data and dashboard stats on mount
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
        // Initially set with API stats (these will be overridden by dynamic totals on filtering)
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

  // Aggregation logic for the line chart data remains unchanged.
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

  // Filter aggregated data for the line chart based on selected dates.
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

  // Compute dynamic dashboard stats from the raw API data based on the filter.
  // Here we filter the raw data (using its TimeStamp) to compute total actual and predicted.
  // Note that the average price remains unchanged.
  let dynamicStats = dashboardStats;
  if (demandData && Array.isArray(demandData)) {
    const filteredRaw = demandData.filter((entry) => {
      const entryDate = new Date(entry.TimeStamp);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      return true;
    });
    const totalActual = filteredRaw.reduce(
      (sum, entry) => sum + Number(entry["Demand(Actual)"] || 0),
      0
    );
    const totalPredicted = filteredRaw.reduce(
      (sum, entry) => sum + Number(entry["Demand(Pred)"] || 0),
      0
    );
    // Convert to MW (assuming the API values are in Watts) and format to 2 decimal places.
    dynamicStats = {
      averagePrice: dashboardStats ? dashboardStats.averagePrice : "",
      totalPlants: dashboardStats ? dashboardStats.totalPlants : "",
      totalDemand: `${(totalActual / 1e6).toFixed(2)} MW`,
      totalSupply: `${(totalPredicted / 1e6).toFixed(2)} MW`,
    };
  }

  // Prepare CSV data for export (using the filtered chart data)
  const csvData = [
    ["Date", "Actual Demand", "Predicted Demand"],
    ...filteredData.map((entry) => [entry.day, entry.actual, entry.pred]),
  ];

  // Prepare CSV data for raw (non-aggregated) data export
  const rawCSVData = [
    ["Timestamp", "Actual Demand", "Predicted Demand"],
    ...(demandData || []).map((entry) => [
      entry.TimeStamp,
      entry["Demand(Actual)"],
      entry["Demand(Pred)"],
    ]),
  ];

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

          {/* CSV Download for Aggregated Chart Data */}
          <CSVLink
            data={csvData}
            filename={`demand_data_${
              startDate ? startDate.toISOString().slice(0, 10) : "full"
            }_to_${endDate ? endDate.toISOString().slice(0, 10) : "full"}.csv`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200 text-center shadow">
            Download CSV
          </CSVLink>

          {/* CSV Download for Raw Data */}
          <CSVLink
            data={rawCSVData}
            filename={`raw_demand_data_${new Date()
              .toISOString()
              .slice(0, 10)}.csv`}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200 text-center shadow">
            Download Raw Data CSV
          </CSVLink>
        </div>
      </div>

      {/* ✅ Updated Cards with dynamically computed totals based on filter */}
      {dynamicStats && (
        <DashboardCards
          stats={dynamicStats}
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

      {/* ✅ Raw Data Table (using the same logic) */}
      {demandData && (
        <CommonTable
          title="Raw Demand Data"
          caption="Non-Aggregated Demand Data (Raw API Data)"
          columns={[
            {
              accessor: "TimeStamp",
              header: "Timestamp",
              render: (row) => new Date(row.TimeStamp).toLocaleString(),
            },
            {
              accessor: "Demand(Actual)",
              header: "Actual Demand",
              render: (row) => Number(row["Demand(Actual)"]).toFixed(2),
            },
            {
              accessor: "Demand(Pred)",
              header: "Predicted Demand",
              render: (row) => Number(row["Demand(Pred)"]).toFixed(2),
            },
          ]}
          data={demandData}
        />
      )}
    </div>
  );
}
