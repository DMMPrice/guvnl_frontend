// src/Component/Dashboards/***/components/ActionButtons.jsx
import React from "react";
import {FiEdit, FiTrash2} from "react-icons/fi";
import {Button} from "@/components/ui/Button";

/**
 * Small icon-only “Edit / Delete” control for table rows.
 *
 * Props
 * -----
 * • onEdit   – callback when the pencil icon is clicked
 * • onDelete – callback when the trash-can icon is clicked
 */
export default function ActionButtons({onEdit, onDelete}) {
    return (
        <div className="flex gap-1">
            <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                aria-label="Edit"
                className="hover:bg-gray-100"
            >
                <FiEdit className="w-4 h-4"/>
            </Button>

            <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                aria-label="Delete"
                className="hover:bg-gray-100"
            >
                <FiTrash2 className="w-4 h-4 text-red-600"/>
            </Button>
        </div>
    );
}