import React, { useEffect, useState } from "react";
import CommonTable from "../Utils/CommonTable";
import PlantInfoCards from "./PlantInfoCards";

function Plants() {
  const [plantData, setPlantData] = useState(() => {
    const saved = localStorage.getItem("plantData");
    return saved
      ? JSON.parse(saved)
      : { must_run: [], other: [], must_run_count: 0, other_count: 0 };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!plantData.must_run.length && !plantData.other.length) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}procurement/plant`)
        .then((res) => res.json())
        .then((data) => {
          setPlantData(data);
          localStorage.setItem("plantData", JSON.stringify(data));
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [plantData]);

  const columns = [
    { header: "Plant Code", key: "Code" },
    { header: "Plant Capacity (MW)", key: "Rated_Capacity" },
    {
      header: "PAF",
      render: (row) => `${(row.PAF * 100).toFixed(2)}%`,
    },
    {
      header: "PLF",
      render: (row) => `${(row.PLF * 100).toFixed(2)}%`,
    },
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
      <PlantInfoCards
        mustRunCount={plantData.must_run_count}
        otherCount={plantData.other_count}
      />
      <div className="mx-10 px-4">
        <CommonTable
          title="Other Plants"
          columns={columns}
          data={plantData.other}
        />
        <CommonTable
          title="Must Run Plants"
          columns={columns}
          data={plantData.must_run}
        />
      </div>
    </div>
  );
}

export default Plants;
