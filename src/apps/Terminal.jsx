import React from "react";

import AboutMe from "./AboutMe";
import Credits from "./Credits";
import { WindowContext } from "../Root";

import { displayHelp } from "../commands/help";
import { changeColor, displayHelpColor } from "../commands/color";

import beep_error from "./../assets/sounds/beep_error.wav";

export default function Terminal() {
    /** @type {{ current: HTMLDivElement }} terminalRef */
    const terminalRef = React.useRef(null);

    const [output, setOutput] = React.useState([]);

    const { windows, setWindows } = React.useContext(WindowContext);

    const executeCommand = (command, args) => {
        const availableCommands = {
            "": () => null,
            "aboutme": () => {
                setWindows((oldWindows) => [...oldWindows, {
                    id: "window-about-me",
                    title: "A propos de moi",
                    initialX: window.innerWidth - (16 * 30) - 100,
                    initialY: 100,
                    initialWidth: 16 * 30,
                    initialHeight: 16 * 5,
                    view: <AboutMe />
                }])
            },
            "clear": () => {
                setOutput([]);
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
                setWindows((oldWindows) => [...oldWindows, {
                    id: "window-credits",
                    title: "Crédits / Mentions légales",
                    initialX: window.innerWidth / 2 - (16 * 30) / 2,
                    initialY: window.innerHeight - (16 * 5) - 100,
                    initialWidth: 16 * 30,
                    initialHeight: 16 * 5,
                    view: <Credits />
                }])
            },
            "exit": () => {
                setWindows(windows.filter(window => window.id !== "window-terminal"))
            },
            "help": () => {
                setOutput(oldOutput => [...oldOutput, displayHelp()])
            },
            "portfolio": () => {
                setOutput(oldOutput => [...oldOutput, <span>Accès au site portfolio: https://tamdaz.fr.</span>]);
                
                setTimeout(() => {
                    window.open("https://tamdaz.fr", "_blank");
                }, 1000);
            },
            "version": () => {
                setOutput(oldOutput => [
                    ...oldOutput,
                    <span>&copy; tamdaz.sh version 0.0.1, tous droits réservés</span>
                ]);
            },
            "default": () => {
                displayCommandNotFound();
            }
        }

        return (availableCommands[command] || availableCommands['default'])();
    }

    /** @type {{ target: HTMLSpanElement }} e */
    const handleInput = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.contentEditable = false;
            
            const args = e.target.innerText.replace("\n", '').split(" ");

            const command = args[0];
            const argv = Array.from(args); // immutable array
            
            argv.shift();

            executeCommand(command, argv);
            createShell();
        }
    }

    const createShell = () => {
        const shellOutput = <div style={{ display: "flex", flexDirection: "row" }}>
            <span>user@tamdaz.sh:~$&nbsp;</span>
            <span contentEditable={true} style={{ width: "100%", outline: "none" }} autoFocus onKeyDown={handleInput}></span>
        </div>

        setOutput(oldOutput => [...oldOutput, shellOutput]);
    }

    const displayCommandNotFound = () => {
        new Audio(beep_error).play();

        const helpOutput = <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#f00" }}>
                Commande introuvable, tapez "help" pour afficher une liste de commandes disponibles.
            </span>
        </div>

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

    React.useEffect(() => {
        createShell();
    }, []);

    React.useEffect(() => {
        focusInput();
    }, [output]);

    return <>
        <div ref={terminalRef} className="tz-sh-terminal" onClick={focusInput}>
            {
                output.map((o, k) => {
                    return <React.Fragment key={`output-id-${k}`}>
                        { o }
                    </React.Fragment>
                })
            }
        </div>
    </>
}