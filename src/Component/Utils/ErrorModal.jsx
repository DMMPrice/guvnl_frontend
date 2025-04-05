import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ErrorModal = ({ message, errorCode, onClose }) => {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border border-red-300">
                <DialogHeader className="flex justify-between items-center">
                    <DialogTitle className="text-red-600 flex items-center gap-2 text-lg font-semibold">
                        Error
                    </DialogTitle>
                </DialogHeader>

                {/* Error Message Section */}
                <div className="mt-4">
                    <p className="text-gray-800 text-sm">
                        {message}
                    </p>
                    {errorCode && (
                        <p className="text-sm text-red-500 font-semibold mt-2">
                            Error Code: <span className="font-mono">{errorCode}</span>
                        </p>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-all"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorModal;
