import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputForm({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  handleSubmit,
}) {
  const [showModal, setShowModal] = useState(false);
  const [exchangePriceCap, setExchangePriceCap] = useState("");

  // Generate time options in 15-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");
      timeOptions.push(`${h}:${m}`);
    }
  }

  // Generate price cap options from 1 to 50
  const priceCapOptions = [];
  for (let i = 1; i <= 50; i++) {
    priceCapOptions.push(i);
  }

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime("");
    setEndTime("");
    setExchangePriceCap("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime || !exchangePriceCap) {
      setShowModal(true);
    } else {
      handleSubmit({
        startDate,
        endDate,
        startTime,
        endTime,
        exchangePriceCap,
      });
    }
  };

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleFormSubmit} className="w-full">
        <div className="flex flex-wrap items-end gap-4 w-full">
          {/* Start Date Picker */}
          <div className="flex flex-col w-full sm:w-auto">
            <Label className="mb-2">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-40 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}>
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time Picker */}
          <div className="flex flex-col w-full sm:w-auto">
            <Label className="mb-2">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Select time" />
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

          {/* End Date Picker */}
          <div className="flex flex-col w-full sm:w-auto">
            <Label className="mb-2">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-40 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}>
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Time Picker */}
          <div className="flex flex-col w-full sm:w-auto">
            <Label className="mb-2">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Select time" />
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

          {/* Exchange Price Cap Picker */}
          <div className="flex flex-col w-full sm:w-auto">
            <Label className="mb-2">Exchange Price Cap</Label>
            <Select
              value={exchangePriceCap}
              onValueChange={setExchangePriceCap}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Select Price" />
              </SelectTrigger>
              <SelectContent>
                {priceCapOptions.map((price) => (
                  <SelectItem key={price} value={String(price)}>
                    {price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col w-full sm:w-auto">
            <Button type="submit" className="mt-6 w-full sm:w-auto">
              Submit
            </Button>
          </div>

          {/* Clear Button */}
          <div className="flex flex-col w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleClear}
              className="mt-6 w-full sm:w-auto">
              Clear
            </Button>
          </div>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogTitle>Missing Information</DialogTitle>
            <DialogDescription>
              Please enter all required values before submitting the form.
            </DialogDescription>
            <DialogClose asChild>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
