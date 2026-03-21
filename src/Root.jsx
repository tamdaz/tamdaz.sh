import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import { ensureProcessState } from './commands/processSystem';
import { loadColors } from './commands/color';
import { useUptime } from './hooks/useUptime';
import { useWindowManager } from './hooks/useWindowManager';
import { preloadAllAssets } from './utils/preload';

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
		preloadAllAssets().catch(err => console.warn('Préchargement partiel', err));
	}, []);

	React.useEffect(() => {
		const handleRestartSystem = () => {
			// Dispatcher l'événement de fermeture à toutes les fenêtres
			const closeAllEvent = new CustomEvent("tz-close-all-windows", { detail: {} });
			window.dispatchEvent(closeAllEvent);

			// Gérer le fondu audio - rechercher tous les éléments audio même dynamiques
			const fadeOutAudio = () => {
				const startTime = Date.now();
				const targetDuration = 1500; // Fondu sur 1.5 secondes
				
				const fade = () => {
					const elapsed = Date.now() - startTime;
					const progress = Math.min(elapsed / targetDuration, 1);
					const volume = 1 - progress;

					// Appliquer le volume à tous les éléments audio actuels
					const audioElements = document.querySelectorAll("audio");
					audioElements.forEach((audio) => {
						audio.volume = Math.max(0, volume);
					});

					if (progress < 1) {
						requestAnimationFrame(fade);
					}
				};

				fade();
			};

			fadeOutAudio();

			// Attendre que les animations de fermeture se terminent (250ms par fenêtre + marge)
			setTimeout(() => {
				// Stopper et mute tous les audios
				const audioElements = document.querySelectorAll("audio");
				audioElements.forEach((audio) => {
					audio.pause();
					audio.volume = 0;
				});

				// Appliquer l'animation d'arrêt au body
				document.body.style.animation = `animation-shutdown 500ms ease-in forwards`;

				// Rafraîchir la page après l'animation d'arrêt
				setTimeout(() => {
					window.location.reload();
				}, 600);
			}, 500); // Attendre que les fenêtres finissent leur fermeture (250ms) + marge
		};

		window.addEventListener("tz-restart-system", handleRestartSystem);
		return () => window.removeEventListener("tz-restart-system", handleRestartSystem);
	}, [setWindows]);

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
						if (window.id === "window-loading" && windows.length > 1) {
							setTimeout(() => {
								setWindows((oldWindows) => oldWindows.filter((windowData) => windowData.id !== "window-loading"));
							}, 1250);
						}

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
