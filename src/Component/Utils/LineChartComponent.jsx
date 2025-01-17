import React from "react";
import { LineChart, Line, XAxis, YAxis, Legend, Tooltip } from "recharts";

const LineChartComponent = ({ data, xAxisKey, lines, chartTitle }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">{chartTitle}</h2>
      <LineChart
        width={600} // Adjust width if needed
        height={400} // Consistent height for alignment
        data={data}
        margin={{ top: 20, right: 20, bottom: 40, left: 20 }} // Uniform margins
      >
        <XAxis
          dataKey={xAxisKey}
          tick={false}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return `${date.getHours()}:${String(date.getMinutes()).padStart(
              2,
              "0"
            )}`;
          }}
        />
        <YAxis tick={false} />
        <Tooltip />
        {/* <Legend /> */}
        {lines.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            name={line.label}
            dot={false} // Removes individual points for cleaner lines
          />
        ))}
      </LineChart>
    </div>
  );
};

export default LineChartComponent;
