// src/Component/Utils/BasicDateTimePicker.jsx
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

export default function BasicDateTimePicker({
                                                label,
                                                value,
                                                onChange,
                                                textFieldProps = {},
                                            }) {
    const defaultTextFieldProps = {
        sx: {
            "& .MuiOutlinedInput-root": {
                "& fieldset": {borderColor: "blue"},
                "&:hover fieldset": {borderColor: "blue"},
                "&.Mui-focused fieldset": {borderColor: "blue"},
            },
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateTimePicker"]}>
                <DateTimePicker
                    label={label}
                    value={value ? dayjs(value).tz("Asia/Kolkata") : null}
                    onChange={(newValue) => {
                        if (newValue) {
                            const istTime = newValue.tz("Asia/Kolkata");
                            onChange(istTime.format("YYYY-MM-DD HH:mm:ss"));
                        } else {
                            onChange(null);
                        }
                    }}

                    // ─── only allow 15-minute steps ────────────────────
                    ampm={false}
                    minutesStep={15}

                    // ─── which views to show ────────────────────────────
                    views={["year", "month", "day", "hours", "minutes"]}
                    format="YYYY-MM-DD HH:mm:ss"

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