import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ResponseData({ data, exchangeData }) {
  const [rowsToShow, setRowsToShow] = useState(10);
  const navigate = useNavigate();

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div>Enter start and end date to get the data</div>;
  }

  const handleDownload = (format) => {
    const flattenedData = data.map(({ timestamp, data }) => ({
      TimeStamp: timestamp,
      "Actual Demand": data["Demand(Actual)"],
      "Predicted Demand": data["Demand(Pred)"],
      "IEX Predicted Price": data.IEX_Data?.Pred_Price,
      "IEX Predicted Quantity": data.IEX_Data?.Qty_Pred,
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plant Data");

    if (format === "xlsx") {
      XLSX.writeFile(workbook, "plant_data.xlsx");
    }
  };

  const handleRowsChange = (value) => {
    setRowsToShow(Number(value));
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-4xl font-bold mb-4 text-center">Plant Data</h2>

      {/* Row Selection and Download Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="rows" className="mr-2">
            Show rows:
          </label>
          <Select value={String(rowsToShow)} onValueChange={handleRowsChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value={String(data.length)}>All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => handleDownload("xlsx")}
          className="bg-blue-500 text-white px-4 py-2 rounded">
          Download as Excel
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">TimeStamp</th>
              <th className="py-2 px-4 border-b">Actual Demand</th>
              <th className="py-2 px-4 border-b">Predicted Demand</th>
              <th className="py-2 px-4 border-b">IEX Pred Price</th>
              <th className="py-2 px-4 border-b">IEX Pred Quantity</th>
              <th className="py-2 px-4 border-b">Must Run Plants</th>
              <th className="py-2 px-4 border-b">Remaining Plants</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, rowsToShow).map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{item.timestamp}</td>
                <td className="py-2 px-4 border-b">
                  {item.data["Demand(Actual)"]}
                </td>
                <td className="py-2 px-4 border-b">
                  {item.data["Demand(Pred)"]}
                </td>
                <td className="py-2 px-4 border-b">
                  {item.data.IEX_Data?.Pred_Price}
                </td>
                <td className="py-2 px-4 border-b">
                  {item.data.IEX_Data?.Qty_Pred}
                </td>
                <td className="py-2 px-4 border-b">
                  {item.data.Must_Run?.length || 0} plants
                </td>
                <td className="py-2 px-4 border-b">
                  {item.data.Remaining_Plants?.name || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
