import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import { API_URL } from "../../config";
import DemandLineChart from "./DemandLineChart";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [demandData, setDemandData] = useState(null); // Data for the line chart
  const [dashboardStats, setDashboardStats] = useState(null); // Data for the dashboard cards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch demand line chart data
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

    // Fetch dashboard overview stats
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_URL}demand/dashboard`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Format the API response for display
        setDashboardStats({
          totalDemand: `${(data.demand_actual / 1e6).toFixed(2)} MW`, // Convert from kWh to MW
          totalSupply: `${(data.demand_predicted / 1e6).toFixed(2)} MW`,
          averagePrice: `₹${data.avg_price.toFixed(2)}/unit`,
          totalPlants: data.plant_count.toString(),
        });
      } catch (error) {
        setError(error.message);
      }
    };

    fetchDemandData(); // Fetch demand data for the chart
    fetchDashboardStats(); // Fetch dashboard overview stats
  }, []);

  const getDailyAggregates = () => {
    if (!demandData || !Array.isArray(demandData)) return [];

    const dailyMap = {};
    for (const entry of demandData) {
      const dateObj = new Date(entry.TimeStamp);
      const dayKey = dateObj.toISOString().slice(0, 10);

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { actualSum: 0, predSum: 0 };
      }
      dailyMap[dayKey].actualSum += Number(entry["Demand(Actual)"] || 0);
      dailyMap[dayKey].predSum += Number(entry["Demand(Pred)"] || 0);
    }

    return Object.entries(dailyMap).map(([day, sums]) => ({
      day,
      actual: sums.actualSum === 0 ? null : sums.actualSum,
      pred: sums.predSum === 0 ? null : sums.predSum,
    }));
  };

  const dailyData = getDailyAggregates();

  const chartConfig = {
    actual: {
      label: "Actual Demand",
      color: "rgba(14, 165, 233, 1)",
    },
    pred: {
      label: "Predicted Demand",
      color: "rgb(248, 8, 76)",
    },
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

      {dashboardStats && <DashboardCards stats={dashboardStats} />}
      <DemandLineChart dailyData={dailyData} chartConfig={chartConfig} />
    </div>
  );
}
