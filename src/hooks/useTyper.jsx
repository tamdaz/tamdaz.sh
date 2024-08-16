import React from "react";

export default function useTyper(text) {
    const [range, setRange] = React.useState(0);
    const [value, setValue] = React.useState("");

    React.useEffect(() => {
        const interval = setInterval(() => {
            setValue(text.substr(0, range) + String.fromCharCode((range % 32 <= 32 / 2) ? "32" : "9608"));
        }, 16);

        if (value.length >= range) {
            setRange(n => n + 1);
        }

        return () => {
            clearInterval(interval);
        }
    }, [value]);

    return value;
}