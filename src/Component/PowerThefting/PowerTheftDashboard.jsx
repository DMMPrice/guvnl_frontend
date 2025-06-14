import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import InfoCard from "@/Component/Utils/InfoCard";
import BasicDateTimePicker from "@/Component/Utils/DateTimePicker";
import { BarChart, LineChart, Bar as RechartsBar, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const PowerTheftDashboard = () => {
  const [open, setOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState({
    locations: [],
    substations: [],
    feeders: []
  });
  const [openStats, setOpenStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [chartData, setChartData] = useState({
    stageData: [],
    feederData: []
  });

  const stats = [
    {
      id: 'total',
      title: "Total Theft Cases",
      value: "1,234",
      change: "+12%",
      description: "Total cases detected",
      details: [
        { label: "High Priority", value: "456", change: "+15%" },
        { label: "Medium Priority", value: "589", change: "+10%" },
        { label: "Low Priority", value: "189", change: "+5%" }
      ]
    },
    {
      id: 'active',
      title: "Active Cases",
      value: "456",
      change: "-2%",
      description: "Currently under investigation",
      details: [
        { label: "Under Investigation", value: "234", change: "-5%" },
        { label: "Pending Review", value: "122", change: "+2%" },
        { label: "Evidence Collection", value: "100", change: "-3%" }
      ]
    },
    {
      id: 'resolved',
      title: "Resolved Cases",
      value: "778",
      change: "+8%",
      description: "Successfully closed cases",
      details: [
        { label: "Prosecution", value: "445", change: "+12%" },
        { label: "Settlement", value: "223", change: "+5%" },
        { label: "Dismissed", value: "110", change: "-2%" }
      ]
    }
  ];

  const stageData = [
    { stage: 'Stage 1', percentage: 33.79, description: 'Substation to Feeder Loss' },
    { stage: 'Stage 2', percentage: 12.14, description: 'Feeder to DTR Loss' },
    { stage: 'Stage 3', percentage: 54.07, description: 'DTR to Consumer Loss' },
  ];

  const feederData = [
    { name: 'Feeder1', cases: 65, trend: '+5%' },
    { name: 'Feeder2', cases: 59, trend: '-2%' },
    { name: 'Feeder3', cases: 80, trend: '+8%' },
    { name: 'Feeder4', cases: 81, trend: '+10%' },
    { name: 'Feeder5', cases: 56, trend: '-3%' },
  ];

  // Sample data for dropdowns
  const locations = [
    { id: "north", label: "North District" },
    { id: "south", label: "South District" },
    { id: "east", label: "East District" },
  ];

  const substations = {
    north: [
      { id: "sub1", label: "Substation 1" },
      { id: "sub2", label: "Substation 2" },
    ],
    south: [
      { id: "sub3", label: "Substation 3" },
      { id: "sub4", label: "Substation 4" },
    ],
  };

  const feeders = {
    sub1: [
      { id: "feed1", label: "Feeder 1" },
      { id: "feed2", label: "Feeder 2" },
    ],
    sub2: [
      { id: "feed3", label: "Feeder 3" },
      { id: "feed4", label: "Feeder 4" },
    ],
  };

  const toggleItem = (type, item) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(item.id) 
        ? prev[type].filter(id => id !== item.id)
        : [...prev[type], item.id]
    }));
  };

  const toggleStats = (id) => {
    setOpenStats(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Dummy data generator functions
  const generateStageData = (areas, date) => {
    // Generate different percentages based on selected areas
    return [
      {
        stage: 'Stage 1',
        percentage: 30 + Math.random() * 10,
        description: 'Substation to Feeder Loss'
      },
      {
        stage: 'Stage 2',
        percentage: 10 + Math.random() * 10,
        description: 'Feeder to DTR Loss'
      },
      {
        stage: 'Stage 3',
        percentage: 50 + Math.random() * 10,
        description: 'DTR to Consumer Loss'
      }
    ];
  };

  const generateFeederData = (areas, date) => {
    const selectedFeeders = areas.feeders.length || 5;
    return Array.from({ length: selectedFeeders }, (_, i) => ({
      name: areas.feeders[i]?.label || `Feeder${i + 1}`,
      cases: 50 + Math.floor(Math.random() * 40),
      trend: Math.random() > 0.5 ? '+' : '-' + Math.floor(Math.random() * 10) + '%'
    }));
  };

  // Update charts when selection changes
  useEffect(() => {
    const updateCharts = () => {
      const newStageData = generateStageData(selectedItems, selectedDate);
      const newFeederData = generateFeederData(selectedItems, selectedDate);
      
      setChartData({
        stageData: newStageData,
        feederData: newFeederData
      });
    };

    updateCharts();
  }, [selectedItems, selectedDate]);

  // Update your existing date picker handler
  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Power Theft Monitoring Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-[280px]">
            <BasicDateTimePicker 
              label="Select Date & Time"
              value={selectedDate}
              onChange={handleDateChange}
              textFieldProps={{
                sx: {
                  width: '100%',
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    minHeight: "40px",
                    maxHeight: "40px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& fieldset": {
                      borderColor: "rgb(var(--primary))",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgb(var(--primary))",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgb(var(--primary))",
                    },
                  },
                  "& .MuiInputBase-root": {
                    overflow: "hidden",
                  },
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                  },
                },
              }}
            />
          </div>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[280px] h-10 justify-between"
              >
                <span>Select Areas</span>
                <span className="text-xs text-muted-foreground">
                  {Object.values(selectedItems).flat().length} selected
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search area..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Locations">
                    {locations.map((location) => (
                      <CommandItem
                        key={location.id}
                        onSelect={() => toggleItem('locations', location)}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedItems.locations.includes(location.id) ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}>
                          <Check className={cn("h-4 w-4", selectedItems.locations.includes(location.id) ? "opacity-100" : "opacity-0")} />
                        </div>
                        {location.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  
                  <CommandSeparator />
                  
                  <CommandGroup heading="Substations">
                    {Object.values(substations).flat().map((substation) => (
                      <CommandItem
                        key={substation.id}
                        onSelect={() => toggleItem('substations', substation)}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedItems.substations.includes(substation.id) ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}>
                          <Check className={cn("h-4 w-4", selectedItems.substations.includes(substation.id) ? "opacity-100" : "opacity-0")} />
                        </div>
                        {substation.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  
                  <CommandSeparator />
                  
                  <CommandGroup heading="Feeders">
                    {Object.values(feeders).flat().map((feeder) => (
                      <CommandItem
                        key={feeder.id}
                        onSelect={() => toggleItem('feeders', feeder)}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedItems.feeders.includes(feeder.id) ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}>
                          <Check className={cn("h-4 w-4", selectedItems.feeders.includes(feeder.id) ? "opacity-100" : "opacity-0")} />
                        </div>
                        {feeder.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Collapsible
            key={stat.id}
            open={openStats[stat.id]}
            onOpenChange={() => toggleStats(stat.id)}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{stat.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        stat.change.startsWith('+') ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    openStats[stat.id] && "transform rotate-180"
                  )}/>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-2">
                {stat.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm font-medium">{detail.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{detail.value}</span>
                      <span className={cn(
                        "text-xs",
                        detail.change.startsWith('+') ? "text-green-600" : "text-red-600"
                      )}>
                        {detail.change}
                      </span>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loss Distribution by Stage</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`} />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Loss Percentage']} />
                <RechartsBar
                  dataKey="percentage"
                  fill="#60A5FA"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4 mt-4">
            {chartData.stageData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b">
                <div>
                  <h3 className="font-medium">{item.stage}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {item.percentage}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Theft Cases Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.feederData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <RechartsLine
                  type="monotone"
                  dataKey="cases"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4 mt-4">
            {chartData.feederData.map((feeder, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b">
                <div>
                  <h3 className="font-medium">{feeder.name}</h3>
                  <p className="text-sm text-gray-500">Total Cases</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{feeder.cases}</span>
                  <span className={`text-sm ${
                    feeder.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feeder.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">District-wise Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['North 24 Parganas', 'Howrah', 'Hooghly', 'Kolkata (North)', 'South 24 Parganas'].map((district) => (
            <Card key={district} className="p-4 text-center bg-gray-50">
              <h3 className="font-medium">{district}</h3>
              <p className="text-2xl font-bold mt-2 text-red-600">12%</p>
              <p className="text-sm text-gray-500">Loss Rate</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PowerTheftDashboard;