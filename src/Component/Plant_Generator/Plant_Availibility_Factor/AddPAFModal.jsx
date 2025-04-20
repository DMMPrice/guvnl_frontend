import React, {useState} from "react";

const defaultForm = {
    Code: "",
    name: "",
    Jan: "Y", Feb: "Y", Mar: "Y", Apr: "Y",
    May: "Y", Jun: "Y", Jul: "Y", Aug: "Y",
    Sep: "Y", Oct: "Y", Nov: "Y", Dec: "Y",
};

export default function AddPAFModal({isOpen, onClose, onSave}) {
    const [form, setForm] = useState(defaultForm);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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

                <input
                    name="Code"
                    placeholder="Code"
                    value={form.Code}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded col-span-2"
                />
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded col-span-2"
                />

                {Object.keys(defaultForm)
                    .filter((k) => k.length === 3) // months only
                    .map((mon) => (
                        <div key={mon} className="flex items-center space-x-2">
                            <label className="w-8">{mon}</label>
                            <select
                                name={mon}
                                value={form[mon]}
                                onChange={handleChange}
                                className="border p-1 rounded flex-1"
                            >
                                <option value="Y">Y</option>
                                <option value="N">N</option>
                            </select>
                        </div>
                    ))}

                <div className="col-span-2 flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}