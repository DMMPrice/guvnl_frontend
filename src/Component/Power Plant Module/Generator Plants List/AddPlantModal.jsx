// src/Component/Dashboard/AddPlantModal.jsx
import React, {useState, useEffect} from "react";

const AddPlantModal = ({isOpen, onClose, onSave}) => {
    const [formData, setFormData] = useState({
        Name: "",
        Code: "",
        Ownership: "",
        Fuel_Type: "",
        Rated_Capacity: "",
        PAF: "",
        PLF: "",
        Aux_Consumption: "",
        Variable_Cost: "",
        Type: "Must run",
        Technical_Minimum: "",
        // these will be computed
        Max_Power: "",
        Min_Power: "",
    });

    // Recalculate Max/Min Power whenever rated capacity, aux consumption or technical minimum change
    useEffect(() => {
        const rated = parseFloat(formData.Rated_Capacity) || 0;
        const aux = parseFloat(formData.Aux_Consumption) || 0;
        const techMin = parseFloat(formData.Technical_Minimum) || 0;

        const maxPower = rated * 0.25 * 1000 * (1 - aux);
        const minPower = maxPower * techMin;

        setFormData((prev) => ({
            ...prev,
            Max_Power: maxPower.toFixed(2),
            Min_Power: minPower.toFixed(2),
        }));
    }, [
        formData.Rated_Capacity,
        formData.Aux_Consumption,
        formData.Technical_Minimum,
    ]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // onSave will receive the computed Max_Power and Min_Power
        onSave(formData);
        setFormData({
            Name: "",
            Code: "",
            Ownership: "",
            Fuel_Type: "",
            Rated_Capacity: "",
            PAF: "",
            PLF: "",
            Aux_Consumption: "",
            Variable_Cost: "",
            Type: "Must run",
            Technical_Minimum: "",
            Max_Power: "",
            Min_Power: "",
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Add New Plant</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="Name"
                            type="text"
                            value={formData.Name}
                            onChange={handleChange}
                            placeholder="Plant Name"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Code"
                            type="text"
                            value={formData.Code}
                            onChange={handleChange}
                            placeholder="Plant Code"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Ownership"
                            type="text"
                            value={formData.Ownership}
                            onChange={handleChange}
                            placeholder="Ownership"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Fuel_Type"
                            type="text"
                            value={formData.Fuel_Type}
                            onChange={handleChange}
                            placeholder="Fuel Type"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Rated_Capacity"
                            type="number"
                            value={formData.Rated_Capacity}
                            onChange={handleChange}
                            placeholder="Rated Capacity (MW)"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="PAF"
                            type="number"
                            step="0.01"
                            value={formData.PAF}
                            onChange={handleChange}
                            placeholder="PAF (0–1)"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="PLF"
                            type="number"
                            step="0.01"
                            value={formData.PLF}
                            onChange={handleChange}
                            placeholder="PLF (0–1)"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Aux_Consumption"
                            type="number"
                            step="0.01"
                            value={formData.Aux_Consumption}
                            onChange={handleChange}
                            placeholder="Aux Consumption (0–1)"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            name="Variable_Cost"
                            type="number"
                            step="0.01"
                            value={formData.Variable_Cost}
                            onChange={handleChange}
                            placeholder="Variable Cost"
                            required
                            className="w-full border p-2 rounded"
                        />
                        <select
                            name="Type"
                            value={formData.Type}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="Must run">Must Run</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            name="Technical_Minimum"
                            type="number"
                            step="0.01"
                            value={formData.Technical_Minimum}
                            onChange={handleChange}
                            placeholder="Technical Minimum (0–1)"
                            required
                            className="w-full border p-2 rounded"
                        />

                        {/* Computed values (read-only) */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Max Power (kW)
                            </label>
                            <input
                                name="Max_Power"
                                type="number"
                                value={formData.Max_Power}
                                readOnly
                                className="w-full border p-2 rounded bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Min Power (kW)
                            </label>
                            <input
                                name="Min_Power"
                                type="number"
                                value={formData.Min_Power}
                                readOnly
                                className="w-full border p-2 rounded bg-gray-100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlantModal;