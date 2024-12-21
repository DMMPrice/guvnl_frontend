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

  if (!data) {
    return <div>Enter start and end date to get the data</div>;
  }

  const { demand_list, end_date, start_date, total_blocks, total_demand } =
    data;

  const handleDownload = (format) => {
    const worksheet = XLSX.utils.json_to_sheet(demand_list);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demand Data");

    if (format === "xlsx") {
      XLSX.writeFile(workbook, "demand_data.xlsx");
    } else if (format === "csv") {
      XLSX.writeFile(workbook, "demand_data.csv", { bookType: "csv" });
    }
  };

  const handleRowsChange = (value) => {
    setRowsToShow(Number(value));
  };

  const handleNavigate = () => {
    navigate("/procurement", { state: { demand_list, exchangeData } });
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-4xl font-bold mb-4 text-center">Demand Data</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold">Start Date</h3>
          <p>{start_date}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold">End Date</h3>
          <p>{end_date}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold">Total Blocks</h3>
          <p>{total_blocks}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4">
          <h3 className="text-lg font-semibold">Total Demand</h3>
          <p>{total_demand} KWh</p>
        </div>
      </div>

      {/* Row Selection and Download Buttons */}
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
              <SelectItem value={String(demand_list.length)}>All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNavigate}
            className="bg-blue-500 text-white px-4 py-2 rounded">
            Power Procurement
          </button>
          <button
            onClick={() => handleDownload("xlsx")}
            className="bg-blue-500 text-white px-4 py-2 rounded">
            Download as Excel
          </button>
          <button
            onClick={() => handleDownload("csv")}
            className="bg-green-500 text-white px-4 py-2 rounded">
            Download as CSV
          </button>
        </div>
      </div>

      {/* Demand List Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">TimeStamp</th>
              <th className="py-2 px-4 border-b">Demand (Actual)</th>
              <th className="py-2 px-4 border-b">Demand (Pred)</th>
            </tr>
          </thead>
          <tbody>
            {demand_list.slice(0, rowsToShow).map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{item.TimeStamp}</td>
                <td className="py-2 px-4 border-b">{item["Demand(Actual)"]}</td>
                <td className="py-2 px-4 border-b">{item["Demand(Pred)"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
