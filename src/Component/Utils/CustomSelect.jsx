import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // Ensure this utility exists

export default function CustomSelect({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = "Select option",
  triggerWidth = "w-full sm:w-32",
}) {
  const handleChange = (val) => {
    // console.log(`CustomSelect [${label}] selected value:`, val); // Debug log
    onValueChange(val);
  };

  return (
    <div className="flex flex-col w-full sm:w-auto">
      <Label className="mb-2">{label}</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger
          className={cn(
            "w-full sm:w-40 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
