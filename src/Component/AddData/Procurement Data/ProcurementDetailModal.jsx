// src/Component/Dashboard/ProcurementDetailModal.jsx
import React from "react";
import {createPortal} from "react-dom";
import CommonTable from "@/Component/Utils/CommonTable.jsx";

export default function ProcurementDetailModal({
                                                   isOpen,
                                                   onClose,
                                                   data,
                                                   columns,
                                                   isEditing = false,
                                                   onSave,
                                               }) {
    if (!isOpen || !data) return null;

    const [formData, setFormData] = React.useState(data);

    React.useEffect(() => {
        if (isEditing) {
            setFormData(data);
        }
    }, [data, isEditing]);

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const mount = document.body;

    const MUST_RUN_COLUMNS = [
        {accessor: "plant_name", header: "Plant Name"},
        {accessor: "plant_code", header: "Code"},
        {accessor: "Rated_Capacity", header: "Rated Capacity"},
        {accessor: "Variable_Cost", header: "Variable Cost"},
        {accessor: "generated_energy", header: "Generated Energy"},
        {accessor: "net_cost", header: "Net Cost"},
    ];

    const OTHER_COLUMNS = [
        {accessor: "plant_name", header: "Plant Name"},
        {accessor: "plant_code", header: "Code"},
        {accessor: "rated_capacity", header: "Rated Capacity"},
        {accessor: "Variable_Cost", header: "Variable Cost"},
        {accessor: "generated_energy", header: "Generated Energy"},
        {accessor: "net_cost", header: "Net Cost"},
        {accessor: "backdown_cost", header: "Backdown Cost"},
        {accessor: "backdown_rate", header: "Backdown Rate"},
    ];

    const content = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}/>

            {/* panel */}
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-semibold">Procurement Details</h2>
                    <div className="flex gap-4">
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Save
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 text-3xl leading-none"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                {/* body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* key/value list */}
                    <div className="grid grid-cols-1 gap-y-3">
                        {columns.map(col => {
                            const value = isEditing ? formData[col.accessor] : data[col.accessor];
                            return (
                                <div key={col.accessor} className="flex">
                                    <div className="w-1/3 font-medium text-gray-700">{col.header}</div>
                                    <div className="w-2/3">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="w-full border rounded px-2 py-1"
                                                value={value ?? ""}
                                                onChange={e => handleChange(col.accessor, e.target.value)}
                                            />
                                        ) : col.render ? (
                                            col.render(data)
                                        ) : (
                                            value != null ? value.toString() : "-"
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* must-run plants */}
                    {Array.isArray(data.must_run) && data.must_run.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Must-Run Plants</h3>
                            <CommonTable
                                title={null}
                                columns={MUST_RUN_COLUMNS}
                                data={data.must_run}
                                footer={null}
                            />
                        </div>
                    )}

                    {/* other plants */}
                    {Array.isArray(data.remaining_plants) && data.remaining_plants.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Other Plants</h3>
                            <CommonTable
                                title={null}
                                columns={OTHER_COLUMNS}
                                data={data.remaining_plants}
                                footer={null}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(content, mount);
}