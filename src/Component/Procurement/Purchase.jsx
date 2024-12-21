import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DemandCard from "./DemandCard";

export default function Purchase() {
  const location = useLocation();
  const { demand_list, exchangeData } = location.state || {
    demand_list: [],
    exchangeData: [],
  };
  const [index, setIndex] = useState(0);

  useEffect(() => {
    console.log("Demand List:", demand_list);
    console.log("Exchange Data:", exchangeData.exchange_data);
    console.log("Start Date:", exchangeData.start_date);
    console.log("End Date:", exchangeData.end_date);
  }, [demand_list, exchangeData]);

  const handleIndexChange = (e) => {
    const value = parseInt(e.target.value, 10) - 1; // Subtract 1 to handle internally starting from 0
    if (value >= 0 && value < demand_list.length) {
      setIndex(value);
    }
  };

  const exchangeDataArray = Array.isArray(exchangeData.exchange_data)
    ? exchangeData.exchange_data
    : [exchangeData.exchange_data];

  return (
    <div className="p-4 w-full">
      <h2 className="text-4xl font-bold mb-4 text-center">Procurement Data</h2>

      {/* Input Area */}
      <div className="mb-4">
        <label htmlFor="index" className="mr-2">
          Enter Block No:
        </label>
        <select
          id="index"
          value={index + 1} // Display value starting from 1
          onChange={handleIndexChange}
          className="border rounded p-2">
          {demand_list.map((_, idx) => (
            <option key={idx} value={idx + 1}>
              {idx + 1}
            </option>
          ))}
        </select>
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
          />
        ))}
      </div>
    </div>
  );
}
