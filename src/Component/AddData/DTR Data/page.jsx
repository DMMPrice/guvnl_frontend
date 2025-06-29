import React, {useState, useEffect} from "react";
import axios from "axios";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import FilterBar from "./FilterBar.jsx";
import ActionButtons from "./ActionButtons.jsx";
import AddDtrDialog from "./AddDtrDialog.jsx";
import EditDtrDialog from "./EditDtrDialog.jsx";
import DeleteConfirmDialog from "./DeleteConfirmDialog.jsx";
import {API_URL} from "@/config.js";
import {Button} from "@/components/ui/Button";
import {toast} from "react-toastify";

export default function DtrDirectory() {
    /* master lists */
    const [feederList, setFeederList] = useState([]);
    const [dtrList, setDtrList] = useState([]);

    /* filter */
    const [feederId, setFeederId] = useState("");
    const [appliedFeeder, setAppliedFeeder] = useState("");

    /* dialogs */
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState("");
    const blankForm = {
        feeder_id: "", location_description: "", capacity_kva: "",
        residential_connections: "", installed_date: ""
    };
    const [form, setForm] = useState(blankForm);

    const [delOpen, setDelOpen] = useState(false);
    const [delId, setDelId] = useState("");

    const [loading, setLoading] = useState(false);

    /* ─── load feeders once ─── */
    useEffect(() => {
        axios.get(`${API_URL}feeder/`).then(r => {
            setFeederList(r.data || []);
            if (r.data?.length) setFeederId(r.data[0].feeder_id);
        });
    }, []);

    /* fetch DTR list whenever appliedFeeder changes */
    const fetchDtrs = async (fId) => {
        setLoading(true);
        try {
            const url = fId ? `${API_URL}dtr/by-feeder/${fId}` : `${API_URL}dtr/`;
            const r = await axios.get(url);
            setDtrList(r.data || []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        appliedFeeder !== null && fetchDtrs(appliedFeeder);
    }, [appliedFeeder]);

    /* handlers */
    const handleApply = () => setAppliedFeeder(feederId);
    const handleClear = () => {
        setFeederId("");
        setAppliedFeeder("");
        fetchDtrs("");
    };

    /* add */
    const createDtr = async (payload) => {
        try {
            await axios.post(`${API_URL}dtr/`, payload);
            toast.success("DTR created");
            fetchDtrs(appliedFeeder);
        } catch (e) {
            throw e;                    // bubbled to dialog for toast
        }
    };

    /* edit */
    const openEdit = (row) => {
        setEditId(row.dtr_id);
        setForm({
            feeder_id: row.feeder_id,
            location_description: row.location_description,
            capacity_kva: row.capacity_kva,
            residential_connections: row.residential_connections,
            installed_date: row.installed_date?.slice(0, 10) || ""
        });
        setEditOpen(true);
    };
    const saveEdit = async () => {
        try {
            await axios.put(`${API_URL}dtr/${editId}`, form);
            toast.success("Updated");
            setEditOpen(false);
            fetchDtrs(appliedFeeder);
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    /* delete */
    const openDelete = (row) => (setDelId(row.dtr_id), setDelOpen(true));
    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}dtr/${delId}`);
            toast.success("Deleted");
            setDelOpen(false);
            fetchDtrs(appliedFeeder);
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    /* table */
    const columns = [
        {header: "DTR ID", accessor: "dtr_id"},
        {header: "Feeder", accessor: "feeder_id"},
        {header: "Location", accessor: "location_description"},
        {header: "Capacity (kVA)", accessor: "capacity_kva"},
        {header: "Res. Conn.", accessor: "residential_connections"},
        {header: "Installed Date", accessor: "installed_date"},
        {
            header: "Action", accessor: "_action",
            render: (row) => <ActionButtons onEdit={() => openEdit(row)} onDelete={() => openDelete(row)}/>
        }
    ];

    /* ─── UI ─── */
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">DTR Directory</h2>
                <Button onClick={() => setAddOpen(true)}>Add DTR</Button>
            </div>

            {/* feeder filter (reuse existing FilterBar but only show feeder dropdown) */}
            <FilterBar
                feederList={feederList}
                dtrList={[]}                       /* not used */
                feederId={feederId} dtrId={""}
                onFeederChange={setFeederId}
                onDtrChange={() => {
                }}
                onApply={handleApply}
                onClear={handleClear}
                hideDtr                                    /* small prop to hide 2nd select */
            />

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : (
                <CommonTable
                    title={appliedFeeder ? `DTRs under ${appliedFeeder}` : "All DTRs"}
                    columns={columns}
                    data={dtrList}
                />
            )}

            {/* dialogs */}
            <AddDtrDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                feederList={feederList}
                onCreate={async (p) => {
                    try {
                        await createDtr(p);
                        setAddOpen(false);
                    } catch (e) {
                        toast.error(e.response?.data?.error || e.message);
                    }
                }}
            />

            <EditDtrDialog
                open={editOpen} onOpenChange={setEditOpen}
                feederList={feederList}
                form={form} setForm={setForm} onSave={saveEdit}
            />

            <DeleteConfirmDialog
                open={delOpen} onOpenChange={setDelOpen}
                consumerId={delId}            /* prop name doesn't matter in dialog */
                onConfirm={confirmDelete}
            />
        </div>
    );
}