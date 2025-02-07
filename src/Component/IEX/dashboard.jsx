import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import IEXLineChart from "./IEXLineChart";
import CustomDatePicker from "../Utils/CustomDatePicker";
import { Loader2 } from "lucide-react";
import { CSVLink } from "react-csv"; // ✅ Import CSV Export Functionality

export default function IEXDashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [demandData, setDemandData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Start and End Date initially empty
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [defaultStartDate, setDefaultStartDate] = useState(null);
  const [defaultEndDate, setDefaultEndDate] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/iex/dashboard");
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
        const response = await fetch("http://127.0.0.1:5000/iex/all");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const dailyAggregates = {};
        data.forEach((entry) => {
          const dateKey = new Date(entry.TimeStamp).toISOString().slice(0, 10);

          if (!dailyAggregates[dateKey]) {
            dailyAggregates[dateKey] = { actualSum: 0, predSum: 0, count: 0 };
          }

          dailyAggregates[dateKey].actualSum += Number(entry.Actual || 0);
          dailyAggregates[dateKey].predSum += Number(entry.Pred || 0);
          dailyAggregates[dateKey].count += 1;
        });

        const formattedData = Object.entries(dailyAggregates).map(
          ([day, sums]) => ({
            day,
            actual: sums.count > 0 ? sums.actualSum / sums.count : null,
            predicted: sums.count > 0 ? sums.predSum / sums.count : null,
          })
        );

        setDemandData(formattedData);
        setFilteredData(formattedData);

        if (formattedData.length > 0) {
          setDefaultStartDate(new Date(formattedData[0].day));
          setDefaultEndDate(
            new Date(formattedData[formattedData.length - 1].day)
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

  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredData(demandData);
      return;
    }

    const filtered = demandData.filter((entry) => {
      const entryDate = new Date(entry.day);
      return (
        (!startDate || entryDate >= startDate) &&
        (!endDate || entryDate <= new Date(endDate).setHours(23, 59, 59, 999))
      );
    });

    setFilteredData(filtered);

    if (filtered.length > 0) {
      const avgPredictedPrice = (
        filtered.reduce((sum, entry) => sum + entry.predicted, 0) /
        filtered.length
      ).toFixed(2);

      const avgPrice = (
        filtered.reduce((sum, entry) => sum + entry.actual, 0) / filtered.length
      ).toFixed(2);

      setDashboardStats((prevStats) => ({
        ...prevStats,
        avgPredictedPrice: avgPredictedPrice,
        avgPrice: avgPrice,
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
            demandData.reduce((sum, entry) => sum + entry.predicted, 0) /
            demandData.length
          ).toFixed(2)
        : prevStats.avgPredictedPrice,
      avgPrice: demandData.length
        ? (
            demandData.reduce((sum, entry) => sum + entry.actual, 0) /
            demandData.length
          ).toFixed(2)
        : prevStats.avgPrice,
    }));
  };

  // ✅ Prepare Data for CSV Download
  const csvData = [
    ["Date", "Actual Price", "Predicted Price"],
    ...filteredData.map((entry) => [entry.day, entry.actual, entry.predicted]),
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

  return (
    <div className="mx-8 p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
        IEX Market Overview
      </h1>

      {/* ✅ Date Pickers Section with Adjusted Spacing */}
      <div className="flex flex-wrap gap-6 mb-6 items-center p-4">
        {" "}
        {/* ✅ Added padding */}
        <div className="flex flex-col">
          <CustomDatePicker
            label="Start Date"
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Select Start Date"
          />
        </div>
        <div className="flex flex-col">
          <CustomDatePicker
            label="End Date"
            selected={endDate}
            onChange={setEndDate}
            placeholderText="Select End Date"
          />
        </div>
        {/* ✅ Buttons Section with Padding */}
        <div className="flex gap-4 pt-2">
          {" "}
          {/* ✅ Added padding on top */}
          {/* ✅ Clear Button */}
          <button
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition duration-200">
            Clear
          </button>
          {/* ✅ Download CSV Button */}
          <CSVLink
            data={csvData}
            filename={`iex_data_${
              startDate ? startDate.toISOString().slice(0, 10) : "full"
            }_to_${endDate ? endDate.toISOString().slice(0, 10) : "full"}.csv`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition duration-200 text-center">
            Download CSV
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
        <IEXLineChart data={filteredData} chartConfig={chartConfig} />
      )}
    </div>
  );
}
