import { useState, useCallback, useRef, useEffect } from 'react';
import Terminal from '../apps/Terminal';
import { setActiveTTY } from '../commands/ttySystem';
import { killProcess } from '../commands/processSystem';

export const MAIN_TERMINAL_ID = "window-terminal-main";

/**
 * Hook personnalisé gérant l'état et les actions de toutes les fenêtres de l'OS.
 * Il s'occupe de :
 * - Gérer l'empilement (z-index) et la mise au premier plan des fenêtres.
 * - Suivre l'identifiant de la fenêtre active et ajuster le TTY en conséquence.
 * - Gérer le cycle de vie : création de nouvelles fenêtres de terminal, instanciation des terminaux virtuels (tty),
 *   et nettoyage des processus orphelins lors de la fermeture d'une fenêtre.
 * 
 * @returns {Object} Les états des fenêtres et les méthodes de gestion.
 */
export function useWindowManager() {
    const [windows, setWindows] = useState([]);
    const [maxZIndex, setMaxZIndex] = useState(1);
    const [activeWindowId, setActiveWindowId] = useState(null);

    const previousWindowsRef = useRef([]);
    const loadingClosedRef = useRef(false);

    const bringWindowToFront = useCallback((windowId) => {
        setMaxZIndex((previous) => {
            const next = previous + 1;
            setActiveWindowId(windowId);

            setWindows((oldWindows) => oldWindows.map((windowData) => (
                windowData.id === windowId
                    ? { ...windowData, zIndex: next }
                    : windowData
            )));

            return next;
        });
    }, []);

    const openTerminalWindow = useCallback((options = {}) => {
        const { forceMain = false } = options;
        let createdId = null;

        setWindows((oldWindows) => {
            const existingMain = oldWindows.find((windowData) => windowData.id === MAIN_TERMINAL_ID);

            if (forceMain || !existingMain) {
                createdId = MAIN_TERMINAL_ID;
                if (existingMain) {
                    return oldWindows;
                }

                const mainWindow = {
                    id: MAIN_TERMINAL_ID,
                    title: "Terminal (principal)",
                    initialX: window.innerWidth / 2 - (16 * 50 / 2),
                    initialY: window.innerHeight / 2 - (16 * 30 / 2),
                    initialWidth: 16 * 50,
                    initialHeight: 16 * 30,
                    minWidth: 560,
                    minHeight: 320,
                    snapsToBounds: true,
                    view: <Terminal windowId={MAIN_TERMINAL_ID} tty="tty0" isMainTerminal={true} />,
                    closeable: false,
                    tty: "tty0",
                    zIndex: Math.max(...oldWindows.map((entry) => entry.zIndex || 1), 1) + 1
                };

                setActiveTTY("tty0");
                return [...oldWindows, mainWindow];
            }

            const usedTtyNumbers = new Set(
                oldWindows
                    .map((windowData) => windowData.tty)
                    .filter(Boolean)
                    .map((tty) => Number.parseInt(tty.replace("tty", ""), 10))
                    .filter((value) => !Number.isNaN(value))
            );

            let ttyNumber = 1;
            while (usedTtyNumbers.has(ttyNumber)) {
                ttyNumber += 1;
            }

            const tty = `tty${ttyNumber}`;
            createdId = `window-terminal-${tty}`;
            const offset = ttyNumber * 24;

            const terminalWindow = {
                id: createdId,
                title: `Terminal (${tty})`,
                initialX: Math.max(20, window.innerWidth / 2 - (16 * 50 / 2) + offset),
                initialY: Math.max(20, window.innerHeight / 2 - (16 * 30 / 2) + offset),
                initialWidth: 16 * 50,
                initialHeight: 16 * 30,
                minWidth: 560,
                minHeight: 320,
                snapsToBounds: true,
                view: <Terminal windowId={createdId} tty={tty} isMainTerminal={false} />,
                closeable: true,
                tty,
                zIndex: Math.max(...oldWindows.map((entry) => entry.zIndex || 1), 1) + 1
            };

            setActiveTTY(tty);
            return [...oldWindows, terminalWindow];
        });

        if (createdId) {
            setTimeout(() => bringWindowToFront(createdId), 0);

            if (!loadingClosedRef.current) {
                loadingClosedRef.current = true;
                setTimeout(() => {
                    setWindows((oldWindows) => oldWindows.filter((windowData) => windowData.id !== "window-loading"));
                }, 2000);
            }
        }

        return createdId;
    }, [bringWindowToFront]);

    useEffect(() => {
        const currentIds = new Set(windows.map((windowData) => windowData.id));

        for (const previousWindow of previousWindowsRef.current) {
            if (!currentIds.has(previousWindow.id) && previousWindow.processPid) {
                killProcess(previousWindow.processPid);
            }
        }

        previousWindowsRef.current = windows;
    }, [windows]);

    useEffect(() => {
        const activeWindow = windows.find((windowData) => windowData.id === activeWindowId);
        if (activeWindow?.tty) {
            setActiveTTY(activeWindow.tty);
        }
    }, [activeWindowId, windows]);

    return {
        windows,
        setWindows,
        maxZIndex,
        setMaxZIndex,
        activeWindowId,
        setActiveWindowId,
        bringWindowToFront,
        openTerminalWindow
    };
}
