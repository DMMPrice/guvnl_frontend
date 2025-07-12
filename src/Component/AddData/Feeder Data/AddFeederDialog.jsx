import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";

/* metadata */
const FIELDS = [
    {key: "substation_id", label: "Substation ID *", required: true},
    {key: "feeder_name", label: "Feeder Name *", required: true},
    {key: "capacity_amperes", label: "Capacity (A)"},
];

export default function AddFeederDialog({open, onOpenChange, onCreate}) {
    const [form, setForm] = useState(
        Object.fromEntries(FIELDS.map((f) => [f.key, ""]))
    );
    const [saving, setSaving] = useState(false);

    const reset = () =>
        setForm(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));

    const handleSave = async () => {
        if (!form.substation_id || !form.feeder_name) return;
        setSaving(true);
        try {
            await onCreate(form); // POST /feeder
            reset();
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) reset();
                onOpenChange(v);
            }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Feeder</DialogTitle>
                </DialogHeader>

                {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">
                            {f.label}
                            {f.required && " *"}
                        </label>
                        <Input
                            value={form[f.key]}
                            onChange={(e) => setForm({...form, [f.key]: e.target.value})}
                        />
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={
                            saving || !form.substation_id || !form.feeder_name
                        }
                        onClick={handleSave}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}