import React from "react";
import { getFileInfo } from "./fileSystem";

export const executeReadlink = (args) => {
    let actualArgs = [];
    
    // Simplification: ignorer les flags pour l'instant (-f, etc.)
    for (const arg of args) {
        if (!arg.startsWith("-")) {
            actualArgs.push(arg);
        }
    }

    if (actualArgs.length === 0) {
        return <span style={{ color: "#f00" }}>readlink: opérande manquante</span>;
    }

    const targetPath = actualArgs[0];
    const info = getFileInfo(targetPath);

    if (!info) {
        // readlink doesn't output anything if file doesn't exist or isn't a symlink usually, but let's mimic basic behavior
        return null;
    }

    if (!info.isSymlink) {
        // usually readlink prints nothing and exits with 1 if not a symlink
        return null;
    }

    return <span>{info.target}</span>;
};
