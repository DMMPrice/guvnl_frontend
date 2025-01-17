import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PieChartCard({
  title,
  data = [],
  dataKey = "value",
  nameKey = "name",
  colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8B0000",
    "#FFD700",
    "#00FF00",
    "#00CED1",
    "#DC143C",
    "#FF4500",
    "#2E8B57",
    "#20B2AA",
    "#FF00FF",
    "#4682B4",
    "#9ACD32",
    "#7B68EE",
    "#8FBC8F",
    "#D2691E",
    "#6B8E23",
    "#708090",
    "#A0522D",
    "#F4A460",
    "#9370DB",
    "#00BFFF",
    "#FF1493",
    "#C71585",
  ],
}) {
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const entry = payload[0];
      const percentage = total
        ? ((entry.value / total) * 100).toFixed(2) + "%"
        : "0%";
      return (
        <div className="p-2 bg-white shadow-md border rounded text-sm">
          <div>
            <strong>{entry.name}</strong>
          </div>
          <div>Value: {entry.value.toLocaleString()}</div>
          <div>Share: {percentage}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-7">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-1">
        <div className="mx-auto" style={{ height: "450px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={160}
                fill="#8884d8"
                label={false}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]} // Use more varied colors
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
