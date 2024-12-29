import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function BasicDateTimePicker({ label, value, onChange }) {
  const shouldDisableTime = (timeValue, clockType) => {
    if (clockType === "minutes") {
      return timeValue % 15 !== 0;
    }
    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateTimePicker"]}>
        <DateTimePicker
          label={label}
          value={value}
          onChange={onChange}
          shouldDisableTime={shouldDisableTime}
          ampm={false}
          format="DD/MM/YYYY HH:mm"
          views={["year", "month", "day", "hours", "minutes"]}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
