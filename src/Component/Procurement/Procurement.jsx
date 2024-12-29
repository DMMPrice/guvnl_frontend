import React, { useState, useEffect, useMemo } from "react";
import InputForm from "./InputForm";
import { aggregatePlantData } from "./aggregatePlantData";
import ResponseDashboard from "./ResponseDashboard";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ParentComponent() {
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [endTimestamp, setEndTimestamp] = useState(null);
  const [hasData, setHasData] = useState(false);

  const handleResponses = (responses) => {
    setAllResponses(responses);
    setHasData(responses && responses.length > 0);
  };

  const handleTimestampsChange = (start, end) => {
    console.log("Received timestamps in parent:", start, end);
    setStartTimestamp(start);
    setEndTimestamp(end);
  };

  const aggregatedData = useMemo(() => {
    return aggregatePlantData(allResponses);
  }, [allResponses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 mx-8">
      <InputForm
        onResponseData={handleResponses}
        onTimestampsChange={handleTimestampsChange}
      />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Progress value={33} />
        </div>
      ) : !hasData ? (
        <Alert className="mt-6 mx-8 max-w-8xl mx-auto px-8">
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Please select a date range and submit the form to view the data.
          </AlertDescription>
        </Alert>
      ) : (
        <ResponseDashboard
          aggregatedData={aggregatedData}
          startTimestamp={startTimestamp}
          endTimestamp={endTimestamp}
        />
      )}
    </div>
  );
}
