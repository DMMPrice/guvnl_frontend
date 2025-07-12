import React from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/Button";

export default function DeleteConfirmDialog({
                                                open, onOpenChange, consumerId, onConfirm
                                            }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete consumer?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-700">
                    This will permanently remove <strong>{consumerId}</strong>.
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