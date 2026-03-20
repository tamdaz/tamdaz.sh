import React from "react"

import ding from "./assets/sounds/ding.wav";
import box_sizing from "./assets/sounds/box_sizing.wav";
import beep_flash from "./assets/sounds/beep_flash.wav";
import close_window from "./assets/sounds/close_window.wav";

import { WindowContext } from "./contexts/WindowContext";

export default function Window({
	title = "Abstract Window",
	initialWidth = 640, initialHeight = 360,
	minWidth = 320, minHeight = 180,
	initialX = 100, initialY = 100,
	closeable = true,
	draggable = true,
	resizable = true,
	snapsToBounds = false,
	view, id, zIndex: initialZIndex = 1,
	processPid = null
}) {
	/**
	 * @type {{ current: HTMLDivElement }} viewRef
	 */
	const windowRef = React.useRef(null);

	/**
	 * @type {{ current: HTMLDivElement }} viewRef
	 */
	const headerRef = React.useRef(null);

	/**
	 * @type {{ current: HTMLDivElement }} viewRef
	 */
	const viewRef = React.useRef(null);

	const { setWindows, bringWindowToFront } = React.useContext(WindowContext);

	const [canDrag, setDrag] = React.useState(false);
	const [relativeMouse, setRelativeMouse] = React.useState({});

	const bringToFront = React.useCallback(() => {
		bringWindowToFront(id);
	}, [bringWindowToFront, id]);

	/**
	 * Crée un effet de fantômes de bordures
	 * @param {number} duration - Durée totale en ms
	 * @param {number} ghostDuration - Durée d'animation de chaque fantôme en ms
	 */
	const createGhostEffect = (duration, ghostDuration = 600) => {
		const ghostInterval = setInterval(() => {
			if (!windowRef.current) return;
			const rect = windowRef.current.getBoundingClientRect();
			
			const ghost = document.createElement("div");
			ghost.style.position = "absolute";
			ghost.style.border = "2px solid var(--terminal-color)";
			ghost.style.pointerEvents = "none";
			ghost.style.left = `${rect.left}px`;
			ghost.style.top = `${rect.top}px`;
			ghost.style.width = `${rect.width}px`;
			ghost.style.height = `${rect.height}px`;
			ghost.style.zIndex = Math.max(0, initialZIndex - 1);
			document.body.appendChild(ghost);

			const animation = ghost.animate([
				{ opacity: 0.6 },
				{ opacity: 0 }
			], {
				duration: ghostDuration,
				easing: "cubic-bezier(.12,.07,0,.99)"
			});

			animation.onfinish = () => ghost.remove();
		}, 16);

		setTimeout(() => {
			clearInterval(ghostInterval);
		}, duration * 0.75);
	};

	React.useEffect(() => {
		const handleMouseMove = (e) => {
			if (canDrag === true) {
				const rawLeft = e.clientX - relativeMouse.left;
				const rawTop = e.clientY - relativeMouse.top;

				const minVisibleWidth = 100;
				const maxLeft = window.innerWidth - minVisibleWidth;
				const maxTop = window.innerHeight - 40;

				windowRef.current.style.left = `${Math.max(0, Math.min(rawLeft, maxLeft))}px`;
				windowRef.current.style.top = `${Math.max(0, Math.min(rawTop, maxTop))}px`;
			}
		};

		const handleMouseUp = () => {
			setDrag(false);
		};

		if (canDrag) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [canDrag, relativeMouse]);

	React.useEffect(() => {
		bringToFront();
	}, [bringToFront]);

	React.useEffect(() => {
		new Audio(box_sizing).play();

		windowRef.current.animate([
			{ width: `${window.innerWidth}px`, height: `${window.innerHeight}px`, left: 0, top: 0 },
			{ width: initialWidth + "px", height: initialHeight + "px", left: initialX + "px", top: initialY + "px" },
		], {
			duration: 300,
			easing: "cubic-bezier(0,.71,.19,1)"
		});

		// Effet fantôme lors de l'ouverture
		createGhostEffect(300, 600);

		// Déclencher les beeps et clignotements une fois le mouvement initial de 300ms complètement fini
		setTimeout(() => {
			// Jouer 4 beeps et faire clignoter la fenêtre avant de finaliser le chargement
			const beeps = setInterval(() => {
				new Audio(beep_flash).play();
			}, 1000 / 4);

			windowRef.current.animate([
				{ opacity: 0 }, { opacity: 1 },
				{ opacity: 0 }, { opacity: 1 },
				{ opacity: 0 }, { opacity: 1 },
				{ opacity: 0 },
			], {
				duration: 1000,
				easing: "steps(6)"
			});

			setTimeout(() => {
				clearInterval(beeps);
				
				if (headerRef.current) headerRef.current.style.opacity = 1;
				if (viewRef.current) viewRef.current.style.opacity = 1;

				new Audio(ding).play();
			}, 1000);
		}, 300);
	}, [initialWidth, initialHeight, initialX, initialY]);

	/**
	 * @param {MouseEvent} e 
	 */
	const startDrag = (e) => {
		if (!draggable) return;
		bringToFront();
		setDrag(true);
		setRelativeMouse({
			left: e.clientX - windowRef.current.getBoundingClientRect().left,
			top: e.clientY - windowRef.current.getBoundingClientRect().top
		})
	};


	const closeApp = () => {
		const duration = 250;

		const bounds = windowRef.current.getBoundingClientRect();
		const [fromX, fromY, currentWidth, currentHeight] = [
			windowRef.current.getBoundingClientRect().left,
			windowRef.current.getBoundingClientRect().top,
			bounds.width,
			bounds.height
		];

		new Audio(close_window).play();

		headerRef.current.style.opacity = 0;
		viewRef.current.style.opacity = 0;

		// Permet la reduction visuelle complete meme si la fenetre a une taille minimale.
		windowRef.current.style.minWidth = "0px";
		windowRef.current.style.minHeight = "0px";

		// Effet fantôme lors de la fermeture
		createGhostEffect(duration, 400);

		windowRef.current.animate([
			{ left: fromX + "px", top: fromY + "px" },
			{ width: 0, height: 0, left: fromX + currentWidth / 2 + "px", top: fromY + currentHeight / 2 + "px " }
		], {
			duration: duration,
			easing: "linear",
			fill: "forwards"
		});

		setTimeout(() => {
			setWindows((oldWindows) => oldWindows.filter((windowData) => windowData.id !== id));
		}, duration);
	}

	React.useEffect(() => {
		if (processPid === null) return;

		const handleProcessKill = (e) => {
			if (e.detail?.pidsKilled?.includes(processPid)) {
				// Ne ferme pas si on ne doit pas
				if (closeable) {
					closeApp();
				}
			}
		};

		window.addEventListener("tz-process-killed", handleProcessKill);
		return () => window.removeEventListener("tz-process-killed", handleProcessKill);
	}, [processPid, closeable]); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect(() => {
		const handleCloseAllWindows = (e) => {
			// Fermer cette fenêtre de force, même le terminal principal
			const duration = 250;

			if (!windowRef.current) return;

			const bounds = windowRef.current.getBoundingClientRect();
			const [fromX, fromY, currentWidth, currentHeight] = [
				windowRef.current.getBoundingClientRect().left,
				windowRef.current.getBoundingClientRect().top,
				bounds.width,
				bounds.height
			];

			try {
				new Audio(close_window).play();
			} catch (e) { }

			headerRef.current.style.opacity = 0;
			viewRef.current.style.opacity = 0;

			windowRef.current.style.minWidth = "0px";
			windowRef.current.style.minHeight = "0px";

			// Effet fantôme lors de la fermeture
			createGhostEffect(duration, 400);

			windowRef.current.animate([
				{ left: fromX + "px", top: fromY + "px" },
				{ width: 0, height: 0, left: fromX + currentWidth / 2 + "px", top: fromY + currentHeight / 2 + "px " }
			], {
				duration: duration,
				easing: "linear",
				fill: "forwards"
			});

			setTimeout(() => {
				setWindows((oldWindows) => oldWindows.filter((windowData) => windowData.id !== id));
			}, duration);
		};

		window.addEventListener("tz-close-all-windows", handleCloseAllWindows);
		return () => window.removeEventListener("tz-close-all-windows", handleCloseAllWindows);
	}, [id, setWindows, createGhostEffect]);

	// Grille matricielle pour le redimensionnement (8x16)
	React.useEffect(() => {
		if (!resizable || !windowRef.current || !snapsToBounds) return;

		const handlePointerDown = (e) => {
			// Vérifier si c'est sur le coin inférieur droit (zone de resize)
			if (e.target !== windowRef.current) return;
			
			const rect = windowRef.current.getBoundingClientRect();
			const isResizeZone = (
				e.clientX > rect.right - 16 &&
				e.clientY > rect.bottom - 16
			);
			
			if (!isResizeZone) return;
			
			e.preventDefault();
			let startX = e.clientX;
			let startY = e.clientY;
			let startWidth = rect.width;
			let startHeight = rect.height;

			const snapX = 8;
			const snapY = 16;

			const handleMove = (moveEvent) => {
				const deltaX = moveEvent.clientX - startX;
				const deltaY = moveEvent.clientY - startY;
				
				let newWidth = startWidth + deltaX;
				let newHeight = startHeight + deltaY;
				
				// Appliquer le snapping
				newWidth = Math.round(newWidth / snapX) * snapX;
				newHeight = Math.round(newHeight / snapY) * snapY;
				
				// Respecter les limites min
				newWidth = Math.max(minWidth, newWidth);
				newHeight = Math.max(minHeight, newHeight);
				
				windowRef.current.style.width = `${newWidth}px`;
				windowRef.current.style.height = `${newHeight}px`;
			};

			const handleUp = () => {
				document.removeEventListener('pointermove', handleMove);
				document.removeEventListener('pointerup', handleUp);
			};

			document.addEventListener('pointermove', handleMove);
			document.addEventListener('pointerup', handleUp);
		};

		windowRef.current.addEventListener('pointerdown', handlePointerDown);
		return () => {
			if (windowRef.current) {
				windowRef.current.removeEventListener('pointerdown', handlePointerDown);
			}
		};
	}, [resizable, minWidth, minHeight]);

	return <div className={`tz-sh-window ${resizable ? '' : 'tz-sh-window-no-resize'}`}
		style={{
			width: initialWidth,
			height: initialHeight,
			minWidth,
			minHeight,
			left: initialX,
			top: initialY,
			zIndex: initialZIndex
		}}
		ref={windowRef}
		onMouseDown={bringToFront}>
		<div ref={headerRef}
			onMouseDown={startDrag}
			className="tz-sh-terminal-header">
			<span>{title}</span>
			<span style={{ flex: 1 }}></span>
			{closeable && <span onClick={() => closeApp(id)}>&#215;</span>}
		</div>
		<div ref={viewRef} className="tz-sh-view">
			{view}
		</div>
	</div>
}
