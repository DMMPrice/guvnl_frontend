import React from "react";

export default function InfoCard({
  header,
  value,
  bgColor = "bg-gray-100",
  textColor = "text-gray-800",
}) {
  return (
    <div
      className={`p-6 rounded-lg ${bgColor} text-center shadow-md transition-transform transform hover:scale-105 hover:shadow-lg`}>
      <h4 className={`text-lg font-semibold ${textColor}`}>{header}</h4>
      <p className={`mt-2 text-xl ${textColor}`}>{value}</p>
    </div>
  );
}
