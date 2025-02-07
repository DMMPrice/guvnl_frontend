import React from "react";
import InfoCard from "../Utils/InfoCard"; // Importing InfoCard component
import { FaChartLine, FaDollarSign, FaCalendarAlt } from "react-icons/fa"; // Importing React Icons

const DashboardCards = ({ stats, startDate, endDate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp mt-4">
      {/* ✅ Avg Predicted Price Card */}
      <InfoCard
        header="Avg Predicted Price"
        value={stats.avgPredictedPrice}
        icon={<FaChartLine size={24} className="text-blue-800" />}
        bgColor="bg-blue-100"
        textColor="text-blue-800"
        iconBgColor="bg-blue-300"
        iconColor="text-blue-900"
        className="w-full"
      />

      {/* ✅ Avg Price Card */}
      <InfoCard
        header="Avg Price"
        value={stats.avgPrice}
        icon={<FaDollarSign size={24} className="text-green-800" />}
        bgColor="bg-green-100"
        textColor="text-green-800"
        iconBgColor="bg-green-300"
        iconColor="text-green-900"
        className="w-full"
      />

      {/* ✅ Start Date Card */}
      <InfoCard
        header="Start Date"
        value={startDate}
        icon={<FaCalendarAlt size={24} className="text-purple-800" />}
        bgColor="bg-purple-100"
        textColor="text-purple-800"
        iconBgColor="bg-purple-300"
        iconColor="text-purple-900"
        className="w-full"
      />

      {/* ✅ End Date Card */}
      <InfoCard
        header="End Date"
        value={endDate}
        icon={<FaCalendarAlt size={24} className="text-red-800" />}
        bgColor="bg-red-100"
        textColor="text-red-800"
        iconBgColor="bg-red-300"
        iconColor="text-red-900"
        className="w-full"
      />
    </div>
  );
};

export default DashboardCards;
