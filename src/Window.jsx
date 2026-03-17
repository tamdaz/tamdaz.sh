/* eslint-disable react/prop-types */
import React from "react"

import ding from "./assets/sounds/ding.wav";
import box_sizing from "./assets/sounds/box_sizing.wav";
import beep_flash from "./assets/sounds/beep_flash.wav";
import close_window from "./assets/sounds/close_window.wav";

import { WindowContext } from "./Root";

export default function Window({
	title = "Abstract Window",
	initialWidth = 640, initialHeight = 360,
	minWidth = 320, minHeight = 180,
	initialX = 100, initialY = 100,
	closeable = true,
	draggable = true,
	resizable = true,
	view, id, zIndex: initialZIndex = 1
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

	React.useEffect(() => {
		const handleMouseMove = (e) => {
			if (canDrag === true) {
				const newLeft = e.clientX - relativeMouse.left;
				const newTop = e.clientY - relativeMouse.top;
				
				// Empêcher de dépasser les bords gauche et haut
				// Autoriser le dépassement droit et bas (avec limite minimale visible)
				const minVisibleWidth = 100; // Garder au moins 100px visibles
				const maxLeft = window.innerWidth - minVisibleWidth;
				const maxTop = window.innerHeight - 40; // Garder au moins la barre de titre visible
				
				windowRef.current.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
				windowRef.current.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
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

		setTimeout(() => {
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

			setTimeout(() => clearInterval(beeps), 1000);
		}, 250);

		setTimeout(() => {
			if (headerRef.current) headerRef.current.style.opacity = 1;
			if (viewRef.current) viewRef.current.style.opacity = 1;
			
			new Audio(ding).play();
		}, 1250);
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

		windowRef.current.animate([
			{ left: fromX + "px", top: fromY + "px" },
			{ width: 0, height: 0, left: fromX + currentWidth / 2 + "px", top: fromY + currentHeight / 2 + "px "}
		], {
			duration: duration,
			easing: "linear",
			fill: "forwards"
		});
		
		setTimeout(() => {
			setWindows((oldWindows) => oldWindows.filter((windowData) => windowData.id !== id));
		}, duration);
	}

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
			{ closeable && <span onClick={() => closeApp(id)}>&#215;</span>}
		</div>
		<div ref={viewRef} className="tz-sh-view">
			{ view }
		</div>
	</div>
}
