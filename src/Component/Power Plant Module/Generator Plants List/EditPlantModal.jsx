// src/Component/Dashboard/EditPlantModal.jsx
import React, {useState, useEffect} from "react";
import {API_URL} from "@/config.js";
import {FaTimes} from "react-icons/fa";
import InputField from "@/Component/Utils/InputField.jsx";

export default function EditPlantModal({isOpen, plant, onClose, onSave}) {
    const [formData, setFormData] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Seed form data when modal opens or plant changes
    useEffect(() => {
        if (plant) {
            setFormData({...plant});
        }
    }, [plant]);

    if (!isOpen || !plant) return null;

    const isMustRun = formData.Type === "Must run";

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            const endpoint = `${API_URL}plant/${encodeURIComponent(formData.Code)}`;
            const payload = {
                // required by API
                Name: formData.name || "",
                Code: formData.Code || "",
                Ownership: formData.Ownership || "",
                Fuel_Type: formData.Fuel_Type || "",
                Type: formData.Type || "",
                Rated_Capacity: Number(formData.Rated_Capacity) || 0,
                PAF: Number(formData.PAF) || 0,
                PLF: Number(formData.PLF) || 0,
                Aux_Consumption: Number(formData.Aux_Consumption) || 0,
                Variable_Cost: Number(formData.Variable_Cost) || 0,
                Technical_Minimum: Number(formData.Technical_Minimum) || 0,
                Max_Power: Number(formData.Max_Power) || 0,
                Min_Power: Number(formData.Min_Power) || 0,
            };

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                console.error("Update failed:", await res.text());
                return;
            }
            const updated = await res.json();
            onSave(updated);
            onClose();
        } catch (err) {
            console.error("Error updating plant:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFieldChange = (field) => (e) => {
        const value = e.target.value;
        setFormData((f) => ({...f, [field]: value}));
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-full p-6 relative">
                <button
                    onClick={onClose}
                    disabled={isUpdating}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                >
                    <FaTimes size={20}/>
                </button>

                <h2 className="text-xl font-semibold mb-4">Edit {plant.name}</h2>

                {/* Required string fields */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <InputField
                        label="Name"
                        value={formData.name || ""}
                        onChange={handleFieldChange("name")}
                    />
                    <InputField
                        label="Code"
                        value={formData.Code || ""}
                        onChange={handleFieldChange("Code")}
                    />
                    <InputField
                        label="Ownership"
                        value={formData.Ownership || ""}
                        onChange={handleFieldChange("Ownership")}
                    />
                    <InputField
                        label="Fuel Type"
                        value={formData.Fuel_Type || ""}
                        onChange={handleFieldChange("Fuel_Type")}
                    />
                    <InputField
                        label="Type"
                        value={formData.Type || ""}
                        onChange={handleFieldChange("Type")}
                    />
                </div>

                {/* Numeric fields */}
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Capacity (MW)"
                        type="number"
                        value={formData.Rated_Capacity}
                        onChange={handleFieldChange("Rated_Capacity")}
                    />
                    <InputField
                        label="PAF"
                        type="number"
                        step="0.01"
                        value={formData.PAF}
                        onChange={handleFieldChange("PAF")}
                    />
                    <InputField
                        label="PLF"
                        type="number"
                        step="0.01"
                        value={formData.PLF}
                        onChange={handleFieldChange("PLF")}
                    />
                    <InputField
                        label="Variable Cost"
                        type="number"
                        step="0.01"
                        value={formData.Variable_Cost}
                        onChange={handleFieldChange("Variable_Cost")}
                    />
                    <InputField
                        label="Technical Min (%)"
                        type="number"
                        step="0.01"
                        value={formData.Technical_Minimum}
                        onChange={handleFieldChange("Technical_Minimum")}
                    />
                    <InputField
                        label="Max Power"
                        type="number"
                        value={formData.Max_Power}
                        onChange={handleFieldChange("Max_Power")}
                    />
                    <InputField
                        label="Aux Consumption"
                        type="number"
                        step="0.01"
                        value={formData.Aux_Consumption}
                        onChange={handleFieldChange("Aux_Consumption")}
                    />
                    {isMustRun && (
                        <InputField
                            label="Min Power"
                            type="number"
                            value={formData.Min_Power}
                            onChange={handleFieldChange("Min_Power")}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded text-white ${
                            isUpdating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}