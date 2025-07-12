// src/Component/Dashboards/Plant Wise Procurement Dashboard/procurementForm.jsx
import React from 'react';
import BasicDateTimePicker from '@/Component/Utils/DateTimeBlock.jsx';

export default function ProcurementForm({
                                            loading,
                                            startDateTime,
                                            setStartDateTime,
                                            endDateTime,
                                            setEndDateTime,
                                            handleSubmit,
                                            onCancel = () => {
                                                setStartDateTime(null);
                                                setEndDateTime(null);
                                            },
                                            onShowPowerBI = () => {
                                                console.log('Show in Power BI');
                                            },
                                        }) {
    return (
        <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-screen-2xl mx-auto">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Start Date & Time */}
                    <BasicDateTimePicker
                        label="Start Date & Time"
                        value={startDateTime}
                        onChange={setStartDateTime}
                    />

                    {/* End Date & Time */}
                    <BasicDateTimePicker
                        label="End Date & Time"
                        value={endDateTime}
                        onChange={setEndDateTime}
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* Apply */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
              px-6 py-3
              bg-blue-600 text-white font-semibold
              rounded-lg
              shadow-md
              hover:bg-blue-700 hover:shadow-lg
              transform hover:-translate-y-0.5
              transition
            "
                    >
                        {loading ? 'Applying…' : 'Apply'}
                    </button>

                    {/* Cancel */}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
              px-6 py-3
              bg-gray-300 text-gray-900 font-medium
              rounded-lg
              shadow-md
              hover:bg-gray-400 hover:shadow-lg
              transform hover:-translate-y-0.5
              transition
            "
                    >
                        Cancel
                    </button>

                    {/* Show in Power BI */}
                    <button
                        type="button"
                        onClick={onShowPowerBI}
                        className="
              px-6 py-3
              bg-green-600 text-white font-semibold
              rounded-lg
              shadow-md
              hover:bg-green-700 hover:shadow-lg
              transform hover:-translate-y-0.5
              transition
            "
                    >
                        Show in Power BI
                    </button>
                </div>
            </form>
        </div>
    );
}