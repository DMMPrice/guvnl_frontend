// src/Component/Dashboard/ProcurementTable.jsx
import React, {useState} from "react";
import AdvancedTable from "@/Component/Utils/AdvancedTable.jsx";
import ProcurementDetailModal from "./ProcurementDetailModal.jsx";

export default function ProcurementTable({data, userRole}) {
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = row => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };
    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    const columns = [
        {
            id: "timestamp",
            accessor: "timestamp",
            header: "TimeStamp (IST)",
            render: row => {
                const dt = new Date(row.timestamp);
                const offset = 5.5 * 60 * 60 * 1000;
                const adjusted = new Date(dt.getTime() - offset);
                return adjusted.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            },
        },
        {id: "demand_banked", accessor: "demand_banked", header: "Demand (Predicted) [kWh]"},
        {id: "banking_unit", accessor: "banking_unit", header: "Banking Unit [kWh]"},
        {id: "last_price", accessor: "last_price", header: "Block wise Max Price"},
        {id: "must_run_total_gen", accessor: "must_run_total_gen", header: "Total Must Run Generation [kWh]"},
        {id: "must_run_total_cost", accessor: "must_run_total_cost", header: "Total Cost Must Run Generation [Rs]"},
        {
            id: "remaining_plants_total_gen",
            accessor: "remaining_plants_total_gen",
            header: "Others Plant Total Generation [kWh]"
        },
        {
            id: "remaining_plants_total_cost",
            accessor: "remaining_plants_total_cost",
            header: "Total Cost Others Plant [Rs]"
        },
        {id: "iex_gen", accessor: "iex_gen", header: "Power Exchange Qty [kWh]"},
        {id: "iex_cost", accessor: "iex_cost", header: "Power Exchange Cost [Rs]"},
        {id: "backdown_total_cost", accessor: "backdown_total_cost", header: "Backdown Total Cost"},
    ];

    return (
        <>
            <AdvancedTable
                title="Procurement Summary"
                columns={columns}
                data={data}
                userRole={userRole}
                editRoles={[]}
                deleteRoles={[]}
                onView={handleView}
            />

            <ProcurementDetailModal
                isOpen={isModalOpen}
                onClose={handleClose}
                data={selectedRow}
                columns={columns}         // ← pass columns in
            />
        </>
    );
}