import React from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const ErrorModal = ({message, errorCode, onClose, isError = true}) => {
    const titleText = isError ? "Error" : "Success";
    const titleColor = isError ? "text-red-600" : "text-green-600";
    const borderColor = isError ? "border-red-300" : "border-green-300";
    const buttonColor = isError ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700";

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-md p-6 bg-white shadow-lg rounded-lg border ${borderColor}`}>
                <DialogHeader className="flex justify-between items-center">
                    <DialogTitle className={`${titleColor} flex items-center gap-2 text-lg font-semibold`}>
                        {titleText}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <p className="text-gray-800 text-sm">
                        {message}
                    </p>
                    {isError && errorCode && (
                        <p className="text-sm text-red-500 font-semibold mt-2">
                            Error Code: <span className="font-mono">{errorCode}</span>
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={onClose}
                        className={`${buttonColor} text-white px-4 py-2 rounded-lg shadow transition-all`}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorModal;