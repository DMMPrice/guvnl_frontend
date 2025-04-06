// CSVResponseHandler.jsx
import React, {useEffect, useState} from "react";
import CSVDownloadModal from "./CSVDownloadModal.jsx"; // Adjust the import path as needed

// Helper function to safely convert a value for CSV cell
const safeCell = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        // If the value is an object (including arrays), stringify it.
        return JSON.stringify(value);
    }
    return value;
};

const CSVResponseHandler = ({responses, onClose}) => {
    const [csvUrl, setCsvUrl] = useState(null);

    useEffect(() => {
        if (responses && responses.length > 0) {
            // Get a set of all keys from the responses. (Assumes all objects have similar keys.)
            const keys = Object.keys(responses[0] || {});

            // Create CSV header and rows.
            const csvRows = [
                keys.join(","), // header row
                ...responses.map((row) =>
                    keys
                        .map((key) => {
                            // Use safeCell to convert the cell value.
                            let cell = safeCell(row[key]);
                            // Escape double quotes by replacing them with two double quotes.
                            cell = String(cell).replace(/"/g, '""');
                            return `"${cell}"`;
                        })
                        .join(",")
                ),
            ];
            const csvData = csvRows.join("\n");
            const blob = new Blob([csvData], {type: "text/csv"});
            const url = URL.createObjectURL(blob);
            setCsvUrl(url);
        }
    }, [responses]);

    if (!csvUrl) return null;
    return <CSVDownloadModal csvUrl={csvUrl} onClose={onClose}/>;
};

export default CSVResponseHandler;