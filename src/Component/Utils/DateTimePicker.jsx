import * as React from "react";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone support and set default to IST
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export default function BasicDateTimePicker({label, value, onChange, textFieldProps = {}}) {
    const shouldDisableTime = (timeValue, clockType) => {
        if (clockType === "minutes") {
            return timeValue % 15 !== 0;
        }
        return false;
    };

    const defaultTextFieldProps = {
        sx: {
            "& .MuiOutlinedInput-root": {
                "& fieldset": {
                    borderColor: "blue",
                },
                "&:hover fieldset": {
                    borderColor: "blue",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "blue",
                },
            },
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                    label={label}
                    value={value ? dayjs(value).tz("Asia/Kolkata") : null} // Ensure it's treated as IST
                    onChange={(newValue) => {
                        // Convert and pass value in IST timezone
                        if (newValue) {
                            const istTime = newValue.tz("Asia/Kolkata");
                            onChange(istTime);
                        } else {
                            onChange(null);
                        }
                    }}
                    shouldDisableTime={shouldDisableTime}
                    ampm={false}
                    format="DD/MM/YYYY HH:mm"
                    views={["year", "month", "day", "hours", "minutes"]}
                    slotProps={{
                        textField: {
                            ...defaultTextFieldProps,
                            ...textFieldProps,
                        },
                    }}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
}