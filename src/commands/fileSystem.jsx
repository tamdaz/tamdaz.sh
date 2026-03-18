import { COMMAND_NAMES } from "./commandCatalog";
import { isProcPath, listProcDirectory, readProcFile } from "./processSystem";
import { getActiveTTY, isTTYDevicePath, listRegisteredTTYs, writeToTTYPath } from "./ttySystem";

const FS_KEY = "tamdaz_sh_filesystem";
const CWD_KEY = "tamdaz_sh_cwd";

const SYSTEM_PROTECTED_PATHS = new Set(["/", "/proc", "/dev", "/usr", "/usr/bin", "/usr/sbin", "/bin", "/sbin"]);

const DEV_NODES = [
    { name: "null", isDir: false },
    { name: "zero", isDir: false },
    { name: "random", isDir: false },
    { name: "tty", isDir: false },
    { name: "stdin", isDir: false },
    { name: "stdout", isDir: false },
    { name: "stderr", isDir: false },
    { name: "sda", isDir: false },
    { name: "sda1", isDir: false }
];

const asIso = () => new Date().toISOString();

const createBinaryEntries = (now) => {
    const entries = {};

    for (const command of COMMAND_NAMES) {
        entries[`/bin/${command}`] = {
            _content: `#!/bin/sh\n# Commande virtuelle: ${command}`,
            _permissions: "-rwxr-xr-x",
            _owner: "root",
            _group: "root",
            _modified: now
        };

        entries[`/usr/bin/${command}`] = {
            _content: `#!/bin/sh\n# Commande virtuelle: ${command}`,
            _permissions: "-rwxr-xr-x",
            _owner: "root",
            _group: "root",
            _modified: now
        };

        entries[`/sbin/${command}`] = {
            _content: `#!/bin/sh\n# Commande virtuelle: ${command}`,
            _permissions: "-rwxr-xr-x",
            _owner: "root",
            _group: "root",
            _modified: now
        };

        entries[`/usr/sbin/${command}`] = {
            _content: `#!/bin/sh\n# Commande virtuelle: ${command}`,
            _permissions: "-rwxr-xr-x",
            _owner: "root",
            _group: "root",
            _modified: now
        };
    }

    return entries;
};

const buildDefaultStructure = () => {
    const now = asIso();

    return {
        "/": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/bin": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/dev": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/home": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/home/user": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "user", _group: "user", _modified: now },
        "/home/user/readme.txt": {
            _content: "Bienvenue sur tamdaz.sh!\nCe terminal simule un petit OS Unix-like.",
            _permissions: "-rw-r--r--",
            _owner: "user",
            _group: "user",
            _modified: now
        },
        "/home/user/about.txt": {
            _content: "Projet créé par tamdaz.\nVisitez https://tamdaz.fr pour en savoir plus.",
            _permissions: "-rw-r--r--",
            _owner: "user",
            _group: "user",
            _modified: now
        },
        "/proc": { _isDir: true, _permissions: "dr-xr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/root": { _isDir: true, _permissions: "drwx------", _owner: "root", _group: "root", _modified: now },
        "/sbin": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/tmp": { _isDir: true, _permissions: "drwxrwxrwt", _owner: "root", _group: "root", _modified: now },
        "/usr": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/usr/bin": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        "/usr/sbin": { _isDir: true, _permissions: "drwxr-xr-x", _owner: "root", _group: "root", _modified: now },
        ...createBinaryEntries(now)
    };
};

const getDevEntries = (path) => {
    const now = asIso();

    if (path === "/dev") {
        const ttyNodes = listRegisteredTTYs().map((ttyName) => ({ name: ttyName, isDir: false }));
        const combinedNodes = [...DEV_NODES, ...ttyNodes];

        return combinedNodes.map((node) => ({
            name: node.name,
            isDir: node.isDir,
            path: `/dev/${node.name}`,
            permissions: node.isDir ? "drwxr-xr-x" : "crw-rw-rw-",
            owner: "root",
            group: "root",
            modified: now,
            size: 0
        }));
    }

    return [];
};

const randomHexBlock = (bytes = 24) => {
    if (window.crypto?.getRandomValues) {
        const array = new Uint8Array(bytes);
        window.crypto.getRandomValues(array);
        return Array.from(array).map((value) => value.toString(16).padStart(2, "0")).join("");
    }

    return Array.from({ length: bytes })
        .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0"))
        .join("");
};

const readDevFile = (path) => {
    if (path === "/dev/null") return "";
    if (path === "/dev/zero") return `${"0".repeat(128)}\n${"0".repeat(128)}`;
    if (path === "/dev/random") return `${randomHexBlock()}\n${randomHexBlock()}\n${randomHexBlock()}`;
    if (path === "/dev/tty") return `${getActiveTTY()}\n`;
    if (path === "/dev/stdin") return "/dev/tty\n";
    if (path === "/dev/stdout") return "/dev/tty\n";
    if (path === "/dev/stderr") return "/dev/tty\n";
    if (path === "/dev/sda") return "Disk device: sda (virtual)\nSize: 64 GiB\n";
    if (path === "/dev/sda1") return "Disk partition: sda1 (virtual)\nSize: 64 GiB\n";
    if (/^\/dev\/tty\d+$/.test(path)) {
        return `${path.replace("/dev/", "")}\n`;
    }

    return null;
};

const isDevPath = (path) => path === "/dev" || path.startsWith("/dev/");
const isVirtualPath = (path) => isProcPath(path) || isDevPath(path);

const isDirectoryEntry = (entry) => Boolean(entry && typeof entry === "object" && entry._isDir === true);
const isFileEntry = (entry) => Boolean(entry && typeof entry === "object" && entry._content !== undefined);

export const normalizePath = (path) => {
    if (path === "/" || path === "") {
        return "/";
    }

    const parts = path.split("/").filter((part) => part && part !== ".");
    const normalized = [];

    for (const part of parts) {
        if (part === "..") {
            normalized.pop();
        } else {
            normalized.push(part);
        }
    }

    return `/${normalized.join("/")}`;
};

export const getCurrentDir = () => localStorage.getItem(CWD_KEY) || "/home/user";

export const setCurrentDir = (path) => {
    localStorage.setItem(CWD_KEY, normalizePath(path));
};

export const resolvePath = (path) => {
    const cwd = getCurrentDir();
    if (path.startsWith("/")) {
        return normalizePath(path);
    }

    return normalizePath(`${cwd}/${path}`);
};

const loadStoredFileSystem = () => {
    const payload = localStorage.getItem(FS_KEY);
    if (!payload) return null;

    try {
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

/**
 * Charge le FS persistant et applique les migrations de structure minimales.
 * Les repertoires virtuels (/proc, /dev) restent dynamiques et non stockes par entree.
 */
export const getFileSystem = () => {
    const defaultStructure = buildDefaultStructure();
    const existing = loadStoredFileSystem();

    if (!existing) {
        localStorage.setItem(FS_KEY, JSON.stringify(defaultStructure));
        return defaultStructure;
    }

    let needsSave = false;

    // Réinitialise les répertoires virtuels et temporaires au démarrage
    for (const key of Object.keys(existing)) {
        if (key.match(/^\/(tmp|dev|proc)(\/|$)/)) {
            delete existing[key];
            needsSave = true;
        }
    }

    for (const path in defaultStructure) {
        if (!existing[path]) {
            existing[path] = defaultStructure[path];
            needsSave = true;
        }
    }

    if (needsSave) {
        localStorage.setItem(FS_KEY, JSON.stringify(existing));
    }

    return existing;
};

export const saveFileSystem = (fs) => {
    localStorage.setItem(FS_KEY, JSON.stringify(fs));
};

export const getParentPath = (path) => {
    const parts = normalizePath(path).split("/").filter(Boolean);
    parts.pop();
    return parts.length === 0 ? "/" : `/${parts.join("/")}`;
};

const getVirtualInfo = (path) => {
    const normalized = normalizePath(path);

    if (isProcPath(normalized)) {
        if (normalized === "/proc") {
            return {
                path: "/proc",
                name: "proc",
                isDir: true,
                permissions: "dr-xr-xr-x",
                owner: "root",
                group: "root",
                modified: asIso(),
                size: 0
            };
        }

        const parent = getParentPath(normalized);
        const entries = listProcDirectory(parent);
        const match = entries.find((entry) => entry.path === normalized);
        if (match) {
            return {
                path: match.path,
                name: match.name,
                isDir: match.isDir,
                permissions: match.permissions,
                owner: match.owner,
                group: match.group,
                modified: match.modified,
                size: match.size
            };
        }

        const content = readProcFile(normalized);
        if (content !== null) {
            return {
                path: normalized,
                name: normalized.split("/").pop() || "proc",
                isDir: false,
                permissions: "-r--r--r--",
                owner: "root",
                group: "root",
                modified: asIso(),
                size: content.length
            };
        }
    }

    if (isDevPath(normalized)) {
        if (normalized === "/dev") {
            return {
                path: normalized,
                name: normalized.split("/").pop() || "dev",
                isDir: true,
                permissions: "drwxr-xr-x",
                owner: "root",
                group: "root",
                modified: asIso(),
                size: 0
            };
        }

        const parent = getParentPath(normalized);
        const entries = getDevEntries(parent);
        const match = entries.find((entry) => entry.path === normalized);
        if (match) {
            return {
                path: match.path,
                name: match.name,
                isDir: match.isDir,
                permissions: match.permissions,
                owner: match.owner,
                group: match.group,
                modified: match.modified,
                size: 0
            };
        }

        const content = readDevFile(normalized);
        if (content !== null) {
            return {
                path: normalized,
                name: normalized.split("/").pop() || "dev",
                isDir: false,
                permissions: "crw-rw-rw-",
                owner: "root",
                group: "root",
                modified: asIso(),
                size: content.length
            };
        }
    }

    return null;
};

export const exists = (path) => {
    const fullPath = resolvePath(path);
    if (getVirtualInfo(fullPath)) {
        return true;
    }

    const fs = getFileSystem();
    return fs[fullPath] !== undefined;
};

export const isDirectory = (path) => {
    const fullPath = resolvePath(path);
    const virtual = getVirtualInfo(fullPath);
    if (virtual) {
        return virtual.isDir;
    }

    const fs = getFileSystem();
    return isDirectoryEntry(fs[fullPath]);
};

export const isFile = (path) => {
    const fullPath = resolvePath(path);
    const virtual = getVirtualInfo(fullPath);
    if (virtual) {
        return !virtual.isDir;
    }

    const fs = getFileSystem();
    return isFileEntry(fs[fullPath]);
};

export const getFileInfo = (path) => {
    const fullPath = resolvePath(path);
    const virtual = getVirtualInfo(fullPath);
    if (virtual) {
        return virtual;
    }

    const fs = getFileSystem();
    const file = fs[fullPath];
    if (!file) return null;

    const isDir = isDirectoryEntry(file);
    const size = isDir ? 4096 : (file._content || "").length;

    return {
        path: fullPath,
        name: fullPath.split("/").pop() || "/",
        isDir,
        permissions: file._permissions || (isDir ? "drwxr-xr-x" : "-rw-r--r--"),
        owner: file._owner || "user",
        group: file._group || "user",
        modified: file._modified || asIso(),
        size
    };
};

/**
 * Determine si un fichier est executable en verifiant le bit 'x' dans les permissions.
 */
export const isExecutable = (path) => {
    const info = getFileInfo(path);
    if (!info || info.isDir) return false;
    
    const perms = info.permissions;
    if (!perms || perms.length < 10) return false;
    
    // Format typique: -rwxr-xr-x, drwxr-xr-x
    // Index: 0=type, 1-3=owner, 4-6=group, 7-9=other
    // Cherche le bit 'x' dans owner (index 3), group (index 6), ou other (index 9)
    return perms[3] === 'x' || perms[6] === 'x' || perms[9] === 'x';
};

/**
 * Liste les entrees d'un dossier en incluant les dossiers virtuels.
 * Sans option -l, l'affichage sera ensuite mis en forme en grille par la commande ls.
 */
export const listFiles = (targetPath = null) => {
    const cwd = targetPath ? resolvePath(targetPath) : getCurrentDir();

    if (isProcPath(cwd)) {
        return listProcDirectory(cwd).sort((a, b) => a.name.localeCompare(b.name));
    }

    if (isDevPath(cwd)) {
        return getDevEntries(cwd).sort((a, b) => a.name.localeCompare(b.name));
    }

    const fs = getFileSystem();
    const files = [];

    for (const path in fs) {
        if (path === cwd) {
            continue;
        }

        if (getParentPath(path) !== cwd) {
            continue;
        }

        const name = path.split("/").pop();
        const file = fs[path];
        const isDir = isDirectoryEntry(file);

        files.push({
            name,
            isDir,
            path,
            permissions: file._permissions || (isDir ? "drwxr-xr-x" : "-rw-r--r--"),
            owner: file._owner || "user",
            group: file._group || "user",
            modified: file._modified || asIso(),
            size: isDir ? 4096 : (file._content || "").length
        });
    }

    return files.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
    });
};

export const readFile = (path) => {
    const fullPath = resolvePath(path);

    if (isProcPath(fullPath)) {
        return readProcFile(fullPath);
    }

    if (isDevPath(fullPath)) {
        return readDevFile(fullPath);
    }

    const fs = getFileSystem();
    const file = fs[fullPath];
    if (!file || isDirectoryEntry(file)) {
        return null;
    }

    return file._content || "";
};

export const isSilentSinkPath = (path) => {
    const resolved = resolvePath(path);
    return resolved === "/dev/null" || isTTYDevicePath(resolved);
};

export const writeFile = (path, content, append = false) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (isProcPath(fullPath)) {
        return false;
    }

    if (isDevPath(fullPath)) {
        if (fullPath === "/dev/null") {
            return true;
        }

        if (isTTYDevicePath(fullPath)) {
            return writeToTTYPath(fullPath, content);
        }

        return false;
    }

    if (isDirectoryEntry(fs[fullPath])) {
        return false;
    }

    const now = asIso();
    const previous = fs[fullPath];
    const previousContent = previous?._content || "";

    fs[fullPath] = {
        _content: append ? `${previousContent}${content}` : content,
        _permissions: previous?._permissions || "-rw-r--r--",
        _owner: previous?._owner || "user",
        _group: previous?._group || "user",
        _modified: now
    };

    saveFileSystem(fs);
    return true;
};

const isDeletionProtected = (path) => {
    const normalized = normalizePath(path);
    if (SYSTEM_PROTECTED_PATHS.has(normalized)) {
        return true;
    }

    return normalized.startsWith("/proc/")
        || normalized.startsWith("/dev/")
        || normalized.startsWith("/usr/bin/")
        || normalized.startsWith("/usr/sbin/")
        || normalized.startsWith("/sbin/")
        || normalized.startsWith("/bin/");
};

export const deleteFile = (path) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (isDeletionProtected(fullPath)) {
        return false;
    }

    if (!fs[fullPath] || isDirectoryEntry(fs[fullPath])) {
        return false;
    }

    delete fs[fullPath];
    saveFileSystem(fs);
    return true;
};

export const copyFile = (source, dest) => {
    const fs = getFileSystem();
    const sourcePath = resolvePath(source);
    const destPath = resolvePath(dest);

    if (isVirtualPath(sourcePath) || isVirtualPath(destPath)) {
        return false;
    }

    if (!fs[sourcePath] || isDirectoryEntry(fs[sourcePath])) {
        return false;
    }

    fs[destPath] = {
        ...JSON.parse(JSON.stringify(fs[sourcePath])),
        _modified: asIso()
    };

    saveFileSystem(fs);
    return true;
};

export const moveFile = (source, dest) => {
    const fs = getFileSystem();
    const sourcePath = resolvePath(source);
    const destPath = resolvePath(dest);

    if (isVirtualPath(sourcePath) || isVirtualPath(destPath) || isDeletionProtected(sourcePath)) {
        return false;
    }

    if (!fs[sourcePath]) {
        return false;
    }

    fs[destPath] = {
        ...fs[sourcePath],
        _modified: asIso()
    };

    delete fs[sourcePath];
    saveFileSystem(fs);
    return true;
};

export const createDirectory = (path) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (fs[fullPath] || isVirtualPath(fullPath) || fullPath.startsWith("/proc/") || fullPath.startsWith("/dev/")) {
        return false;
    }

    fs[fullPath] = {
        _isDir: true,
        _permissions: "drwxr-xr-x",
        _owner: "user",
        _group: "user",
        _modified: asIso()
    };

    saveFileSystem(fs);
    return true;
};

export const removeDirectory = (path) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (isDeletionProtected(fullPath)) {
        return false;
    }

    if (!isDirectoryEntry(fs[fullPath])) {
        return false;
    }

    for (const itemPath in fs) {
        if (itemPath !== fullPath && itemPath.startsWith(`${fullPath}/`)) {
            return false;
        }
    }

    delete fs[fullPath];
    saveFileSystem(fs);
    return true;
};

export const chmod = (path, permissions) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (!fs[fullPath] || isVirtualPath(fullPath)) {
        return false;
    }

    fs[fullPath]._permissions = permissions;
    saveFileSystem(fs);
    return true;
};

export const chown = (path, owner, group) => {
    const fs = getFileSystem();
    const fullPath = resolvePath(path);

    if (!fs[fullPath] || isVirtualPath(fullPath)) {
        return false;
    }

    if (owner) fs[fullPath]._owner = owner;
    if (group) fs[fullPath]._group = group;

    saveFileSystem(fs);
    return true;
};

export const fileExists = (path) => exists(path);
