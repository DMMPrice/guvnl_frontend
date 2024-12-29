import React, { useState } from "react";
import BasicDateTimePicker from "../Utils/DateTimePicker";
import InputField from "../Utils/InputField";

const InputForm = ({ onResponseData }) => {
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);
  const [numberInput, setNumberInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const intervals = generateTimeIntervalsIST(startTimestamp, endTimestamp);
    if (!intervals.length) {
      return;
    }

    const requests = intervals.map((interval) => {
      const formattedStartDate = interval.replace("T", " ") + ":00";
      return fetch(
        `http://127.0.0.1:5000/plant/?start_date=${encodeURIComponent(
          formattedStartDate
        )}&price_cap=${encodeURIComponent(numberInput)}`,
        { method: "GET" }
      )
        .then((response) => response.json())
        .catch(() => null);
    });

    Promise.all(requests)
      .then((resultsArray) => {
        console.log("All responses:", resultsArray);
        if (onResponseData) {
          onResponseData(resultsArray);
        }
      })
      .catch((err) => console.error("Error with interval requests:", err));
  };

  const handleClear = () => {
    setStartTimestamp(null);
    setEndTimestamp(null);
    setNumberInput("");
  };

  const generateTimeIntervalsIST = (start, end) => {
    const intervals = [];
    let current = new Date(start);
    const endDate = new Date(end);
    const subtractOffset = 6.5 * 60 * 60000 - 12 * 60 * 60000;

    while (current <= endDate) {
      const adjusted = new Date(current.getTime() - subtractOffset);
      intervals.push(adjusted.toISOString().slice(0, 16));
      current = new Date(current.getTime() + 15 * 60000);
    }

    return intervals;
  };

  return (
    <div className="mx-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <BasicDateTimePicker
            label="Start Timestamp"
            value={startTimestamp}
            onChange={setStartTimestamp}
          />
        </div>
        <div className="flex-1">
          <BasicDateTimePicker
            label="End Timestamp"
            value={endTimestamp}
            onChange={setEndTimestamp}
          />
        </div>
        <div className="flex-1">
          <InputField
            label="Number Input"
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full md:w-auto">
            Submit
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 w-full md:w-auto">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
