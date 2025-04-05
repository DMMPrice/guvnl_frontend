import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MdCheckCircle, MdCancel } from "react-icons/md";

export default function CommonConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90%] sm:max-w-md p-5 rounded-lg">
                <DialogTitle className="text-lg sm:text-xl text-center sm:text-left font-semibold">
                    {title || "Confirm Action"}
                </DialogTitle>

                <p className="text-gray-700 text-sm sm:text-base text-center sm:text-left">
                    {message || "Are you sure you want to proceed?"}
                </p>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                    {/* Confirm Button */}
                    <Button
                        onClick={onConfirm}
                        className="bg-green-600 text-white hover:bg-green-500 flex items-center justify-center px-4 py-2 rounded-lg w-full sm:w-auto"
                    >
                        <MdCheckCircle className="mr-2" /> Confirm
                    </Button>

                    {/* Cancel Button */}
                    <Button
                        onClick={onClose}
                        className="bg-gray-600 text-white hover:bg-gray-500 flex items-center justify-center px-4 py-2 rounded-lg w-full sm:w-auto"
                    >
                        <MdCancel className="mr-2" /> Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
