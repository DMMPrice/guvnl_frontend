import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import IEXLineChart from "./IEXLineChart";
import BasicDateTimePicker from "../Utils/DateTimePicker"; // Use BasicDateTimePicker here
import CommonTable from "../Utils/CommonTable"; // Import the CommonTable component
import { API_URL } from "../../config";
import { Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";

export default function IEXDashboard() {
  // Aggregated data for the chart
  const [demandData, setDemandData] = useState([]);
  // Raw non-aggregated data for the table
  const [rawData, setRawData] = useState([]);
  // Filtered (aggregated) data for the chart based on date filters
  const [filteredData, setFilteredData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date states for filtering the chart (the table always shows raw data)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [defaultStartDate, setDefaultStartDate] = useState(null);
  const [defaultEndDate, setDefaultEndDate] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_URL}iex/dashboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDashboardStats({
          avgPredictedPrice: data.Avg_Pred_Price,
          avgPrice: data.Avg_Price,
        });
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchDemandData = async () => {
      try {
        const response = await fetch(`${API_URL}iex/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Create raw (non-aggregated) data for the table.
        // Include a full date & time string and round the numeric values.
        const formattedRawData = data.map((entry) => ({
          dateTime: new Date(entry.TimeStamp).toLocaleString(), // Full date and time
          day: new Date(entry.TimeStamp).toISOString().slice(0, 10), // For aggregation and chart filtering
          actual: Number(entry.Actual).toFixed(2),
          predicted: Number(entry.Pred).toFixed(2),
        }));
        setRawData(formattedRawData);

        // Aggregate data by day for the line chart.
        const aggregates = {};
        formattedRawData.forEach((item) => {
          const day = item.day;
          if (!aggregates[day]) {
            aggregates[day] = { day, actualSum: 0, predictedSum: 0, count: 0 };
          }
          aggregates[day].actualSum += Number(item.actual);
          aggregates[day].predictedSum += Number(item.predicted);
          aggregates[day].count += 1;
        });

        let aggregatedData = Object.entries(aggregates).map(([day, sums]) => ({
          day,
          actual: (sums.actualSum / sums.count).toFixed(2),
          predicted: (sums.predictedSum / sums.count).toFixed(2),
        }));

        // Sort aggregated data by date (ascending)
        aggregatedData.sort((a, b) => new Date(a.day) - new Date(b.day));

        setDemandData(aggregatedData);
        setFilteredData(aggregatedData);

        if (aggregatedData.length > 0) {
          setDefaultStartDate(new Date(aggregatedData[0].day));
          setDefaultEndDate(
            new Date(aggregatedData[aggregatedData.length - 1].day)
          );
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
    fetchDemandData();
  }, []);

  // Filter the aggregated chart data based on the selected dates.
  // The table will always show the full raw data.
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(demandData);
      return;
    }

    const filtered = demandData.filter((entry) => {
      const entryDate = new Date(entry.day);
      return (
        (!startDate || entryDate >= startDate) &&
        (!endDate ||
          entryDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)))
      );
    });

    setFilteredData(filtered);

    if (filtered.length > 0) {
      const avgPredictedPrice = (
        filtered.reduce((sum, entry) => sum + Number(entry.predicted), 0) /
        filtered.length
      ).toFixed(2);

      const avgPrice = (
        filtered.reduce((sum, entry) => sum + Number(entry.actual), 0) /
        filtered.length
      ).toFixed(2);

      setDashboardStats((prevStats) => ({
        ...prevStats,
        avgPredictedPrice,
        avgPrice,
      }));
    }
  }, [startDate, endDate, demandData]);

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredData(demandData);

    setDashboardStats((prevStats) => ({
      ...prevStats,
      avgPredictedPrice: demandData.length
        ? (
            demandData.reduce(
              (sum, entry) => sum + Number(entry.predicted),
              0
            ) / demandData.length
          ).toFixed(2)
        : prevStats.avgPredictedPrice,
      avgPrice: demandData.length
        ? (
            demandData.reduce((sum, entry) => sum + Number(entry.actual), 0) /
            demandData.length
          ).toFixed(2)
        : prevStats.avgPrice,
    }));
  };

  // Prepare CSV data for export (using the filtered chart data)
  const csvData = [
    ["Date", "Actual Price", "Predicted Price"],
    ...filteredData.map((entry) => [entry.day, entry.actual, entry.predicted]),
  ];

  // Prepare CSV data for raw (non-aggregated) data export
  const rawCSVData = [
    ["Date & Time", "Actual Price", "Predicted Price"],
    ...rawData.map((entry) => [entry.dateTime, entry.actual, entry.predicted]),
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

  const chartConfig = {
    actual: { label: "Actual Price", color: "rgba(14, 165, 233, 1)" },
    predicted: { label: "Predicted Price", color: "rgb(248, 8, 76)" },
  };

  // Define table columns for the raw (non-aggregated) API data.
  // A new column "Date & Time" is added to show the full date and time.
  const tableColumns = [
    { accessor: "dateTime", header: "Date & Time" },
    {
      accessor: "actual",
      header: "Actual Price",
      render: (row) => (row.actual !== "N/A" ? row.actual : "N/A"),
    },
    {
      accessor: "predicted",
      header: "Predicted Price",
      render: (row) => (row.predicted !== "N/A" ? row.predicted : "N/A"),
    },
  ];

  return (
    <div className="mx-8 p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
        IEX Market Overview
      </h1>

      {/* Date Pickers and Action Buttons for chart filtering */}
      <div className="flex flex-wrap gap-6 mb-6 items-center p-4">
        <div className="flex flex-col">
          <BasicDateTimePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
        </div>
        <div className="flex flex-col">
          <BasicDateTimePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition duration-200">
            Clear
          </button>
          {/* CSV Download for Aggregated Chart Data */}
          <CSVLink
            data={csvData}
            filename={`iex_data_${
              startDate ? startDate.toISOString().slice(0, 10) : "full"
            }_to_${endDate ? endDate.toISOString().slice(0, 10) : "full"}.csv`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition duration-200 text-center">
            Download CSV
          </CSVLink>
          {/* CSV Download for Raw Data */}
          <CSVLink
            data={rawCSVData}
            filename={`iex_raw_data_${new Date()
              .toISOString()
              .slice(0, 10)}.csv`}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition duration-200 text-center">
            Download Raw Data CSV
          </CSVLink>
        </div>
      </div>

      {dashboardStats && (
        <DashboardCards
          stats={dashboardStats}
          startDate={
            startDate
              ? startDate.toISOString().slice(0, 10)
              : defaultStartDate?.toISOString().slice(0, 10)
          }
          endDate={
            endDate
              ? endDate.toISOString().slice(0, 10)
              : defaultEndDate?.toISOString().slice(0, 10)
          }
        />
      )}

      {filteredData.length > 0 && (
        <>
          {/* The LineChart uses the aggregated (filtered) data as before */}
          <IEXLineChart data={filteredData} chartConfig={chartConfig} />
          {/* The table displays the raw non-aggregated data with full date & time */}
          <CommonTable
            title="Raw IEX Data"
            caption="Non-Aggregated IEX Data (Raw API Data with Date & Time)"
            columns={tableColumns}
            data={rawData}
          />
        </>
      )}
    </div>
  );
}
