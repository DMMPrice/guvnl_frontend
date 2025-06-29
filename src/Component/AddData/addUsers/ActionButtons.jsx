import React from "react";
import {FiEdit, FiTrash2} from "react-icons/fi";
import {Button} from "@/components/ui/Button";

export default function ActionButtons({onEdit, onDelete}) {
    return (
        <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={onEdit}>
                <FiEdit className="w-4 h-4"/>
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
                <FiTrash2 className="w-4 h-4 text-red-600"/>
            </Button>
        </div>
    );
}