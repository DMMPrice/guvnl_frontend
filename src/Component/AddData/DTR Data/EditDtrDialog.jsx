import React from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/Button";
import CustomSelect from "@/Component/Utils/CustomSelect.jsx";

const FIELDS = [
    {key: "feeder_id", label: "Feeder", isSelect: true},
    {key: "location_description", label: "Location"},
    {key: "capacity_kva", label: "Capacity (kVA)"},
    {key: "residential_connections", label: "Res. Connections"},
    {key: "installed_date", label: "Installed Date (YYYY-MM-DD)"}
];

export default function EditDtrDialog({
                                          open, onOpenChange, feederList,
                                          form, setForm, onSave
                                      }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Edit DTR</DialogTitle></DialogHeader>

                {FIELDS.map(f => (
                    <div key={f.key} className="space-y-1">
                        <label className="text-sm font-medium">{f.label}</label>

                        {f.isSelect ? (
                            <CustomSelect
                                options={feederList.map(fl => fl.feeder_id)}
                                value={form.feeder_id}
                                onChange={val => setForm({...form, feeder_id: val})}
                                className="w-full"
                            />
                        ) : (
                            <Input
                                value={form[f.key] ?? ""}
                                onChange={e => setForm({...form, [f.key]: e.target.value})}
                            />
                        )}
                    </div>
                ))}

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}