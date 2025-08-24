// src/Component/Dashboards/SubstationFeederDashboard/FilterBar.jsx
import React from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

export default function FilterBar({
                                      startDate,
                                      endDate,
                                      feederName,
                                      substationId,
                                      feederList,
                                      onStartDateChange,
                                      onEndDateChange,
                                      onFeederChange,
                                      onSubstationChange,
                                      onApply,
                                      onClear,
                                      onDownload,
                                  }) {
    return (
        <div className="flex flex-col gap-2 mb-6">
            {/* Row 1: filters + apply/clear */}
            <div className="flex flex-wrap items-end gap-4">
                <BasicDateTimePicker
                    label="Start Date"
                    value={startDate}
                    onChange={onStartDateChange}
                    textFieldProps={{className: "w-56"}}
                />
                <BasicDateTimePicker
                    label="End Date"
                    value={endDate}
                    onChange={onEndDateChange}
                    textFieldProps={{className: "w-56"}}
                />
                <CustomSelect
                    placeholder="Select Feeder"
                    options={["All", ...feederList.map(f => f.feeder_name)]}
                    value={feederName}
                    onChange={onFeederChange}
                    className="w-48"
                />
                <CustomSelect
                    placeholder="Select Substation"
                    options={[substationId]}
                    value={substationId}
                    onChange={onSubstationChange}
                    className="w-48"
                />
                <div className="ml-auto flex gap-3">
                    <button
                        onClick={onApply}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Apply
                    </button>
                    <button
                        onClick={onClear}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Row 2: download */}
            <div className="flex justify-end">
                <button
                    onClick={onDownload}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Download CSV
                </button>
            </div>
        </div>
    );
}