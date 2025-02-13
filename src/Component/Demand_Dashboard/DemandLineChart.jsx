import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, Legend, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * @param {Object[]} data - An array of raw data objects.
 * @param {String} data[].TimeStamp - The timestamp for each data point.
 * @param {Number} data[].Demand(Actual) - The actual demand value.
 * @param {Number} data[].Demand(Pred) - The predicted demand value.
 * @param {Object} chartConfig - Contains styling/color config for each line, e.g.:
 *   {
 *     actual: { label: "Actual Demand", color: "blue" },
 *     pred: { label: "Predicted Demand", color: "red" },
 *   }
 */
export default function DemandLineChart({ data, chartConfig }) {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Raw Demand (Actual vs Predicted)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              data={data}
              margin={{
                top: 60,
                left: 12,
                right: 12,
                bottom: 20, // to accommodate legend
              }}>
              <CartesianGrid vertical={false} />

              {/* 
                XAxis: we’re using "TimeStamp" as the key. Recharts 
                will display it as a string by default. If you want 
                a custom format, you can add a tickFormatter. 
              */}
              <XAxis
                dataKey="TimeStamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />

              {/* Optional YAxis to show numeric scale */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // If your demand values are large, set domain or tickFormatter
                // domain={["auto", "auto"]}
              />

              <Legend verticalAlign="bottom" align="center" height={36} />

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Line
                dataKey="Demand(Actual)"
                name={chartConfig.actual.label}
                type="monotone"
                stroke={chartConfig.actual.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Demand(Pred)"
                name={chartConfig.pred.label}
                type="monotone"
                stroke={chartConfig.pred.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
