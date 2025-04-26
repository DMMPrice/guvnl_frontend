import React from "react";
import BasicDatePicker from "@/Component/Utils/BasicDatePicker"; // adjust path if needed

export default function BankingFilter({
                                          startDate,
                                          endDate,
                                          setStartDate,
                                          setEndDate,
                                          handleApply,
                                          handleClear,
                                          handleDownloadCSV,
                                          handleDownloadPowerBI,
                                      }) {
    return (
        <div className="flex flex-wrap items-end gap-4 mb-6 p-6 pl-10 m-10 bg-gray-200 rounded-lg shadow-md">
            <div className="min-w-[220px]">
                <BasicDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                />
            </div>

            <div className="min-w-[220px]">
                <BasicDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                />
            </div>

            <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                Apply
            </button>
            <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
            >
                Clear
            </button>
            <button
                onClick={handleDownloadCSV}
                disabled={!startDate || !endDate}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
                Download CSV
            </button>
            <button
                onClick={handleDownloadPowerBI}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
                Show in PowerBI
            </button>
        </div>
    );
}