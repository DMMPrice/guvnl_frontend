import React, { useState } from "react";

export default function DemandCard({
  timestamp,
  actual,
  predicted,
  exchangeData,
}) {
  const [showExchangeData, setShowExchangeData] = useState(false);

  const handleButtonClick = () => {
    setShowExchangeData(!showExchangeData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold">Procurement Data</h3>
      <button
        onClick={handleButtonClick}
        className="mt-2 mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        {showExchangeData ? "Hide Exchange Data" : "Show Exchange Data"}
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Field</th>
            <th className="py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">TimeStamp</td>
            <td className="border px-4 py-2">{timestamp}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Demand (Actual)</td>
            <td className="border px-4 py-2">{actual}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Demand (Predicted)</td>
            <td className="border px-4 py-2">{predicted}</td>
          </tr>
          {showExchangeData && exchangeData && (
            <>
              <tr>
                <td className="border px-4 py-2">Predicted Price (IEX)</td>
                <td className="border px-4 py-2">{exchangeData.Pred_Price}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Predicted Quantity (IEX)</td>
                <td className="border px-4 py-2">{exchangeData.Qty_Pred}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
