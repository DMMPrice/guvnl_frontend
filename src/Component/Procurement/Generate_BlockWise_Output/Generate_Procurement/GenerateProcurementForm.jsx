// src/Component/Dashboard/ProcurementForm.jsx
import React, {useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import BasicDateTimePicker from "@/Component/Utils/DateTimeBlock.jsx";  // updated import
import InputField from "@/Component/Utils/InputField.jsx";
import ProcurementActions from "./ProcurementActions.jsx";
import ErrorModal from "@/Component/Utils/ErrorModal.jsx";
import CSVResponseHandler from "./CSVResponseHandler.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Progress} from "@/components/ui/progress";
import {API_URL, SAVE_URL} from "@/config.js";

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const MAX_PARALLEL = 10;

// Loading Modal
const LoadingModal = ({progress, total}) => {
    const percent = total > 0 ? (progress / total) * 100 : 0;
    return (
        <Dialog open>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
                <DialogHeader>
                    <DialogTitle>Fetching Data</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>
                        Please wait while we fetch data... ({progress}/{total})
                    </p>
                    <Progress value={percent} className="mt-2"/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Saving Modal
const SavingModal = ({progress, total}) => {
    const percent = total > 0 ? (progress / total) * 100 : 0;
    return (
        <Dialog open>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
                <DialogHeader>
                    <DialogTitle>Saving Data</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>
                        Saving data to database... ({progress}/{total})
                    </p>
                    <Progress value={percent} className="mt-2"/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function ProcurementForm() {
    // form state: now holds formatted strings
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [procurementName, setProcurementName] = useState("");
    const [saveToDatabase, setSaveToDatabase] = useState(true);

    // UI state
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorCode, setErrorCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState(null);
    const [failedCount, setFailedCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);

    const [saving, setSaving] = useState(false);
    const [savingProgress, setSavingProgress] = useState(0);
    const [totalSaving, setTotalSaving] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!procurementName || !startDate || !endDate) {
            setErrorMessage("Please fill all required details.");
            setErrorCode("FORM_INCOMPLETE");
            setErrorModalOpen(true);
            return;
        }

        // parse strings into dayjs with IST timezone
        const start = dayjs(startDate).tz("Asia/Kolkata");
        const end = dayjs(endDate).tz("Asia/Kolkata");

        // build 15-min timestamps
        const times = [];
        let cursor = start;
        while (cursor.isBefore(end) || cursor.isSame(end)) {
            times.push(cursor);
            cursor = cursor.add(15, "minute");
        }

        setTotalRequests(times.length);
        setProgress(0);
        setFailedCount(0);
        setLoading(true);

        let successfulData = [];
        let failed = 0;

        // helper to fetch single timestamp
        const fetchOne = async (t) => {
            const formatted = t.format("YYYY-MM-DD HH:mm:ss");
            try {
                const {data} = await axios.get(`${API_URL.replace(/\/$/, "")}/procurement/`, {
                    params: {start_date: formatted, price_cap: procurementName},
                });
                return {status: "fulfilled", data};
            } catch (err) {
                return {status: "rejected", error: err};
            } finally {
                setProgress((p) => p + 1);
            }
        };

        try {
            const allResults = [];
            for (let i = 0; i < times.length; i += MAX_PARALLEL) {
                const chunk = times.slice(i, i + MAX_PARALLEL);
                // eslint-disable-next-line no-await-in-loop
                const results = await Promise.all(chunk.map(fetchOne));
                allResults.push(...results);
            }

            successfulData = allResults
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.data);
            failed = allResults.filter((r) => r.status === "rejected").length;

            setResponses(successfulData);
            setFailedCount(failed);
        } catch (err) {
            console.error("Fetch error:", err);
            setErrorMessage(err.message);
            setErrorCode("API_ERROR");
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }

        // POST using the locally captured data
        if (saveToDatabase && successfulData.length > 0) {
            const saveEndpoint = `${SAVE_URL}procurement-output/`;
            setTotalSaving(successfulData.length);
            setSavingProgress(0);
            setSaving(true);

            const postOne = async (record) => {
                try {
                    await axios.post(saveEndpoint, record, {
                        headers: {"Content-Type": "application/json"},
                    });
                } catch (err) {
                    console.error("Save error:", err);
                } finally {
                    setSavingProgress((p) => p + 1);
                }
            };

            for (let i = 0; i < successfulData.length; i += MAX_PARALLEL) {
                const chunk = successfulData.slice(i, i + MAX_PARALLEL);
                // eslint-disable-next-line no-await-in-loop
                await Promise.all(chunk.map(postOne));
            }

            setSaving(false);
        }
    };

    const handleClear = () => {
        setProcurementName("");
        setStartDate(null);
        setEndDate(null);
        setResponses(null);
        setFailedCount(0);
    };

    return (
        <>
            <form
                className="mx-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 w-full">
                    <div className="w-full sm:w-1/4">
                        <InputField
                            label="IEX Price Cap"
                            value={procurementName}
                            onChange={(e) => setProcurementName(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-2/4">
                        <BasicDateTimePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                        />
                    </div>
                    <div className="w-full sm:w-2/4">
                        <BasicDateTimePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </div>
                    <div className="w-full sm:w-auto flex justify-end">
                        <ProcurementActions onClear={handleClear}/>
                    </div>
                </div>
            </form>

            {loading && <LoadingModal progress={progress} total={totalRequests}/>}
            {saving && <SavingModal progress={savingProgress} total={totalSaving}/>}

            {responses && !loading && !saving && (
                <CSVResponseHandler
                    responses={responses}
                    failedCount={failedCount}
                    onClose={() => setResponses(null)}
                />
            )}

            {errorModalOpen && (
                <ErrorModal
                    message={`${errorMessage} (${failedCount} unsuccessful)`}
                    errorCode={errorCode}
                    onClose={() => setErrorModalOpen(false)}
                />
            )}
        </>
    );
}