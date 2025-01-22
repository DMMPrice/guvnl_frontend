// CommonTable.jsx
import React from "react";
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

export default function CommonTable({ title, caption, columns, data, footer }) {
  // console.log("CommonTable - Columns:", columns); // Debug log
  // console.log("CommonTable - Data:", data); // Debug log

  if (!columns || !Array.isArray(columns)) {
    console.error("Columns prop is missing or not an array.");
    return <div>Error: Invalid columns format</div>;
  }

  if (!data || !Array.isArray(data)) {
    console.error("Data prop is missing or not an array.");
    return <div>Error: Invalid data format</div>;
  }

  return (
    <>
      {title && <h3 className="text-xl font-semibold mt-6 mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white">
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className || ""}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className || ""}>
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
                  <TableCell key={idx} className={label.className || ""}>
                    {label.content}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </>
  );
}
