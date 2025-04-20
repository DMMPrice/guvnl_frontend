import React, { useState } from "react";

const AddPlantModal = ({ isOpen, onClose, onSave }) => {
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
    Type: "Must run", // Default value
    Technical_Minimum: "",
    Max_Power: "",
    Min_Power: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Pass the form data back to the parent
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
    onClose(); // Close the modal
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
              value={formData.PAF}
              onChange={handleChange}
              placeholder="PAF (%)"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="PLF"
              type="number"
              value={formData.PLF}
              onChange={handleChange}
              placeholder="PLF (%)"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="Aux_Consumption"
              type="number"
              value={formData.Aux_Consumption}
              onChange={handleChange}
              placeholder="Aux Consumption (%)"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="Variable_Cost"
              type="number"
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
              required>
              <option value="Must run">Must Run</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="Technical_Minimum"
              type="number"
              value={formData.Technical_Minimum}
              onChange={handleChange}
              placeholder="Technical Minimum"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="Max_Power"
              type="number"
              value={formData.Max_Power}
              onChange={handleChange}
              placeholder="Max Power"
              required
              className="w-full border p-2 rounded"
            />
            <input
              name="Min_Power"
              type="number"
              value={formData.Min_Power}
              onChange={handleChange}
              placeholder="Min Power"
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;
