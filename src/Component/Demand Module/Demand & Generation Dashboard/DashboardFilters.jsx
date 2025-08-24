// src/Component/Dashboard/DashboardFilters.jsx
import React from "react";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import PowerBIModal from '@/Component/Utils/PowerBIModal.jsx';

export default function DashboardFilters({
                                             startDate,
                                             endDate,
                                             onStartDateChange,
                                             onEndDateChange,
                                             onLoad,
                                             onDownloadFull,
                                             loading,
                                         }) {
    const normalizeAndFormat = (d) =>
        d ? dayjs(d).format("YYYY-MM-DD HH:mm:ss") : null;

    // disable if either date is missing
    const isDisabled = !startDate || !endDate;

    return (
        <div className="flex flex-wrap items-end gap-4 mb-6 bg-blue-400 p-8 rounded-lg">
            <BasicDateTimePicker
                label="Start Date & Time"
                value={startDate ? dayjs(startDate) : null}
                onChange={(d) => onStartDateChange(normalizeAndFormat(d))}
            />

            <BasicDateTimePicker
                label="End Date & Time"
                value={endDate ? dayjs(endDate) : null}
                onChange={(d) => onEndDateChange(normalizeAndFormat(d))}
            />

            {/* initial Load */}
            <Button
                onClick={onLoad}
                disabled={loading || isDisabled}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
            >
                {loading ? "Loading…" : "Load"}
            </Button>

            {/* reload latest data */}
            <Button
                onClick={onLoad}
                disabled={loading || isDisabled}
                variant="outline"
                className="px-4 py-2"
            >
                Reload
            </Button>

            {/* download CSV */}
            <Button
                onClick={onDownloadFull}
                disabled={isDisabled}
                variant="outline"
                className="px-4 py-2"
            >
                Download Full Data
            </Button>

            {/* PowerBI embed */}
            <PowerBIModal/>
        </div>
    );
}