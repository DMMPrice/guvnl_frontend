import React from "react";
import InfoCard from "../Utils/InfoCard";
import {
  FaClock,
  FaDollarSign,
  FaChartLine,
  FaChartPie,
  FaBolt,
} from "react-icons/fa";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaIndianRupeeSign } from "react-icons/fa6";

export function convertGmtToIst(timeStamp) {
  return timeStamp.replace("GMT", "IST");
}

export default function SummaryInfoCards({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 px-4">
      <InfoCard
        header="Time Stamp"
        value={convertGmtToIst(data.TimeStamp)}
        icon={<FaClock size={24} />}
        bgColor="bg-red-50"
        textColor="text-red-800"
        iconBgColor="bg-red-200"
        iconColor="text-red-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Other Plants Total Cost"
        value={`₹${data.Remaining_Plants_Total_Cost.toFixed(2)}`}
        icon={<FaIndianRupeeSign size={24} />}
        bgColor="bg-blue-50"
        textColor="text-blue-800"
        iconBgColor="bg-blue-200"
        iconColor="text-blue-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Must Run Total Cost"
        value={`₹${data.Must_Run_Total_Cost.toFixed(2)}`}
        icon={<FaIndianRupeeSign size={24} />}
        bgColor="bg-green-50"
        textColor="text-green-800"
        iconBgColor="bg-green-200"
        iconColor="text-green-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Last Plant Price"
        value={`₹${data.Last_Price.toFixed(2)}`}
        icon={<MdOutlineTrendingUp size={24} />}
        bgColor="bg-yellow-50"
        textColor="text-yellow-800"
        iconBgColor="bg-yellow-200"
        iconColor="text-yellow-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="IEX Price"
        value={`₹${data.IEX_Cost.toFixed(2)}`}
        icon={<FaIndianRupeeSign size={24} />}
        bgColor="bg-purple-50"
        textColor="text-purple-800"
        iconBgColor="bg-purple-200"
        iconColor="text-purple-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Cost Per Block"
        value={`₹${data.Cost_Per_Block.toFixed(2)}`}
        icon={<FaChartPie size={32} />}
        bgColor="bg-pink-50"
        textColor="text-pink-800"
        iconBgColor="bg-pink-200"
        iconColor="text-pink-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Demand (Actual)"
        value={data["Demand(Actual)"]}
        icon={<FaBolt size={32} />}
        bgColor="bg-teal-50"
        textColor="text-teal-800"
        iconBgColor="bg-teal-200"
        iconColor="text-teal-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
      <InfoCard
        header="Demand (Predicted)"
        value={data["Demand(Pred)"].toFixed(3)}
        icon={<FaBolt size={32} />}
        bgColor="bg-orange-50"
        textColor="text-orange-800"
        iconBgColor="bg-orange-200"
        iconColor="text-orange-900"
        className="shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-200"
      />
    </div>
  );
}
