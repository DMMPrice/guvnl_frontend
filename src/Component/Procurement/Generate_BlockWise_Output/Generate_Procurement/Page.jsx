// GenerateProcurementPage.jsx
import React from "react";
import ProcurementForm from "./GenerateProcurementForm.jsx";
import DemandGenerationDashboard from "@/Component/Dashboards/Demand & Generation Dashboard/Page.jsx";

export default function GenerateProcurementPage() {
    return <>
        <ProcurementForm/>;
        <DemandGenerationDashboard/>
    </>

}