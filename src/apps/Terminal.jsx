import React from "react";
import awaitSleep from "await-sleep";

import AboutMe from "./AboutMe";
import Credits from "./Credits";

import { WindowContext } from "../Root";

import beep_error from "./../assets/sounds/beep_error.wav";

import { displayHelp } from "../commands/help";
import { changeColor, displayHelpColor } from "../commands/color";
import { changeBrightness, displayHelpBrightness } from "../commands/brightness";

export default function Terminal() {
    /** @type {{ current: HTMLDivElement }} terminalRef */
    const terminalRef = React.useRef(null);

    const [output, setOutput] = React.useState([]);

    const [history, setHistory] = React.useState([]);
    const historyRef = React.useRef(history);

    const indexRef = React.useRef(0);

    const { windows, setWindows } = React.useContext(WindowContext);

    const executeCommand = (command, args) => {
        const availableCommands = {
            "": () => null,
            "aboutme": () => {
                setWindows((oldWindows) => {
                    if (oldWindows.some(window => window.id === "window-about-me"))
                        return oldWindows;

                    return [...oldWindows, {
                        id: "window-about-me",
                        title: "A propos de moi",
                        initialX: window.innerWidth - (16 * 30) - 100,
                        initialY: 100,
                        initialWidth: 16 * 30,
                        initialHeight: 16 * 5,
                        view: <AboutMe />
                    }];
                });
            },
            "brightness": () => {
                if (!isNaN(args[0])) {
                    changeBrightness(args[0], setOutput);
                } else {
                    setOutput(oldOutput => [...oldOutput, displayHelpBrightness()]);
                }
            },
            "clear": () => setOutput([]),
            "historyc": () => {
                setHistory([])
                setOutput(oldOutput => [...oldOutput, <span>Historique des commandes effacés.</span>]);
            },
            "color": () => {
                if (!isNaN(args[0]) && args[0] >= 0 && args[0] <= 9) {
                    const colorId = parseInt(args[0]);
                    changeColor(colorId);
                } else {
                    setOutput(oldOutput => [...oldOutput, displayHelpColor()]);
                }
            },
            "credits": () => {
                setWindows((oldWindows) => {
                    if (oldWindows.some(window => window.id === "window-credits"))
                        return oldWindows;

                    return [...oldWindows, {
                        id: "window-credits",
                        title: "Crédits / Mentions légales",
                        initialX: window.innerWidth / 2 - (16 * 30) / 2,
                        initialY: window.innerHeight - (16 * 5) - 100,
                        initialWidth: 16 * 30,
                        initialHeight: 16 * 5,
                        view: <Credits />
                    }];
                });
            },
            "exit": () => setWindows(oldWindows => oldWindows.filter(oldWindow => oldWindow.id !== "window-terminal")),
            "help": () => setOutput(oldOutput => [...oldOutput, displayHelp()]),
            "portfolio": async () => {
                window.open("https://tamdaz.fr", "_blank");

                await awaitSleep(1000);

                setOutput(oldOutput => [...oldOutput, <span>Accès au site portfolio: https://tamdaz.fr.</span>]);
            },
            "version": () => {
                setOutput(oldOutput => [...oldOutput, <span>&copy; tamdaz.sh version 0.0.1, tous droits réservés</span>]);
            },
            "default": () => displayCommandNotFound()
        }

        return (availableCommands[command] || availableCommands['default'])();
    }

    /** @param {{ target: HTMLSpanElement }} e */
    const handleInput = (e) => {
        if (historyRef.current.length !== 0) {
            if (e.key === "ArrowUp") {
                if (indexRef.current + 1 < historyRef.current.length) {
                    indexRef.current += 1;

                    e.target.innerText = historyRef.current[indexRef.current];
                }

                /**
                 * Allows to move the cursor to the end.
                 * The `setTimeout()` function is applied because it allows to take a little time
                 * to the navigator to execute those instructions below.
                 * Without this function, the cursor cannot move to the end, it's strange.
                 */
                setTimeout(() => {
                    let sel = window.getSelection();
                    sel.selectAllChildren(e.target);
                    sel.collapseToEnd();
                });
            }

            if (e.key === "ArrowDown") {
                if (indexRef.current > -1) {
                    indexRef.current -= 1;
                }

                if (indexRef.current !== -1) {
                    e.target.innerText = historyRef.current[indexRef.current];
                } else {
                    e.target.innerText = "";
                }
            }
        }

        if (e.key === "Enter") {
            e.preventDefault();

            e.target.contentEditable = false;

            const input = e.target.innerText.replace("\n", '');
            const args = input.split(" ");

            const command = args[0];
            const argv = Array.from(args); // immuable array

            argv.shift();

            executeCommand(command, argv);

            if (input !== "" && input !== "historyc") {
                setHistory(oldHistory => [input, ...oldHistory]);
            }

            indexRef.current = -1;
            createShell();
        }
    }

    const createShell = () => {
        const shellOutput = <div style={{ display: "flex", flexDirection: "row" }}>
            <span>user@tamdaz.sh:~$&nbsp;</span>
            <span contentEditable={true} style={{ width: "100%", outline: "none" }} onKeyDown={handleInput}></span>
        </div>

        setOutput(oldOutput => [...oldOutput, shellOutput]);
    }

    const displayCommandNotFound = () => {
        new Audio(beep_error).play();

        const helpOutput = <span style={{ color: "#f00" }}>
            Commande introuvable, tapez "help" pour afficher une liste de commandes disponibles.
        </span>

        setOutput(oldOutput => [...oldOutput, helpOutput]);

        terminalRef.current.scrollTo(0, terminalRef.current.scrollHeight);
    }

    const focusInput = () => {
        if (output.length === 1) {
            const shell = terminalRef.current.lastChild.lastChild;

            if (shell.getAttribute("contenteditable") === "false") {
                shell.setAttribute("contenteditable", "true");
                shell.innerText = null;
            }
        }

        // Focus the editable span.
        if (output.length !== 0) {
            terminalRef.current.lastChild.lastChild.focus();
        }
    }

    React.useEffect(() => createShell(), []);

    React.useEffect(() => focusInput(), [output]);

    React.useEffect(() => {
        historyRef.current = history;
    }, [history]);

    return <div ref={terminalRef} className="tz-sh-terminal" onClick={focusInput}>
        {
            output.map((o, k) => {
                return <React.Fragment key={`output-id-${k}`}>
                    { o }
                </React.Fragment>
            })
        }
    </div>
}