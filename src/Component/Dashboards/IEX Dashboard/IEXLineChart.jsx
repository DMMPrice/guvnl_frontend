import React from "react";
import {LineChart, Line, Tooltip, Legend, XAxis} from "recharts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function IEXLineChart({data, chartConfig}) {
    // Default fallback config
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

    // Determine x-axis key: 'timestamp' (raw) or 'day' (aggregated)
    const firstItem = data && data.length > 0 ? data[0] : null;
    const xKey = firstItem
        ? firstItem.hasOwnProperty("timestamp")
            ? "timestamp"
            : "day"
        : "day";

    return (
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Actual vs Predicted Daily Avg Price</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{width: "100%", overflowX: "auto"}}>
                        <LineChart
                            width={1400}
                            height={450}
                            data={data}
                            margin={{top: 150, right: 20, left: 20, bottom: 40}}
                        >
                            {/* X-Axis in IST */}
                            <XAxis
                                dataKey={xKey}
                                tickFormatter={(val) => {
                                    if (!val) return "";
                                    const date = new Date(val);
                                    return date.toLocaleString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        hour12: false,
                                    });
                                }}
                                tickMargin={10}
                                minTickGap={30}
                            />

                            {/* Legend at bottom center */}
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{paddingTop: 10}}
                            />

                            {/* Tooltip in IST */}
                            <Tooltip
                                formatter={(value, name) => [
                                    `${parseFloat(value).toFixed(2)}`,
                                    name === "actual" ? "Actual Price" : "Predicted Price",
                                ]}
                                labelFormatter={(label) => {
                                    const date = new Date(label);
                                    return `Date: ${date.toLocaleString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        hour12: false,
                                    })}`;
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