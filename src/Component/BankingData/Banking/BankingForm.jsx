// src/Component/Dashboard/BankingForm.jsx
import React, {useRef, useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import * as XLSX from "xlsx"; // yarn add xlsx
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import BankingActions from "./BankingActions.jsx";
import ErrorModal from "@/Component/Utils/ErrorModal.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Progress} from "@/components/ui/progress";
import {API_URL} from "@/config.js";

// Day.js setup
dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_STEP_MIN = 15;          // 15-minute increments
const TZ = "Asia/Kolkata";         // IST
const CALL_DELAY_MS = 200;         // same as Python: 0.2s between calls
const ENDPOINT = "consolidated-part/calculate";

// --- Loading Modal (fetching) with Cancel ---
const LoadingModal = ({progress, total, onCancel}) => {
    const percent = total > 0 ? (progress / total) * 100 : 0;
    return (
        <Dialog open>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
                <DialogHeader>
                    <DialogTitle>Fetching Data</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>Please wait while we fetch data... ({progress}/{total})</p>
                    <Progress value={percent} className="mt-2"/>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Utility: sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Utility: build inclusive 15-min blocks (IST)
const buildBlocks = (start, end) => {
    const times = [];
    let cursor = dayjs(start).tz(TZ);
    const endT = dayjs(end).tz(TZ);
    while (cursor.isBefore(endT) || cursor.isSame(endT)) {
        times.push(cursor);
        cursor = cursor.add(TIME_STEP_MIN, "minute");
    }
    return times;
};

// Utility: flatten object keys (for Excel header union)
const collectHeaders = (rows) => {
    const set = new Set();
    rows.forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
    return Array.from(set);
};

// Utility: export to Excel
const exportToExcel = (rows, filename = "Banking_Data.xlsx") => {
    if (!rows || rows.length === 0) return;

    // Ensure consistent headers across rows (include Timestamp, status, error if present)
    const headers = collectHeaders(rows);
    const data = [headers, ...rows.map((r) => headers.map((h) => (r[h] ?? "")))];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Autosize columns
    const colWidths = headers.map((h, idx) => {
        const maxLen = data.reduce((m, row) => Math.max(m, String(row[idx] ?? "").length), h.length);
        return {wch: Math.min(Math.max(12, maxLen + 2), 60)};
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, filename);
};

export default function BankingForm() {
    // form state
    const [startDate, setStartDate] = useState(null); // dayjs or null
    const [endDate, setEndDate] = useState(null);     // dayjs or null

    // UI state
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorCode, setErrorCode] = useState(null);

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);

    const [rowsForExcel, setRowsForExcel] = useState([]); // each timestamp gets a row (success/fail)

    // Cancellation + live rows snapshot for partial download
    const cancelRequested = useRef(false);
    const rowsRef = useRef([]);

    const requestCancel = () => {
        // Flag loop to stop at next safe point
        cancelRequested.current = true;

        // Immediately download what we have so far
        if (rowsRef.current.length > 0) {
            const tag = dayjs().format("YYYYMMDD_HHmmss");
            exportToExcel(
                rowsRef.current,
                `Consolidated_Banking_Data_${tag}_PARTIAL_${progress}_of_${totalRequests}.xlsx`
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            setErrorMessage("Please select both Start and End date/time.");
            setErrorCode("FORM_INCOMPLETE");
            setErrorModalOpen(true);
            return;
        }

        // Reset cancellation state and collected rows
        cancelRequested.current = false;
        rowsRef.current = [];

        const blocks = buildBlocks(startDate, endDate);
        if (blocks.length === 0) {
            setErrorMessage("No time blocks found in the selected range.");
            setErrorCode("EMPTY_RANGE");
            setErrorModalOpen(true);
            return;
        }

        setTotalRequests(blocks.length);
        setProgress(0);
        setRowsForExcel([]);
        setLoading(true);

        const url = `${API_URL.replace(/\/$/, "")}/${ENDPOINT}`;

        try {
            for (let i = 0; i < blocks.length; i += 1) {
                if (cancelRequested.current) break; // stop cleanly

                const tsStr = blocks[i].format("YYYY-MM-DD HH:mm"); // backend expects this
                try {
                    const {data} = await axios.get(url, {params: {start_date: tsStr}});

                    // Include Timestamp and status for each row
                    const row = {Timestamp: tsStr, status: "ok", ...data};
                    rowsRef.current.push(row);
                } catch (err) {
                    // Ensure even failures appear in Excel
                    const msg = err?.response?.data?.message || err?.message || "Unknown error";
                    const row = {Timestamp: tsStr, status: "error", error: msg};
                    rowsRef.current.push(row);
                }

                // Update progress & apply default delay (like Python)
                setProgress((p) => p + 1);
                if (i < blocks.length - 1) {
                    // 200 ms between calls
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(CALL_DELAY_MS);
                }
            }

            // Reflect whatever we gathered (full or partial)
            setRowsForExcel(rowsRef.current);
        } catch (err) {
            setErrorMessage(err.message || "Unknown error during fetching.");
            setErrorCode("API_ERROR");
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
        setRowsForExcel([]);
        setProgress(0);
        setTotalRequests(0);
        cancelRequested.current = false;
        rowsRef.current = [];
    };

    const handleDownloadExcel = () => {
        if (!rowsForExcel.length) return;
        const tag = dayjs().format("YYYYMMDD_HHmmss");
        exportToExcel(rowsForExcel, `Consolidated_Banking_Data_${tag}.xlsx`);
    };

    return (
        <>
            <form className="mx-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4 w-full">
                    <div className="w-full sm:w-1/2">
                        <BasicDateTimePicker label="Start Date/Time (IST)" value={startDate} onChange={setStartDate}/>
                    </div>
                    <div className="w-full sm:w-1/2">
                        <BasicDateTimePicker label="End Date/Time (IST)" value={endDate} onChange={setEndDate}/>
                    </div>
                    <div className="w-full sm:w-auto flex justify-end">
                        <BankingActions onClear={handleClear}/>
                    </div>
                </div>
            </form>

            {loading && (
                <LoadingModal
                    progress={progress}
                    total={totalRequests}
                    onCancel={requestCancel}
                />
            )}

            {/* Results bar with Excel download (every block included, success or fail) */}
            {!loading && rowsForExcel.length > 0 && (
                <div className="mx-6 mt-4 p-4 bg-white border rounded-lg shadow flex items-center justify-between">
                    <div>
                        <p className="font-semibold">Fetched {rowsForExcel.length} blocks (15-min each).</p>
                        <p className="text-sm text-gray-600">
                            All timestamps were called sequentially. Both successful and failed responses are included.
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Download Excel
                    </button>
                </div>
            )}

            {errorModalOpen && (
                <ErrorModal
                    message={errorMessage}
                    errorCode={errorCode}
                    onClose={() => setErrorModalOpen(false)}
                />
            )}
        </>
    );
}