import React, { useState, useEffect } from "react";

function EditPlantModal({ isOpen, plant, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); // For handling loading state

  // Update the formData whenever the plant prop changes
  useEffect(() => {
    if (plant) {
      setFormData({ ...plant });
    }
  }, [plant]);

  if (!isOpen || !plant) return null; // Don't render if modal is closed or plant is not available

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsUpdating(true); // Set loading state
    const apiEndpoint = `${import.meta.env.VITE_API_URL}procurement/${
      formData.Code
    }`; // Dynamic endpoint based on plant code

    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: formData.Name || "",
          Code: formData.Code || "",
          Ownership: formData.Ownership || "Public",
          Fuel_Type: formData.Fuel_Type || "Coal",
          Rated_Capacity: Number(formData.Rated_Capacity) || 0,
          PAF: Number(formData.PAF) || 0,
          PLF: Number(formData.PLF) || 0,
          Aux_Consumption: Number(formData.Aux_Consumption) || 0,
          Variable_Cost: Number(formData.Variable_Cost) || 0,
          Type: formData.Type || "Other",
          Technical_Minimum: Number(formData.Technical_Minimum) || 0,
          Max_Power: Number(formData.Max_Power) || 0,
          Min_Power: Number(formData.Min_Power) || 0,
        }),
      });

      if (response.ok) {
        const updatedPlant = await response.json();
        onSave(updatedPlant); // Pass updated data back to parent
        onClose(); // Close the modal
      } else {
        console.error("Failed to update plant:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating plant:", error);
    } finally {
      setIsUpdating(false); // Reset loading state
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-80">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
        <h2 className="text-lg font-bold mb-4">Edit Plant Details</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Plant Code</label>
            <input
              type="text"
              name="Code"
              value={formData.Code || ""}
              onChange={handleChange}
              disabled
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Plant Capacity (MW)</label>
            <input
              type="number"
              name="Rated_Capacity"
              value={formData.Rated_Capacity || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">PAF</label>
            <input
              type="number"
              name="PAF"
              value={formData.PAF || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">PLF</label>
            <input
              type="number"
              name="PLF"
              value={formData.PLF || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Aux Consumption</label>
            <input
              type="number"
              name="Aux_Consumption"
              value={formData.Aux_Consumption || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Technical Minimum</label>
            <input
              type="number"
              name="Technical_Minimum"
              value={formData.Technical_Minimum || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Max Power</label>
            <input
              type="number"
              name="Max_Power"
              value={formData.Max_Power || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Min Power</label>
            <input
              type="number"
              name="Min_Power"
              value={formData.Min_Power || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 mt-1"
            />
          </div>
        </form>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={onClose}
            disabled={isUpdating}>
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white ${
              isUpdating ? "bg-gray-400" : "bg-red-500"
            }`}
            onClick={handleSave}
            disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPlantModal;
