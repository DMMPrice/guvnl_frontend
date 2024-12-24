import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import CommonTable from "../Utils/CommonTable";
import InfoCard from "../Utils/InfoCard";
import PieChartCard from "../Utils/PieChartCard";

export default function DemandCard({
  timestamp,
  actual,
  predicted,
  exchangeData,
  startDate,
  endDate,
}) {
  const navigate = useNavigate();
  const [plantData, setPlantData] = useState(null);
  const [otherPlants, setOtherPlants] = useState(null);

  // Fetch loading
  const [fetchLoading, setFetchLoading] = useState(true);
  // Additional loading
  const [displayLoading, setDisplayLoading] = useState(true);

  // Format timestamp, subtract 5 hours and 30 minutes
  const dateObj = new Date(timestamp);
  dateObj.setHours(dateObj.getHours() - 5);
  dateObj.setMinutes(dateObj.getMinutes() - 30);
  const formattedTimestamp = dateObj
    .toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
  const actualInUnits = actual === 0 ? "NA" : actual.toFixed(2) + " Units";
  const predictedInUnits = predicted.toFixed(2);

  // Fetch must-run
  useEffect(() => {
    const fetchMustRunPlants = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/plant/must-run?net_demand=${predictedInUnits}&timeStamp=${formattedTimestamp}`
        );
        const data = await response.json();
        setPlantData({ must_run: data });
        setFetchLoading(false);
      } catch (error) {
        console.error("Error fetching must-run plants:", error);
        setFetchLoading(false);
      }
    };
    fetchMustRunPlants();
  }, [predictedInUnits, formattedTimestamp]);

  const { totalPowerSum, totalPowerCostSum } = plantData?.must_run?.reduce(
    (totals, plant) => ({
      totalPowerSum: totals.totalPowerSum + Number(plant.generated_energy || 0),
      totalPowerCostSum: totals.totalPowerCostSum + Number(plant.net_cost || 0),
    }),
    { totalPowerSum: 0, totalPowerCostSum: 0 }
  ) || { totalPowerSum: 0, totalPowerCostSum: 0 };

  // Fetch other plants
  useEffect(() => {
    const fetchOtherPlants = async () => {
      if (totalPowerSum) {
        try {
          const remaining = (Number(predictedInUnits) - totalPowerSum).toFixed(
            2
          );
          const response = await fetch(
            `${
              import.meta.env.VITE_API_URL
            }/plant/others?net_demand=${remaining}`
          );
          const data = await response.json();
          setOtherPlants(data.other);
        } catch (error) {
          console.error("Error fetching other plants:", error);
        }
      }
    };
    fetchOtherPlants();
  }, [totalPowerSum, predictedInUnits]);

  // IEX handling
  const iexQty =
    exchangeData?.Qty_Pred === -1 ? 0 : exchangeData?.Qty_Pred || 0;
  const iexPrice =
    exchangeData?.Pred_Price === -1 ? 0 : exchangeData?.Pred_Price || 0;

  // Totals
  const totalOtherPower =
    otherPlants?.reduce(
      (sum, plant) => sum + Number(plant.generation || 0),
      0
    ) || 0;
  const totalOtherCost =
    otherPlants?.reduce((sum, plant) => sum + Number(plant.cost || 0), 0) || 0;
  const totalPowerWithIEX = totalPowerSum + totalOtherPower + iexQty;
  const totalCostWithIEX =
    totalPowerCostSum + totalOtherCost + iexQty * iexPrice;

  // Loading
  useEffect(() => {
    if (!fetchLoading) {
      const timer = setTimeout(() => setDisplayLoading(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [fetchLoading]);

  const displayedIexQty =
    exchangeData?.Qty_Pred === -1 ? "NA" : exchangeData?.Qty_Pred || 0;

  if (fetchLoading || displayLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="w-64 p-4">
          <Progress value={50} className="w-full" />
        </div>
      </div>
    );
  }

  // Prepare data for the CommonTable component (Info Table & IEX Data)
  const mainData = [
    { Field: "TimeStamp", Value: formattedTimestamp },
    { Field: "Demand (Actual)", Value: actualInUnits },
    { Field: "Demand (Predicted)", Value: predictedInUnits },
  ];

  const iexData = [
    {
      Field: "Predicted Price (IEX)",
      Value:
        exchangeData?.Pred_Price === -1
          ? "NA"
          : `₹ ${Number(exchangeData?.Pred_Price || 0).toFixed(2)}`,
    },
    {
      Field: "Predicted Quantity (IEX)",
      Value: displayedIexQty + " Units",
    },
  ];

  // Define columns for Must Run Plants
  const mustRunColumns = [
    { header: "Code", key: "plant_code" },
    // { header: "Plant Name", key: "plant_name" },
    { header: "Rated Capacity", key: "Rated_Capacity" },
    { header: "Aux Consumption", key: "Aux_Consumption" },
    { header: "Technical Minimum", key: "Technical_Minimum" },
    { header: "PAF", key: "PAF" },
    { header: "PLF", key: "PLF" },
    { header: "Generated Energy", key: "generated_energy" },
    { header: "Variable Cost", key: "Variable_Cost" },
    { header: "Net Cost", key: "net_cost" },
  ];

  // Define columns for Other Plants
  const otherPlantsColumns = [
    { header: "Code", key: "code" },
    {
      header: "Rated Capacity",
      key: "rated_capacity",
      alternateKey: "Rated_Capacity",
    },
    { header: "Aux Consumption", key: "Aux_Consumption" },
    { header: "Technical Minimum", key: "Technical_Minimum" },
    { header: "PAF", key: "PAF" },
    { header: "PLF", key: "PLF" },
    { header: "Generated Energy", key: "generation" },
    { header: "Variable Cost", key: "Variable_Cost" },
    { header: "Net Cost", key: "cost" },
  ];

  // Define columns for IEX Data (Field, Value)
  const infoColumns = [
    { header: "Field", key: "Field" },
    { header: "Value", key: "Value", className: "text-right" },
  ];

  // Prepare data for PieChartCard component
  const pieCostChartData = [
    {
      name: "Other Plants Cost",
      value: totalOtherCost,
      color: "rgb(11, 211, 246)",
    },
    {
      name: "Must Run Plants Cost",
      value: totalPowerCostSum,
      color: "rgb(8, 156, 75)",
    },
    {
      name: "IEX Cost",
      value: iexQty * iexPrice,
      color: "#36A2EB",
    },
  ];
  const pieGenerateChartData = [
    {
      name: "Other Plants Generation",
      value: totalOtherPower,
      color: "rgb(246, 226, 11)",
    },
    {
      name: "Must Run Plants Generation",
      value: totalPowerSum,
      color: "rgb(101, 11, 219)",
    },
    {
      name: "IEX Generation",
      value: iexQty,
      color: "rgb(30, 160, 175)",
    },
  ];

  return (
    <div className="bg-white border-2 border-gray-200 shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
      {/* Info Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <InfoCard
          header="Current TimeStamp"
          value={`${formattedTimestamp}`}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
        />
        <InfoCard
          header="Current Demand"
          value={`${actualInUnits}`}
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
        />
        <InfoCard
          header="Predicted Demand"
          value={`${predictedInUnits} Units`}
          bgColor="bg-red-100"
          textColor="text-red-800"
        />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <PieChartCard
          title="Cost Distribution"
          data={pieCostChartData}
          dataKey="value"
          nameKey="name"
        />
        <PieChartCard
          title="Generation Distribution"
          data={pieGenerateChartData}
          dataKey="value"
          nameKey="name"
        />
      </div>
      {/* Info Table */}
      <CommonTable
        title="Procurement Information"
        columns={infoColumns}
        data={mainData}
      />

      {/* Must Run Plants Table */}
      {plantData?.must_run && (
        <CommonTable
          title="Must Run Plants Data"
          columns={mustRunColumns}
          data={plantData.must_run}
        />
      )}

      {/* Other Plants Table */}
      {otherPlants && (
        <CommonTable
          title="Other Plants Data"
          columns={otherPlantsColumns}
          data={otherPlants}
        />
      )}

      {/* IEX Data Table */}
      {exchangeData && (
        <CommonTable title="IEX Data" columns={infoColumns} data={iexData} />
      )}
    </div>
  );
}
