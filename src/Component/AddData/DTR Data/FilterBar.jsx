// src/Component/Dashboards/***/FilterBar.jsx
import React from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

/**
 * Generic filter row for dashboards.
 *
 * Props (new)
 * -----------
 * • hideDtr (Boolean)   — if true, the DTR dropdown is not rendered
 */
export default function FilterBar({
                                      /* existing props */
                                      startDate,
                                      endDate,
                                      feederName,   // or feederId
                                      dtrId,
                                      feederList,
                                      dtrList,
                                      onStartDateChange,
                                      onEndDateChange,
                                      onFeederChange,
                                      onDtrChange,
                                      onApply,
                                      onClear,
                                      onDownload,
                                      /* new */
                                      hideDtr = false,
                                  }) {
    return (
        <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-wrap items-end gap-4">
                {/* date pickers (optional – remove if not needed) */}
                {startDate !== undefined && (
                    <BasicDateTimePicker
                        label="Start Date"
                        value={startDate}
                        onChange={onStartDateChange}
                        textFieldProps={{className: "w-56"}}
                    />
                )}
                {endDate !== undefined && (
                    <BasicDateTimePicker
                        label="End Date"
                        value={endDate}
                        onChange={onEndDateChange}
                        textFieldProps={{className: "w-56"}}
                    />
                )}

                {/* Feeder selector */}
                <CustomSelect
                    placeholder="Select Feeder"
                    options={feederList.map((f) => f.feeder_id || f.feeder_name)}
                    value={feederName}
                    onChange={onFeederChange}
                    className="w-56"
                />

                {/* DTR selector (optional) */}
                {!hideDtr && (
                    <CustomSelect
                        placeholder="Select DTR"
                        options={dtrList.map((d) => d.dtr_id)}
                        value={dtrId}
                        onChange={onDtrChange}
                        className="w-56"
                    />
                )}

                {/* buttons */}
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
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Download CSV
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}