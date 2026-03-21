import React from "react";

export const executeUname = (args) => {
    const isAll = args.includes("-a") || args.includes("--all");
    const kernelName = "tamdaz.sh";
    const nodeName = "localhost";
    const kernelRelease = "1.0.0";
    const kernelVersion = "#1 SMP Fri Mar 20 00:00:00 UTC 2026";
    const machine = "wasm32";
    const os = "GNU/WebOS";

    if (isAll) {
        return <span>{`${kernelName} ${nodeName} ${kernelRelease} ${kernelVersion} ${machine} ${os}`}</span>;
    }

    if (args.includes("-r")) {
        return <span>{kernelRelease}</span>;
    }

    if (args.includes("-m")) {
        return <span>{machine}</span>;
    }
    
    if (args.includes("-o")) {
        return <span>{os}</span>;
    }
    
    if (args.includes("-n")) {
        return <span>{nodeName}</span>;
    }

    return <span>{kernelName}</span>;
};
