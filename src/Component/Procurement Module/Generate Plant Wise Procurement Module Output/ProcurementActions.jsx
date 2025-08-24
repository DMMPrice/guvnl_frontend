// ProcurementActions.jsx
import React from "react";
import {Button} from "@/components/ui/button"; // Adjust the import path as necessary

const ProcurementActions = ({onClear}) => {
    return (
        <div className="flex flex-row gap-4 items-center">
            <Button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Generate Procurement
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={onClear}
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50"
            >
                Clear
            </Button>
        </div>
    );
};

export default ProcurementActions;