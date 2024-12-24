import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PieChartCard({
  title,
  data = [],
  dataKey = "value",
  nameKey = "name",
  colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
}) {
  // Calculate total for percentages
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  // Custom Legend renderer
  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-2 text-sm mt-4">
        {payload.map((entry, index) => {
          const percentage = ((entry.payload[dataKey] / total) * 100).toFixed(
            1
          );
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.value}: {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-7">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-1">
        <div className="mx-auto aspect-square max-h-[350px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend content={renderLegend} className="flex flex-col" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
