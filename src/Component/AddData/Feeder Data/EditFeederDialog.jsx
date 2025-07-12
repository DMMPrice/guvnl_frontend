import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";

const FIELDS = [
    {key: "substation_id", label: "Substation ID"},
    {key: "feeder_name", label: "Feeder Name"},
    {key: "capacity_amperes", label: "Capacity (A)"},
];

export default function EditFeederDialog({
                                             open,
                                             onOpenChange,
                                             form,
                                             setForm,
                                             onSave,
                                         }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Feeder</DialogTitle>
                </DialogHeader>

                {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">{f.label}</label>
                        <Input
                            value={form[f.key] ?? ""}
                            onChange={(e) => setForm({...form, [f.key]: e.target.value})}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}