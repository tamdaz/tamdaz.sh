import React from "react";
import { readFile, fileExists, isDirectory } from "./fileSystem";

function LessViewer({ content, filename, setStopRef, onDone }) {
    const [active, setActive] = React.useState(true);
    const [scroll, setScroll] = React.useState(0);
    const lines = content.split("\n");
    const containerRef = React.useRef(null);
    const [rows, setRows] = React.useState(20);

    const quit = React.useCallback(() => {
        setActive(false);
        // Notifier le Terminal que le flux est terminé
        if (onDone) {
            setTimeout(() => {
                onDone();
            }, 10);
        }
    }, [onDone]);

    React.useEffect(() => {
        setStopRef({ stop: quit });
    }, [setStopRef, quit]);

    React.useEffect(() => {
        if (!active || !containerRef.current) return;
        const updateRows = () => {
            if (containerRef.current) {
                const height = containerRef.current.clientHeight;
                // Roughly 18px per line 
                setRows(Math.floor(height / 18) - 2);
            }
        };
        updateRows();
        window.addEventListener('resize', updateRows);
        return () => window.removeEventListener('resize', updateRows);
    }, [active]);

    React.useEffect(() => {
        if (!active) return;
        
        const handleKey = (e) => {
            if (e.key === 'q' || (e.ctrlKey && e.key.toLowerCase() === 'c')) {
                quit();
                e.preventDefault();
                e.stopPropagation();
            } else if (e.key === 'ArrowDown' || e.key === 'j') {
                setScroll(s => Math.min(s + 1, Math.max(0, lines.length - rows)));
                e.preventDefault();
                e.stopPropagation();
            } else if (e.key === 'ArrowUp' || e.key === 'k') {
                setScroll(s => Math.max(s - 1, 0));
                e.preventDefault();
                e.stopPropagation();
            } else if (e.key === 'PageDown' || e.key === ' ') {
                setScroll(s => Math.min(s + rows, Math.max(0, lines.length - rows)));
                e.preventDefault();
                e.stopPropagation();
            } else if (e.key === 'PageUp' || e.key === 'b') {
                setScroll(s => Math.max(s - rows, 0));
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Utilise window plutôt que le document pour garantir la capture
        // Et stoppe la propagation pour ne pas écrire dans le terminal caché
        const keyListener = (e) => handleKey(e);
        window.addEventListener('keydown', keyListener, { capture: true });
        return () => window.removeEventListener('keydown', keyListener, { capture: true });
    }, [active, lines.length, quit, rows]);

    // Give it absolute position so it overlays the terminal exactly
    if (!active) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--terminal-bg-color)',
            color: 'var(--terminal-color)',
            zIndex: 9999,
            display: 'flex', 
            flexDirection: 'column',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            overflow: 'hidden'
        }} ref={containerRef}>
            <div style={{ flex: 1, overflow: 'hidden', padding: '0 8px' }}>
                {lines.slice(scroll, scroll + rows).join("\n")}
            </div>
            <div style={{ 
                backgroundColor: 'var(--terminal-color)', 
                color: 'var(--terminal-bg-color)', 
                padding: '2px 8px',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>{filename}</span>
                <span>Lignes {Math.min(scroll + 1, lines.length)}-{Math.min(scroll + rows, lines.length)}/{lines.length} (Appuyez sur 'q' pour quitter)</span>
            </div>
        </div>
    );
}

export const executeLess = (args, setStopRef, onDone) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>less: opérande manquante</span>;
    }

    const path = args[0];
    if (!fileExists(path)) {
        return <span style={{ color: '#f00' }}>{`less: ${path}: Aucun fichier ou dossier de ce type`}</span>;
    }
    if (isDirectory(path)) {
        return <span style={{ color: '#f00' }}>{`less: ${path}: est un dossier`}</span>;
    }

    const content = readFile(path);
    if (content === null) {
        return <span style={{ color: '#f00' }}>{`less: ${path}: impossible de lire le fichier`}</span>;
    }

    return <LessViewer content={content} filename={path} setStopRef={setStopRef} onDone={onDone} />;
};
