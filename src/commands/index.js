// Color & Theme
export { changeColor, displayHelpColor } from "./color";
export { changeBrightness } from "./brightness";
export { changeFont, displayHelpFont } from "./font";

// File Operations
export { executeEcho } from "./echo";
export { executeCat, isContinuousCatTarget, readContinuousCatChunk } from "./cat";
export { executeTouch } from "./touch";
export { executeRm } from "./rm";
export { executeLn } from "./ln";
export { executeLs } from "./ls";
export { executeCp } from "./cp";
export { executeMv } from "./mv";
export { executeMkdir } from "./mkdir";
export { executeRmdir } from "./rmdir";
export { executeReadlink } from "./readlink";
export { executeDownload } from "./download";

// Navigation
export { executePwd } from "./pwd";
export { executeCd } from "./cd";

// System Info
export { executeIp } from "./ip";
export { executeFastfetch } from "./fastfetch";
export { executeTop } from "./top";
export { executePs } from "./ps";
export { executeWhoami } from "./whoami";
export { executeDate } from "./date";
export { executeUname } from "./uname";
export { executeUptime } from "./uptime";

// Process Management
export { executeKill } from "./kill";
export { executeWatch } from "./watch";

// File Content
export { executeHashsum } from "./hashsum";
export { executeMan } from "./man";
export { executeVim } from "./vim";
export { executeLess } from "./less";

// Permissions
export { executeChmod } from "./chmod";
export { executeChown } from "./chown";

// Ping & Network
export { executePing } from "./ping";

// Autocomplete
export { getCompletions } from "./autocomplete";

// File System Utilities
export { 
    writeFile, 
    getCurrentDir, 
    isSilentSinkPath,
    readFile,
    resolvePath,
    isExecutable,
    getFileInfo,
    isDirectory
} from "./fileSystem";

// Process System Utilities
export { 
    ensureProcessState, 
    killProcess, 
    spawnProcess, 
    spawnTransientProcess 
} from "./processSystem";

// TTY System
export { 
    registerTTY, 
    setActiveTTY, 
    unregisterTTY 
} from "./ttySystem";
