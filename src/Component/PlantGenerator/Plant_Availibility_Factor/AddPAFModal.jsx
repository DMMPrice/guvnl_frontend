// src/Component/Dashboard/AddPAFModal.jsx
import React, {useState, useEffect} from "react";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";
import {API_URL} from "@/config.js";

const defaultForm = {
    Code: "",
    name: "",
    Jan: "Y", Feb: "Y", Mar: "Y", Apr: "Y",
    May: "Y", Jun: "Y", Jul: "Y", Aug: "Y",
    Sep: "Y", Oct: "Y", Nov: "Y", Dec: "Y",
};

export default function AddPAFModal({isOpen, onClose, onSave}) {
    const [form, setForm] = useState(defaultForm);
    const [plants, setPlants] = useState([]);
    const [existingCodes, setExistingCodes] = useState([]);
    const [error, setError] = useState("");

    // Load plant list & existing PAF codes when modal opens
    useEffect(() => {
        if (!isOpen) return;

        // Fetch list of all plants
        fetch(`${API_URL}plant/all`)
            .then((r) => r.json())
            .then(setPlants)
            .catch(console.error);

        // Fetch existing PAF records to prevent duplicates
        fetch(`${API_URL}availability/`)
            .then((r) => r.json())
            .then((data) => setExistingCodes(data.map((rec) => rec.Code)))
            .catch(console.error);
    }, [isOpen]);

    // Handle selection of a plant name
    const handleNameSelect = (name) => {
        const plant = plants.find((p) => p.name === name);
        if (!plant) return;

        // Duplicate check
        if (existingCodes.includes(plant.Code)) {
            setError(`PAF record for “${plant.name}” already exists.`);
        } else {
            setError("");
        }

        // Update form with selected plant's code and name
        setForm((f) => ({
            ...f,
            Code: plant.Code,
            name: plant.name,
        }));
    };

    // Handle month flag changes
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || error) return;
        onSave(form);
        setForm(defaultForm);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-lg w-full max-w-lg grid grid-cols-2 gap-4"
            >
                <h3 className="col-span-2 text-xl font-bold">Add PAF Record</h3>

                {/* Plant name selector (exclude those already in existingCodes) */}
                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">Plant Name</label>
                    <CustomSelect
                        options={plants
                            .filter((p) => !existingCodes.includes(p.Code))
                            .map((p) => p.name)}
                        value={form.name}
                        onChange={handleNameSelect}
                        placeholder="Select plant name"
                        className="w-full"
                    />
                </div>

                {/* Hidden code field (sent on save) */}
                <input type="hidden" name="Code" value={form.Code}/>

                {/* Error message if duplicate */}
                {error && <p className="col-span-2 text-red-600">{error}</p>}

                {/* Month flags */}
                {Object.keys(defaultForm)
                    .filter((k) => k.length === 3)
                    .map((mon) => (
                        <div key={mon} className="flex items-center space-x-2">
                            <label className="w-8 text-gray-700">{mon}</label>
                            <select
                                name={mon}
                                value={form[mon]}
                                onChange={handleChange}
                                className="border-gray-300 rounded p-1 flex-1"
                            >
                                <option value="Y">Y</option>
                                <option value="N">N</option>
                            </select>
                        </div>
                    ))}

                {/* Actions */}
                <div className="col-span-2 flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!form.name || !!error}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}