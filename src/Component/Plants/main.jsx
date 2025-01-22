import React, { useEffect, useState } from "react";
import CommonTable from "../Utils/CommonTable";
import PlantInfoCards from "./PlantInfoCards";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditPlantModal from "./EditPlantModal"; // Import the edit modal
import DeleteConfirmationModal from "./DeleteConfirmationModal"; // Import the delete confirmation modal

function Plants() {
  const [plantData, setPlantData] = useState({
    must_run: [],
    other: [],
    must_run_count: 0,
    other_count: 0,
  });

  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}procurement/plant`)
        .then((res) => res.json())
        .then((data) => {
          if (data.must_run && data.other) {
            setPlantData(data);
            localStorage.setItem("plantData", JSON.stringify(data));
          } else {
            console.error("Invalid data format from API");
          }
        })
        .catch((err) => console.error("Error fetching plant data:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleEdit = (plant) => {
    setSelectedPlant(plant);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedPlant) => {
    setPlantData((prevState) => ({
      ...prevState,
      other: prevState.other.map((plant) =>
        plant.Code === updatedPlant.Code ? updatedPlant : plant
      ),
      must_run: prevState.must_run.map((plant) =>
        plant.Code === updatedPlant.Code ? updatedPlant : plant
      ),
    }));
    setIsEditModalOpen(false);
  };

  const handleDelete = (plantCode) => {
    setDeletePlantCode(plantCode);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setPlantData((prevState) => ({
      ...prevState,
      other: prevState.other.filter((plant) => plant.Code !== deletePlantCode),
      must_run: prevState.must_run.filter(
        (plant) => plant.Code !== deletePlantCode
      ),
    }));
    setIsDeleteModalOpen(false);
    setDeletePlantCode(null);
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
      <div className="flex justify-center space-x-4 my-6">
        <PlantInfoCards
          mustRunCount={plantData.must_run_count}
          otherCount={plantData.other_count}
        />
      </div>
      <div className="mx-10 px-4">
        {Array.isArray(plantData.other) ? (
          <CommonTable
            title="Other Plants"
            columns={columns}
            data={plantData.other}
          />
        ) : (
          <div>No data available for other plants.</div>
        )}
        {Array.isArray(plantData.must_run) ? (
          <CommonTable
            title="Must Run Plants"
            columns={columns}
            data={plantData.must_run}
          />
        ) : (
          <div>No data available for must-run plants.</div>
        )}
      </div>

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
