import React, {useState} from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

/* form spec */
const FIELDS = [
    {key: "feeder_id", label: "Feeder *", isSelect: true, required: true},
    {key: "location_description", label: "Location *", required: true},
    {key: "capacity_kva", label: "Capacity (kVA) *", required: true},
    {key: "residential_connections", label: "Res. Connections *", required: true},
    {key: "installed_date", label: "Installed Date (YYYY-MM-DD) *", required: true}
];

export default function AddDtrDialog({open, onOpenChange, feederList, onCreate}) {
    const [form, setForm] = useState(() =>
        Object.fromEntries(FIELDS.map(f => [f.key, ""]))
    );
    const [saving, setSaving] = useState(false);

    const reset = () => setForm(Object.fromEntries(FIELDS.map(f => [f.key, ""])));

    const handleSave = async () => {
        /* simple client-side required check */
        if (!form.feeder_id || !form.location_description ||
            !form.capacity_kva || !form.residential_connections || !form.installed_date) return;

        setSaving(true);
        try {
            await onCreate(form);               // Page.jsx will call POST /dtr
            reset();
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => {
            if (!v) reset();
            onOpenChange(v);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Add DTR</DialogTitle></DialogHeader>

                {FIELDS.map(f => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">{f.label}</label>

                        {f.isSelect ? (
                            <CustomSelect
                                options={feederList.map(fl => fl.feeder_id)}
                                value={form.feeder_id}
                                onChange={val => setForm({...form, feeder_id: val})}
                                placeholder="Select feeder"
                                className="w-full"
                            />
                        ) : (
                            <Input
                                value={form[f.key]}
                                onChange={e => setForm({...form, [f.key]: e.target.value})}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button disabled={saving || !form.feeder_id} onClick={handleSave}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}