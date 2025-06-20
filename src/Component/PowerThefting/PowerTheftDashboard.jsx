import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import CommonComposedChart from '../Utils/CommonComposedChart';
import CommonTable from "@/Component/Utils/CommonTable.jsx";
import { API_BASE } from "../../config.js";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const PowerTheftDashboard = () => {
  // Selection states
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedSubstation, setSelectedSubstation] = useState("");
  const [selectedFeeder, setSelectedFeeder] = useState("");
  const [selectedDTR, setSelectedDTR] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("00:00");
  
  // Data states
  const [distributionData, setDistributionData] = useState([]);
  const [lossData, setLossData] = useState([]);
  const [analysisType, setAnalysisType] = useState('distribution');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consumers, setConsumers] = useState([]);
  
  // API data states
  const [regions, setRegions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [substations, setSubstations] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [dtrs, setDTRs] = useState([]);
  
  // Time options for the time selector
  const timeOptions = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );

  // Initialize data on component mount
  useEffect(() => {
    fetchRegions();
    // Set default time to current hour
    const now = new Date();
    setSelectedTime(`${now.getHours().toString().padStart(2, '0')}:00`);
  }, []);
  // Fetch regions
  const fetchRegions = async () => {
    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE}region/all`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Try to get the response text first
      const responseText = await response.text();
      let data;
      
      try {
        // Try to parse it as JSON
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      if (!Array.isArray(data)) {
        console.error('Unexpected data format:', data);
        throw new Error('Invalid data format: expected an array of regions');
      }
      
      setRegions(data.length > 0 ? data : []);

      // Clear any existing error messages if the request was successful
      toast.dismiss();
    } catch (error) {
      console.error('Error fetching regions:', error);
      if (error.name === 'AbortError') {
        toast.error('Request timeout: Server is not responding');
      } else if (!navigator.onLine) {
        toast.error('Network error: Please check your internet connection');
      } else {
        toast.error(
          `Failed to fetch regions: ${error.message}. Please ensure the backend server is running at ${API_BASE}`
        );
      }
      setRegions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch divisions when region is selected
  useEffect(() => {
    if (selectedRegion) {
      fetchDivisions(selectedRegion);
      // Reset downstream selections
      setSelectedDivision("");
      setSelectedSubstation("");
      setSelectedFeeder("");
      setSelectedDTR("");
    } else {
      setDivisions([]);
      setSelectedDivision("");
      setSelectedSubstation("");
      setSelectedFeeder("");
      setSelectedDTR("");
    }
  }, [selectedRegion]);

  const fetchDivisions = async (regionId) => {
    try {
      setIsLoading(true);      const response = await fetch(`${API_BASE}division/by-region/${regionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch divisions');
      }
      
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error(`Failed to fetch divisions: ${error.message}`);
      setDivisions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch substations when division is selected
  useEffect(() => {
    if (selectedDivision) {
      fetchSubstations(selectedDivision);
      // Reset downstream selections
      setSelectedSubstation("");
      setSelectedFeeder("");
      setSelectedDTR("");
    } else {
      setSubstations([]);
      setSelectedSubstation("");
      setSelectedFeeder("");
      setSelectedDTR("");
    }
  }, [selectedDivision]);
  const fetchSubstations = async (divisionId) => {
    try {
      setIsLoading(true);
      console.log('Fetching substations for division:', divisionId);
      
      const response = await fetch(`${API_BASE}substation/by-division/${divisionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });

      console.log('Substation response status:', response.status);
      const responseText = await response.text();
      console.log('Substation response text:', responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse substation data:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!Array.isArray(data)) {
        console.error('Unexpected data format:', data);
        throw new Error('Invalid data format: expected an array of substations');
      }
      
      console.log('Received substations:', data);
      setSubstations(data);
    } catch (error) {
      console.error('Error fetching substations:', error);
      toast.error(`Failed to fetch substations: ${error.message}`);
      setSubstations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feeders when substation is selected
  useEffect(() => {
    if (selectedSubstation) {
      fetchFeeders(selectedSubstation);
      // Reset downstream selections
      setSelectedFeeder("");
      setSelectedDTR("");
    } else {
      setFeeders([]);
      setSelectedFeeder("");
      setSelectedDTR("");
    }
  }, [selectedSubstation]);  const fetchFeeders = async (substationId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}feeder/by-substation/${substationId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });

      const data = await response.json();

      // Handle both success and no-data scenarios
      if (response.ok) {
        if (data.status === "success" && Array.isArray(data.data)) {
          setFeeders(data.data);
        } else {
          setFeeders([]);
        }
      } else if (response.status === 404) {
        // Handle "No feeders found" case gracefully
        console.log('No feeders found for substation:', substationId);
        setFeeders([]);
        toast.info('No feeders available for this substation');
      } else {
        // Handle other error cases
        throw new Error(`Server error: ${response.status} - ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Error fetching feeders:', error);
      toast.error(`Failed to fetch feeders: ${error.message}`);
      setFeeders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch DTRs when feeder is selected
  useEffect(() => {
    if (selectedFeeder) {
      fetchDTRs(selectedFeeder);
      setSelectedDTR(""); // Reset DTR selection
    }
  }, [selectedFeeder]);

  const fetchDTRs = async (feederId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/dtr/by-feeder/${feederId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch DTRs');
      }
      
      setDTRs(data);
    } catch (error) {
      console.error('Error fetching DTRs:', error);
      toast.error(`Failed to fetch DTRs: ${error.message}`);
      setDTRs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch consumers when DTR is selected
  useEffect(() => {
    if (selectedDTR) {
      fetchConsumers(selectedDTR);
    } else {
      setConsumers([]);
    }
  }, [selectedDTR]);

  const fetchConsumers = async (dtrId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}consumer/by-dtr/${dtrId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch consumers');
      setConsumers(data);
    } catch (error) {
      toast.error(`Failed to fetch consumers: ${error.message}`);
      setConsumers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update data when selections change
  useEffect(() => {
    if (selectedRegion || selectedDivision || selectedSubstation || selectedFeeder || selectedDTR) {
      updateChartData();
    }
  }, [selectedRegion, selectedDivision, selectedSubstation, selectedFeeder, selectedDTR, selectedDate, selectedTime]);

  const updateChartData = async () => {
    setIsLoading(true);
    
    try {
      // Build the URL with required parameters
      const params = new URLSearchParams();
      if (selectedRegion) params.append('region_id', selectedRegion);
      if (selectedDivision) params.append('division_id', selectedDivision);
      if (selectedSubstation) params.append('substation_id', selectedSubstation);
      if (selectedFeeder) params.append('feeder_id', selectedFeeder);
      if (selectedDTR) params.append('dtr_id', selectedDTR);
      
      // Add date and time
      const formattedDate = selectedDate.toISOString().split('T')[0];
      params.append('date', formattedDate);
      params.append('time', selectedTime);
        const url = `${API_BASE}power-theft/analysis?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache' // Prevent caching
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Format the data
      const formattedData = data.map(item => ({
        timestamp: item.timestamp,
        substationSupply: item.substationSupply,
        feederSupply: item.feederSupply,
        dtrSupply: item.dtrSupply,
        consumerSupply: item.consumerSupply,
        substationLoss: item.substationLoss,
        feederLoss: item.feederLoss,
        dtrLoss: item.dtrLoss,
        totalLoss: item.totalLoss
      }));

      setDistributionData(formattedData);
      setLossData(formattedData);
      setTableData(analysisType === 'distribution' ? formattedData : formattedData);
    } catch (error) {
      console.error('Error updating chart data:', error);
      toast.error(`Failed to update data: ${error.message}`);
      
      // Generate fallback data on error
      const fallbackData = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const timestamp = new Date(
          selectedDate.getFullYear(), 
          selectedDate.getMonth(), 
          selectedDate.getDate(), 
          hour
        ).toISOString();
        
        // Generate realistic power values
        const peakHour = hour >= 18 && hour <= 22;
        const baseSupply = 1000;
        const variation = peakHour ? 300 : 100;
        const supplyFactor = peakHour ? 1.3 : 1;
        
        const substationSupply = (baseSupply * supplyFactor - Math.random() * variation).toFixed(2);
        const feederSupply = (substationSupply * 0.95 - Math.random() * 10).toFixed(2);
        const dtrSupply = (feederSupply * 0.93 - Math.random() * 10).toFixed(2);
        const consumerSupply = (dtrSupply * 0.91 - Math.random() * 10).toFixed(2);
        
        // Calculate losses
        const substationLoss = ((substationSupply - feederSupply) / substationSupply * 100).toFixed(2);
        const feederLoss = ((feederSupply - dtrSupply) / feederSupply * 100).toFixed(2);
        const dtrLoss = ((dtrSupply - consumerSupply) / dtrSupply * 100).toFixed(2);
        const totalLoss = ((substationSupply - consumerSupply) / substationSupply * 100).toFixed(2);
        
        return {
          timestamp,
          substationSupply,
          feederSupply,
          dtrSupply,
          consumerSupply,
          substationLoss,
          feederLoss,
          dtrLoss,
          totalLoss
        };
      });
      
      setDistributionData(fallbackData);
      setLossData(fallbackData);
      setTableData(analysisType === 'distribution' ? fallbackData : fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Combined chart configuration
  const chartConfig = {
    data: analysisType === 'distribution' ? distributionData : lossData,
    title: analysisType === 'distribution' ? "Power Distribution Analysis" : "Loss Analysis",
    xAxisKey: 'timestamp',
    xAxisFormatter: formatTimestamp,
    series: analysisType === 'distribution' ? [
      {
        key: 'substationSupply',
        label: 'Substation Supply',
        type: 'line',
        color: '#8884d8',
        unit: 'kWh'
      },
      {
        key: 'feederSupply',
        label: 'Feeder Supply',
        type: 'line',
        color: '#82ca9d',
        unit: 'kWh'
      },
      {
        key: 'dtrSupply',
        label: 'DTR Supply',
        type: 'line',
        color: '#ffc658',
        unit: 'kWh'
      },
      {
        key: 'consumerSupply',
        label: 'Consumer Supply',
        type: 'line',
        color: '#ff7300',
        unit: 'kWh'
      }
    ] : [
      {
        key: 'substationLoss',
        label: 'Substation Loss',
        type: 'area',
        color: 'rgba(136, 132, 216, 0.6)',
        stackId: '1',
        unit: '%'
      },
      {
        key: 'feederLoss',
        label: 'Feeder Loss',
        type: 'area',
        color: 'rgba(130, 202, 157, 0.6)',
        stackId: '1',
        unit: '%'
      },
      {
        key: 'dtrLoss',
        label: 'DTR Loss',
        type: 'area',
        color: 'rgba(255, 115, 0, 0.6)',
        stackId: '1',
        unit: '%'
      },
      {
        key: 'totalLoss',
        label: 'Total Loss',
        type: 'line',
        color: '#ff0000',
        stackId: null,
        unit: '%'
      }
    ]
  };

  // Distribution table columns
  const distributionColumns = [
    { 
      header: 'Time', 
      accessor: 'timestamp',
      cell: (value) => formatTimestamp(value)
    },
    { 
      header: 'Substation Supply (kWh)', 
      accessor: 'substationSupply',
      cell: (value) => Number(value).toLocaleString()
    },
    { 
      header: 'Feeder Supply (kWh)', 
      accessor: 'feederSupply',
      cell: (value) => Number(value).toLocaleString()
    },
    { 
      header: 'DTR Supply (kWh)', 
      accessor: 'dtrSupply',
      cell: (value) => Number(value).toLocaleString()
    },
    { 
      header: 'Consumer Supply (kWh)', 
      accessor: 'consumerSupply',
      cell: (value) => Number(value).toLocaleString()
    }
  ];

  // Loss table columns
  const lossColumns = [
    { 
      header: 'Time', 
      accessor: 'timestamp',
      cell: (value) => formatTimestamp(value)
    },
    { 
      header: 'Substation Loss (%)', 
      accessor: 'substationLoss',
      cell: (value) => `${Number(value).toFixed(2)}%`
    },
    { 
      header: 'Feeder Loss (%)', 
      accessor: 'feederLoss',
      cell: (value) => `${Number(value).toFixed(2)}%`
    },
    { 
      header: 'DTR Loss (%)', 
      accessor: 'dtrLoss',
      cell: (value) => `${Number(value).toFixed(2)}%`
    },
    { 
      header: 'Total Loss (%)', 
      accessor: 'totalLoss',
      cell: (value) => `${Number(value).toFixed(2)}%`
    }
  ];

  // Consumer details table columns
  const consumerColumns = [
    { header: 'Consumer Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Address', accessor: 'address' },
    { header: 'District', accessor: 'district' },
  ];

  // Update table data when analysis type changes
  useEffect(() => {
    setTableData(analysisType === 'distribution' ? distributionData : lossData);
  }, [analysisType, distributionData, lossData]);

  // Add color constants with proper opacity for readability
  const SELECTION_COLORS = {
    region: 'rgba(255, 165, 0, 0.1)',     // Orange
    regionHover: 'rgba(255, 165, 0, 0.2)',
    division: 'rgba(255, 215, 0, 0.1)',    // Gold
    divisionHover: 'rgba(255, 215, 0, 0.2)',
    substation: 'rgba(255, 0, 0, 0.1)',    // Red
    substationHover: 'rgba(255, 0, 0, 0.2)',
    feeder: 'rgba(0, 255, 0, 0.1)',        // Green
    feederHover: 'rgba(0, 255, 0, 0.2)',
    dtr: 'rgba(0, 0, 255, 0.1)',           // Blue
    dtrHover: 'rgba(0, 0, 255, 0.2)',
    date: 'rgba(128, 0, 128, 0.1)',        // Purple
    dateHover: 'rgba(128, 0, 128, 0.2)',
    time: 'rgba(0, 128, 128, 0.1)',        // Teal
    timeHover: 'rgba(0, 128, 128, 0.2)',
    analysis: 'rgba(75, 0, 130, 0.1)',     // Indigo
    analysisHover: 'rgba(75, 0, 130, 0.2)'
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Selection Controls */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {/* Region Selection */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.region,
              }}
            >
              <SelectValue placeholder="Select Region" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.region_id} value={region.region_id}>
                  {region.region_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Division Selection */}
          <Select 
            value={selectedDivision} 
            onValueChange={setSelectedDivision}
            disabled={!selectedRegion}
          >
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.division,
              }}
            >
              <SelectValue placeholder="Select Division" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((division) => (
                <SelectItem key={division.division_id} value={division.division_id}>
                  {division.division_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Substation Selection */}
          <Select 
            value={selectedSubstation} 
            onValueChange={setSelectedSubstation}
            disabled={!selectedDivision}
          >
            <SelectTrigger 
              className={`h-10 transition-colors hover:bg-opacity-20 ${
                !selectedDivision ? 'opacity-50' : ''
              }`}
              style={{ 
                backgroundColor: SELECTION_COLORS.substation,
              }}
            >
              <SelectValue 
                placeholder={
                  !selectedDivision 
                    ? "Select Division First" 
                    : substations.length === 0 
                      ? "No Substations" 
                      : "Select Substation"
                } 
                className="text-gray-800" 
              />
            </SelectTrigger>
            <SelectContent>
              {substations.map((substation) => (
                <SelectItem 
                  key={substation.substation_id} 
                  value={substation.substation_id || `substation-${substation.substation_id}`}
                >
                  {substation.substation_name || `Substation ${substation.substation_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Feeder Selection */}
          <Select 
            value={selectedFeeder} 
            onValueChange={setSelectedFeeder}
            disabled={!selectedSubstation}
          >
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.feeder,
              }}
            >
              <SelectValue placeholder="Select Feeder" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {feeders.map((feeder) => (
                <SelectItem key={feeder.feeder_id} value={feeder.feeder_id}>
                  {feeder.feeder_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* DTR Selection */}
          <Select 
            value={selectedDTR} 
            onValueChange={setSelectedDTR}
            disabled={!selectedFeeder}
          >
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.dtr,
              }}
            >
              <SelectValue placeholder="Select DTR" className="text-gray-800" />
            </SelectTrigger>
            <SelectContent>
              {dtrs.map((dtr) => (
                <SelectItem key={dtr.dtr_id} value={dtr.dtr_id}>
                  {dtr.location_description || `DTR ${dtr.dtr_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Selection */}
          <div 
            className="flex items-center rounded-md border px-3 py-2 h-10 transition-colors hover:bg-opacity-20"
            style={{ 
              backgroundColor: SELECTION_COLORS.date,
            }}
          >
            <Calendar className="mr-2 h-4 w-4 opacity-70" />
            <DatePicker 
              date={selectedDate} 
              onSelect={setSelectedDate} 
              className="bg-transparent w-full focus:outline-none"
            />
          </div>

          {/* Time Selection */}
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger 
              className="h-10 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.time,
              }}
            >
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 opacity-70" />
                <SelectValue placeholder="Select Time" className="text-gray-800" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Analysis Type Selection - Bottom Row */}
        <div className="mt-4 flex justify-end">
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger 
              className="h-10 w-48 transition-colors hover:bg-opacity-20"
              style={{ 
                backgroundColor: SELECTION_COLORS.analysis,
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
      </Card>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <Loader2 className="h-8 w-8 animate-spin mr-4 text-blue-500" />
            <p className="text-lg font-medium">Loading power distribution data...</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">{chartConfig.title}</h2>
        {distributionData?.length > 0 ? (
          <CommonComposedChart {...chartConfig} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No data available for selected criteria</p>
          </div>
        )}
      </Card>

      {/* Table Section */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          {analysisType === 'distribution' ? 'Power Distribution Data' : 'Loss Analysis Data'}
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
            <p className="text-gray-500">No data available for selected criteria</p>
          </div>
        )}
      </Card>

      {/* Consumer Details Section */}
      <Card className="p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Consumer Details</h2>
        {consumers.length > 0 ? (
          <CommonTable
            data={consumers}
            columns={consumerColumns}
            pagination={true}
            pageSize={10}
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">No consumer data available for selected DTR</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PowerTheftDashboard;