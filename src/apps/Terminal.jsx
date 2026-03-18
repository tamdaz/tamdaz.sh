 
import React from "react";

import AboutMe from "./AboutMe";
import Credits from "./Credits";
import VimEditor from "./VimEditor";
import ManPage from "./ManPage";
import Power4Game from "./Power4Game";
import RPSGame from "./RPSGame";
import TicTacToeGame from "./TicTacToeGame";
import FileManager from "./FileManager";
import ProcessManager from "./ProcessManager";

import { WindowContext } from "../contexts/WindowContext";

import beep_error from "./../assets/sounds/beep_error.wav";

import { displayHelp } from "../commands/help";
import { changeColor, displayHelpColor } from "../commands/color";
import { changeBrightness } from "../commands/brightness";
import { changeFont, displayHelpFont } from "../commands/font";
import { executeEcho } from "../commands/echo";
import { executeCat, isContinuousCatTarget, readContinuousCatChunk } from "../commands/cat";
import { executeTouch } from "../commands/touch";
import { executeRm } from "../commands/rm";
import { executeLs } from "../commands/ls";
import { executePwd } from "../commands/pwd";
import { executeCd } from "../commands/cd";
import { executeCp } from "../commands/cp";
import { executeMv } from "../commands/mv";
import { executeMkdir } from "../commands/mkdir";
import { executeRmdir } from "../commands/rmdir";
import { executeVim } from "../commands/vim";
import { executePing } from "../commands/ping";
import { executeIp } from "../commands/ip";
import { executeFastfetch } from "../commands/fastfetch";
import { executeTop } from "../commands/top";
import { executePs } from "../commands/ps";
import { executeKill } from "../commands/kill";
import { executeHashsum } from "../commands/hashsum";
import { executeMan } from "../commands/man";
import { executeChmod } from "../commands/chmod";
import { executeChown } from "../commands/chown";
import { writeFile, getCurrentDir, isSilentSinkPath } from "../commands/fileSystem";
import { ensureProcessState, killProcess, spawnProcess, spawnTransientProcess } from "../commands/processSystem";
import { registerTTY, setActiveTTY, unregisterTTY } from "../commands/ttySystem";
import { executeWatch } from "../commands/watch";
const TRANSIENT_EXCLUDED_COMMANDS = new Set([
    "",
    "aboutme",
    "brightness",
    "clear",
    "color",
    "credits",
    "exit",
    "files",
    "font",
    "help",
    "history",
    "historyc",
    "man",
    "terminal",
    "portfolio",
    "procman",
    "power4",
    "rps",
    "ttt",
    "version",
    "watch"
]);

const extractText = (node) => {
    if (node === null || node === undefined || typeof node === "boolean") {
        return "";
    }

    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map((child) => extractText(child)).filter(Boolean).join("\n");
    }

    if (React.isValidElement(node)) {
        return extractText(node.props.children);
    }

    return "";
};

/**
 * Shell interactif principal: parse des commandes, redirection et ouverture
 * des fenetres applicatives tout en synchronisant l'etat des processus virtuels.
 */
export default function Terminal({ windowId = "window-terminal-main", tty = "tty0", isMainTerminal = false }) {
    const terminalRef = React.useRef(null);
    const shellPidRef = React.useRef(null);
    const activeStreamRef = React.useRef(null);

    const [output, setOutput] = React.useState([]);
    const [history, setHistory] = React.useState([]);
    const historyRef = React.useRef(history);
    const indexRef = React.useRef(0);

    const { setWindows, bringWindowToFront, activeWindowId, openTerminalWindow } = React.useContext(WindowContext);

    const appendOutput = React.useCallback((line) => {
        if (line === null || line === undefined || line === "") {
            return;
        }

        setOutput((oldOutput) => [...oldOutput, line]);
    }, []);

    const appendTTYPayload = React.useCallback((payload) => {
        const text = String(payload ?? "").replace(/\r/g, "");
        if (text.length === 0) {
            return;
        }

        const lines = text.split("\n");
        setOutput((oldOutput) => {
            const nextOutput = [...oldOutput];

            for (let index = 0; index < lines.length; index += 1) {
                const line = lines[index];
                const isLastEmptyLine = index === lines.length - 1 && line === "";

                if (!isLastEmptyLine) {
                    nextOutput.push(<span>{line}</span>);
                }
            }

            return nextOutput;
        });
    }, []);

    const openWindow = React.useCallback((windowConfig, options = {}) => {
        const { unique = false, processName = null } = options;

        setWindows((oldWindows) => {
            if (unique && oldWindows.some((windowData) => windowData.id === windowConfig.id)) {
                setTimeout(() => bringWindowToFront(windowConfig.id), 0);
                return oldWindows;
            }

            const processPid = processName
                ? spawnProcess({ name: processName, ppid: shellPidRef.current || 1, user: "user", tty }).pid
                : null;

            return [...oldWindows, {
                ...windowConfig,
                minWidth: windowConfig.minWidth || 320,
                minHeight: windowConfig.minHeight || 180,
                processPid
            }];
        });
    }, [bringWindowToFront, setWindows, tty]);

    const handleRedirection = React.useCallback((commandOutput, redirectType, filename) => {
        const content = extractText(commandOutput);
        const append = redirectType === ">>";
        const success = writeFile(filename, `${content}\n`, append);

        if (!success) {
            appendOutput(<span style={{ color: "#f00" }}>Redirection impossible vers {filename}</span>);
            return;
        }

        if (!isSilentSinkPath(filename)) {
            const message = append
                ? `Contenu ajouté à '${filename}'.`
                : `Contenu écrit dans '${filename}'.`;
            appendOutput(<span>{message}</span>);
        }
    }, [appendOutput]);

    const displayCommandNotFound = React.useCallback(() => {
        new Audio(beep_error).play();
        appendOutput(<span style={{ color: "#f00" }}>{"Commande introuvable, tapez \"help\" pour afficher une liste de commandes disponibles."}</span>);
        terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    }, [appendOutput]);

    const createShell = React.useCallback(() => {
        const cwd = getCurrentDir();
        const shortCwd = cwd === "/home/user"
            ? "~"
            : (cwd.startsWith("/home/user/") ? `~${cwd.substring("/home/user".length)}` : cwd);

        appendOutput(<div style={{ display: "flex", flexDirection: "row" }}>
            <span style={{ whiteSpace: "nowrap" }}>user@tamdaz.sh:{shortCwd}$&nbsp;</span>
            <span contentEditable={true} style={{ flex: 1, outline: "none", wordBreak: "break-all" }} onKeyDown={handleInput}></span>
        </div>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appendOutput]);

    const stopActiveStream = React.useCallback((withInterruptLine = true) => {
        if (!activeStreamRef.current) {
            return false;
        }

        const { stop } = activeStreamRef.current;
        stop();
        activeStreamRef.current = null;

        if (withInterruptLine) {
            appendOutput(<span>^C</span>);
        }

        createShell();
        return true;
    }, [appendOutput, createShell]);

    const startContinuousCat = React.useCallback((path, ppidOverride = null) => {
        const catProcess = spawnProcess({
            name: "cat",
            ppid: ppidOverride || shellPidRef.current || 1,
            status: "running",
            user: "user",
            tty,
            cmdline: `/usr/bin/cat ${path}`
        });

        appendOutput(<span style={{ color: "#888" }}>Flux en cours depuis {path} (Ctrl+C pour interrompre)</span>);

        const intervalId = window.setInterval(() => {
            appendOutput(<span>{readContinuousCatChunk(path)}</span>);
        }, 90);

        activeStreamRef.current = {
            stop: () => {
                window.clearInterval(intervalId);
                killProcess(catProcess.pid);
            }
        };
    }, [appendOutput, tty]);

    const executeCommand = React.useCallback(function internalExecute(command, args, customEmit, ppidOverride = null) {
        let redirectType = null;
        let redirectFile = null;
        let actualArgs = [...args];
        const isContinuousCat = command === "cat" && actualArgs[0] && isContinuousCatTarget(actualArgs[0]);

        const redirectIndex = actualArgs.findIndex((arg) => arg === ">" || arg === ">>");
        if (redirectIndex !== -1) {
            redirectType = actualArgs[redirectIndex];
            redirectFile = actualArgs[redirectIndex + 1];
            actualArgs = actualArgs.slice(0, redirectIndex);
        }

        const emitCommandOutput = (commandOutput) => {
            if (commandOutput === null || commandOutput === undefined) {
                return;
            }

            if (customEmit) {
                customEmit(commandOutput);
            } else if (redirectFile) {
                handleRedirection(commandOutput, redirectType, redirectFile);
            } else {
                appendOutput(commandOutput);
            }
        };

        if (command && !TRANSIENT_EXCLUDED_COMMANDS.has(command) && !isContinuousCat) {
            spawnTransientProcess(command, ppidOverride || shellPidRef.current || 1, actualArgs);
        }

        const availableCommands = {
            "": () => null,
            aboutme: () => openWindow({
                id: "window-about-me",
                title: "À propos de moi",
                initialX: window.innerWidth - (16 * 30) - 100,
                initialY: 100,
                initialWidth: 16 * 30,
                initialHeight: 16 * 5,
                minWidth: 360,
                minHeight: 140,
                view: <AboutMe />
            }, { unique: true, processName: "aboutme" }),
            brightness: () => changeBrightness(actualArgs[0], setOutput),
            cat: () => {
                if (isContinuousCat) {
                    if (redirectFile) {
                        // Allow a large block of random/continuous data to be written once
                        emitCommandOutput(readContinuousCatChunk(actualArgs[0]).repeat(20));
                        return { blocking: false };
                    }

                    startContinuousCat(actualArgs[0], ppidOverride);
                    return { blocking: true };
                }

                emitCommandOutput(executeCat(actualArgs));
                return { blocking: false };
            },
            cd: () => emitCommandOutput(executeCd(actualArgs)),
            chmod: () => emitCommandOutput(executeChmod(actualArgs)),
            chown: () => emitCommandOutput(executeChown(actualArgs)),
            clear: () => setOutput([]),
            color: () => {
                if (!Number.isNaN(Number(actualArgs[0])) && actualArgs[0] >= 0 && actualArgs[0] <= 9) {
                    changeColor(parseInt(actualArgs[0], 10));
                } else {
                    appendOutput(displayHelpColor());
                }
            },
            cp: () => emitCommandOutput(executeCp(actualArgs)),
            credits: () => openWindow({
                id: "window-credits",
                title: "Credits",
                initialX: window.innerWidth / 2 - (16 * 30) / 2,
                initialY: window.innerHeight - (16 * 5) - 100,
                initialWidth: 16 * 30,
                initialHeight: 16 * 5,
                minWidth: 360,
                minHeight: 140,
                view: <Credits />
            }, { unique: true, processName: "credits" }),
            echo: () => emitCommandOutput(executeEcho(actualArgs)),
            exit: () => {
                if (isMainTerminal) {
                    appendOutput(<span style={{ color: "#f00" }}>Le terminal principal ne peut pas être fermé.</span>);
                    return { blocking: false };
                }

                setWindows((windowsData) => windowsData.filter((win) => win.id !== windowId));
                return { blocking: true };
            },
            fastfetch: () => emitCommandOutput(executeFastfetch()),
            files: () => openWindow({
                id: "window-files",
                title: "Gestionnaire de fichiers",
                initialX: window.innerWidth / 2 - 380,
                initialY: window.innerHeight / 2 - 220,
                initialWidth: 760,
                initialHeight: 440,
                minWidth: 560,
                minHeight: 320,
                view: <FileManager />
            }, { unique: true, processName: "files" }),
            font: () => {
                if (!actualArgs[0]) {
                    emitCommandOutput(displayHelpFont());
                } else {
                    changeFont(actualArgs[0], setOutput);
                }
            },
            help: () => emitCommandOutput(displayHelp()),
            history: () => emitCommandOutput(<>
                {historyRef.current.length === 0
                    ? <span style={{ color: "#888" }}>Historique vide.</span>
                    : historyRef.current.map((entry, index) => <span key={`hist-${index}`}>{String(historyRef.current.length - index).padStart(3, " ")}  {entry}</span>)}
            </>),
            historyc: () => {
                setHistory([]);
                emitCommandOutput(<span>Historique des commandes effacé.</span>);
            },
            ip: () => emitCommandOutput(executeIp()),
            kill: () => emitCommandOutput(executeKill(actualArgs)),
            less: () => appendOutput(<span style={{ color: "#f00" }}>{"Commande less supprimée. Utilisez cat ou vim."}</span>),
            ls: () => emitCommandOutput(executeLs(actualArgs)),
            man: () => emitCommandOutput(executeMan(actualArgs)),
            md5sum: () => emitCommandOutput(executeHashsum("md5sum", actualArgs)),
            mkdir: () => emitCommandOutput(executeMkdir(actualArgs)),
            more: () => appendOutput(<span style={{ color: "#f00" }}>{"Commande more supprimée. Utilisez cat ou vim."}</span>),
            mv: () => emitCommandOutput(executeMv(actualArgs)),
            ping: () => emitCommandOutput(executePing(actualArgs)),
            portfolio: () => {
                appendOutput(<span>Accès au site portfolio: https://tamdaz.fr.</span>);
                setTimeout(() => window.open("https://tamdaz.fr", "_blank"), 1000);
            },
            procman: () => openWindow({
                id: "window-procman",
                title: "Gestionnaire de processus",
                initialX: window.innerWidth / 2 - 380,
                initialY: window.innerHeight / 2 - 250,
                initialWidth: 760,
                initialHeight: 500,
                minWidth: 620,
                minHeight: 320,
                view: <ProcessManager />
            }, { unique: true, processName: "procman" }),
            ps: () => emitCommandOutput(executePs(actualArgs)),
            power4: () => {
                const gameId = `window-power4-${Date.now()}`;
                openWindow({
                    id: gameId,
                    title: "Puissance 4",
                    initialX: window.innerWidth / 2 - 250,
                    initialY: window.innerHeight / 2 - 280,
                    initialWidth: 500,
                    initialHeight: 560,
                    minWidth: 420,
                    minHeight: 420,
                    view: <Power4Game />
                }, { processName: "power4" });
            },
            pwd: () => emitCommandOutput(executePwd()),
            rm: () => emitCommandOutput(executeRm(actualArgs)),
            rmdir: () => emitCommandOutput(executeRmdir(actualArgs)),
            rps: () => {
                const gameId = `window-rps-${Date.now()}`;
                openWindow({
                    id: gameId,
                    title: "Pierre-Feuille-Ciseaux",
                    initialX: window.innerWidth / 2 - 200,
                    initialY: window.innerHeight / 2 - 200,
                    initialWidth: 400,
                    initialHeight: 400,
                    minWidth: 320,
                    minHeight: 260,
                    view: <RPSGame />
                }, { processName: "rps" });
            },
            sha1sum: () => emitCommandOutput(executeHashsum("sha1sum", actualArgs)),
            sha256sum: () => emitCommandOutput(executeHashsum("sha256sum", actualArgs)),
            sha3sum: () => emitCommandOutput(executeHashsum("sha3sum", actualArgs)),
            sha512sum: () => emitCommandOutput(executeHashsum("sha512sum", actualArgs)),
            terminal: () => {
                if (typeof openTerminalWindow === "function") {
                    openTerminalWindow();
                    return;
                }

                appendOutput(<span style={{ color: "#f00" }}>{"Impossible d'ouvrir un nouveau terminal."}</span>);
            },
            top: () => emitCommandOutput(executeTop()),
            touch: () => emitCommandOutput(executeTouch(actualArgs)),
            ttt: () => {
                const gameId = `window-ttt-${Date.now()}`;
                openWindow({
                    id: gameId,
                    title: "Tic Tac Toe",
                    initialX: window.innerWidth / 2 - 175,
                    initialY: window.innerHeight / 2 - 200,
                    initialWidth: 350,
                    initialHeight: 400,
                    minWidth: 300,
                    minHeight: 260,
                    view: <TicTacToeGame />
                }, { processName: "ttt" });
            },
            version: () => appendOutput(<span>&copy; tamdaz.sh version 0.0.1, tous droits réservés</span>),
            vim: () => {
                const result = executeVim(actualArgs, setWindows);

                if (result.command !== "vim") {
                    emitCommandOutput(result);
                    return;
                }

                const vimId = `window-vim-${Date.now()}`;
                openWindow({
                    id: vimId,
                    title: `vim ${result.filename}`,
                    initialX: window.innerWidth / 2 - 320,
                    initialY: window.innerHeight / 2 - 240,
                    initialWidth: 640,
                    initialHeight: 480,
                    minWidth: 480,
                    minHeight: 260,
                    view: <VimEditor filename={result.filename} onClose={() => {
                        setWindows((windowsData) => windowsData.filter((win) => win.id !== vimId));
                    }} />
                }, { processName: "vim" });
            },
            watch: () => {
                if (actualArgs.length === 0) {
                    emitCommandOutput(<span style={{ color: '#f00' }}>watch: veuillez fournir une commande à exécuter</span>);
                    return { blocking: false };
                }
                
                const watchProcess = spawnProcess({
                    name: "watch",
                    ppid: ppidOverride || shellPidRef.current || 1,
                    status: "running",
                    user: "user",
                    tty,
                    cmdline: `watch ${actualArgs.join(" ")}`
                });

                const boundExecuteCommand = (cmd, cArgs, emit) => internalExecute(cmd, cArgs, emit, watchProcess.pid);
                
                const watchComponent = executeWatch(actualArgs, boundExecuteCommand, (ref) => {
                    activeStreamRef.current = {
                        stop: () => {
                            if (ref && ref.stop) ref.stop();
                            killProcess(watchProcess.pid);
                        }
                    };
                });
                
                emitCommandOutput(watchComponent);
                return { blocking: true };
            },
            default: () => displayCommandNotFound()
        };

        return (availableCommands[command] || availableCommands.default)();
    }, [appendOutput, displayCommandNotFound, handleRedirection, isMainTerminal, openTerminalWindow, openWindow, setWindows, startContinuousCat, tty, windowId]);

    const handleInput = React.useCallback((e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "c") {
            e.preventDefault();
            if (stopActiveStream(true)) {
                return;
            }
        }

        if (historyRef.current.length !== 0) {
            if (e.key === "ArrowUp") {
                if (indexRef.current + 1 < historyRef.current.length) {
                    indexRef.current += 1;
                    e.target.innerText = historyRef.current[indexRef.current];
                }

                setTimeout(() => {
                    const selection = window.getSelection();
                    selection.selectAllChildren(e.target);
                    selection.collapseToEnd();
                });
            }

            if (e.key === "ArrowDown") {
                if (indexRef.current > -1) {
                    indexRef.current -= 1;
                }

                e.target.innerText = indexRef.current !== -1
                    ? historyRef.current[indexRef.current]
                    : "";
            }
        }

        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();
        e.target.contentEditable = false;

        const input = e.target.innerText.replace("\n", "").trim();
        const args = input === "" ? [] : input.split(/\s+/);
        const command = (args[0] || "").toLowerCase();
        const argv = args.slice(1);

        const result = executeCommand(command, argv);

        if (input !== "" && command !== "historyc") {
            setHistory((oldHistory) => [input, ...oldHistory]);
        }

        indexRef.current = -1;
        if (!result || !result.blocking) {
            createShell();
        }
    }, [createShell, executeCommand, stopActiveStream]);

    const focusInput = React.useCallback((force = false) => {
        if (!terminalRef.current || output.length === 0) {
            return;
        }

        if (!force && activeWindowId !== windowId) {
            return;
        }

        if (output.length === 1) {
            const shell = terminalRef.current.lastChild?.lastChild;
            if (shell && typeof shell.getAttribute === "function" && shell.getAttribute("contenteditable") === "false") {
                shell.setAttribute("contenteditable", "true");
                shell.innerText = "";
            }
        }

        const inputNode = terminalRef.current.lastChild?.lastChild;
        if (inputNode && typeof inputNode.focus === "function") {
            inputNode.focus();
        }
    }, [activeWindowId, output.length, windowId]);

    React.useEffect(() => {
        ensureProcessState();
        const shellProcess = spawnProcess({
            name: "bash",
            ppid: 1,
            status: "running",
            user: "user",
            cpu: 1.1,
            mem: 0.6,
            cmdline: "/usr/bin/bash --login",
            tty
        });

        shellPidRef.current = shellProcess.pid;
        setWindows((oldWindows) => oldWindows.map((w) => w.id === windowId ? { ...w, processPid: shellProcess.pid } : w));
        createShell();

        return () => {
            if (shellPidRef.current) {
                killProcess(shellPidRef.current);
            }
        };
    }, [createShell, setWindows, tty, windowId]);

    React.useEffect(() => {
        registerTTY(tty, appendTTYPayload);

        return () => {
            unregisterTTY(tty);
        };
    }, [appendTTYPayload, tty]);

    React.useEffect(() => {
        if (activeWindowId === windowId) {
            setActiveTTY(tty);
        }
    }, [activeWindowId, tty, windowId]);

    React.useEffect(() => {
        focusInput();
    }, [focusInput, output]);

    React.useEffect(() => {
        historyRef.current = history;
    }, [history]);

    React.useEffect(() => {
        return () => {
            if (activeStreamRef.current) {
                activeStreamRef.current.stop();
                activeStreamRef.current = null;
            }
        };
    }, []);

    React.useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.ctrlKey && event.key.toLowerCase() === "c") {
                if (activeStreamRef.current) {
                    event.preventDefault();
                    stopActiveStream(true);
                }
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [stopActiveStream]);

    return <div ref={terminalRef} className="tz-sh-terminal" onClick={() => focusInput(true)}>
        {output.map((singleOutput, index) => (
            <React.Fragment key={`output-id-${index}`}>
                {singleOutput}
            </React.Fragment>
        ))}
    </div>;
}
