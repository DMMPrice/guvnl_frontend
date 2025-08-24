import React from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import InputField from "@/Component/Utils/InputField.jsx";

export default function ConsumerForm({
                                         consumerOptions,              // [{ value: consumer_id, label: name }]
                                         selectedConsumerId,           // consumer_id
                                         setSelectedConsumerId,
                                         selectedConsumerLabel,        // name of selected consumer
                                         startDate,
                                         setStartDate,
                                         endDate,
                                         setEndDate,
                                         overuseMargin,
                                         setOveruseMargin,
                                         onApply,
                                     }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white shadow-md p-4 rounded-xl w-full">
            {/* Consumer (Name shown, ID sent) */}
            <div className="w-full md:w-[280px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consumer
                </label>
                <CustomSelect
                    options={consumerOptions.map(o => o.label)}  // show only names
                    value={selectedConsumerLabel || ""}
                    placeholder="Select Consumer"
                    className="w-full"
                    onChange={(label) => {
                        const found = consumerOptions.find(o => o.label === label);
                        setSelectedConsumerId(found?.value || "");
                    }}
                />
                <p className="mt-1 text-xs text-gray-500">
                    Sending ID: <span className="font-medium">{selectedConsumerId || "-"}</span>
                </p>
            </div>

            {/* Start / End */}
            <div className="w-full md:w-[360px]">
                <BasicDateTimePicker label="Start Date & Time" value={startDate} onChange={setStartDate}/>
            </div>
            <div className="w-full md:w-[360px]">
                <BasicDateTimePicker label="End Date & Time" value={endDate} onChange={setEndDate}/>
            </div>

            {/* Overuse Margin */}
            <div className="w-full md:w-[200px]">
                <InputField
                    label="Overuse Margin (0–1)"
                    type="number"
                    value={overuseMargin}
                    onChange={(e) => setOveruseMargin(Number(e.target.value))}
                />
            </div>

            <button
                type="button"
                onClick={onApply}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition w-full md:w-auto"
            >
                Apply
            </button>
        </div>
    );
}
