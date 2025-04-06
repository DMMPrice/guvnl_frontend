// ProcurementForm.jsx
import React, {useState} from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import BasicDateTimePicker from "@/Component/Utils/DateTimePicker.jsx";
import InputField from "@/Component/Utils/InputField.jsx";
import ProcurementActions from "./ProcurementActions.jsx"; // Adjust path as needed
import ErrorModal from "@/Component/Utils/ErrorModal.jsx"; // Adjust path as needed
import CSVResponseHandler from "./CSVResponseHandler.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Progress} from "@/components/ui/progress"; // ShadeCN Progress component
import {API_URL, SAVE_URL} from "@/config.js"; // Import dynamic URLs

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Loading Modal with progress (for GET requests)
const LoadingModal = ({progress, total}) => {
    const percent = total > 0 ? (progress / total) * 100 : 0;
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
                <DialogHeader>
                    <DialogTitle>Loading</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>Please wait while we fetch data... ({progress}/{total})</p>
                    <Progress value={percent} className="mt-2"/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Saving Modal with progress (for POST requests)
const SavingModal = ({progress, total}) => {
    const percent = total > 0 ? (progress / total) * 100 : 0;
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md p-6 bg-white shadow-lg rounded-lg border">
                <DialogHeader>
                    <DialogTitle>Saving Data</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <p>Saving data to database... ({progress}/{total})</p>
                    <Progress value={percent} className="mt-2"/>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ProcurementForm = () => {
    // Form fields (empty by default)
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [procurementName, setProcurementName] = useState("");

    // Option to save data to database
    const [saveToDatabase, setSaveToDatabase] = useState(false);

    // States for modals and response handling
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorCode, setErrorCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responses, setResponses] = useState(null);
    const [progress, setProgress] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);

    // States for saving progress (POST requests)
    const [saving, setSaving] = useState(false);
    const [savingProgress, setSavingProgress] = useState(0);
    const [totalSaving, setTotalSaving] = useState(0);

    // Function to sequentially POST each response to the save endpoint using Axios.
    const saveResponsesToDB = async (data) => {
        // Use SAVE_URL directly since it already points to the /demand endpoint.
        const saveEndpoint = SAVE_URL;
        console.log("Saving data to endpoint:", saveEndpoint);
        setTotalSaving(data.length);
        setSavingProgress(0);
        setSaving(true);
        for (let i = 0; i < data.length; i++) {
            try {
                console.log(`Saving record ${i + 1}`);
                const res = await axios.post(saveEndpoint, data[i], {
                    headers: {"Content-Type": "application/json"},
                    // Optionally, you can add redirect: 'follow' if necessary.
                });
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`Failed to save record ${i + 1} with status ${res.status}`);
                } else {
                    console.log(`Record ${i + 1} saved successfully.`);
                }
            } catch (err) {
                console.error("Error saving record:", err);
                // Optionally, accumulate errors or notify the user
            } finally {
                setSavingProgress((prev) => prev + 1);
            }
        }
        setSaving(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!procurementName || !startDate || !endDate) {
            setErrorMessage("Please fill all required details.");
            setErrorCode("FORM_INCOMPLETE");
            setErrorModalOpen(true);
            return;
        }

        // Generate an array of times in 15-minute increments between startDate and endDate.
        let times = [];
        let current = dayjs(startDate);
        const end = dayjs(endDate);
        while (current.isBefore(end) || current.isSame(end)) {
            times.push(current);
            current = current.add(15, "minute");
        }
        setTotalRequests(times.length);
        setProgress(0);

        // Show loading modal while fetching data
        setLoading(true);

        try {
            // Create an array of GET fetch promises using Axios for each time slot.
            const fetchPromises = times.map((t) => {
                // Format time in IST as "YYYY-MM-DD HH:mm:ss"
                const formattedDate = t.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
                const url = `${API_URL.replace(/\/$/, "")}/plant?start_date=${encodeURIComponent(
                    formattedDate
                )}&price_cap=${procurementName}`;
                console.log("Fetching URL:", url);
                return axios
                    .get(url)
                    .then((res) => {
                        // Update progress after each successful fetch.
                        setProgress((prev) => prev + 1);
                        return res.data;
                    });
            });

            // Wait for all GET requests to complete
            const data = await Promise.all(fetchPromises);
            setResponses(data);

            // If user opted to save data, POST each response sequentially.
            if (saveToDatabase) {
                await saveResponsesToDB(data);
            }
        } catch (error) {
            console.error("Error during fetching/saving:", error);
            setErrorMessage(error.message);
            setErrorCode("API_ERROR");
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setProcurementName("");
        setStartDate(null);
        setEndDate(null);
        setResponses(null);
    };

    return (
        <>
            <form
                className="mx-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md"
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4 items-center">
                        <InputField
                            label="Enter IEX Price Cap"
                            value={procurementName}
                            onChange={(e) => setProcurementName(e.target.value)}
                        />
                        <BasicDateTimePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                        />
                        <BasicDateTimePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                        />
                        <ProcurementActions onClear={handleClear}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="saveToDb"
                            checked={saveToDatabase}
                            onChange={(e) => setSaveToDatabase(e.target.checked)}
                        />
                        <label htmlFor="saveToDb" className="text-sm text-gray-700">
                            Save data to database
                        </label>
                    </div>
                </div>
            </form>
            {loading && <LoadingModal progress={progress} total={totalRequests}/>}
            {saving && <SavingModal progress={savingProgress} total={totalSaving}/>}
            {responses && !loading && !saving && (
                <CSVResponseHandler responses={responses} onClose={() => setResponses(null)}/>
            )}
            {errorModalOpen && (
                <ErrorModal
                    message={errorMessage}
                    errorCode={errorCode}
                    onClose={() => setErrorModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProcurementForm;