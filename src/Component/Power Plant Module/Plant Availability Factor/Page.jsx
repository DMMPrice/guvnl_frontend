import React, {useEffect, useState} from "react";
import CommonTable from "../../Utils/CommonTable.jsx";
import AddPAFModal from "./AddPAFModal.jsx";
import EditPAFModal from "./EditPAFModal.jsx";
import DeleteConfirmationModal from "../Generator Plants List/DeleteConfirmationModal.jsx";
import {FaEdit, FaTrash} from "react-icons/fa";
import {Loader2} from "lucide-react"; // ✅ Import Loader
import {API_URL} from "@/config.js";

export default function PAFAvailability() {
    const [pafData, setPafData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteCode, setDeleteCode] = useState(null);

    const fetchPafData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}availability/`);
            const data = await res.json();
            setPafData(data);
        } catch (err) {
            console.error("Error fetching PAF data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPafData();
    }, []);

    const handleAdd = async (newRec) => {
        try {
            const res = await fetch(`${API_URL}availability/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newRec),
            });
            if (!res.ok) throw new Error(res.statusText);
            await fetchPafData();
            setIsAddOpen(false);
        } catch (err) {
            console.error("Add failed:", err);
            alert("Failed to add record");
        }
    };

    const handleEditClick = (rec) => {
        setSelectedRecord(rec);
        setIsEditOpen(true);
    };

    const handleSave = async (updatedRec) => {
        try {
            const res = await fetch(`${API_URL}availability/${updatedRec.Code}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(updatedRec),
            });
            if (!res.ok) throw new Error(res.statusText);
            await fetchPafData();
            setIsEditOpen(false);
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update record");
        }
    };

    const handleDeleteClick = (code) => {
        setDeleteCode(code);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`${API_URL}availability/${deleteCode}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(res.statusText);
            await fetchPafData();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete record");
        } finally {
            setIsDeleteOpen(false);
            setDeleteCode(null);
        }
    };

    const monthCols = [
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "Jan", "Feb", "Mar"
    ].map((m) => ({
        accessor: m,
        header: m,
        render: (row) => row[m] || "–",
    }));

    const columns = [
        {accessor: "Code", header: "Code"},
        {accessor: "name", header: "Name"},
        ...monthCols,
        {
            header: "Actions",
            render: (row) => (
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <FaEdit/>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.Code)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FaTrash/>
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                <p className="text-gray-700 text-lg font-semibold">Loading PAF data...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Plant Availability Factor</h2>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add PAF Record
                </button>
            </div>

            <CommonTable columns={columns} data={pafData}/>

            {/* Modals */}
            <AddPAFModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleAdd}
            />
            <EditPAFModal
                isOpen={isEditOpen}
                record={selectedRecord}
                onClose={() => setIsEditOpen(false)}
                onSave={handleSave}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}