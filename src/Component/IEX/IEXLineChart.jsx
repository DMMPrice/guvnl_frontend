import React from "react";
import { LineChart, Line, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IEXLineChart({ data, chartConfig }) {
  const defaultConfig = {
    actual: {
      label: "Actual Daily Avg Price",
      color: "rgba(14, 165, 233, 0.8)",
    }, // Blue with opacity
    predicted: {
      label: "Predicted Daily Avg Price",
      color: "rgba(248, 8, 76, 0.8)",
    }, // Red with opacity
  };

  const finalConfig = chartConfig || defaultConfig;

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Actual vs Predicted Daily Avg Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <LineChart
              width={1400} // ✅ Increased width
              height={500} // ✅ Increased height
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }} // ✅ Adjusted margins
            >
              {/* ✅ Removed X-Axis */}

              {/* ✅ Moving legend to bottom center to prevent overlap */}
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 10 }}
              />

              {/* ✅ Custom Tooltip with rounded values */}
              <Tooltip
                formatter={(value, name) => [
                  `${parseFloat(value).toFixed(2)}`, // ✅ Rounds to 2 decimal places
                  name === "actual" ? "Actual Price" : "Predicted Price",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />

              {/* ✅ Rendering "actual" first with opacity for better visibility */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke={finalConfig.actual.color}
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                stroke={finalConfig.predicted.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
