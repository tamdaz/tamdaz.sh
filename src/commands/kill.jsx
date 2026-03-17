import { killProcess } from "./processSystem";

/**
 * Termine un processus du systeme virtuel via son PID.
 * Le PID 1 (system) est volontairement protege.
 */
export const executeKill = (args) => {
    if (args.length === 0) {
        return <span style={{ color: "#f00" }}>kill: usage: kill PID</span>;
    }

    const pid = Number.parseInt(args[0], 10);
    if (Number.isNaN(pid)) {
        return <span style={{ color: "#f00" }}>kill: PID invalide: {args[0]}</span>;
    }

    const result = killProcess(pid);
    if (!result.ok) {
        return <span style={{ color: "#f00" }}>{result.message}</span>;
    }

    return <span>{result.message}</span>;
};
