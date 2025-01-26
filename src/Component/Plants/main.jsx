import React, { useEffect, useState } from "react";
import CommonTable from "../Utils/CommonTable";
import PlantInfoCards from "./PlantInfoCards";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditPlantModal from "./EditPlantModal"; // Import the edit modal
import DeleteConfirmationModal from "./DeleteConfirmationModal"; // Import the delete confirmation modal
import AddPlantModal from "./AddPlantModal"; // Import the add modal

function Plants() {
  const [plantData, setPlantData] = useState({
    must_run: [],
    other: [],
    must_run_count: 0,
    other_count: 0,
  });

  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePlantCode, setDeletePlantCode] = useState(null);

  useEffect(() => {
    if (!Array.isArray(plantData.must_run) || !Array.isArray(plantData.other)) {
      console.error("Invalid plant data structure");
      setPlantData({
        must_run: [],
        other: [],
        must_run_count: 0,
        other_count: 0,
      });
    } else if (!plantData.must_run.length && !plantData.other.length) {
      fetchPlantData();
    }
  }, []);

  const fetchPlantData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}procurement/plant`
      );
      const data = await response.json();
      if (data.must_run && data.other) {
        setPlantData(data);
      } else {
        console.error("Invalid data format from API");
      }
    } catch (error) {
      console.error("Error fetching plant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async (newPlant) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}procurement/plant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPlant),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Show success message

        // Refresh the plant data to include the newly added plant
        await fetchPlantData();
      } else {
        console.error("Failed to add plant:", response.statusText);
        alert("Failed to add plant. Please try again.");
      }
    } catch (error) {
      console.error("Error adding plant:", error);
      alert("An error occurred while adding the plant.");
    } finally {
      setIsAddModalOpen(false); // Close the Add Plant modal
    }
  };

  const handleEdit = (plant) => {
    setSelectedPlant(plant);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedPlant) => {
    setPlantData((prevState) => ({
      ...prevState,
      other: prevState.other.map((plant) =>
        plant.Code === updatedPlant.Code ? updatedPlant : plant
      ),
      must_run: prevState.must_run.map((plant) =>
        plant.Code === updatedPlant.Code ? updatedPlant : plant
      ),
    }));
    await fetchPlantData(); // Optionally, fetch the latest data to sync state
    setIsEditModalOpen(false);
  };

  const handleDelete = (plantCode) => {
    setDeletePlantCode(plantCode);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/procurement/plant", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Code: deletePlantCode }), // Send the plant code in the body
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Plant deleted successfully"); // Show success message

        // Reload the state by fetching updated plant data from the server
        await fetchPlantData();
      } else {
        console.error("Failed to delete plant:", response.statusText);
        alert("Failed to delete plant. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting plant:", error);
      alert("An error occurred while deleting the plant.");
    } finally {
      setIsDeleteModalOpen(false); // Close the delete confirmation modal
      setDeletePlantCode(null); // Clear the selected plant code
    }
  };

  const columns = [
    { header: "Plant Name", accessor: "name" },
    { header: "Plant Code", accessor: "Code" },
    { header: "Plant Capacity (MW)", accessor: "Rated_Capacity" },
    { header: "PAF", render: (row) => `${(row.PAF * 100).toFixed(2)}%` },
    { header: "PLF", render: (row) => `${(row.PLF * 100).toFixed(2)}%` },
    {
      header: "Aux Consumption",
      render: (row) => `${(row.Aux_Consumption * 100).toFixed(2)}%`,
    },
    {
      header: "Technical Minimum",
      render: (row) => `${(row.Technical_Minimum * 100).toFixed(2)}%`,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-5">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleEdit(row)}>
            <FaEdit size={20} className="inline-block" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(row.Code)}>
            <FaTrash size={20} className="inline-block" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4">
      {/* Info Cards */}
      <div className="flex justify-center space-x-4 my-6">
        <PlantInfoCards
          mustRunCount={plantData.must_run_count}
          otherCount={plantData.other_count}
        />
      </div>

      {/* Add Plant Button */}
      <div className="flex justify-between items-center mb-4 px-10">
        <h2 className="text-xl font-bold">Other Plants</h2>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setIsAddModalOpen(true)}>
          Add Plant
        </button>
      </div>

      {/* Other Plants Table */}
      <div className="mx-10 px-3">
        {Array.isArray(plantData.other) ? (
          <CommonTable title="" columns={columns} data={plantData.other} />
        ) : (
          <div>No data available for other plants.</div>
        )}
      </div>
      <div className="flex justify-between items-center mb-4 px-10">
        <h2 className="text-xl font-bold">Must Run Plants</h2>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setIsAddModalOpen(true)}>
          Add Plant
        </button>
      </div>
      <div className="mx-10 px-3">
        {Array.isArray(plantData.must_run) ? (
          <CommonTable title="" columns={columns} data={plantData.must_run} />
        ) : (
          <div>No data available for must-run plants.</div>
        )}
      </div>

      {/* Modals */}
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPlant}
      />
      <EditPlantModal
        isOpen={isEditModalOpen}
        plant={selectedPlant}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Plants;
