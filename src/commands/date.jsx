import React from "react";

export const executeDate = () => {
    const now = new Date();
    // Ex: "ven. 20 mars 2026 15:30:00 CET"
    const formatted = now.toLocaleString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
    });
    
    return <span>{formatted}</span>;
};
