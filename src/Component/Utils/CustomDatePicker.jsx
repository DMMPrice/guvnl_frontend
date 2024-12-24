import React from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Ensure you have a utility for conditional classNames

export default function CustomDatePicker({
  label,
  selectedDate,
  onSelect,
  placeholder = "Pick a date",
}) {
  return (
    <div className="flex flex-col w-full sm:w-auto">
      <Label className="mb-2">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-40 justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}>
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
