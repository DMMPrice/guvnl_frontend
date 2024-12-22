import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DemandCard from "./DemandCard";
import { Progress } from "@/components/ui/progress";

export default function Purchase() {
  const location = useLocation();
  const navigate = useNavigate();
  const { demand_list, exchangeData } = location.state || {
    demand_list: [],
    exchangeData: [],
  };

  const [plantData, setPlantData] = useState(null);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.powercasting.online/procurement/plant"
        );
        const data = await response.json();
        setPlantData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIndexChange = (e) => {
    const value = parseInt(e.target.value, 10) - 1;
    if (value >= 0 && value < demand_list.length) {
      setIndex(value);
    }
  };

  const exchangeDataArray = Array.isArray(exchangeData.exchange_data)
    ? exchangeData.exchange_data
    : [exchangeData.exchange_data];

  // Show loading state with Progress bar, centered on screen
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="w-64 p-4">
          <Progress value={70} className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <h2 className="text-4xl font-bold mb-4 text-center">Procurement Data</h2>

      {/* Input Area */}
      <div className="mb-4 flex justify-center items-center gap-2">
        <label htmlFor="index" className="mr-2">
          Enter Block No:
        </label>
        <select
          id="index"
          value={index + 1}
          onChange={handleIndexChange}
          className="border rounded p-2">
          {demand_list.map((_, idx) => (
            <option key={idx} value={idx + 1}>
              {idx + 1}
            </option>
          ))}
        </select>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Home
        </button>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {demand_list.slice(0, index + 1).map((item, idx) => (
          <DemandCard
            key={idx}
            timestamp={item.TimeStamp}
            actual={item["Demand(Actual)"]}
            predicted={item["Demand(Pred)"]}
            exchangeData={exchangeDataArray[idx]}
            startDate={exchangeData.start_date}
            endDate={exchangeData.end_date}
            plantData={plantData}
          />
        ))}
      </div>
    </div>
  );
}
