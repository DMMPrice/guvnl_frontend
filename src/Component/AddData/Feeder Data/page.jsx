import React, {useState, useEffect} from "react";
import axios from "axios";
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import ActionButtons from "./ActionButtons.jsx";
import AddFeederDialog from "./AddFeederDialog.jsx";
import EditFeederDialog from "./EditFeederDialog.jsx";
import DeleteConfirmDialog from "./DeleteConfirmDialog.jsx";
import {API_URL} from "@/config.js";
import {Button} from "@/components/ui/Button";
import {toast} from "react-toastify";

export default function FeederDirectory() {
    /* data */
    const [feeders, setFeeders] = useState([]);
    const [loading, setLoading] = useState(false);

    /* dialogs */
    const [addOpen, setAddOpen] = useState(false);

    const blank = {substation_id: "", feeder_name: "", capacity_amperes: ""};
    const [editOpen, setEditOpen] = useState(false);
    const [editId, setEditId] = useState("");
    const [form, setForm] = useState(blank);

    const [delOpen, setDelOpen] = useState(false);
    const [delId, setDelId] = useState("");

    /* fetch */
    const fetchFeeders = async () => {
        setLoading(true);
        try {
            const r = await axios.get(`${API_URL}feeder/`);
            setFeeders(r.data || []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchFeeders();
    }, []);

    /* CRUD helpers */
    const createFeeder = async (payload) => {
        await axios.post(`${API_URL}feeder/`, payload);
        await fetchFeeders();
        toast.success("Feeder created");
    };

    const openEdit = (row) => {
        setEditId(row.feeder_id);
        setForm({
            substation_id: row.substation_id,
            feeder_name: row.feeder_name,
            capacity_amperes: row.capacity_amperes,
        });
        setEditOpen(true);
    };
    const saveEdit = async () => {
        try {
            await axios.put(`${API_URL}feeder/${editId}`, form);
            toast.success("Updated");
            setEditOpen(false);
            fetchFeeders();
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    const openDelete = (row) => {
        setDelId(row.feeder_id);
        setDelOpen(true);
    };
    const confirmDelete = async () => {
        try {
            await axios.delete(`${API_URL}feeder/${delId}`);
            toast.success("Deleted");
            setDelOpen(false);
            fetchFeeders();
        } catch (e) {
            toast.error(e.response?.data?.error || e.message);
        }
    };

    /* table cols */
    const columns = [
        {header: "Feeder ID", accessor: "feeder_id"},
        {header: "Substation ID", accessor: "substation_id"},
        {header: "Feeder Name", accessor: "feeder_name"},
        {header: "Capacity (A)", accessor: "capacity_amperes"},
        {
            header: "Action",
            accessor: "_action",
            render: (row) => (
                <ActionButtons
                    onEdit={() => openEdit(row)}
                    onDelete={() => openDelete(row)}
                />
            ),
        },
    ];

    /* JSX */
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Feeder Directory</h2>
                <Button onClick={() => setAddOpen(true)}>Add Feeder</Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                </div>
            ) : (
                <CommonTable title="All Feeders" columns={columns} data={feeders}/>
            )}

            {/* dialogs */}
            <AddFeederDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                onCreate={async (p) => {
                    try {
                        await createFeeder(p);
                        setAddOpen(false);
                    } catch (e) {
                        toast.error(e.response?.data?.error || e.message);
                    }
                }}
            />

            <EditFeederDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                form={form}
                setForm={setForm}
                onSave={saveEdit}
            />

            <DeleteConfirmDialog
                open={delOpen}
                onOpenChange={setDelOpen}
                label={delId}
                onConfirm={confirmDelete}
            />
        </div>
    );
}