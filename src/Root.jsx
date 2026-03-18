import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import { ensureProcessState } from './commands/processSystem';
import { loadColors } from './commands/color';
import { useUptime } from './hooks/useUptime';
import { useWindowManager } from './hooks/useWindowManager';

import { WindowContext } from "./contexts/WindowContext";

export default function Root() {
	const { uptimeMs, formatUptime } = useUptime();
	const { 
		windows, setWindows, 
		maxZIndex, setMaxZIndex, 
		activeWindowId, 
		bringWindowToFront, 
		openTerminalWindow 
	} = useWindowManager();

	React.useEffect(() => {
		loadColors();
		ensureProcessState();
	}, []);

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
			}]);
		}, 1250);

		return () => {
			window.removeEventListener("keydown", handleKeydown);
		}
	}, [openTerminalWindow, setWindows]);

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
							snapsToBounds={window.snapsToBounds}
							zIndex={window.zIndex || 1}
							processPid={window.processPid}
						/>
					})
				}
			</WindowContext.Provider>
		</div>
    </>
}
