import React from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";

const FIELDS = [
    {key: "name", label: "Name"},
    {key: "type", label: "Type"},
    {key: "address", label: "Address"},
    {key: "district", label: "District"},
    {key: "pincode", label: "Pincode"},
    {key: "dtr_id", label: "DTR ID"}
];

export default function EditConsumerDialog({
                                               open, onOpenChange, form, setForm, onSave
                                           }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Edit Consumer</DialogTitle></DialogHeader>

                {FIELDS.map(f => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">{f.label}</label>
                        <Input
                            value={form[f.key]}
                            onChange={e => setForm({...form, [f.key]: e.target.value})}
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