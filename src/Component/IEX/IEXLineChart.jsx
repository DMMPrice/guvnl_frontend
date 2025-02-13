import React from "react";
import { LineChart, Line, Tooltip, Legend, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IEXLineChart({ data, chartConfig }) {
  // Default config if none provided
  const defaultConfig = {
    actual: {
      label: "Actual Daily Avg Price",
      color: "rgba(14, 165, 233, 0.8)",
    },
    predicted: {
      label: "Predicted Daily Avg Price",
      color: "rgba(248, 8, 76, 0.8)",
    },
  };
  const finalConfig = chartConfig || defaultConfig;

  // Decide which key to use for the x-axis
  const firstItem = data && data.length > 0 ? data[0] : null;
  const xKey = firstItem
    ? firstItem.hasOwnProperty("timestamp")
      ? "timestamp"
      : "day"
    : "day";

  // Helper to add 5h30m
  const addFiveThirty = (dateObj) => {
    dateObj.setMinutes(dateObj.getMinutes());
    return dateObj;
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Actual vs Predicted Daily Avg Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <LineChart
              width={1400}
              height={500}
              data={data}
              margin={{ top: 50, right: 20, left: 20, bottom: 50 }}>
              {/* No YAxis => no Y-axis labels */}

              {/* XAxis with +5h30m in tickFormatter */}
              <XAxis
                dataKey={xKey}
                tickFormatter={(val) => {
                  if (!val) return "";
                  const d = addFiveThirty(new Date(val));
                  return d.toLocaleDateString();
                }}
                tickMargin={10}
              />

              {/* Legend at bottom center */}
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 10 }}
              />

              {/* Tooltip with +5h30m as well */}
              <Tooltip
                formatter={(value, name) => [
                  `${parseFloat(value).toFixed(2)}`,
                  name === "actual" ? "Actual Price" : "Predicted Price",
                ]}
                labelFormatter={(label) => {
                  const d = addFiveThirty(new Date(label));
                  return `Date: ${d.toLocaleString()}`;
                }}
              />

              {/* Actual line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke={finalConfig.actual.color}
                strokeWidth={2}
                dot={false}
                name={finalConfig.actual.label}
              />

              {/* Predicted line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={finalConfig.predicted.color}
                strokeWidth={2}
                dot={false}
                name={finalConfig.predicted.label}
              />
            </LineChart>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
