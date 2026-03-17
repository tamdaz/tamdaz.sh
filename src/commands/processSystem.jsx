const PROCESS_STATE_KEY = "tamdaz_sh_process_state";
const TOTAL_MEMORY_MB = 8192;

/**
 * Fournit un générateur de bruit pseudo-aleatoire simple pour stabiliser
 * les variations CPU/MEM entre deux rafraichissements de l'interface.
 */
const jitter = (value, step) => {
    const seed = (Date.now() % 11) - 5;
    return Math.max(0, Number((value + seed * step).toFixed(1)));
};

const asIso = (value) => new Date(value).toISOString();

const createInitialState = () => {
    const bootMs = Date.now();

    return {
        bootMs,
        nextPid: 40,
        processes: [
            {
                pid: 1,
                ppid: 0,
                name: "system",
                status: "running",
                cpu: 0.2,
                mem: 0.4,
                startTime: asIso(bootMs),
                user: "root",
                tty: "tty0",
                cmdline: "/sbin/system"
            },
            {
                pid: 2,
                ppid: 1,
                name: "tamdaz.sh",
                status: "running",
                cpu: 1.3,
                mem: 2.2,
                startTime: asIso(bootMs + 400),
                user: "user",
                tty: "tty0",
                cmdline: "/usr/bin/tamdaz.sh"
            }
        ]
    };
};

const readRawState = () => {
    const payload = localStorage.getItem(PROCESS_STATE_KEY);
    if (!payload) {
        return null;
    }

    try {
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

const saveState = (state) => {
    localStorage.setItem(PROCESS_STATE_KEY, JSON.stringify(state));
    return state;
};

/**
 * Garantit la presence de la table des processus et du PID 1 "system".
 * Cette fonction est appelee avant toute lecture ou mutation.
 */
export const ensureProcessState = () => {
    const existing = readRawState();
    if (!existing || !Array.isArray(existing.processes)) {
        return saveState(createInitialState());
    }

    existing.processes = existing.processes.map((process) => ({
        ...process,
        tty: process.tty || "tty0"
    }));

    const hasSystem = existing.processes.some((process) => process.pid === 1);
    if (!hasSystem) {
        existing.processes.unshift(createInitialState().processes[0]);
    }

    existing.nextPid = Math.max(
        existing.nextPid || 40,
        ...existing.processes.map((process) => process.pid + 1)
    );

    return saveState(existing);
};

const mutateState = (mutator) => {
    const state = ensureProcessState();
    const next = mutator({ ...state, processes: [...state.processes] }) || state;
    return saveState(next);
};

export const getBootTimeMs = () => ensureProcessState().bootMs;

export const listProcesses = () => {
    const state = ensureProcessState();
    return [...state.processes].sort((a, b) => a.pid - b.pid);
};

export const getProcessByPid = (pid) => listProcesses().find((process) => process.pid === pid) || null;

/**
 * Cree un processus enfant du PID fourni et le persiste.
 * Retourne le processus complet afin de permettre des associations UI (fenetres, shell).
 */
export const spawnProcess = ({
    name,
    ppid = 1,
    status = "running",
    user = "user",
    tty,
    cpu,
    mem,
    cmdline
}) => {
    let created = null;

    const parentProcess = getProcessByPid(ppid);
    const processTTY = tty || parentProcess?.tty || "tty0";

    mutateState((state) => {
        const pid = state.nextPid;
        created = {
            pid,
            ppid,
            name,
            status,
            tty: processTTY,
            cpu: cpu ?? Number((Math.random() * 4 + 0.2).toFixed(1)),
            mem: mem ?? Number((Math.random() * 2 + 0.2).toFixed(1)),
            startTime: asIso(Date.now()),
            user,
            cmdline: cmdline || `/usr/bin/${name}`
        };

        state.nextPid += 1;
        state.processes.push(created);
        return state;
    });

    return created;
};

export const updateProcess = (pid, patch) => {
    mutateState((state) => {
        state.processes = state.processes.map((process) => (
            process.pid === pid ? { ...process, ...patch } : process
        ));
        return state;
    });
};

const findDescendants = (pid, processes) => {
    const children = processes.filter((process) => process.ppid === pid).map((process) => process.pid);
    const descendants = [...children];

    for (const childPid of children) {
        descendants.push(...findDescendants(childPid, processes));
    }

    return descendants;
};

/**
 * Termine un processus et ses enfants, comme un kill de groupe simplifie.
 * Le PID 1 est protege pour conserver un noyau systeme stable.
 */
export const killProcess = (pid) => {
    if (pid === 1) {
        return { ok: false, message: "kill: (1) operation not permitted" };
    }

    const target = getProcessByPid(pid);
    if (!target) {
        return { ok: false, message: `kill: (${pid}) no such process` };
    }

    let removed = 0;

    mutateState((state) => {
        const descendants = findDescendants(pid, state.processes);
        const toRemove = new Set([pid, ...descendants]);
        const previousLength = state.processes.length;

        state.processes = state.processes.filter((process) => !toRemove.has(process.pid));
        removed = previousLength - state.processes.length;

        return state;
    });

    return { ok: true, message: `Processus ${pid} termine. (${removed} processus retires)` };
};

export const spawnTransientProcess = (name, ppid, argv = []) => {
    const process = spawnProcess({
        name,
        ppid,
        status: "running",
        user: "user",
        cmdline: [`/usr/bin/${name}`, ...argv].join(" ").trim()
    });

    window.setTimeout(() => {
        updateProcess(process.pid, { status: "sleeping", cpu: 0.1 });
    }, 350);

    window.setTimeout(() => {
        updateProcess(process.pid, { status: "zombie", cpu: 0, mem: 0 });
    }, 1900);

    window.setTimeout(() => {
        killProcess(process.pid);
    }, 3600);

    return process;
};

const toTopState = (status) => ({
    running: "R",
    sleeping: "S",
    zombie: "Z"
}[status] || "S");

const toTopTime = (startIso) => {
    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - new Date(startIso).getTime()) / 1000));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.00`;
};

const toTopProcesses = () => {
    return listProcesses().map((process) => {
        const cpu = jitter(process.cpu, 0.08);
        const mem = jitter(process.mem, 0.03);
        const memMiB = Math.max(2, Math.round((TOTAL_MEMORY_MB * mem) / 100));

        return {
            ...process,
            cpu,
            mem,
            pr: 20,
            ni: 0,
            virt: `${memMiB * 2}`,
            res: `${memMiB}`,
            shr: `${Math.max(1, Math.round(memMiB * 0.35))}`,
            s: toTopState(process.status),
            time: toTopTime(process.startTime),
            command: process.name
        };
    });
};

/**
 * Retourne un instantane homogene du systeme: charge, memoire et processus.
 * top, ps et le gestionnaire graphique reutilisent cet objet tel quel.
 */
export const getSystemSnapshot = () => {
    const processes = toTopProcesses();
    const running = processes.filter((process) => process.status === "running").length;
    const sleeping = processes.filter((process) => process.status === "sleeping").length;
    const zombie = processes.filter((process) => process.status === "zombie").length;
    const usedMem = processes.reduce((sum, process) => sum + process.mem, 0);
    const freeMem = Math.max(0, 100 - usedMem);

    return {
        clock: new Date().toTimeString().split(" ")[0],
        uptimeSeconds: Math.max(1, Math.floor((Date.now() - getBootTimeMs()) / 1000)),
        users: 1,
        loadAvg: [running / 10 + 0.12, running / 12 + 0.08, running / 15 + 0.05]
            .map((value) => value.toFixed(2))
            .join(", "),
        totalTasks: processes.length,
        running,
        sleeping,
        zombie,
        memory: {
            totalMB: TOTAL_MEMORY_MB,
            usedMB: Math.round((TOTAL_MEMORY_MB * usedMem) / 100),
            freeMB: Math.round((TOTAL_MEMORY_MB * freeMem) / 100),
            cachedMB: Math.round(TOTAL_MEMORY_MB * 0.18)
        },
        processes
    };
};

const formatStatusContent = (process) => {
    const snapshot = getSystemSnapshot();

    return [
        `Name:\t${process.name}`,
        `State:\t${process.status}`,
        `Pid:\t${process.pid}`,
        `PPid:\t${process.ppid}`,
        `Tty:\t${process.tty || "tty0"}`,
        `Uid:\t${process.user}`,
        `VmRSS:\t${Math.max(1, Math.round((snapshot.memory.totalMB * process.mem) / 100))} MB`,
        `Threads:\t1`,
        `StartTime:\t${new Date(process.startTime).toLocaleString("fr-FR")}`
    ].join("\n");
};

const formatMapsContent = () => {
    return [
        "00400000-00452000 r-xp 00000000 08:02 12345 /usr/bin/app",
        "00651000-00652000 r--p 00051000 08:02 12345 /usr/bin/app",
        "00e2a000-00e4b000 rw-p 00000000 00:00 0 [heap]",
        "7ffd5e9d7000-7ffd5e9f8000 rw-p 00000000 00:00 0 [stack]"
    ].join("\n");
};

const parsePidFromProc = (path) => {
    const segments = path.split("/").filter(Boolean);
    if (segments[0] !== "proc") {
        return null;
    }

    const pid = Number.parseInt(segments[1], 10);
    if (Number.isNaN(pid)) {
        return null;
    }

    return pid;
};

export const isProcPath = (path) => path === "/proc" || path.startsWith("/proc/");

export const listProcDirectory = (path) => {
    const normalizedPath = path === "/proc/" ? "/proc" : path;
    const snapshot = getSystemSnapshot();

    if (normalizedPath === "/proc") {
        const fixedFiles = ["cpuinfo", "meminfo", "uptime", "version", "loadavg"];
        const pidDirs = snapshot.processes.map((process) => `${process.pid}`);

        return [...fixedFiles, ...pidDirs].map((name) => ({
            name,
            isDir: /^\d+$/.test(name),
            path: `/proc/${name}`,
            permissions: /^\d+$/.test(name) ? "dr-xr-xr-x" : "-r--r--r--",
            owner: "root",
            group: "root",
            modified: asIso(Date.now()),
            size: 0
        }));
    }

    const pid = parsePidFromProc(normalizedPath);
    if (!pid) {
        return [];
    }

    const process = getProcessByPid(pid);
    if (!process) {
        return [];
    }

    if (normalizedPath === `/proc/${pid}`) {
        return [
            { name: "status", isDir: false, path: `/proc/${pid}/status` },
            { name: "cmdline", isDir: false, path: `/proc/${pid}/cmdline` },
            { name: "fd", isDir: true, path: `/proc/${pid}/fd` },
            { name: "environ", isDir: false, path: `/proc/${pid}/environ` },
            { name: "maps", isDir: false, path: `/proc/${pid}/maps` }
        ].map((entry) => ({
            ...entry,
            permissions: entry.isDir ? "dr-xr-xr-x" : "-r--r--r--",
            owner: process.user,
            group: process.user,
            modified: process.startTime,
            size: 0
        }));
    }

    if (normalizedPath === `/proc/${pid}/fd`) {
        return [0, 1, 2].map((fd) => ({
            name: `${fd}`,
            isDir: false,
            path: `/proc/${pid}/fd/${fd}`,
            permissions: "lrwx------",
            owner: process.user,
            group: process.user,
            modified: process.startTime,
            size: 0
        }));
    }

    return [];
};

/**
 * Simule la lecture des fichiers exposes par /proc.
 * Le contenu est reconstruit a la demande depuis l'etat de processus React.
 */
export const readProcFile = (path) => {
    const snapshot = getSystemSnapshot();

    if (path === "/proc/cpuinfo") {
        return [
            "processor\t: 0",
            "vendor_id\t: tamdaz",
            "model name\t: Tamdaz Virtual CPU v1",
            "cpu MHz\t\t: 3200.000",
            "cache size\t: 8192 KB"
        ].join("\n");
    }

    if (path === "/proc/meminfo") {
        return [
            `Total Memory:\t${snapshot.memory.totalMB} MB`,
            `Free Memory:\t${snapshot.memory.freeMB} MB`,
            `Cached:\t${snapshot.memory.cachedMB} MB`
        ].join("\n");
    }

    if (path === "/proc/uptime") {
        const uptime = snapshot.uptimeSeconds;
        return `${uptime.toFixed(2)} ${Math.max(1, uptime / 4).toFixed(2)}`;
    }

    if (path === "/proc/version") {
        return `Linux tamdaz.sh 1.0.0-virtual #1 SMP ${new Date(getBootTimeMs()).toUTCString()} x86_64`;
    }

    if (path === "/proc/loadavg") {
        return `${snapshot.loadAvg.replace(/,/g, "")} ${snapshot.running}/${snapshot.totalTasks} ${snapshot.totalTasks + 110}`;
    }

    const pid = parsePidFromProc(path);
    if (!pid) {
        return null;
    }

    const process = getProcessByPid(pid);
    if (!process) {
        return null;
    }

    if (path === `/proc/${pid}/status`) {
        return formatStatusContent(process);
    }

    if (path === `/proc/${pid}/cmdline`) {
        return process.cmdline;
    }

    if (path === `/proc/${pid}/environ`) {
        return `USER=${process.user}\nHOME=/home/${process.user}\nSHELL=/usr/bin/bash`;
    }

    if (path === `/proc/${pid}/maps`) {
        return formatMapsContent();
    }

    if (path === `/proc/${pid}/fd/0`) return `/dev/${process.tty || "tty0"}`;
    if (path === `/proc/${pid}/fd/1`) return `/dev/${process.tty || "tty0"}`;
    if (path === `/proc/${pid}/fd/2`) return `/dev/${process.tty || "tty0"}`;

    return null;
};
