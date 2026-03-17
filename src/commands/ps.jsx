import { getSystemSnapshot } from "./processSystem";

const formatStart = (iso) => {
    const date = new Date(iso);
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
};

const buildProcessTree = (processes) => {
    const childrenByParent = new Map();

    for (const process of processes) {
        const siblings = childrenByParent.get(process.ppid) || [];
        siblings.push(process);
        childrenByParent.set(process.ppid, siblings);
    }

    for (const children of childrenByParent.values()) {
        children.sort((left, right) => left.pid - right.pid);
    }

    const roots = processes.filter((process) => !processes.some((candidate) => candidate.pid === process.ppid));
    roots.sort((left, right) => left.pid - right.pid);

    const lines = [];

    const walk = (node, prefix = "", isLast = true) => {
        const branch = prefix ? `${prefix}${isLast ? "└─" : "├─"}` : "";
        lines.push({ process: node, treePrefix: branch });

        const children = childrenByParent.get(node.pid) || [];
        const nextPrefix = prefix + (prefix ? (isLast ? "  " : "│ ") : "");

        for (let index = 0; index < children.length; index += 1) {
            walk(children[index], nextPrefix, index === children.length - 1);
        }
    };

    for (let index = 0; index < roots.length; index += 1) {
        walk(roots[index], "", index === roots.length - 1);
    }

    return lines;
};

/**
 * Affiche les processus visibles du systeme virtuel.
 * Le format "aux" expose plus de colonnes comme sur Unix.
 */
export const executePs = (args) => {
    const snapshot = getSystemSnapshot();
    const auxMode = args.includes("aux") || args.includes("-aux") || args.includes("-ef") || args.includes("-e");
    const forestMode = args.includes("--forest") || args.includes("forest") || args.includes("-H");
    const visibleProcesses = auxMode
        ? [...snapshot.processes]
        : snapshot.processes.filter((process) => process.name !== "system");

    if (!auxMode) {
        const rows = forestMode
            ? buildProcessTree(visibleProcesses)
            : visibleProcesses.sort((left, right) => left.pid - right.pid).map((process) => ({ process, treePrefix: "" }));

        return <>
            <span>{"PID".padEnd(6)} {"TTY".padEnd(7)} {"STAT".padEnd(5)} {"TIME".padEnd(8)} COMMAND</span>
            {rows.map(({ process, treePrefix }) => (
                <span key={process.pid}>
                    {process.pid.toString().padEnd(6)} {(process.tty || "tty0").padEnd(7)} {process.s.padEnd(5)} {process.time.padEnd(8)} {treePrefix}{process.name}
                </span>
            ))}
        </>;
    }

    const rows = forestMode
        ? buildProcessTree(visibleProcesses)
        : visibleProcesses.sort((left, right) => left.pid - right.pid).map((process) => ({ process, treePrefix: "" }));

    return <>
        <span>{"USER".padEnd(8)} {"PID".padEnd(6)} {"PPID".padEnd(6)} {"TTY".padEnd(7)} {"%CPU".padEnd(6)} {"%MEM".padEnd(6)} {"START".padEnd(7)} {"STAT".padEnd(5)} COMMAND</span>
        {rows.map(({ process, treePrefix }) => (
            <span key={process.pid}>
                {process.user.padEnd(8)} {process.pid.toString().padEnd(6)} {process.ppid.toString().padEnd(6)} {(process.tty || "tty0").padEnd(7)} {process.cpu.toFixed(1).padEnd(6)} {process.mem.toFixed(1).padEnd(6)} {formatStart(process.startTime).padEnd(7)} {process.s.padEnd(5)} {treePrefix}{process.cmdline}
            </span>
        ))}
    </>;
};
