import React from "react";
import InfoCard from "../../Utils/InfoCard.jsx";
import {FaIndustry} from "react-icons/fa";
import {MdDateRange} from "react-icons/md";
import {PiNuclearPlantFill} from "react-icons/pi";

function PlantInfoCards({mustRunCount, otherCount}) {
    const total = mustRunCount + otherCount;
    return (
        <div className="flex justify-center space-x-10 mt-1">
            <InfoCard
                header="Must Run Plants"
                value={mustRunCount}
                icon={<PiNuclearPlantFill size={24}/>}
                bgColor="bg-green-100"
                textColor="text-green-800"
                iconBgColor="bg-green-300"
                iconColor="text-green-900"
                className="w-72" // Increased width
            />
            <InfoCard
                header="Other Plants"
                value={otherCount}
                icon={<FaIndustry size={24}/>}
                bgColor="bg-blue-100"
                textColor="text-blue-800"
                iconBgColor="bg-blue-300"
                iconColor="text-blue-900"
                className="w-72" // Increased width
            />
            <InfoCard
                header="Total Plants"
                value={total}
                icon={<PiNuclearPlantFill size={24}/>}
                bgColor="bg-yellow-100"
                textColor="text-yellow-800"
                iconBgColor="bg-yellow-300"
                iconColor="text-yellow-900"
                className="w-72" // Increased width
            />
            <InfoCard
                header="Updated Since"
                value={"2024"}
                icon={<MdDateRange size={24}/>}
                bgColor="bg-red-100"
                textColor="text-white-800"
                iconBgColor="bg-red-300"
                iconColor="text-red-900"
                className="w-72" // Increased width
            />
        </div>
    );
}

export default PlantInfoCards;
