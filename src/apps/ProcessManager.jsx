import React from "react";

import { getTopSnapshot } from "../commands/top";
import { killProcess } from "../commands/processSystem";

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

    const tree = [];

    const walk = (node, depth = 0) => {
        tree.push({ process: node, depth });
        const children = childrenByParent.get(node.pid) || [];
        for (const child of children) {
            walk(child, depth + 1);
        }
    };

    for (const root of roots) {
        walk(root, 0);
    }

    return tree;
};

export default function ProcessManager() {
    const [snapshot, setSnapshot] = React.useState(() => getTopSnapshot());
    const [selectedPid, setSelectedPid] = React.useState(null);
    const [status, setStatus] = React.useState("Prêt");
    const [displayMode, setDisplayMode] = React.useState("tree");
    const tree = React.useMemo(() => buildProcessTree(snapshot.processes), [snapshot.processes]);

    const refresh = React.useCallback(() => {
        const next = getTopSnapshot();
        setSnapshot(next);

        if (selectedPid && !next.processes.some((proc) => proc.pid === selectedPid)) {
            setSelectedPid(null);
        }
    }, [selectedPid]);

    React.useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 1500);
        return () => clearInterval(interval);
    }, [refresh]);

    const killSelected = () => {
        if (!selectedPid) {
            setStatus("Sélectionnez un processus.");
            return;
        }

        const result = killProcess(selectedPid);
        setStatus(result.message);

        refresh();
    };

    return <div className="tz-sh-panel">
        <div>
            <div>top - {snapshot.clock} up {snapshot.uptime}, {snapshot.users} user, load average: {snapshot.loadAvg}</div>
            <div>Tasks: {snapshot.totalTasks} total, {snapshot.running} running, {snapshot.sleeping} sleeping, {snapshot.zombie} zombie</div>
        </div>

        <div className="tz-sh-toolbar">
            <button onClick={refresh}>Rafraîchir</button>
            <button onClick={killSelected}>Terminer processus</button>
            <span style={{ flex: 1 }}></span>
            <button onClick={() => setDisplayMode(displayMode === "tree" ? "list" : "tree")}>
                {displayMode === "tree" ? "Liste" : "Arborescence"}
            </button>
        </div>

        <div className="tz-sh-box" style={{ flex: 1 }}>
            {displayMode === "tree" && (
                <div className="tz-sh-tree-box">
                    {tree.map(({ process, depth }) => {
                        const selected = process.pid === selectedPid;

                        return <div
                            key={`tree-${process.pid}`}
                            className={`tz-sh-tree-node ${selected ? "selected" : ""}`}
                            style={{ paddingLeft: `${8 + depth * 18}px` }}
                            onClick={() => setSelectedPid(process.pid)}
                        >
                            <span>{process.pid.toString().padStart(4, " ")} {process.name}</span>
                            <span>{process.s} {process.time}</span>
                        </div>;
                    })}
                </div>
            )}

            {displayMode === "list" && (
                <table className="tz-sh-table">
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>PPID</th>
                            <th>TTY</th>
                            <th>USER</th>
                            <th>S</th>
                            <th>%CPU</th>
                            <th>%MEM</th>
                            <th>TIME+</th>
                            <th>COMMAND</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snapshot.processes.map((proc) => {
                            const selected = proc.pid === selectedPid;
                            return <tr
                                key={proc.pid}
                                className={selected ? "selected" : ""}
                                onClick={() => setSelectedPid(proc.pid)}
                            >
                                <td>{proc.pid}</td>
                                <td>{proc.ppid}</td>
                                <td>{proc.tty || "tty0"}</td>
                                <td>{proc.user}</td>
                                <td>{proc.s}</td>
                                <td>{proc.cpu.toFixed(1)}</td>
                                <td>{proc.mem.toFixed(1)}</td>
                                <td>{proc.time}</td>
                                <td>{proc.command}</td>
                            </tr>;
                        })}
                    </tbody>
                </table>
            )}
        </div>

        <div className="tz-sh-status">{status}</div>
    </div>;
}
