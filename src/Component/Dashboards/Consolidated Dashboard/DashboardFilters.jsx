// src/Component/Dashboard/DashboardFilters.jsx
import React from "react";
import BasicDatePicker from "@/Component/Utils/DateTimePicker.jsx";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";

export default function DashboardFilters({
                                             startDate,
                                             endDate,
                                             onStartDateChange,
                                             onEndDateChange,
                                             onLoad,
                                             loading,
                                         }) {
    return (
        <div className="flex flex-wrap items-end gap-4 mb-6">
            <BasicDatePicker
                label="Start Date"
                value={startDate ? dayjs(startDate) : null}
                onChange={(d) =>
                    onStartDateChange(d ? d.format("YYYY-MM-DD") : null)
                }
            />
            <BasicDatePicker
                label="End Date"
                value={endDate ? dayjs(endDate) : null}
                onChange={(d) =>
                    onEndDateChange(d ? d.format("YYYY-MM-DD") : null)
                }
            />
            <Button
                onClick={onLoad}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
            >
                {loading ? "Loading…" : "Load"}
            </Button>
        </div>
    );
}