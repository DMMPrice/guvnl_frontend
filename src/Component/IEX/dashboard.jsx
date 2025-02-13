import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import IEXLineChart from "./IEXLineChart";
import BasicDateTimePicker from "../Utils/DateTimePicker";
import CommonTable from "../Utils/CommonTable";
import { API_URL } from "../../config";
import { Loader2 } from "lucide-react";
import { CSVLink } from "react-csv";

export default function IEXDashboard() {
  // --- Aggregated data for optional stats ---
  const [demandData, setDemandData] = useState([]); // Entire aggregated dataset
  // --- Raw (non-aggregated) data (full) from API ---
  const [rawData, setRawData] = useState([]);

  // --- Filtered aggregated data ---
  const [filteredData, setFilteredData] = useState([]);
  // --- Filtered raw data ---
  const [filteredRawData, setFilteredRawData] = useState([]);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date states for filtering
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Default (earliest, latest) dates from aggregated data
  const [defaultStartDate, setDefaultStartDate] = useState(null);
  const [defaultEndDate, setDefaultEndDate] = useState(null);

  // ------------------------------------------------------------------
  // Helper to subtract 5h30m from an array of raw data
  // ------------------------------------------------------------------
  const shiftRawDataByFiveThirty = (dataArray) => {
    return dataArray.map((item) => {
      const dateObj = new Date(item.timestamp);
      // Subtract 5 hours 30 minutes = 330 minutes
      dateObj.setMinutes(dateObj.getMinutes() - 330);

      // Return a new object with updated timestamp + dateTime
      return {
        ...item,
        timestamp: dateObj.toISOString(),
        dateTime: dateObj.toLocaleString(),
      };
    });
  };

  // ------------------------------------------------------------------
  // 1) Fetch data (dashboard stats + IEX data)
  // ------------------------------------------------------------------
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

        // Format raw data
        const formattedRawData = data.map((entry) => {
          const timeObj = new Date(entry.TimeStamp);
          return {
            // For table & filtering
            timestamp: entry.TimeStamp,
            dateTime: timeObj.toLocaleString(),

            // For aggregator
            day: timeObj.toISOString().slice(0, 10),

            // Numeric values
            actual: Number(entry.Actual).toFixed(2),
            predicted: Number(entry.Pred).toFixed(2),
          };
        });
        setRawData(formattedRawData);

        // --- Aggregate by day (for initial chart & stats) ---
        const aggregates = {};
        formattedRawData.forEach((item) => {
          const day = item.day;
          if (!aggregates[day]) {
            aggregates[day] = {
              day,
              actualSum: 0,
              predictedSum: 0,
              count: 0,
            };
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

        // Sort aggregated data
        aggregatedData.sort((a, b) => new Date(a.day) - new Date(b.day));

        setDemandData(aggregatedData);
        setFilteredData(aggregatedData); // no filter => aggregated
        setFilteredRawData(formattedRawData); // table => raw data

        // Determine earliest & latest from aggregated
        if (aggregatedData.length > 0) {
          const earliest = new Date(aggregatedData[0].day);
          const latest = new Date(
            aggregatedData[aggregatedData.length - 1].day
          );
          setDefaultStartDate(earliest);
          setDefaultEndDate(latest);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
    fetchDemandData();
  }, [API_URL]);

  // ------------------------------------------------------------------
  // 2) Filter AGGREGATED data (still used for stats or initial chart)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!demandData || demandData.length === 0) return;

    // No filters => full aggregated
    if (!startDate && !endDate) {
      setFilteredData(demandData);

      // Revert dashboardStats to overall average if needed
      if (demandData.length && dashboardStats) {
        const avgPredictedPrice = (
          demandData.reduce((sum, e) => sum + Number(e.predicted), 0) /
          demandData.length
        ).toFixed(2);

        const avgPrice = (
          demandData.reduce((sum, e) => sum + Number(e.actual), 0) /
          demandData.length
        ).toFixed(2);

        setDashboardStats((prev) => ({
          ...prev,
          avgPredictedPrice,
          avgPrice,
        }));
      }
      return;
    }

    // Filter aggregator data by day
    const filtered = demandData.filter((entry) => {
      const entryDate = new Date(entry.day);
      return (
        (!startDate || entryDate >= startDate) &&
        (!endDate ||
          entryDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)))
      );
    });

    setFilteredData(filtered);

    // Recompute aggregator-based stats
    if (filtered.length > 0 && dashboardStats) {
      const avgPredictedPrice = (
        filtered.reduce((sum, e) => sum + Number(e.predicted), 0) /
        filtered.length
      ).toFixed(2);

      const avgPrice = (
        filtered.reduce((sum, e) => sum + Number(e.actual), 0) / filtered.length
      ).toFixed(2);

      setDashboardStats((prevStats) => ({
        ...prevStats,
        avgPredictedPrice,
        avgPrice,
      }));
    }
  }, [startDate, endDate, demandData, dashboardStats]);

  // ------------------------------------------------------------------
  // 3) Filter RAW data (line chart & table if filter) & SHIFT -5:30
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;

    // If no filter => show ALL raw data (unshifted)
    if (!startDate && !endDate) {
      setFilteredRawData(rawData);
      return;
    }

    // Filter raw data
    let filteredRaw = rawData.filter((entry) => {
      const rowDate = new Date(entry.timestamp);
      return (
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate)
      );
    });

    // Subtract 5h30 if filter is applied
    filteredRaw = shiftRawDataByFiveThirty(filteredRaw);

    setFilteredRawData(filteredRaw);
  }, [startDate, endDate, rawData]);

  // ------------------------------------------------------------------
  // 4) Handle "Clear" => revert line chart to aggregated
  // ------------------------------------------------------------------
  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);

    // Revert aggregator data
    setFilteredData(demandData);

    // Revert to all raw data (no shift)
    setFilteredRawData(rawData);

    // Reset stats to overall average if needed
    if (demandData.length && dashboardStats) {
      const avgPredictedPrice = (
        demandData.reduce((sum, e) => sum + Number(e.predicted), 0) /
        demandData.length
      ).toFixed(2);

      const avgPrice = (
        demandData.reduce((sum, e) => sum + Number(e.actual), 0) /
        demandData.length
      ).toFixed(2);

      setDashboardStats((prevStats) => ({
        ...prevStats,
        avgPredictedPrice,
        avgPrice,
      }));
    }
  };

  // ------------------------------------------------------------------
  // 5) Decide chart data: no filter => aggregated, filter => raw (already shifted)
  // ------------------------------------------------------------------
  const hasFilter = Boolean(startDate || endDate);
  const lineChartData = hasFilter ? filteredRawData : filteredData;

  // ------------------------------------------------------------------
  // 6) Prepare SINGLE CSV for RAW data (filteredRawData)
  // ------------------------------------------------------------------
  const rawCSVData = [
    ["Date & Time", "Actual Price", "Predicted Price"],
    ...filteredRawData.map((entry) => [
      entry.dateTime,
      entry.actual,
      entry.predicted,
    ]),
  ];

  // ------------------------------------------------------------------
  // 7) Loading / Error
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // 8) Chart config & Table columns
  // ------------------------------------------------------------------
  const chartConfig = {
    actual: { label: "Actual Price", color: "rgba(14, 165, 233, 1)" },
    predicted: { label: "Predicted Price", color: "rgb(248, 8, 76)" },
  };

  // For the table, we’re now storing the SHIFTED dateTime if user filters
  // (in effect #3 above). If no filters, it's unshifted.
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

  // ------------------------------------------------------------------
  // 9) Render
  // ------------------------------------------------------------------
  return (
    <div className="mx-8 p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 animate-slideDown">
        IEX Market Overview
      </h1>

      {/* Date Pickers + Action Buttons */}
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

          {/* SINGLE CSV Download (Raw Data Only) */}
          <CSVLink
            data={rawCSVData}
            filename={`iex_raw_${new Date().toISOString().slice(0, 10)}.csv`}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg transition duration-200 text-center">
            Download Raw Data CSV
          </CSVLink>
        </div>
      </div>

      {/* Dashboard Stats (optional) */}
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

      {/* 
        Line Chart:
        - Aggregated + no filter => (no time shift)
        - Raw + filter => time shifted by 5h30
        Also note that we've removed the Y-axis in IEXLineChart,
        so no Y labels appear.
      */}
      {lineChartData.length > 0 && (
        <IEXLineChart data={lineChartData} chartConfig={chartConfig} />
      )}

      {/* Table with RAW Data (shifted if user sets date) */}
      {filteredRawData.length > 0 && (
        <CommonTable
          title="Raw IEX Data"
          caption="Filtered Non-Aggregated IEX Data (Raw API Data with possible -5:30 shift)"
          columns={tableColumns}
          data={filteredRawData}
        />
      )}
    </div>
  );
}
