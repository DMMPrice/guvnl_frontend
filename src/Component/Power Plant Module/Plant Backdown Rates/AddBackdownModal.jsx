import React, {useState, useEffect} from "react";

export default function AddBackdownModal({isOpen, onClose, onSave}) {
    const defaultForm = {
        Start_Load: "",
        End_Load: "",
        SHR: "",
        Aux_Consumption: "",
    };
    const [form, setForm] = useState(defaultForm);

    // reset when opened
    useEffect(() => {
        if (isOpen) setForm(defaultForm);
    }, [isOpen]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            Start_Load: Number(form.Start_Load),
            End_Load: Number(form.End_Load),
            SHR: Number(form.SHR),
            Aux_Consumption: Number(form.Aux_Consumption),
        });
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-lg w-full max-w-md grid grid-cols-2 gap-4"
            >
                <h3 className="col-span-2 text-xl font-bold">Add Backdown Rate</h3>

                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">Start Load</label>
                    <input
                        type="number"
                        name="Start_Load"
                        value={form.Start_Load}
                        onChange={handleChange}
                        required
                        className="w-full border-gray-300 rounded p-2"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">End Load</label>
                    <input
                        type="number"
                        name="End_Load"
                        value={form.End_Load}
                        onChange={handleChange}
                        required
                        className="w-full border-gray-300 rounded p-2"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">SHR</label>
                    <input
                        type="number"
                        name="SHR"
                        value={form.SHR}
                        onChange={handleChange}
                        required
                        className="w-full border-gray-300 rounded p-2"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Aux Consumption</label>
                    <input
                        type="number"
                        step="0.01"
                        name="Aux_Consumption"
                        value={form.Aux_Consumption}
                        onChange={handleChange}
                        required
                        className="w-full border-gray-300 rounded p-2"
                    />
                </div>

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
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}