import React from "react";
import { readFile, writeFile, exists } from "../commands/fileSystem";

export default function VimEditor({ filename, onClose }) {
    const [content, setContent] = React.useState("");
    const [mode, setMode] = React.useState("NORMAL");
    const [message, setMessage] = React.useState(`"${filename}" [Nouveau fichier]`);
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
        if (exists(filename)) {
            const fileContent = readFile(filename);
            if (fileContent !== null) {
                setContent(fileContent);
                setMessage(`"${filename}" ${fileContent.split('\n').length}L, ${fileContent.length}C`);
            }
        }
        
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [filename]);

    const handleKeyDown = (e) => {
        if (mode === "NORMAL") {
            if (e.key === "i") {
                e.preventDefault();
                setMode("INSERT");
                setMessage("-- INSERT --");
            } else if (e.key === ":" && !e.shiftKey) {
                e.preventDefault();
                setMode("COMMAND");
                setMessage(":");
            } else if (e.key === "Escape") {
                e.preventDefault();
            }
        } else if (mode === "INSERT") {
            if (e.key === "Escape") {
                e.preventDefault();
                setMode("NORMAL");
                setMessage("");
            }
        } else if (mode === "COMMAND") {
            if (e.key === "Enter") {
                e.preventDefault();
                const cmd = message.slice(1).trim();
                handleCommand(cmd);
            } else if (e.key === "Escape") {
                e.preventDefault();
                setMode("NORMAL");
                setMessage("");
            } else if (e.key === "Backspace" && message === ":") {
                e.preventDefault();
                setMode("NORMAL");
                setMessage("");
            }
        }
    };

    const handleCommand = (cmd) => {
        if (cmd === "w" || cmd === "write") {
            const success = writeFile(filename, content);
            if (success) {
                setMessage(`"${filename}" ${content.split('\n').length}L, ${content.length}C écrit`);
            } else {
                setMessage(`Erreur: impossible d'écrire dans "${filename}"`);
            }
            setMode("NORMAL");
        } else if (cmd === "q" || cmd === "quit") {
            onClose();
        } else if (cmd === "wq" || cmd === "x") {
            writeFile(filename, content);
            onClose();
        } else if (cmd === "q!") {
            onClose();
        } else {
            setMessage(`E492: Pas une commande d'éditeur: ${cmd}`);
            setMode("NORMAL");
        }
    };

    const handleInput = (e) => {
        if (mode === "COMMAND") {
            if (e.nativeEvent.data) {
                setMessage(message + e.nativeEvent.data);
            }
        }
    };

    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%", 
            fontFamily: "inherit",
            backgroundColor: "inherit",
            color: "inherit"
        }}>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => mode === "INSERT" && setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                style={{
                    flex: 1,
                    backgroundColor: "inherit",
                    color: "inherit",
                    border: "none",
                    outline: "none",
                    padding: "8px",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    resize: "none",
                    caretColor: mode === "INSERT" ? "inherit" : "transparent"
                }}
                spellCheck={false}
            />
            <div style={{
                padding: "4px 8px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                fontWeight: "bold"
            }}>
                {message}
            </div>
        </div>
    );
}
