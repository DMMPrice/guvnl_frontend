import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import CustomSelect from "../Utils/CustomSelect";
import CustomDatePicker from "../Utils/CustomDatePicker";

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
    console.log("Form cleared");
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
      console.log("Form submitted with values:", {
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
          <CustomDatePicker
            label="Start Date"
            selectedDate={startDate}
            onSelect={setStartDate}
            placeholder="Pick a date"
          />

          {/* Start Time Select */}
          <CustomSelect
            label="Start Time"
            value={startTime}
            onValueChange={setStartTime}
            options={timeOptions}
            placeholder="Select time"
          />

          {/* End Date Picker */}
          <CustomDatePicker
            label="End Date"
            selectedDate={endDate}
            onSelect={setEndDate}
            placeholder="Pick a date"
          />

          {/* End Time Select */}
          <CustomSelect
            label="End Time"
            value={endTime}
            onValueChange={setEndTime}
            options={timeOptions}
            placeholder="Select time"
          />

          {/* Exchange Price Cap Select */}
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
