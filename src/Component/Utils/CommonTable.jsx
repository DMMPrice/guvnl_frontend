// src/Component/Utils/CommonTable.jsx
import React, {useState, useMemo} from "react";
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
import {Button} from "@/components/ui/Button";
import {FiChevronUp, FiChevronDown} from "react-icons/fi";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

export default function CommonTable({
                                        title,
                                        caption,
                                        columns,
                                        data,
                                        footer,
                                    }) {
    // ─── Sorting ──────────────────────────────────────────────
    const [sortConfig, setSortConfig] = useState({key: null, direction: "asc"});
    const handleSort = (accessor) => {
        setCurrentPage(1);
        setSortConfig((prev) => {
            if (prev.key === accessor) {
                return {
                    key: accessor,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }
            return {key: accessor, direction: "asc"};
        });
    };

    // ─── Column filters ───────────────────────────────────────
    const [filters, setFilters] = useState({});

    // ─── Rows per page selector ───────────────────────────────
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const rowsPerPageOptions = [10, 20, 50, 100];

    // ─── Pagination ───────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ─── Data processing: filter → sort → paginate ────────────
    const processedData = useMemo(() => {
        // 1) Filter
        let filtered = data.filter((row) =>
            columns.every((col) => {
                const filterVal = filters[col.accessor];
                if (!filterVal) return true;
                const cell = row[col.accessor];
                return String(cell ?? "")
                    .toLowerCase()
                    .includes(filterVal.toLowerCase());
            })
        );

        // 2) Sort
        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                // handle null/undefined
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                // numeric?
                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
                }
                // date?
                const da = Date.parse(aVal);
                const db = Date.parse(bVal);
                if (!isNaN(da) && !isNaN(db)) {
                    return sortConfig.direction === "asc" ? da - db : db - da;
                }
                // fallback to string
                return sortConfig.direction === "asc"
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            });
        }

        return filtered;
    }, [data, filters, sortConfig, columns]);

    // total pages based on current rowsPerPage
    const totalPages = Math.ceil(processedData.length / rowsPerPage);

    // 3) Paginate
    const paginatedData = useMemo(
        () =>
            processedData.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            ),
        [processedData, currentPage, rowsPerPage]
    );

    // ─── Handlers ────────────────────────────────────────────
    const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
    const handleNext = () =>
        setCurrentPage((p) => Math.min(p + 1, totalPages));

    return (
        <div className="py-6">
            {/* ─── Title + Rows-per-page selector ──────────────────── */}
            <div className="flex justify-between items-center mb-4">
                {title && (
                    <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <CustomSelect
                        options={rowsPerPageOptions}
                        value={rowsPerPage}
                        onChange={(val) => {
                            setRowsPerPage(val);
                            setCurrentPage(1);
                        }}
                        placeholder="Select…"
                        className="w-20"
                    />
                </div>
            </div>

            <div className="relative overflow-x-auto rounded-lg bg-white shadow-lg">
                <Table className="min-w-full divide-y divide-gray-200">
                    {caption && (
                        <TableCaption className="text-left text-gray-500 p-4">
                            {caption}
                        </TableCaption>
                    )}

                    <TableHeader>
                        {/* Sortable header */}
                        <TableRow className="bg-gray-50">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.accessor}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none"
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    <div className="inline-flex items-center gap-1">
                                        {col.header}
                                        {sortConfig.key === col.accessor && (
                                            sortConfig.direction === "asc" ? (
                                                <FiChevronUp className="w-4 h-4"/>
                                            ) : (
                                                <FiChevronDown className="w-4 h-4"/>
                                            )
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>

                        {/* Filter row */}
                        <TableRow className="bg-gray-100">
                            {columns.map((col) => (
                                <TableCell key={col.accessor} className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder={`Filter ${col.header}`}
                                        value={filters[col.accessor] || ""}
                                        onChange={(e) => {
                                            setCurrentPage(1);
                                            setFilters((f) => ({
                                                ...f,
                                                [col.accessor]: e.target.value,
                                            }));
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((row, i) => (
                            <TableRow
                                key={i}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {columns.map((col, j) => (
                                    <TableCell
                                        key={j}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                    >
                                        {col.render ? col.render(row) : row[col.accessor] ?? "—"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {paginatedData.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    No matching records
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {footer?.totalLabels && (
                        <TableFooter>
                            <TableRow className="bg-gray-50">
                                {footer.totalLabels.map((label, idx) => (
                                    <TableCell
                                        key={idx}
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-800"
                                    >
                                        {label.content}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4 px-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Previous
                </Button>
                <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
                <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}