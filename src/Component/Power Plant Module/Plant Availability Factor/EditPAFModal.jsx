// src/Component/Dashboard/EditPAFModal.jsx
import React, {useState, useEffect} from "react";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";  // adjust path if needed

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function EditPAFModal({isOpen, record, onClose, onSave}) {
    const [form, setForm] = useState({
        Code: "",
        name: "",
        Jan: "Y", Feb: "Y", Mar: "Y", Apr: "Y",
        May: "Y", Jun: "Y", Jul: "Y", Aug: "Y",
        Sep: "Y", Oct: "Y", Nov: "Y", Dec: "Y",
    });

    // Populate form when record changes
    useEffect(() => {
        if (!record) return;
        setForm({
            Code: record.Code,
            name: record.name || "",
            ...MONTHS.reduce((acc, m) => {
                acc[m] = record[m] || "N";
                return acc;
            }, {}),
        });
    }, [record]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-lg w-full max-w-lg grid grid-cols-2 gap-4"
            >
                <h3 className="col-span-2 text-xl font-bold">Edit PAF Record</h3>

                {/* Code (readonly) */}
                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">Code</label>
                    <input
                        type="text"
                        name="Code"
                        value={form.Code}
                        readOnly
                        className="w-full border-gray-300 rounded p-2 bg-gray-100"
                    />
                </div>

                {/* Name */}
                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded p-2"
                        required
                    />
                </div>

                {/* Month flags with CustomSelect */}
                {MONTHS.map((mon) => (
                    <div key={mon} className="flex items-center space-x-2">
                        <label className="w-8 text-gray-700">{mon}</label>
                        <CustomSelect
                            options={["Y", "N"]}
                            value={form[mon]}
                            onChange={(val) =>
                                setForm(f => ({...f, [mon]: val}))
                            }
                            placeholder="Select"
                            className="flex-1"
                        />
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
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}