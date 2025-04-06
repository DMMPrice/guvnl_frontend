// CSVDownloadModal.jsx
import React from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const CSVDownloadModal = ({csvUrl, onClose}) => (
    <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
            <DialogHeader>
                <DialogTitle>Download CSV</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
                <p>Data fetched successfully. Click the button below to download the CSV file.</p>
            </div>
            <div className="mt-6 flex justify-end">
                <a href={csvUrl} download="data.csv">
                    <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Download CSV
                    </Button>
                </a>
                <Button
                    onClick={onClose}
                    className="ml-2 border border-gray-300 px-4 py-2 rounded"
                >
                    Close
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);

export default CSVDownloadModal;