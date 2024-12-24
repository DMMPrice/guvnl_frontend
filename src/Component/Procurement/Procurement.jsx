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
  const [responseData, setResponseData] = useState(null);
  const [exchangePriceCapData, setExchangePriceCapData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({
    startDate,
    endDate,
    startTime,
    endTime,
    exchangePriceCap,
  }) => {
    setLoading(true);
    try {
      const start_date =
        startDate && startTime
          ? `${format(startDate, "yyyy-MM-dd")} ${startTime}:00`
          : null;
      const end_date =
        endDate && endTime
          ? `${format(endDate, "yyyy-MM-dd")} ${endTime}:00`
          : null;

      const params = new URLSearchParams();
      if (start_date) {
        params.append("start_date", start_date);
      }
      if (end_date) {
        params.append("end_date", end_date);
      }

      const [demandResponse, priceCapResponse] = await Promise.all([
        fetch(`${API_URL}procurement/demand?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch(
          `${API_URL}procurement/exchange?start_date=${start_date}&end_date=${end_date}&cap_price=${exchangePriceCap}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      const demandData = await demandResponse.json();
      const priceCapData = await priceCapResponse.json();

      setResponseData(demandData); // Save demand response data to state
      setExchangePriceCapData(priceCapData); // Save price cap response data to state

      console.log(demandData);
      console.log(priceCapData);
    } catch (error) {
      console.error("Error:", error);
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
