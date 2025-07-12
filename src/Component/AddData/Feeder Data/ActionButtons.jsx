// ActionButtons.jsx
import React from "react";
import {FiEdit, FiTrash2} from "react-icons/fi";
import {Button} from "@/components/ui/Button";

/**
 * Small “edit / delete” icon pair for use inside CommonTable render() slots.
 *
 * Props
 * -----
 * • onEdit   – function to call on edit click
 * • onDelete – function to call on delete click
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