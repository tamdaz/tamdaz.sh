import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import Terminal from './apps/Terminal';
import { ensureProcessState, getBootTimeMs, killProcess } from './commands/processSystem';
import { setActiveTTY } from './commands/ttySystem';

export const WindowContext = React.createContext(null);
const MAIN_TERMINAL_ID = "window-terminal-main";

const formatUptime = (milliseconds) => {
	const totalMs = Math.max(0, milliseconds);
	const hours = Math.floor(totalMs / 3600000).toString().padStart(2, '0');
	const minutes = Math.floor((totalMs % 3600000) / 60000).toString().padStart(2, '0');
	const seconds = Math.floor((totalMs % 60000) / 1000).toString().padStart(2, '0');

	return `${hours}:${minutes}:${seconds}`;
};

export default function Root() {
	const [windows, setWindows] = React.useState([]);
	const [maxZIndex, setMaxZIndex] = React.useState(1);
	const [activeWindowId, setActiveWindowId] = React.useState(null);
	const [uptimeMs, setUptimeMs] = React.useState(0);
	const osStartedAtRef = React.useRef(Date.now());
	const previousWindowsRef = React.useRef([]);
	const loadingClosedRef = React.useRef(false);

	const bringWindowToFront = React.useCallback((windowId) => {
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

	const openTerminalWindow = React.useCallback((options = {}) => {
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

	React.useEffect(() => {
		ensureProcessState();
		osStartedAtRef.current = getBootTimeMs();

		const uptimeInterval = setInterval(() => {
			setUptimeMs(Date.now() - osStartedAtRef.current);
		}, 50);

		return () => clearInterval(uptimeInterval);
	}, []);

	React.useEffect(() => {
		const currentIds = new Set(windows.map((windowData) => windowData.id));

		for (const previousWindow of previousWindowsRef.current) {
			if (!currentIds.has(previousWindow.id) && previousWindow.processPid) {
				killProcess(previousWindow.processPid);
			}
		}

		previousWindowsRef.current = windows;
	}, [windows]);

	React.useEffect(() => {
		const activeWindow = windows.find((windowData) => windowData.id === activeWindowId);
		if (activeWindow?.tty) {
			setActiveTTY(activeWindow.tty);
		}
	}, [activeWindowId, windows]);

	React.useEffect(() => {
		const isMobile = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(navigator.userAgent);
		
		const handleKeydown = (e) => {
			if (e.ctrlKey && e.key === "Enter" && !isMobile) {
				e.preventDefault();
				openTerminalWindow();
			}
		};

		window.addEventListener("keydown", handleKeydown);

		setTimeout(() => {
			setWindows((oldWindows) => [...oldWindows, {
				id: "window-loading",
				title: "",
				initialX: window.innerWidth / 2 - (16 * 30 / 2),
				initialY: window.innerHeight / 2 - (16 * 5 / 2),
				initialWidth: 16 * 30,
				initialHeight: 16 * 5,
				minWidth: 16 * 30,
				minHeight: 16 * 5,
				view: <Loading />,
				closeable: false,
				draggable: false,
				resizable: false,
				zIndex: 0
			}])
		}, 1250);

		return () => {
			window.removeEventListener("keydown", handleKeydown);
		}
	}, [openTerminalWindow]);

	const visibleWindows = windows.filter((windowData) => windowData.id !== "window-loading");
	const debugLines = [
		`Nombre de fenêtres ouvertes : ${visibleWindows.length}`,
		"- OS",
		...visibleWindows.map((windowData) => `\\- ${windowData.title || windowData.id}`),
		"",
		`Durée de vie de l'OS : ${formatUptime(uptimeMs)}`
	].join("\n");

	return <>
		<div className="tz-sh-screen tz-sh-screen-scanline"></div>
		<div className="tz-sh-screen tz-sh-screen-circle-light"></div>
		<div className="tz-sh-screen-circle-light"></div>
		<div className="tz-sh-debug-overlay">
			<pre>{debugLines}</pre>
		</div>
		<div style={{ position: "absolute", zIndex: -3 }}>
			<WindowContext.Provider value={{ windows, setWindows, maxZIndex, setMaxZIndex, activeWindowId, bringWindowToFront, openTerminalWindow }}>
				{
					windows.map((window) => {
						return <Window key={window.id}
							id={window.id}
							title={window.title}
							initialWidth={window.initialWidth}
							initialHeight={window.initialHeight}
							minWidth={window.minWidth}
							minHeight={window.minHeight}
							initialX={window.initialX}
							initialY={window.initialY}
							view={window.view}
							closeable={window.closeable}
							draggable={window.draggable}
							resizable={window.resizable}
							zIndex={window.zIndex || 1}
						/>
					})
				}
			</WindowContext.Provider>
		</div>
    </>
}
