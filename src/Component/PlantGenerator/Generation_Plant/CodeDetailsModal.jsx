import React from "react";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

export default function CodeDetailsModal({
                                             open,
                                             onOpenChange,
                                             selectedCodes,
                                             options,
                                             loading,
                                             data,
                                         }) {
    const tableColumns = [
        {header: "Timestamp", accessor: "TimeStamp"},
        {header: "Actual", accessor: "Actual"},
        {header: "Predicted", accessor: "Pred"},
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                <DialogHeader className="relative">
                    <DialogTitle>
                        {selectedCodes.length === 1
                            ? `Data for ${selectedCodes[0]}`
                            : `Data for ${selectedCodes.length} Plants`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"/>
                            <p className="ml-4">Loading table data...</p>
                        </div>
                    ) : (
                        selectedCodes.map((code) => {
                            const plant = options.find((o) => o.Code === code) || {};
                            const rows = data.filter((r) => r.Code === code);
                            return (
                                <div key={code}>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {code} — {plant.name}
                                    </h3>
                                    <CommonTable
                                        title=""
                                        columns={tableColumns}
                                        data={rows}
                                        caption={`Code: ${code}`}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-end p-4 border-t">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}