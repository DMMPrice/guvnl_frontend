import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import CommonComposedChart from '../Utils/CommonComposedChart';
// import { BasicDateTimePicker } from '../Utils/DateTimeBlock';
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PowerTheftDashboard = () => {
  // States for selections
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedFeeder, setSelectedFeeder] = useState("");
  const [selectedDTR, setSelectedDTR] = useState("");
  const [distributionData, setDistributionData] = useState([]);
  const [lossData, setLossData] = useState([]);
  // Add analysis type selection
  const [analysisType, setAnalysisType] = useState('distribution');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    updateChartData();
  }, []);

  // Dummy data structure
  const dummyData = {
    districts: [
      { id: 1, name: "North 24 Parganas" },
      { id: 2, name: "Howrah" },
      { id: 3, name: "Hooghly" },
      { id: 4, name: "Kolkata (North)" },
      { id: 5, name: "South 24 Parganas" }
    ],
    feeders: {
      1: [{ id: "FEEDER1", name: "Feeder 1" }],
      2: [{ id: "FEEDER2", name: "Feeder 2" }],
      3: [{ id: "FEEDER3", name: "Feeder 3" }]
    },
    dtrs: {
      FEEDER1: [{ id: "DTR1", name: "DTR 1" }],
      FEEDER2: [{ id: "DTR2", name: "DTR 2" }],
      FEEDER3: [{ id: "DTR3", name: "DTR 3" }]
    }
  };

  const generateLossData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(2023, 0, 1, i).toISOString(),
      substationLoss: (1 + Math.random() * 0.5).toFixed(3), // 1-1.5% loss
      feederLoss: (6 + Math.random() * 1).toFixed(3),      // 6-7% loss
      dtrLoss: (9 + Math.random() * 1).toFixed(3),         // 9-10% loss
      totalLoss: (16 + Math.random() * 2).toFixed(3)       // 16-18% total loss
    }));
  };

  // Effect to update data when selections change
  useEffect(() => {
    if (selectedDistrict || selectedFeeder || selectedDTR) {
      updateChartData();
    }
  }, [selectedDistrict, selectedFeeder, selectedDTR]);
  const updateChartData = () => {
    setIsLoading(true);
    
    try {
      // Generate distribution data
      const newDistributionData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(2023, 0, 1, i).toISOString(),
        substationSupply: (440 + Math.random() * 10).toFixed(2),
        feederSupply: (435 + Math.random() * 8).toFixed(2),
        dtrSupply: (407 + Math.random() * 6).toFixed(2),
        consumerSupply: (368 + Math.random() * 5).toFixed(2)
      }));

      // Generate loss data
      const newLossData = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(2023, 0, 1, i).toISOString(),
        substationLoss: (1 + Math.random() * 0.5).toFixed(3),
        feederLoss: (6 + Math.random() * 1).toFixed(3),
        dtrLoss: (9 + Math.random() * 1).toFixed(3),
        totalLoss: (16 + Math.random() * 2).toFixed(3)
      }));

      setDistributionData(newDistributionData);
      setLossData(newLossData);
      setTableData(analysisType === 'distribution' ? newDistributionData : newLossData);
    } catch (error) {
      console.error('Error updating chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Combined chart configuration
  const chartConfig = {
    data: analysisType === 'distribution' ? distributionData : lossData,
    title: analysisType === 'distribution' ? "Power Distribution Analysis" : "Loss Analysis",
    series: analysisType === 'distribution' ? [
      {
        key: 'substationSupply',
        label: 'Substation Supply',
        type: 'line',
        color: '#8884d8'
      },
      {
        key: 'feederSupply',
        label: 'Feeder Supply',
        type: 'line',
        color: '#82ca9d'
      },
      {
        key: 'dtrSupply',
        label: 'DTR Supply',
        type: 'line',
        color: '#ffc658'
      },
      {
        key: 'consumerSupply',
        label: 'Consumer Supply',
        type: 'line',
        color: '#ff7300'
      }
    ] : [
      {
        key: 'substationLoss',
        label: 'Substation Loss %',
        type: 'area',
        color: 'rgba(136, 132, 216, 0.6)',
        stackId: '1'
      },
      {
        key: 'feederLoss',
        label: 'Feeder Loss %',
        type: 'area',
        color: 'rgba(130, 202, 157, 0.6)',
        stackId: '1'
      },
      {
        key: 'dtrLoss',
        label: 'DTR Loss %',
        type: 'area',
        color: 'rgba(255, 115, 0, 0.6)',
        stackId: '1'
      },
      {
        key: 'totalLoss',
        label: 'Total Loss %',
        type: 'line',
        color: '#ff0000',
        stackId: null
      }
    ]
  };

  // Distribution table columns
  const distributionColumns = [
    { header: 'Time', accessor: 'timestamp' },
    { header: 'Substation Supply', accessor: 'substationSupply' },
    { header: 'Feeder Supply', accessor: 'feederSupply' },
    { header: 'DTR Supply', accessor: 'dtrSupply' },
    { header: 'Consumer Supply', accessor: 'consumerSupply' }
  ];

  // Loss table columns
  const lossColumns = [
    { header: 'Time', accessor: 'timestamp' },
    { header: 'Substation Loss %', accessor: 'substationLoss' },
    { header: 'Feeder Loss %', accessor: 'feederLoss' },
    { header: 'DTR Loss %', accessor: 'dtrLoss' },
    { header: 'Total Loss %', accessor: 'totalLoss' }
  ];

  // Update table data when analysis type changes
  useEffect(() => {
    setTableData(analysisType === 'distribution' ? distributionData : lossData);
  }, [analysisType]);

  // Add color constants with proper opacity for readability
  const SELECTION_COLORS = {
    district: 'rgba(255, 0, 0, 0.1)',    // Light Red
    districtHover: 'rgba(255, 0, 0, 0.2)',
    feeder: 'rgba(0, 255, 0, 0.1)',      // Light Green
    feederHover: 'rgba(0, 255, 0, 0.2)',
    dtr: 'rgba(0, 0, 255, 0.1)',         // Light Blue
    dtrHover: 'rgba(0, 0, 255, 0.2)',
    analysis: 'rgba(128, 0, 128, 0.1)',  // Light Purple
    analysisHover: 'rgba(128, 0, 128, 0.2)'
  };

  return (
    <div className="container mx-auto p-6">
      {/* Selection Controls */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* District Selection - Red Background */}
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.district,
                '&:hover': {
                  backgroundColor: SELECTION_COLORS.districtHover
                }
              }}
            >
              <SelectValue placeholder="Select District" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {dummyData.districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Feeder Selection - Green Background */}
          <Select value={selectedFeeder} onValueChange={setSelectedFeeder}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.feeder,
                '&:hover': {
                  backgroundColor: SELECTION_COLORS.feederHover
                }
              }}
            >
              <SelectValue placeholder="Select Feeder" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {selectedDistrict && 
                dummyData.feeders[selectedDistrict]?.map((feeder) => (
                  <SelectItem key={feeder.id} value={feeder.id}>
                    {feeder.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* DTR Selection - Blue Background */}
          <Select value={selectedDTR} onValueChange={setSelectedDTR}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.dtr,
                '&:hover': {
                  backgroundColor: SELECTION_COLORS.dtrHover
                }
              }}
            >
              <SelectValue placeholder="Select DTR" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {selectedFeeder && 
                dummyData.dtrs[selectedFeeder]?.map((dtr) => (
                  <SelectItem key={dtr.id} value={dtr.id}>
                    {dtr.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Analysis Type Selection - Purple Background */}
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.analysis,
                '&:hover': {
                  backgroundColor: SELECTION_COLORS.analysisHover
                }
              }}
            >
              <SelectValue placeholder="Select Analysis Type" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distribution">Power Distribution</SelectItem>
              <SelectItem value="loss">Loss Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>      {/* Chart Section */}
      <Card className="p-4 mb-6">
        {distributionData?.length > 0 && lossData?.length > 0 ? (
          <CommonComposedChart {...chartConfig} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading data...</p>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {analysisType === 'distribution' ? 'Distribution Data' : 'Loss Analysis Data'}
        </h2>
        {tableData?.length > 0 ? (
          <CommonTable
            data={tableData}
            columns={analysisType === 'distribution' ? distributionColumns : lossColumns}
            pagination={true}
            pageSize={10}
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Loading data...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PowerTheftDashboard;