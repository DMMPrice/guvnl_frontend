import React, { useEffect, useState } from "react";
import CustomSelect from "../../Utils/CustomSelect.jsx";
import InfoCard from "../../Utils/InfoCard.jsx";
import CommonTable from "../../Utils/CommonTable.jsx";
import { API_URL } from "../../../config.js";
import {
  FaKey,
  FaIndustry,
  FaFire,
  FaBolt,
  FaBatteryFull,
  FaBriefcase,
} from "react-icons/fa";

function CodeDetails() {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [codeDetails, setCodeDetails] = useState(null);
  const [loading, setLoading] = useState(true); // For dropdown options
  const [loadingTable, setLoadingTable] = useState(false); // For table data
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}plant/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error("Error fetching codes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const handleSelectChange = async (code) => {
    setSelectedOption(code);

    const details = options.find((option) => option.Code === code);
    setCodeDetails(details);

    setLoadingTable(true); // Start table loading animation
    try {
      const response = await fetch(`${API_URL}procurement/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      const processedData = data.map((row) => ({
        ...row,
        Pred: row.Pred !== undefined ? row.Pred : 0,
      }));

      setTableData(processedData);
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoadingTable(false); // Stop table loading animation
    }
  };

  const tableColumns = [
    { header: "Timestamp", accessor: "TimeStamp" },
    { header: "Actual", accessor: "Actual" },
    { header: "Predicted", accessor: "Pred" },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-6 px-2">
      <h1 className="text-2xl font-bold mb-4">Generation Plant Details</h1>

      {loading ? (
        <div className="flex justify-center items-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4">Loading options...</p>
        </div>
      ) : (
        <>
          <CustomSelect
            options={options.map((item) => item.Code)}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder="Select Plant Code"
            className="mb-10"
          />

          {codeDetails && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                header="Code"
                value={codeDetails.Code}
                icon={<FaKey className="text-blue-500" />}
                bgColor="bg-blue-50"
              />
              <InfoCard
                header="Name"
                value={codeDetails.name}
                icon={<FaIndustry className="text-green-500" />}
                bgColor="bg-green-50"
              />
              <InfoCard
                header="Fuel Type"
                value={codeDetails.Fuel_Type}
                icon={<FaFire className="text-yellow-500" />}
                bgColor="bg-yellow-50"
              />
              <InfoCard
                header="Max Power"
                value={`${codeDetails.Max_Power} MW`}
                icon={<FaBolt className="text-purple-500" />}
                bgColor="bg-purple-50"
              />
              <InfoCard
                header="Min Power"
                value={`${codeDetails.Min_Power} MW`}
                icon={<FaBatteryFull className="text-red-500" />}
                bgColor="bg-red-50"
              />
              <InfoCard
                header="Ownership"
                value={codeDetails.Ownership}
                icon={<FaBriefcase className="text-indigo-500" />}
                bgColor="bg-indigo-50"
              />
            </div>
          )}

          {loadingTable ? (
            <div className="flex justify-center items-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4">Loading table data...</p>
            </div>
          ) : (
            tableData.length > 0 && (
              <CommonTable
                title="Plant Data"
                columns={tableColumns}
                data={tableData}
                caption={`Data for plant code: ${selectedOption}`}
              />
            )
          )}
        </>
      )}
    </div>
  );
}

export default CodeDetails;
