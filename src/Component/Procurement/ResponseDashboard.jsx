import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table.tsx";

const ResponseDashboard = ({
  aggregatedData,
  startTimestamp,
  endTimestamp,
}) => {
  return (
    <div className="mt-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Aggregated Plant Data:</h2>
        <p>Start Timestamp: {startTimestamp}</p>
        <p>End Timestamp: {endTimestamp}</p>
      </div>
      {Object.keys(aggregatedData).length > 0 ? (
        <div className="w-full space-y-8">
          <div className="rounded-md border">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="w-[200px] font-medium">
                    Plant Name
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">
                    Total Generated Energy
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">
                    Total Net Cost
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">
                    Plant Type
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">
                    Total Variable Cost
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">
                    Entries Count
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(aggregatedData.plants).map((plant) => (
                  <TableRow key={plant.plant_name}>
                    <TableCell>{plant.plant_name}</TableCell>
                    <TableCell>
                      {plant.total_generated_energy.toFixed(2)}
                    </TableCell>
                    <TableCell>{plant.total_net_cost.toFixed(2)}</TableCell>
                    <TableCell>{plant.type}</TableCell>
                    <TableCell>
                      {plant.total_variable_cost.toFixed(2)}
                    </TableCell>
                    <TableCell>{plant.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-md border">
            <h3 className="text-xl font-bold p-4">Total IEX Data:</h3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="w-[200px] font-medium">
                    Metric
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Predicted Price</TableCell>
                  <TableCell>
                    {aggregatedData.totalIEXData.Pred_Price.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Quantity Predicted</TableCell>
                  <TableCell>
                    {aggregatedData.totalIEXData.Qty_Pred.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No aggregated data to display.</p>
      )}
    </div>
  );
};

export default ResponseDashboard;
