import * as React from "react";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone support and set default to IST
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

export default function BasicDatePicker({label, value, onChange, textFieldProps = {}}) {
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
            <DemoContainer components={["DatePicker"]}>
                <DatePicker
                    label={label}
                    value={value ? dayjs(value).tz("Asia/Kolkata") : null} // Keep it IST
                    onChange={(newValue) => {
                        if (newValue) {
                            const istDate = newValue.tz("Asia/Kolkata");
                            onChange(istDate);
                        } else {
                            onChange(null);
                        }
                    }}
                    format="DD/MM/YYYY"
                    views={["year", "month", "day"]}
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