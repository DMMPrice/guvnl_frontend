import React, { useEffect, useState } from "react";
import CustomSelect from "../Utils/CustomSelect";
import CommonTable from "../Utils/CommonTable";
import { API_URL } from "../../config";

function Banking() {
  const [consumerCodes, setConsumerCodes] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState("");
  const [consumerData, setConsumerData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch consumer codes from the API
  useEffect(() => {
    const fetchConsumerCodes = async () => {
      try {
        const response = await fetch(`${API_URL}consumer/`);
        const data = await response.json();
        const consumerCodes = data.map((item) => item.Consumer_Code);
        setConsumerCodes(consumerCodes);
      } catch (error) {
        console.error("Error fetching consumer codes:", error);
      }
    };

    fetchConsumerCodes();
  }, []);

  // Fetch data when a consumer code is selected
  useEffect(() => {
    if (!selectedConsumer) return;

    const fetchConsumerData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}consumer/${selectedConsumer}`);
        const data = await response.json();
        setConsumerData(data);
      } catch (error) {
        console.error("Error fetching consumer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumerData();
  }, [selectedConsumer]);

  const handleSelectChange = (value) => {
    setSelectedConsumer(value);
  };

  // Columns to display in the table in the specified order
  const columns = [
    { header: "Date", accessor: "Date" },
    { header: "Date Text", accessor: "Date_text" },
    { header: "Time Slot", accessor: "Time Slot" },
    { header: "Total Consumption", accessor: "Total Consumption" },
    { header: "Adjusted Unit", accessor: "Adjusted_Unit" },
    { header: "Adjustment Charges", accessor: "Adjustment Charges" },
    { header: "Banking Charges", accessor: "Banking Charges" },
    { header: "Banking Cumulative", accessor: "Banking_Cumulative" },
    { header: "Banking Unit", accessor: "Banking_Unit" },
    {
      header: "Injection of Electricity (15 min)",
      accessor: "Injection of Electricity during 15 min.",
    },
    { header: "MOD Price", accessor: "MOD_Price" },
    { header: "Net Injection/Drawal", accessor: "Net Injection/ Drawal" },
  ];

  return (
    <div className="max-w-full mx-auto mt-5 p-3 shadow-md rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select Consumer Code
      </h2>
      <CustomSelect
        options={consumerCodes}
        value={selectedConsumer}
        onChange={handleSelectChange}
        placeholder="Select a Consumer Code"
      />

      {selectedConsumer && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">
            Data for Consumer Code: {selectedConsumer}
          </h3>
          {loading ? (
            <p className="text-center mt-4">Loading data...</p>
          ) : (
            <CommonTable
              title="Consumer Data Table"
              caption={`Data for Consumer: ${selectedConsumer}`}
              columns={columns}
              data={consumerData}
              footer={{
                totalLabels: [
                  {
                    content: "End of Data",
                    className: "text-center font-bold",
                  },
                ],
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Banking;
