import React, { useEffect, useState } from "react";
import CSVDownloadModal from "./CSVDownloadModal.jsx";

// Safely stringify any cell
const safeCell = (value) => {
    if (value == null) return "";
    return typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
};

const CSVResponseHandler = ({ responses, onClose }) => {
    const [consolidatedUrl, setConsolidatedUrl] = useState(null);
    const [rawUrl, setRawUrl] = useState(null);

    useEffect(() => {
        if (!responses?.length) return;

        // ── Build consolidated rows ─────────────────────────────
        const consolidatedRows = responses.map((resp) => {
            const must = resp.Must_Run || [];
            const other = resp.Remaining_Plants || [];
            let iexGist = "";
            const iex = resp.IEX_Data;

            if (Array.isArray(iex)) {
                iexGist = iex
                    .map(
                        (p) =>
                            `Predicted Price: ${p.Pred_Price} | Predicted Quantity: ${p.Qty_Pred}`
                    )
                    .join(" ; ");
            } else if (iex && typeof iex === "object") {
                iexGist = `Predicted Price: ${iex.Pred_Price} | Predicted Quantity: ${iex.Qty_Pred}`;
            }

            return {
                "TimeStamp": resp.TimeStamp,
                "Demand (Actual) [kWh]": resp["Demand(Actual)"],
                "Demand (Predicted) [kWh]": resp["Demand(Pred)"],
                "Backdown_Cost [Rs]": resp.Backdown_Cost,
                "Backdown_Cost_Min [Rs]": resp.Backdown_Cost_Min,
                "Backdown_Unit [kWh]": resp.Backdown_Unit,
                "Banking Unit [kWh]": resp.Banking_Unit,
                "Net Demand [kWh]": resp.Demand_Banked,
                "Total Must Run Generation [kWh]": resp.Must_Run_Total_Gen,
                "Total Cost Must Run Generation [Rs]": resp.Must_Run_Total_Cost,
                "Details of Must Run Generation": must.map((p) => ({
                    Aux_Consumption: p.Aux_Consumption,
                    PAF: p.PAF,
                    PLF: p.PLF,
                    Rated_Capacity: p.Rated_Capacity,
                    Type: p.Type,
                    Variable_Cost: p.Variable_Cost,
                    generated_energy: p.generated_energy,
                    max_power: p.max_power,
                    min_power: p.min_power,
                    net_cost: p.net_cost,
                    plant_code: p.plant_code,
                    plant_name: p.plant_name,
                })),
                "Must Run Generation Gist": must
                    .map((p) =>
                        `Plant Code: ${p.plant_code}|Plant Name: ${p.plant_name}|Rated Capacity: ${p.Rated_Capacity} MW|Variable Cost: Rs ${p.Variable_Cost}|Generated Energy: ${p.generated_energy} kWh|Net Cost: Rs ${p.net_cost}`
                    )
                    .join(" ;\n"),
                "Others Plant Total Generation [kWh]": resp.Remaining_Plants_Total_Gen,
                "Total Cost Others Plant [Rs]": resp.Remaining_Plants_Total_Cost,
                "Other Plants Details": other.map((p) => ({
                    Aux_Consumption: p.Aux_Consumption,
                    Variable_Cost: p.Variable_Cost,
                    backdown_cost: p.backdown_cost,
                    backdown_rate: p.backdown_rate,
                    generated_energy: p.generated_energy,
                    max_power: p.max_power,
                    min_power: p.min_power,
                    net_cost: p.net_cost,
                    paf: p.paf,
                    plant_code: p.plant_code,
                    plant_name: p.plant_name,
                    plf: p.plf,
                    rated_capacity: p.rated_capacity,
                })),
                "Other Plant Generation Gist": other
                    .map((p) =>
                        `Plant Code: ${p.plant_code}|Plant Name: ${p.plant_name}|Rated Capacity: ${p.rated_capacity} MW|Variable Cost: Rs ${p.Variable_Cost}|Generated Energy: ${p.generated_energy} kWh|Net Cost: Rs ${p.net_cost}|PLF: ${(p.plf ?? 1) * 100} %|Backdown Cost: Rs ${p.backdown_cost}|Backdown Rate: Rs ${p.backdown_rate}`
                    )
                    .join(" ;\n"),
                "Power Exchange Qty [kWh]": resp.IEX_Gen,
                "Power Exchange Cost [Rs]": resp.IEX_Cost,
                "Power Exchange Details": iexGist,
                "Backdown Cost [Rs]": resp.Backdown_Cost,
                "Rate per Block [Inclusive of all]": resp.Cost_Per_Block,
                "Block wise Max Price": resp.Last_Price,
            };
        });

        // ── Raw rows from original response ─────────────────────
        const rawRows = responses;

        // ── Helper: Convert rows into downloadable CSV blob ─────
        const makeCsvUrl = (rows) => {
            const headers = Object.keys(rows[0]);
            const lines = [
                headers.join(","),
                ...rows.map(r =>
                    headers
                        .map(h => `"${safeCell(r[h]).replace(/"/g, '""')}"`)
                        .join(",")
                )
            ];
            const blob = new Blob([lines.join("\n")], { type: "text/csv" });
            return URL.createObjectURL(blob);
        };

        setConsolidatedUrl(makeCsvUrl(consolidatedRows));
        setRawUrl(makeCsvUrl(rawRows));
    }, [responses]);

    if (!consolidatedUrl || !rawUrl) return null;

    return (
        <CSVDownloadModal
            consolidatedUrl={consolidatedUrl}
            rawUrl={rawUrl}
            onClose={onClose}
        />
    );
};

export default CSVResponseHandler;