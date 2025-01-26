import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";

export default function CommonTable({ title, caption, columns, data, footer }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Slice data for pagination
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination controls
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="py-6">
      {title && (
        <h3 className="text-xl font-semibold mt-6 mb-4 text-black">{title}</h3>
      )}
      {/* Table Section */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <Table className="min-w-full bg-white">
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow className="bg-gray-200 text-gray-800">
              {/* Lighter header */}
              {columns.map((col) => (
                <TableHead key={col.accessor} className="px-4 py-2">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="hover:bg-gray-300 transition-colors duration-150">
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className="px-4 py-2">
                    {col.render
                      ? col.render(row)
                      : row[col.accessor] !== undefined
                      ? row[col.accessor]
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {footer && footer.totalLabels && (
            <TableFooter>
              <TableRow>
                {footer.totalLabels.map((label, idx) => (
                  <TableCell key={idx}>{label.content}</TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
      {/* Pagination Section */}
      <div className="flex justify-between items-center mt-4 px-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center">
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center">
          Next
        </Button>
      </div>
    </div>
  );
}
