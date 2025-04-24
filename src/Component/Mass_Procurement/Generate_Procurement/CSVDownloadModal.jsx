import React from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const CSVDownloadModal = ({consolidatedUrl, rawUrl, onClose}) => (
    <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
            <DialogHeader>
                <DialogTitle>Download CSV Files</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
                <p>Select a file to download:</p>
                <div className="flex flex-col gap-2">
                    <a href={consolidatedUrl} download="consolidated.csv">
                        <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
                            Download Consolidated CSV
                        </Button>
                    </a>
                    <a href={rawUrl} download="jist_raw.csv">
                        <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full">
                            Download Raw Data CSV
                        </Button>
                    </a>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={onClose} className="border border-gray-300 px-4 py-2 rounded">
                    Close
                </Button>
            </div>
        </DialogContent>
    </Dialog>
);

export default CSVDownloadModal;