import React, {useEffect, useState} from "react";
import CommonTable from "../../Utils/CommonTable.jsx";
import {FaEdit, FaTrash} from "react-icons/fa";
import {Loader2} from "lucide-react";
import {API_URL} from "@/config.js";
import AddBackdownModal from "./AddBackdownModal.jsx";
import EditBackdownModal from "./EditBackdownModal.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";

export default function PlantBackdownRates() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteKey, setDeleteKey] = useState(null);

    // Fetch list
    const fetchBackdownRates = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}backdown/`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Error fetching backdown rates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackdownRates();
    }, []);

    // CRUD handlers
    const handleAdd = async (newRec) => {
        try {
            const res = await fetch(`${API_URL}backdown/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newRec),
            });
            if (!res.ok) throw new Error(res.statusText);
            await fetchBackdownRates();
            setIsAddOpen(false);
        } catch (err) {
            console.error("Add failed:", err);
            alert("Failed to add backdown rate");
        }
    };

    const handleEditClick = (rec) => {
        setSelectedRecord(rec);
        setIsEditOpen(true);
    };

    const handleSave = async (updatedRec) => {
        try {
            const res = await fetch(
                `${API_URL}backdown/${updatedRec.Start_Load}`,
                {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(updatedRec),
                }
            );
            if (!res.ok) throw new Error(res.statusText);
            await fetchBackdownRates();
            setIsEditOpen(false);
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update backdown rate");
        }
    };

    const handleDeleteClick = (key) => {
        setDeleteKey(key);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`${API_URL}backdown/${deleteKey}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(res.statusText);
            await fetchBackdownRates();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete backdown rate");
        } finally {
            setIsDeleteOpen(false);
            setDeleteKey(null);
        }
    };

    // Table columns
    const columns = [
        {accessor: "Start_Load", header: "Start Load"},
        {accessor: "End_Load", header: "End Load"},
        {accessor: "Aux_Consumption", header: "Aux Consumption"},
        {accessor: "SHR", header: "SHR"},
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
                        onClick={() => handleDeleteClick(row.Start_Load)}
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
                <p className="text-gray-700 text-lg font-semibold">
                    Loading backdown rates...
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Plant Backdown Rates</h2>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Backdown Rate
                </button>
            </div>

            <CommonTable columns={columns} data={data}/>

            {/* Modals */}
            <AddBackdownModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleAdd}
            />
            <EditBackdownModal
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