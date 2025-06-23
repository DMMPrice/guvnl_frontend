import CustomDatePicker from "../../Utils/CustomDatePicker.jsx";
import CustomSelect from "../../Utils/CustomSelect.jsx";
import { Loader2 } from "lucide-react";

export default function ProcurementForm({
  loading,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  timeOptions,
  handleSubmit,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default behavior
        if (!startDate || !endDate || !startTime || !endTime) {
          alert("Please fill out all date and time fields before submitting.");
          return;
        }
        handleSubmit(e); // Trigger form submission
      }}
      className="flex flex-wrap items-center gap-4 p-4 bg-white rounded shadow-lg">
      {/* Start Date */}
      <div className="flex flex-col w-full sm:w-auto">
        <label className="mb-1 font-semibold">Start Date:</label>
        <CustomDatePicker
          label="Start Date"
          selected={startDate}
          onChange={(date) => {
            if (date) setStartDate(date);
          }}
          placeholder="Select start date"
        />
      </div>

      {/* Start Time */}
      <div className="flex flex-col w-full sm:w-auto">
        <label className="mb-1 font-semibold">Start Time:</label>
        <CustomSelect
          options={timeOptions}
          value={startTime}
          onChange={(time) => setStartTime(time)}
          placeholder="Select start time"
        />
      </div>

      {/* End Date */}
      <div className="flex flex-col w-full sm:w-auto">
        <label className="mb-1 font-semibold">End Date:</label>
        <CustomDatePicker
          label="End Date"
          selected={endDate}
          onChange={(date) => {
            if (date) setEndDate(date);
          }}
          placeholder="Select end date"
        />
      </div>

      {/* End Time */}
      <div className="flex flex-col w-full sm:w-auto">
        <label className="mb-1 font-semibold">End Time:</label>
        <CustomSelect
          options={timeOptions}
          value={endTime}
          onChange={(time) => setEndTime(time)}
          placeholder="Select end time"
        />
      </div>

      {/* Submit Button */}
      <div className="w-full sm:w-auto mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
