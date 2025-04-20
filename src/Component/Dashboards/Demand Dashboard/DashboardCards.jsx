import React from "react";
import InfoCard from "../../Utils/InfoCard.jsx";
import {MdElectricBolt} from "react-icons/md";
import {FaIndianRupeeSign} from "react-icons/fa6";
import {TbBuildingFactory2} from "react-icons/tb";

const DashboardCards = ({stats}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp mt-4">
            <InfoCard
                header="Total Demand"
                value={stats.totalDemand}
                icon={<MdElectricBolt size={24}/>}
                textColor="text-blue-800"
                bgColor="bg-blue-100"
                iconBgColor="bg-blue-300"
                iconColor="text-blue-900"
                className="w-full"
            />

            <InfoCard
                header="Total Predicted Demand"
                value={stats.totalSupply}
                icon={<MdElectricBolt size={24}/>}
                textColor="text-green-800"
                bgColor="bg-green-100"
                iconBgColor="bg-green-300"
                iconColor="text-green-900"
                className="w-full"
            />

            <InfoCard
                header="Average Price"
                value={stats.averagePrice} // expects 'averagePrice'
                icon={<FaIndianRupeeSign size={24}/>}
                textColor="text-yellow-800"
                bgColor="bg-yellow-100"
                iconBgColor="bg-yellow-300"
                iconColor="text-yellow-900"
                className="w-full"
            />

            <InfoCard
                header="Total Plants"
                value={stats.totalPlants}
                icon={<TbBuildingFactory2 size={24}/>}
                textColor="text-purple-800"
                bgColor="bg-purple-100"
                iconBgColor="bg-purple-300"
                iconColor="text-purple-900"
                className="w-full"
            />
        </div>
    );
};

export default DashboardCards;
