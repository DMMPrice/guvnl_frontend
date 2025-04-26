import React from "react";
import CommonTable from "../../Utils/CommonTable.jsx";

export default function ShowData({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available.</div>;
  }

  const columns = [
    { header: "Time Stamp", accessor: "Time Stamp" },
    { header: "Cost Per Block", accessor: "Cost Per Block" },
    { header: "Demand Actual", accessor: "Demand Actual" },
    { header: "Demand Predicted", accessor: "Demand Predicted" },
    { header: "IEX Cost", accessor: "IEX Cost" },
    { header: "Last Price", accessor: "Last Price" },
    {
      header: "Total Must Run Generated (kWh)",
      accessor: "Total Must Run Generated (kWh)",
    },
    {
      header: "Total Remaining Generated (kWh)",
      accessor: "Total Remaining Generated (kWh)",
    },
    {
      header: "Total IEX Data Generated (kWh)",
      accessor: "Total IEX Data Generated (kWh)",
    },
    {
      header: "Total Must Run Generated Cost (Rs)",
      accessor: "Total Must Run Generated Cost (Rs)",
    },
    {
      header: "Total Remaining Generated Cost (Rs)",
      accessor: "Total Remaining Generated Cost (Rs)",
    },
    { header: "Total Cost (Rs)", accessor: "Total Cost (Rs)" },
  ];

  return (
    <CommonTable
      title="Procurement Data"
      columns={columns}
      data={data}
      caption="Data showing generation and costs."
    />
  );
}
