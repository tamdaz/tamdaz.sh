const ACTIVE_TTY_KEY = "tamdaz_sh_active_tty";
const DEFAULT_TTY = "tty0";

const ttyWriters = new Map();
const knownTtys = new Set([DEFAULT_TTY]);

const sortTtys = (left, right) => {
    const leftIndex = Number.parseInt(left.replace("tty", ""), 10);
    const rightIndex = Number.parseInt(right.replace("tty", ""), 10);

    if (Number.isNaN(leftIndex) || Number.isNaN(rightIndex)) {
        return left.localeCompare(right);
    }

    return leftIndex - rightIndex;
};

const normalizeTtyName = (value) => {
    if (!value || typeof value !== "string") {
        return null;
    }

    const normalized = value.trim();
    if (normalized === "tty") {
        return null;
    }

    if (normalized.startsWith("/dev/tty")) {
        const ttyName = normalized.slice("/dev/".length);
        return /^tty\d+$/.test(ttyName) ? ttyName : null;
    }

    return /^tty\d+$/.test(normalized) ? normalized : null;
};

const getStoredActiveTTY = () => localStorage.getItem(ACTIVE_TTY_KEY);

const pickFallbackTTY = () => {
    const sorted = [...knownTtys].sort(sortTtys);
    return sorted[0] || DEFAULT_TTY;
};

const ensureActiveTTY = () => {
    const stored = normalizeTtyName(getStoredActiveTTY());

    if (stored && knownTtys.has(stored)) {
        return stored;
    }

    const fallback = pickFallbackTTY();
    localStorage.setItem(ACTIVE_TTY_KEY, fallback);
    return fallback;
};

export const getActiveTTY = () => ensureActiveTTY();

export const setActiveTTY = (ttyName) => {
    const normalized = normalizeTtyName(ttyName);
    if (!normalized || !knownTtys.has(normalized)) {
        return false;
    }

    localStorage.setItem(ACTIVE_TTY_KEY, normalized);
    return true;
};

export const registerTTY = (ttyName, writer) => {
    const normalized = normalizeTtyName(ttyName);
    if (!normalized || typeof writer !== "function") {
        return false;
    }

    knownTtys.add(normalized);
    ttyWriters.set(normalized, writer);

    if (!getStoredActiveTTY()) {
        localStorage.setItem(ACTIVE_TTY_KEY, normalized);
    }

    ensureActiveTTY();
    return true;
};

export const unregisterTTY = (ttyName) => {
    const normalized = normalizeTtyName(ttyName);
    if (!normalized) {
        return;
    }

    ttyWriters.delete(normalized);

    if (normalized !== DEFAULT_TTY) {
        knownTtys.delete(normalized);
    }

    ensureActiveTTY();
};

export const listRegisteredTTYs = () => {
    ensureActiveTTY();
    return [...knownTtys].sort(sortTtys);
};

export const isTTYDevicePath = (path) => {
    return path === "/dev/tty"
        || path === "/dev/stdout"
        || path === "/dev/stderr"
        || /^\/dev\/tty\d+$/.test(path);
};

const resolveTTYForPath = (path) => {
    if (path === "/dev/tty" || path === "/dev/stdout" || path === "/dev/stderr") {
        return ensureActiveTTY();
    }

    const match = path.match(/^\/dev\/(tty\d+)$/);
    if (!match) {
        return null;
    }

    return normalizeTtyName(match[1]);
};

export const writeToTTYPath = (path, payload) => {
    const ttyName = resolveTTYForPath(path);
    if (!ttyName) {
        return false;
    }

    const writer = ttyWriters.get(ttyName);
    if (!writer) {
        return false;
    }

    const content = typeof payload === "string" ? payload : String(payload ?? "");
    writer(content);
    return true;
};
