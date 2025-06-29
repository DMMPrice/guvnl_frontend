// DeleteConfirmDialog.jsx
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/Button";

/**
 * Generic confirmation modal.
 *
 * Props
 * -----
 * • open          – boolean, controlled visibility
 * • onOpenChange  – fn(bool)   : toggle visibility
 * • label         – string     : item name to show (e.g. “FEEDER1”)
 * • onConfirm     – fn()       : called on **Delete** click
 */
export default function DeleteConfirmDialog({
                                                open,
                                                onOpenChange,
                                                label = "this record",
                                                onConfirm,
                                            }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete?</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-700">
                    Are you sure you want to delete <strong>{label}</strong>?<br/>
                    This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}