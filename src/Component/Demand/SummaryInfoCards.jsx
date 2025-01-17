import React from "react";
import InfoCard from "../Utils/InfoCard";
import {
  Clock,
  DollarSign,
  TrendingUp,
  BarChart2,
  PieChart,
  Activity,
} from "lucide-react";

export function convertGmtToIst(timeStamp) {
  return timeStamp.replace("GMT", "IST");
}

export default function SummaryInfoCards({ data }) {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard
        header="Time Stamp"
        value={convertGmtToIst(data.TimeStamp)}
        iconBgColor="text-red-600"
        iconColor="text-red-600"
        icon={<Clock className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="Other Plants Total Cost"
        value={`₹${data.Remaining_Plants_Total_Cost.toFixed(2)}`}
        icon={<DollarSign className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="Must Run Total Cost"
        value={`₹${data.Must_Run_Total_Cost.toFixed(2)}`}
        icon={<DollarSign className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="Last Plant Price"
        value={`₹${data.Last_Price.toFixed(2)}`}
        icon={<TrendingUp className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="IEX Price"
        value={`₹${data.IEX_Cost.toFixed(2)}`}
        icon={<BarChart2 className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="Cost Per Block"
        value={`₹${data.Cost_Per_Block.toFixed(2)}`}
        icon={<PieChart className="h-6 w-6" />}
        className="fade-in"
      />
      <InfoCard
        header="Demand (Actual)"
        value={data["Demand(Actual)"]}
        icon={<Activity className="h-6 w-6" />}
        iconColor="bg-green"
        className="fade-in"
      />
      <InfoCard
        header="Demand (Predicted)"
        value={data["Demand(Pred)"].toFixed(3)}
        icon={<Activity className="h-6 w-6" />}
        className="fade-in"
      />
    </div>
  );
}
