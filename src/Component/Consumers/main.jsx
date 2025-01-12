import React, { useState, useEffect } from "react";
import CommonTable from "../Utils/CommonTable";
import { Loader2 } from "lucide-react";

export default function Consumers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { header: "Consumer Code", key: "Consumer_Code" },
    { header: "Station Type", key: "Station_Type" },
  ];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}consumer/`)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] p-4 m-4">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 m-4">
      <CommonTable
        title="Consumer Details"
        caption="Table showing consumer details"
        columns={columns}
        data={data}
      />
    </div>
  );
}
