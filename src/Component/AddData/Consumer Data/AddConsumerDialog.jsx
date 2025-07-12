import React, {useState} from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";   // ← import it

/* ─── form field meta ─────────────────────────────────────────── */
const FIELDS = [
    {key: "consumer_id", label: "Consumer ID", required: true},
    {key: "name", label: "Name", required: true},
    {
        key: "type", label: "Type", isSelect: true,
        options: ["LT", "HT"]
    },
    {key: "address", label: "Address"},
    {key: "district", label: "District"},
    {key: "pincode", label: "Pincode"}
];

export default function AddConsumerDialog({open, onOpenChange, dtrId, onCreate}) {
    /* ─── local state ───────────────────────────────────────────── */
    const [form, setForm] = useState(() =>
        Object.fromEntries(FIELDS.map(f => [f.key, ""]))
    );
    const [saving, setSaving] = useState(false);

    const reset = () => setForm(Object.fromEntries(FIELDS.map(f => [f.key, ""])));

    /* ─── save handler ──────────────────────────────────────────── */
    const handleSave = async () => {
        if (!form.consumer_id || !form.name) return;              // required
        setSaving(true);
        const payload = {...form, dtr_id: dtrId};
        try {
            await onCreate(payload);                                // delegate API call
            reset();
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    /* ─── jsx ───────────────────────────────────────────────────── */
    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) reset();
                onOpenChange(v);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Add Consumer</DialogTitle></DialogHeader>

                {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">
                            {f.label}{f.required && " *"}
                        </label>

                        {/* switch between Input and CustomSelect */}
                        {f.isSelect ? (
                            <CustomSelect
                                options={f.options}
                                value={form[f.key]}
                                onChange={(val) => setForm({...form, [f.key]: val})}
                                placeholder="Select type"
                                className="w-full"
                            />
                        ) : (
                            <Input
                                value={form[f.key]}
                                onChange={(e) => setForm({...form, [f.key]: e.target.value})}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={saving || !form.consumer_id || !form.name}
                        onClick={handleSave}
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}