import React from "react";
import CommonTable from "../Utils/CommonTable";

export default function ShowData({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available.</div>;
  }

  const columns = [
    { header: "Time Stamp", key: "Time Stamp" },
    { header: "Cost Per Block", key: "Cost Per Block" },
    { header: "Demand Actual", key: "Demand Actual" },
    { header: "Demand Predicted", key: "Demand Predicted" },
    { header: "IEX Cost", key: "IEX Cost" },
    { header: "Last Price", key: "Last Price" },
    {
      header: "Total Must Run Generated (kWh)",
      key: "Total Must Run Generated (kWh)",
    },
    {
      header: "Total Remaining Generated (kWh)",
      key: "Total Remaining Generated (kWh)",
    },
    {
      header: "Total IEX Data Generated (kWh)",
      key: "Total IEX Data Generated (kWh)",
    },
    {
      header: "Total Must Run Generated Cost (Rs)",
      key: "Total Must Run Generated Cost (Rs)",
    },
    {
      header: "Total Remaining Generated Cost (Rs)",
      key: "Total Remaining Generated Cost (Rs)",
    },
    { header: "Total Cost (Rs)", key: "Total Cost (Rs)" },
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
