import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import * as XLSX from "xlsx";

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

  // Format timestamp and multiply
  const dateObj = new Date(timestamp);
  dateObj.setHours(dateObj.getHours() - 5);
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
  const actualInUnits = (actual * 1000).toFixed(2);
  const predictedInUnits = (predicted * 1000).toFixed(2);

  // Fetch must-run
  useEffect(() => {
    const fetchMustRunPlants = async () => {
      try {
        const response = await fetch(
          `https://api.powercasting.online/plant/must-run?net_demand=${predictedInUnits}&timeStamp=${formattedTimestamp}`
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
      totalPowerSum: totals.totalPowerSum + plant.generated_energy,
      totalPowerCostSum: totals.totalPowerCostSum + plant.net_cost,
    }),
    { totalPowerSum: 0, totalPowerCostSum: 0 }
  ) || { totalPowerSum: 0, totalPowerCostSum: 0 };

  // Fetch other plants
  useEffect(() => {
    const fetchOtherPlants = async () => {
      if (totalPowerSum) {
        try {
          const finalRemaining = (predicted * 1000 - totalPowerSum).toFixed(2);
          const response = await fetch(
            `https://api.powercasting.online/plant/others?net_demand=${finalRemaining}`
          );
          const data = await response.json();
          setOtherPlants(data.other);
        } catch (error) {
          console.error("Error fetching other plants:", error);
        }
      }
    };
    fetchOtherPlants();
  }, [totalPowerSum, predicted]);

  // IEX handling
  const iexQty =
    exchangeData?.Qty_Pred === -1 ? 0 : exchangeData?.Qty_Pred || 0;
  const iexPrice =
    exchangeData?.Qty_Pred === -1 ? 0 : exchangeData?.Pred_Price || 0;

  // Totals
  const totalOtherPower =
    otherPlants?.reduce((sum, plant) => sum + plant.generation, 0) || 0;
  const totalOtherCost =
    otherPlants?.reduce((sum, plant) => sum + plant.cost, 0) || 0;

  const remainingAfterMustRun = (predicted * 1000 - totalPowerSum).toFixed(2);
  const remainingAfterOther = (
    predicted * 1000 -
    totalPowerSum -
    totalOtherPower
  ).toFixed(2);
  const totalPowerWithIEX = totalPowerSum + totalOtherPower + iexQty;
  const totalCostWithIEX =
    totalPowerCostSum + totalOtherCost + iexQty * iexPrice;
  const finalRemainingPower = (predicted * 1000 - totalPowerWithIEX).toFixed(2);

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

  // Download Excel with multiple sheets
  const handleDownloadExcel = () => {
    // 1) Summary
    const summaryHeader = [
      "Timestamp",
      "Demand Actual",
      "Demand Predicted",
      "IEX Qty",
      "IEX Price",
      "IEX Cost",
      "MustRun Gen",
      "MustRun Cost",
      "Other Gen",
      "Other Cost",
      "Total Gen",
      "Total Cost",
      "Remaining After Must Run",
      "Remaining After Other",
      "Final Remaining",
    ];
    const summaryRow = [
      formattedTimestamp,
      actualInUnits,
      predictedInUnits,
      iexQty,
      iexPrice,
      (iexQty * iexPrice).toFixed(2),
      totalPowerSum.toFixed(2),
      totalPowerCostSum.toFixed(2),
      totalOtherPower.toFixed(2),
      totalOtherCost.toFixed(2),
      totalPowerWithIEX.toFixed(2),
      totalCostWithIEX.toFixed(2),
      remainingAfterMustRun,
      remainingAfterOther,
      finalRemainingPower,
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet([summaryHeader, summaryRow]);

    // 2) IEX data sheet
    const iexHeader = ["Field", "Value"];
    const iexData = [
      ["Predicted Quantity (IEX)", displayedIexQty],
      ["Predicted Price (IEX)", iexPrice],
      ["IEX Cost", (iexQty * iexPrice).toFixed(2)],
    ];
    const iexSheet = XLSX.utils.aoa_to_sheet([iexHeader, ...iexData]);

    // 3) Must-run sheet
    const mustRunHeader = [
      "Plant Code",
      "Plant Name",
      "Rated Capacity",
      "Variable Cost",
      "Aux Consumption",
      "Technical Minimum",
      "PAF",
      "PLF",
      "Generated Energy",
      "Net Cost",
    ];
    const mustRunData = (plantData?.must_run || []).map((plant) => [
      plant.plant_code,
      plant.plant_name,
      plant.Rated_Capacity,
      plant.Variable_Cost,
      plant.Aux_Consumption,
      plant.Technical_Minimum,
      plant.PAF,
      plant.PLF,
      plant.generated_energy.toFixed(2),
      plant.net_cost.toFixed(2),
    ]);
    const mustRunSheet = XLSX.utils.aoa_to_sheet([
      mustRunHeader,
      ...mustRunData,
    ]);

    // 4) Other plants sheet
    const otherHeader = [
      "Code",
      "Plant Name",
      "Aux Consumption",
      "Technical Minimum",
      "PAF",
      "PLF",
      "Generated Energy",
      "Cost",
    ];
    const otherData = (otherPlants || []).map((plant) => [
      plant.code,
      plant.name,
      plant.Aux_Consumption,
      plant.Technical_Minimum,
      plant.PAF,
      plant.PLF,
      plant.generation.toFixed(2),
      plant.cost.toFixed(2),
    ]);
    const otherSheet = XLSX.utils.aoa_to_sheet([otherHeader, ...otherData]);

    // Build workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, iexSheet, "IEX");
    XLSX.utils.book_append_sheet(wb, mustRunSheet, "MustRun");
    XLSX.utils.book_append_sheet(wb, otherSheet, "OtherPlants");

    // Export
    XLSX.writeFile(wb, "DemandCardData.xlsx");
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold mt-4">Procurement Data</h3>
        <button
          onClick={handleDownloadExcel}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded">
          Download Excel
        </button>
      </div>

      {/* Main Data Table */}
      <table className="min-w-full bg-white mb-8">
        <thead>
          <tr>
            <th className="py-2">Field</th>
            <th className="py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">TimeStamp</td>
            <td className="border px-4 py-2">{formattedTimestamp}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Demand (Actual)</td>
            <td className="border px-4 py-2">{actualInUnits}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Demand (Predicted)</td>
            <td className="border px-4 py-2">{predictedInUnits}</td>
          </tr>
        </tbody>
      </table>

      {/* Must Run Plants Table */}
      {plantData?.must_run && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-4">
            Must Run Plants Data
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Code</th>
                  <th className="border px-4 py-2">Plant Name</th>
                  <th className="border px-4 py-2">Rated Capacity</th>
                  <th className="border px-4 py-2">Variable Cost</th>
                  <th className="border px-4 py-2">Aux Consumption</th>
                  <th className="border px-4 py-2">Technical Minimum</th>
                  <th className="border px-4 py-2">PAF</th>
                  <th className="border px-4 py-2">PLF</th>
                  <th className="border px-4 py-2">Generated Energy</th>
                  <th className="border px-4 py-2">Net Cost</th>
                </tr>
              </thead>
              <tbody>
                {plantData.must_run.map((plant, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{plant.plant_code}</td>
                    <td className="border px-4 py-2">{plant.plant_name}</td>
                    <td className="border px-4 py-2">{plant.Rated_Capacity}</td>
                    <td className="border px-4 py-2">{plant.Variable_Cost}</td>
                    <td className="border px-4 py-2">
                      {plant.Aux_Consumption}
                    </td>
                    <td className="border px-4 py-2">
                      {plant.Technical_Minimum}
                    </td>
                    <td className="border px-4 py-2">{plant.PAF}</td>
                    <td className="border px-4 py-2">{plant.PLF}</td>
                    <td className="border px-4 py-2">
                      {plant.generated_energy.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      Rs {plant.net_cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Other Plants Table */}
      {otherPlants && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-4">Other Plants Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Code</th>
                  <th className="border px-4 py-2">Plant Name</th>
                  <th className="border px-4 py-2">Aux Consumption</th>
                  <th className="border px-4 py-2">Technical Minimum</th>
                  <th className="border px-4 py-2">PAF</th>
                  <th className="border px-4 py-2">PLF</th>
                  <th className="border px-4 py-2">Generated Energy</th>
                  <th className="border px-4 py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {otherPlants.map((plant, idx) => (
                  <tr key={idx}>
                    <td className="border px-4 py-2">{plant.code}</td>
                    <td className="border px-4 py-2">{plant.name}</td>
                    <td className="border px-4 py-2">
                      {plant.Aux_Consumption}
                    </td>
                    <td className="border px-4 py-2">
                      {plant.Technical_Minimum}
                    </td>
                    <td className="border px-4 py-2">{plant.PAF}</td>
                    <td className="border px-4 py-2">{plant.PLF}</td>
                    <td className="border px-4 py-2">
                      {plant.generation.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      Rs {plant.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* IEX Data Table */}
      {exchangeData && (
        <>
          <h3 className="text-lg font-semibold mt-6 mb-4">IEX Data</h3>
          <table className="min-w-full bg-white mb-8">
            <thead>
              <tr>
                <th className="py-2">Field</th>
                <th className="py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Predicted Price (IEX)</td>
                <td className="border px-4 py-2">
                  {exchangeData?.Qty_Pred === -1
                    ? 0
                    : exchangeData?.Pred_Price || 0}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Predicted Quantity (IEX)</td>
                <td className="border px-4 py-2">{displayedIexQty}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* Summary Section */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold">
          Must Run Plants Generation: {totalPowerSum.toFixed(2)} Units
        </h4>
        <h4 className="text-lg font-semibold">
          Must Run Plants Cost: ₹ {totalPowerCostSum.toFixed(2)}
        </h4>
        <h4 className="text-lg font-semibold">
          Other Plants Generation: {totalOtherPower.toFixed(2)} Units
        </h4>
        <h4 className="text-lg font-semibold">
          Other Plants Cost: ₹ {totalOtherCost.toFixed(2)}
        </h4>
        <h4 className="text-lg font-semibold">
          IEX Cost: ₹ {(iexQty * iexPrice).toFixed(2)}
        </h4>
        <h4 className="text-lg font-semibold">
          Total Generated Energy: {totalPowerWithIEX.toFixed(2)} Units
        </h4>
        <h4 className="text-lg font-semibold">
          Total Net Cost: ₹ {totalCostWithIEX.toFixed(2)}
        </h4>
        <h4 className="text-lg font-semibold">
          Remaining After Must Run: {remainingAfterMustRun} Units
        </h4>
        <h4 className="text-lg font-semibold">
          Remaining After Other Plants: {remainingAfterOther} Units
        </h4>
        <h4 className="text-lg font-semibold">
          Final Remaining Power: {finalRemainingPower} Units
        </h4>
      </div>
    </div>
  );
}
