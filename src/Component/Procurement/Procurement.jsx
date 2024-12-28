import { useState } from "react";
import { format } from "date-fns";
import { InputForm } from "./InputForm";
import ResponseData from "./ResponseData";
import { API_URL } from "../../config";

export default function Procurement() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [exchangePriceCapData, setExchangePriceCapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({
    startDate,
    endDate,
    startTime,
    endTime,
    exchangePriceCap,
  }) => {
    setLoading(true);
    setError(null);
    setResponseData([]);

    try {
      const start_date =
        startDate && startTime
          ? format(startDate, "yyyy-MM-dd") + " " + startTime + ":00"
          : null;
      const end_date =
        endDate && endTime
          ? format(endDate, "yyyy-MM-dd") + " " + endTime + ":00"
          : null;

      if (start_date && end_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);
        const interval = 15 * 60 * 1000; // 15 minutes in milliseconds
        const result = [];

        for (
          let time = start;
          time <= end;
          time = new Date(time.getTime() + interval)
        ) {
          result.push({
            start_time: format(time, "yyyy-MM-dd HH:mm:ss"),
            cap_price: exchangePriceCap,
          });
        }

        console.log("Generated timestamps:", result);

        const responses = [];

        for (const item of result) {
          const { start_time, cap_price } = item;
          const formattedDate = start_time
            .replace(/["']/g, "")
            .replace(" ", "%20");
          const apiUrl = `${API_URL}plant/?start_date=${formattedDate}&price_cap=${cap_price}`;

          try {
            console.log("Requesting URL:", apiUrl);

            const response = await fetch(apiUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(
                `HTTP error! status: ${response.status} - ${response.statusText}`
              );
            }

            const data = await response.json();
            responses.push({
              timestamp: start_time,
              data: data,
            });

            console.log(`Response for ${start_time}:`, data);
          } catch (apiError) {
            console.error("API Error:", {
              message: apiError.message,
              url: apiUrl,
              timestamp: start_time,
            });
            setError(apiError.message);
          }
        }

        setResponseData(responses);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <InputForm
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        handleSubmit={handleSubmit}
      />
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      ) : (
        <ResponseData data={responseData} exchangeData={exchangePriceCapData} />
      )}
    </div>
  );
}
