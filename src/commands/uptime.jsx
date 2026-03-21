import React from "react";
import { getBootTimeMs } from "./processSystem";

export const executeUptime = () => {
    const bootTime = getBootTimeMs();
    const now = Date.now();
    const elapsedMs = now - bootTime;
    
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    let uptimeStr = "";
    
    if (elapsedMs < minute) {
        uptimeStr = "up less than a minute";
    } else {
        const days = Math.floor(elapsedMs / day);
        const hours = Math.floor((elapsedMs % day) / hour);
        const minutes = Math.floor((elapsedMs % hour) / minute);
        
        const dayStr = days > 0 ? `${days} day${days > 1 ? 's' : ''}, ` : "";
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        uptimeStr = `up ${dayStr}${timeStr}`;
    }
    
    // Format load average placeholders
    const users = "1 user";
    const loadAvg = "load average: 0.05, 0.02, 0.01";
    
    // " 15:30:00 up ... "
    const currentTimeStr = new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return <span>{`${currentTimeStr} ${uptimeStr},  ${users},  ${loadAvg}`}</span>;
};
