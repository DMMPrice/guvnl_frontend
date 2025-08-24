// src/Component/Dashboards/SubstationFeederDashboard/DashboardCards.jsx
import React from "react";
import InfoCard from "@/Component/Utils/InfoCard.jsx";
import {
    FaBolt,
    FaFireAlt,
    FaExclamationTriangle,
    FaPercentage,
} from "react-icons/fa";

export default function DashboardCards({
                                           mode,           // "all" or "single"
                                           metricsAll,     // { actualAll, theoryAll, lossAll, lossAllPct }
                                           metricsSingle,  // { totalFeederEnergy, totalTheoretical, lossKWh, lossPercent }
                                       }) {
    if (mode === "all") {
        const {actualAll, theoryAll, lossAll, lossAllPct} = metricsAll;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <InfoCard
                    header="Actual Supply (kWh)"
                    value={actualAll.toFixed(2)}
                    icon={<FaBolt/>}
                    bgColor="bg-blue-50"
                    iconBgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <InfoCard
                    header="Theoretical Supply (kWh)"
                    value={theoryAll.toFixed(2)}
                    icon={<FaFireAlt/>}
                    bgColor="bg-red-50"
                    iconBgColor="bg-red-100"
                    textColor="text-red-600"
                />
                <InfoCard
                    header="Energy Loss (kWh)"
                    value={lossAll.toFixed(2)}
                    icon={<FaExclamationTriangle/>}
                    bgColor="bg-orange-50"
                    iconBgColor="bg-orange-100"
                    textColor="text-orange-600"
                />
                <InfoCard
                    header="Loss %"
                    value={`${lossAllPct.toFixed(2)}%`}
                    icon={<FaPercentage/>}
                    bgColor="bg-green-50"
                    iconBgColor="bg-green-100"
                    textColor="text-green-600"
                />
            </div>
        );
    } else {
        const {totalFeederEnergy, totalTheoretical, lossKWh, lossPercent} = metricsSingle;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <InfoCard
                    header="Actual Supply (kWh)"
                    value={totalFeederEnergy.toFixed(2)}
                    icon={<FaBolt/>}
                    bgColor="bg-blue-50"
                    iconBgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <InfoCard
                    header="Theoretical Supply (kWh)"
                    value={totalTheoretical.toFixed(2)}
                    icon={<FaFireAlt/>}
                    bgColor="bg-red-50"
                    iconBgColor="bg-red-100"
                    textColor="text-red-600"
                />
                <InfoCard
                    header="Energy Loss (kWh)"
                    value={lossKWh.toFixed(2)}
                    icon={<FaExclamationTriangle/>}
                    bgColor="bg-orange-50"
                    iconBgColor="bg-orange-100"
                    textColor="text-orange-600"
                />
                <InfoCard
                    header="Loss %"
                    value={`${lossPercent.toFixed(2)}%`}
                    icon={<FaPercentage/>}
                    bgColor="bg-green-50"
                    iconBgColor="bg-green-100"
                    textColor="text-green-600"
                />
            </div>
        );
    }
}