import React, { useEffect, useState } from "react";
import CommonTable from "../Utils/CommonTable";
import PlantInfoCards from "./PlantInfoCards";

function Plants() {
  const [plantData, setPlantData] = useState({
    must_run: [],
    other: [],
    must_run_count: 0,
    other_count: 0,
  });

  const [loading, setLoading] = useState(false);

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

  const columns = [
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
      {/* Center-align info cards */}
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
    </div>
  );
}

export default Plants;
