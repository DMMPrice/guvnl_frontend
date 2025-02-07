import React from "react";

export default function InfoCard({
  header,
  value,
  icon,
  bgColor = "bg-white",
  textColor = "text-gray-800",
  iconBgColor = "bg-blue-100",
  iconColor = " ",
  className = "",
}) {
  return (
    <div
      className={`p-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-2 hover:shadow-lg ${bgColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{header}</p>
          <p className={`text-2xl font-semibold ${textColor}`}>{value}</p>
        </div>
        <div className={`p-3 ${iconBgColor} ${iconColor} rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
