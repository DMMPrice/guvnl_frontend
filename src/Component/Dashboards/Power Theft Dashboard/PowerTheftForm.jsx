import React, {useEffect, useState} from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import {API_URL} from "@/config.js";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx"; // your reusable dropdown

export default function PowerTheftForm({
                                           loading,
                                           customerId,
                                           setCustomerId,
                                           startDateTime,
                                           setStartDateTime,
                                           endDateTime,
                                           setEndDateTime,
                                           overuseMargin,
                                           setOveruseMargin,
                                           handleSubmit,
                                           consumerApi,
                                           onCancel = () => {
                                               setCustomerId("DTR1_USER1");
                                               setStartDateTime("2021-04-01 00:00:00");
                                               setEndDateTime("2021-04-02 00:00:00");
                                               setOveruseMargin(0.15);
                                           },
                                       }) {
    const [consumers, setConsumers] = useState([]);
    const [consumersLoading, setConsumersLoading] = useState(false);

    const ENDPOINT = consumerApi || `${API_URL}consumer`;

    useEffect(() => {
        const fetchConsumers = async () => {
            setConsumersLoading(true);
            try {
                const resp = await fetch(ENDPOINT);
                const data = await resp.json();
                if (Array.isArray(data) && data.length > 0) {
                    setConsumers(data);
                    // 👇 auto select first if none is set
                    if (!customerId) {
                        setCustomerId(data[0].consumer_id);
                    }
                } else {
                    setConsumers([]);
                }
            } catch (err) {
                setConsumers([]);
            } finally {
                setConsumersLoading(false);
            }
        };
        fetchConsumers();
    }, [ENDPOINT, customerId, setCustomerId]);

    // Build options
    const options = consumers.map((c) => ({
        label: c.name,
        value: c.consumer_id,
    }));

    const selectedOption =
        options.find((opt) => opt.value === customerId)?.label || "";

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 w-full">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e); // customerId already holds the consumer_id
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <BasicDateTimePicker
                        label="Start Date & Time"
                        value={startDateTime}
                        onChange={setStartDateTime}
                    />

                    <BasicDateTimePicker
                        label="End Date & Time"
                        value={endDateTime}
                        onChange={setEndDateTime}
                    />

                    {/* Consumer dropdown */}
                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">Consumer</label>
                        {consumersLoading ? (
                            <div className="px-3 py-2 border rounded-md text-gray-500">
                                Loading…
                            </div>
                        ) : (
                            <CustomSelect
                                options={options.map((o) => o.label)}
                                value={selectedOption}
                                placeholder="Select Consumer"
                                onChange={(label) => {
                                    const selected = options.find((o) => o.label === label);
                                    setCustomerId(selected?.value || "");
                                }}
                            />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 font-medium">
                            Overuse Margin
                            <span className="text-gray-500 font-normal">
                {" "}
                                (0–1, e.g., 0.15)
              </span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            className="border rounded-lg px-3 py-2"
                            value={overuseMargin}
                            onChange={(e) => setOveruseMargin(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition"
                    >
                        {loading ? "Applying…" : "Apply"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-300 text-gray-900 font-medium rounded-lg shadow-md hover:bg-gray-400 hover:shadow-lg transform hover:-translate-y-0.5 transition"
                    >
                        Reset Defaults
                    </button>
                </div>
            </form>
        </div>
    );
}
