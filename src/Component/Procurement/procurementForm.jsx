import CustomDatePicker from "../Utils/CustomDatePicker";
import CustomSelect from "../Utils/CustomSelect";
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
      onSubmit={handleSubmit}
      className="flex items-center space-x-4 p-4 bg-white rounded shadow-lg">
      {/* Start Date */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Start Date:</label>
        <CustomDatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholder="Select start date"
        />
      </div>
      {/* Start Time */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">Start Time:</label>
        <CustomSelect
          options={timeOptions}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Select start time"
        />
      </div>
      {/* End Date */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">End Date:</label>
        <CustomDatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholder="Select end date"
        />
      </div>
      {/* End Time */}
      <div className="flex flex-col">
        <label className="mb-1 font-semibold">End Time:</label>
        <CustomSelect
          options={timeOptions}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="Select end time"
        />
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
      </button>
    </form>
  );
}
