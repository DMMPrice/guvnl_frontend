import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DemandCard from "./DemandCard";
import { Progress } from "@/components/ui/progress";
import * as XLSX from "xlsx";
import { API_URL } from "../../config";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Dashboard from "./Dashboard";

export default function Purchase() {
  const location = useLocation();
  const navigate = useNavigate();
  const { demand_list, exchangeData } = location.state || {
    demand_list: [],
    exchangeData: [],
  };
  const [plantData, setPlantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/procurement/plant`);
        const data = await response.json();
        setPlantData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transform demand_list to the desired structure
  const transformedDemandList = demand_list.map((item) => ({
    timestamp: item.TimeStamp,
    demand: item["Demand(Actual)"],
    totalMustData: Array.isArray(item["Must Run Data"])
      ? item["Must Run Data"]
      : [item["Must Run Data"]],
    otherData: Array.isArray(item["Other Run Data"])
      ? item["Other Run Data"]
      : [item["Other Run Data"]],
    cost: item["IEX Cost"],
    iexData: item["Total Generation"],
  }));

  const handleExportExcel = async () => {
    const headers = [
      "TimeStamp",
      "Demand",
      "Total Must Run Data",
      "Other Data",
      "Cost",
      "IEX Data",
    ];

    const data = transformedDemandList.map((item) => [
      item.timestamp,
      item.demand,
      item.totalMustData.reduce((acc, curr) => acc + curr.value, 0), // Assuming each object has a 'value' field
      item.otherData.reduce((acc, curr) => acc + curr.value, 0), // Adjust based on actual object structure
      item.cost,
      item.iexData,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Procurement Data");
    XLSX.writeFile(wb, "procurement_data.xlsx");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="w-64 p-4">
          <Progress value={50} className="w-full" />
        </div>
      </div>
    );
  }

  const totalPages = transformedDemandList.length;
  const currentItem = transformedDemandList[currentPage - 1];

  // Handler to navigate to Dashboard with transformed data
  const handleNavigateToDashboard = () => {
    navigate("/dashboard", {
      state: {
        transformedDemandList,
        plantData,
      },
    });
  };

  return (
    <div className="mx-auto px-4 py-8">
      {/* Button to Navigate to Dashboard */}
      <div className="flex justify-end mb-4">
        <Button onClick={handleNavigateToDashboard}>View Dashboard</Button>
      </div>

      {/* Procurement Data Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">Procurement Data</h2>
        <Button onClick={handleExportExcel}>Export to Excel</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Top Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* DemandCard */}
        {currentItem && (
          <DemandCard
            key={currentPage}
            index={currentPage}
            timestamp={currentItem.timestamp}
            demand={currentItem.demand}
            totalMustData={currentItem.totalMustData}
            otherData={currentItem.otherData}
            cost={currentItem.cost}
            iexData={currentItem.iexData}
            plantData={plantData}
          />
        )}
      </div>

      {/* Bottom Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
