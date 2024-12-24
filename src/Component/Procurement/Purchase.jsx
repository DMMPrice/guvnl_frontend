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

  const exchangeDataArray = Array.isArray(exchangeData?.exchange_data)
    ? exchangeData.exchange_data
    : [exchangeData.exchange_data];

  const handleExportExcel = async () => {
    const headers = [
      "TimeStamp",
      "Demand (Actual)",
      "Demand (Pred)",
      "Must Run Data",
      "Other Run Data",
      "IEX Cost",
      "Total Generation",
    ];

    const data = demand_list.map((item) => [
      item.TimeStamp,
      item["Demand(Actual)"],
      item["Demand(Pred)"],
      // Add other data mappings here
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

  const totalPages = demand_list.length;
  const currentItem = demand_list[currentPage - 1];
  const currentExchangeData = exchangeDataArray[currentPage - 1];

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">Procurement Data</h2>
        <Button onClick={handleExportExcel}>Export to Excel</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
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
        {currentItem && (
          <DemandCard
            key={currentPage}
            index={currentPage}
            timestamp={currentItem.TimeStamp}
            actual={currentItem["Demand(Actual)"]}
            predicted={currentItem["Demand(Pred)"]}
            exchangeData={currentExchangeData}
            startDate={exchangeData.start_date}
            endDate={exchangeData.end_date}
            plantData={plantData}
          />
        )}
      </div>

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
