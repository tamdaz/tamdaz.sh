 
import React from "react";

import AboutMe from "./AboutMe";
import Credits from "./Credits";
import VimEditor from "./VimEditor";
import Power4Game from "./Power4Game";
import RPSGame from "./RPSGame";
import TicTacToeGame from "./TicTacToeGame";
import FileManager from "./FileManager";
import ProcessManager from "./ProcessManager";
import HelpViewer from "./HelpViewer";
import Game2048 from "./Game2048";
import SnakeGame from "./SnakeGame";

import { WindowContext } from "../contexts/WindowContext";

import beep_error from "./../assets/sounds/beep_error.wav";

import {
    changeColor, displayHelpColor,
    changeBrightness,
    changeFont, displayHelpFont,
    executeEcho,
    executeCat, isContinuousCatTarget, readContinuousCatChunk,
    executeTouch,
    executeRm,
    getCompletions,
    executeLn,
    executeLs,
    executePwd,
    executeCd,
    executeCp,
    executeMv,
    executeMkdir,
    executeRmdir,
    executeVim,
    executePing,
    executeIp,
    executeFastfetch,
    executeTop,
    executePs,
    executeKill,
    executeHashsum,
    executeMan,
    executeChmod,
    executeChown,
    writeFile, getCurrentDir, isSilentSinkPath,
    ensureProcessState, killProcess, spawnProcess, spawnTransientProcess,
    registerTTY, setActiveTTY, unregisterTTY,
    executeWatch,
    executeWhoami,
    executeDate,
    executeUname,
    executeUptime,
    executeReadlink,
    executeLess,
    executeDownload
} from "./../commands";

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

    const [completionState, setCompletionState] = React.useState(null);
    const completionRef = React.useRef(null);
    React.useEffect(() => {
        completionRef.current = completionState;
    }, [completionState]);

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

    // Auto-scroll vers le bas lorsque le contenu du terminal change
    React.useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

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
            date: () => emitCommandOutput(executeDate()),
            download: () => emitCommandOutput(executeDownload(actualArgs)),
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
            help: () => openWindow({
                id: "window-help",
                title: "Aide - sh.tamdaz.fr",
                initialX: window.innerWidth / 2 - 250,
                initialY: window.innerHeight / 2 - 200,
                initialWidth: 500,
                initialHeight: 400,
                minWidth: 400,
                minHeight: 300,
                view: <HelpViewer />
            }, { unique: true, processName: "help" }),
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
            less: () => {
                let isDone = false;
                const onDone = () => {
                    if (!isDone) {
                        isDone = true;
                        createShell();
                    }
                };

                let lessComponent = executeLess(actualArgs, (ref) => {
                    activeStreamRef.current = {
                        stop: () => {
                            if (ref && ref.stop) ref.stop();
                            onDone();
                        }
                    };
                }, onDone);
                
                emitCommandOutput(lessComponent);
                return { blocking: true };
            },
            ln: () => emitCommandOutput(executeLn(actualArgs)),
            ls: () => emitCommandOutput(executeLs(actualArgs)),
            man: () => emitCommandOutput(executeMan(actualArgs)),
            md5sum: () => emitCommandOutput(executeHashsum("md5sum", actualArgs)),
            mkdir: () => emitCommandOutput(executeMkdir(actualArgs)),
            more: () => appendOutput(<span style={{ color: "#f00" }}>{"Commande more supprimée. Utilisez cat ou vim."}</span>),
            mv: () => emitCommandOutput(executeMv(actualArgs)),
            ping: () => {
                let isDone = false;
                let pingStopper = null;

                const onDone = () => {
                    if (!isDone) {
                        isDone = true;
                        createShell();
                    }
                };
                
                const pingComponent = executePing(actualArgs, onDone, (ref) => {
                    pingStopper = ref;
                });
                
                // Allow Ctrl+C to interrupt ping
                activeStreamRef.current = {
                    stop: () => {
                        if (pingStopper && pingStopper.stop) {
                            pingStopper.stop();
                        }
                        onDone();
                    }
                };

                emitCommandOutput(pingComponent);
                return { blocking: true };
            },
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
            "2048": () => {
                const gameId = `window-2048-${Date.now()}`;
                openWindow({
                    id: gameId,
                    title: "2048",
                    initialX: window.innerWidth / 2 - 200,
                    initialY: window.innerHeight / 2 - 250,
                    initialWidth: 400,
                    initialHeight: 500,
                    minWidth: 350,
                    minHeight: 450,
                    view: <Game2048 />
                }, { processName: "2048" });
            },
            snake: () => {
                const gameId = `window-snake-${Date.now()}`;
                openWindow({
                    id: gameId,
                    title: "Snake",
                    initialX: window.innerWidth / 2 - 220,
                    initialY: window.innerHeight / 2 - 240,
                    initialWidth: 440,
                    initialHeight: 480,
                    minWidth: 400,
                    minHeight: 450,
                    view: <SnakeGame />
                }, { processName: "snake" });
            },
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
            readlink: () => emitCommandOutput(executeReadlink(actualArgs)),
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
            uname: () => emitCommandOutput(executeUname(actualArgs)),
            uptime: () => emitCommandOutput(executeUptime()),
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
            whoami: () => emitCommandOutput(executeWhoami()),
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

        if (e.key === "Tab") {
            e.preventDefault();
            
            const currentText = e.target.innerText.replace("\n", "");
            
            if (completionRef.current) {
                const { matches, selectedIndex, baseText } = completionRef.current;
                
                let nextIndex = selectedIndex;
                if (e.shiftKey) {
                    nextIndex = (selectedIndex - 1 + matches.length) % matches.length;
                } else {
                    nextIndex = (selectedIndex + 1) % matches.length;
                }
                
                const selectedMatch = matches[nextIndex];
                const newText = baseText + selectedMatch.text + (selectedMatch.suffix || "");
                e.target.innerText = newText;
                
                setTimeout(() => {
                    const selection = window.getSelection();
                    selection.selectAllChildren(e.target);
                    selection.collapseToEnd();
                });
                
                setCompletionState({
                    ...completionRef.current,
                    selectedIndex: nextIndex,
                    currentText: newText
                });
                return;
            } else {
                const { matches, baseText } = getCompletions(currentText);
                
                if (matches.length === 1) {
                    const m = matches[0];
                    const newText = baseText + m.text + (m.suffix || "");
                    e.target.innerText = newText;
                    setTimeout(() => {
                        const selection = window.getSelection();
                        selection.selectAllChildren(e.target);
                        selection.collapseToEnd();
                    });
                } else if (matches.length > 1) {
                    setCompletionState({
                        matches,
                        selectedIndex: -1,
                        baseText,
                        originalText: currentText
                    });
                }
                return;
            }
        }

        if (completionRef.current) {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                const { matches, selectedIndex, baseText } = completionRef.current;
                const COLUMNS = 5; // Nombre de colonnes fixe pour la navigation 2D
                
                let nextIndex = selectedIndex;
                if (e.key === "ArrowRight") {
                    nextIndex = selectedIndex + 1 < matches.length ? selectedIndex + 1 : selectedIndex;
                } else if (e.key === "ArrowLeft") {
                    nextIndex = selectedIndex - 1 >= 0 ? selectedIndex - 1 : selectedIndex;
                } else if (e.key === "ArrowDown") {
                    nextIndex = selectedIndex + COLUMNS < matches.length ? selectedIndex + COLUMNS : selectedIndex;
                } else if (e.key === "ArrowUp") {
                    nextIndex = selectedIndex - COLUMNS >= 0 ? selectedIndex - COLUMNS : selectedIndex;
                }
                
                const selectedMatch = matches[nextIndex];
                const newText = baseText + selectedMatch.text + (selectedMatch.suffix || "");
                e.target.innerText = newText;
                
                setTimeout(() => {
                    const selection = window.getSelection();
                    selection.selectAllChildren(e.target);
                    selection.collapseToEnd();
                });
                
                setCompletionState({
                    ...completionRef.current,
                    selectedIndex: nextIndex,
                    currentText: newText
                });
                return;
            }
        }

        if (completionRef.current && !["Shift", "Control", "Alt", "Meta", "Tab"].includes(e.key)) {
            setCompletionState(null);
            if (e.key === "Enter" && completionRef.current.selectedIndex !== -1) {
                e.preventDefault();
                return;
            }
        }

        if (historyRef.current.length !== 0 && !completionRef.current) {
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

    const renderCompletions = () => {
        if (!completionState || !completionState.matches) return null;
        
        const maxMatchLength = completionState.matches.reduce((max, match) => Math.max(max, (match.displayName || match.text).length), 0);
        const columnWidthCh = maxMatchLength + 2;
        const COLUMNS = 5; // 5 colonnes pour la navigation 2D

        return (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS}, ${columnWidthCh}ch)`, gap: '0 16px' }}>
                {completionState.matches.map((match, index) => {
                    const isSelected = completionState.selectedIndex === index;
                    const fgColor = isSelected ? '#000' : (match.color || 'inherit');
                    const bgColor = isSelected ? '#ccc' : 'transparent';
                    
                    return (
                        <span key={index} style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            background: bgColor,
                            color: fgColor,
                        }}>
                            {match.displayName || match.text}
                        </span>
                    );
                })}
            </div>
        );
    };

    return <div ref={terminalRef} className="tz-sh-terminal" onClick={(e) => {
        e.stopPropagation();
        bringWindowToFront(windowId);
        focusInput(true);
    }}>
        {output.map((singleOutput, index) => (
            <React.Fragment key={`output-id-${index}`}>
                {singleOutput}
            </React.Fragment>
        ))}
        {renderCompletions()}
    </div>;
}
