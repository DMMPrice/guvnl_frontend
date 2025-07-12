// src/Component/Dashboards/***/components/DeleteConfirmDialog.jsx
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/Button";

/**
 * A generic “are-you-sure?” dialog.
 *
 * Props
 * -----
 * • open (Boolean)                — controlled open / close
 * • onOpenChange (fn(Boolean))   — lift state to parent
 * • label (String)               — what are we deleting? e.g. “FEEDER1_DTR1”
 * • onConfirm (fn)               — called when user clicks **Delete**
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
                    You are about to delete <strong>{label}</strong>. <br/>
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
