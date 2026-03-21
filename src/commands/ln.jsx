import React from "react";
import { createSymlink, fileExists } from "./fileSystem";

export const executeLn = (args) => {
    let isSymbolic = false;
    let actualArgs = [];

    // Parse arguments
    for (const arg of args) {
        if (arg === "-s" || arg === "--symbolic") {
            isSymbolic = true;
        } else if (!arg.startsWith("-")) {
            actualArgs.push(arg);
        }
    }

    if (actualArgs.length < 2) {
        return <span style={{ color: "#f00" }}>ln: opérande manquante. Syntaxe: ln -s CIBLE LIEN</span>;
    }

    const [target, linkName] = actualArgs;

    if (!isSymbolic) {
        return <span style={{ color: "#f00" }}>ln: les liens physiques ne sont pas supportés. Utilisez -s pour un lien symbolique.</span>;
    }

    if (fileExists(linkName)) {
        return <span style={{ color: "#f00" }}>ln: impossible de créer le lien '{linkName}': Le fichier existe</span>;
    }

    const success = createSymlink(target, linkName);

    if (!success) {
        return <span style={{ color: "#f00" }}>ln: impossible de créer le lien '{linkName}'</span>;
    }

    return null;
};
