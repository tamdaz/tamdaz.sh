import { getSystemSnapshot } from "./processSystem";

const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days} day${days > 1 ? "s" : ""}, ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const getTopSnapshot = () => {
    const snapshot = getSystemSnapshot();

    return {
        clock: snapshot.clock,
        uptime: formatUptime(snapshot.uptimeSeconds),
        users: snapshot.users,
        loadAvg: snapshot.loadAvg,
        totalTasks: snapshot.totalTasks,
        running: snapshot.running,
        sleeping: snapshot.sleeping,
        zombie: snapshot.zombie,
        memory: snapshot.memory,
        processes: snapshot.processes
    };
};

export const executeTop = () => {
    const snapshot = getTopSnapshot();
    const used = snapshot.memory.usedMB;
    const free = snapshot.memory.freeMB;
    const cached = snapshot.memory.cachedMB;
    const swapTotal = 2048;

    return (
        <>
            <span>top - {snapshot.clock} up {snapshot.uptime}, {snapshot.users} user, load average: {snapshot.loadAvg}</span>
            <span>Tasks: {snapshot.totalTasks} total, {snapshot.running} running, {snapshot.sleeping} sleeping, 0 stopped, {snapshot.zombie} zombie</span>
            <span>%Cpu(s): {(snapshot.running * 3.4).toFixed(1)} us, 1.0 sy, 0.0 ni, {(100 - snapshot.running * 3.4).toFixed(1)} id, 0.0 wa, 0.0 hi, 0.0 si, 0.0 st</span>
            <span>MiB Mem : {snapshot.memory.totalMB.toFixed(1)} total, {free.toFixed(1)} free, {used.toFixed(1)} used, {cached.toFixed(1)} buff/cache</span>
            <span>MiB Swap: {swapTotal.toFixed(1)} total, {swapTotal.toFixed(1)} free, 0.0 used. {(free + cached).toFixed(1)} avail Mem</span>
            <span></span>
            <span style={{ fontWeight: "bold" }}>
                {"PID".padEnd(7)} {"USER".padEnd(16)} {"PR".padEnd(4)} {"NI".padEnd(4)} {"VIRT".padEnd(8)} {"RES".padEnd(7)} {"SHR".padEnd(7)} {"S".padEnd(2)} {"%CPU".padEnd(6)} {"%MEM".padEnd(6)} {"TIME+".padEnd(10)} COMMAND
            </span>
            {snapshot.processes.map((proc) => (
                <span key={proc.pid}>
                    {proc.pid.toString().padEnd(7)} {proc.user.padEnd(16)} {proc.pr.toString().padEnd(4)} {proc.ni.toString().padEnd(4)} {proc.virt.padEnd(8)} {proc.res.padEnd(7)} {proc.shr.padEnd(7)} {proc.s.padEnd(2)} {proc.cpu.toFixed(1).padEnd(6)} {proc.mem.toFixed(1).padEnd(6)} {proc.time.padEnd(10)} {proc.command}
                </span>
            ))}
        </>
    );
};