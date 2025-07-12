import React, {useState, useEffect} from "react";
import axios from "axios";
import FilterBar from "./FilterBar.jsx";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import ActionButtons from "./ActionButtons.jsx";
import EditConsumerDialog from "./EditConsumerDialog.jsx";
import DeleteConfirmDialog from "./DeleteConfirmDialog.jsx";
import AddConsumerDialog from "./AddConsumerDialog.jsx";
import {API_URL} from "@/config.js";
import {toast} from "react-toastify";
import {Button} from "@/components/ui/Button";

export default function FeederDtrConsumerTable() {
    /* ═════════════ Filters ═════════════ */
    const [feederId, setFeederId] = useState("");
    const [dtrId, setDtrId] = useState("");

    const [appliedFeeder, setAppliedFeeder] = useState("");
    const [appliedDtr, setAppliedDtr] = useState("");
    const [initialApplied, setInitialApplied] = useState(false);

    /* ═════════════ Master data ══════════ */
    const [feederList, setFeederList] = useState([]);
    const [dtrList, setDtrList] = useState([]);
    const [consumers, setConsumers] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ═════════════ Dialog state ═════════ */
    const blankForm = {name: "", type: "", address: "", district: "", pincode: "", dtr_id: ""};
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState("");
    const [form, setForm] = useState(blankForm);

    const [delOpen, setDelOpen] = useState(false);
    const [delId, setDelId] = useState("");

    const [addOpen, setAddOpen] = useState(false);

    /* ═════════════ Fetch feeders/DTRs once ══════════ */
    useEffect(() => {
        axios.get(`${API_URL}feeder/`).then(r => setFeederList(r.data || []));
        axios.get(`${API_URL}dtr/`).then(r => setDtrList(r.data || []));
    }, []);

    /* auto-pick first feeder & DTR */
    useEffect(() => {
        if (feederList.length && !feederId) setFeederId(feederList[0].feeder_id);
    }, [feederList]);
    useEffect(() => {
        const first = dtrList.find(d => d.feeder_id === feederId);
        if (first && !dtrId) setDtrId(first.dtr_id);
    }, [feederId, dtrList]);

    /* one-time auto-apply */
    useEffect(() => {
        if (!initialApplied && feederId && dtrId) {
            setAppliedFeeder(feederId);
            setAppliedDtr(dtrId);
            setInitialApplied(true);
        }
    }, [feederId, dtrId, initialApplied]);

    /* fetch consumers */
    const fetchConsumers = async (dtr) => {
        setLoading(true);
        try {
            const r = await axios.get(`${API_URL}consumer/by-dtr/${dtr}`);
            setConsumers(r.data || []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        appliedDtr && fetchConsumers(appliedDtr);
    }, [appliedDtr]);

    /* ═════════════ Handlers ═════════════ */
    const handleApply = () => feederId && dtrId &&
        (setAppliedFeeder(feederId), setAppliedDtr(dtrId));

    const handleClear = () => {
        const f = feederList[0]?.feeder_id || "";
        const d = dtrList.find(x => x.feeder_id === f)?.dtr_id || "";
        setFeederId(f);
        setDtrId(d);
        setAppliedFeeder(f);
        setAppliedDtr(d);
    };

    /* edit helpers */
    const openEdit = (row) => {
        setEditId(row.consumer_id);
        setForm({
            name: row.name ?? "", type: row.type ?? "",
            address: row.address ?? "", district: row.district ?? "",
            pincode: row.pincode ?? "", dtr_id: row.dtr_id
        });
        setEditOpen(true);
    };
    const saveEdit = async () => {
        try {
            await axios.put(`${API_URL}consumer/${editId}`, form);
            toast.success("Updated");
            setEditOpen(false);
            fetchConsumers(appliedDtr);
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    /* delete helpers */
    const openDelete = (row) => (setDelId(row.consumer_id), setDelOpen(true));
    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}consumer/${delId}`);
            toast.success("Deleted");
            setDelOpen(false);
            fetchConsumers(appliedDtr);
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    /* add helpers */
    const createConsumer = async (payload) => {
        try {
            await axios.post(`${API_URL}consumer/`, payload);
            toast.success("Created");
            fetchConsumers(appliedDtr);
        } catch (e) {
            throw e; // handled in dialog
        }
    };

    /* ═════════════ Table columns ═════════════ */
    const columns = [
        {header: "Consumer ID", accessor: "consumer_id"},
        {header: "Name", accessor: "name"},
        {header: "Address", accessor: "address"},
        {header: "District", accessor: "district"},
        {header: "Pincode", accessor: "pincode"},
        {header: "Type", accessor: "type"},
        {
            header: "Action", accessor: "_action",
            render: (row) => (
                <ActionButtons onEdit={() => openEdit(row)} onDelete={() => openDelete(row)}/>
            )
        }
    ];

    /* ═════════════ JSX ═════════════ */
    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* title + Add button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                    Feeder → DTR → Consumer Directory
                </h2>
                <Button onClick={() => setAddOpen(true)}>Add Consumer</Button>
            </div>

            <FilterBar
                feederList={feederList}
                dtrList={dtrList.filter(d => d.feeder_id === feederId)}
                feederId={feederId} dtrId={dtrId}
                onFeederChange={setFeederId} onDtrChange={setDtrId}
                onApply={handleApply} onClear={handleClear}
            />

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : (
                <CommonTable
                    title={`Consumers under ${appliedDtr}`}
                    columns={columns}
                    data={consumers}
                />
            )}

            {/* dialogs */}
            <AddConsumerDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                dtrId={appliedDtr}
                onCreate={async (payload) => {
                    try {
                        await createConsumer(payload);
                        setAddOpen(false);
                    } catch (e) {
                        toast.error(e.response?.data?.error || e.message);
                    }
                }}
            />

            <EditConsumerDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                form={form}
                setForm={setForm}
                onSave={saveEdit}
            />

            <DeleteConfirmDialog
                open={delOpen}
                onOpenChange={setDelOpen}
                consumerId={delId}
                onConfirm={confirmDelete}
            />
        </div>
    );
}