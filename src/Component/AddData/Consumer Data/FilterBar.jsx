// src/Component/Dashboards/FeederDtrConsumerTable/FilterBar.jsx
import React from "react";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

export default function FilterBar({
                                      feederList, dtrList,
                                      feederId, dtrId,
                                      onFeederChange, onDtrChange,
                                      onApply, onClear
                                  }) {
    return (
        <div className="flex flex-wrap gap-4 items-end mb-6">
            {/* Feeder dropdown */}
            <CustomSelect
                placeholder="Select Feeder"
                options={feederList.map(f => f.feeder_id)}
                value={feederId}
                onChange={onFeederChange}
                className="w-56"
            />

            {/* DTR dropdown */}
            <CustomSelect
                placeholder="Select DTR"
                options={dtrList.map(d => d.dtr_id)}
                value={dtrId}
                onChange={onDtrChange}
                className="w-56"
            />

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
    );
}