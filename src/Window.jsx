import React from "react"

import ding from "./assets/sounds/ding.wav";
import box_sizing from "./assets/sounds/box_sizing.wav";
import beep_flash from "./assets/sounds/beep_flash.wav";
import close_window from "./assets/sounds/close_window.wav";

import { WindowContext } from "./Root";

export default function Window({
	title = "Abstract Window",
	initialWidth = 640, initialHeight = 360,
	initialX = 100, initialY = 100,
	view, id
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

	const { windows, setWindows } = React.useContext(WindowContext);

	const [canDrag, setDrag] = React.useState(false);
	const [relativeMouse, setRelativeMouse] = React.useState({});

	React.useEffect(() => {
		new Audio(box_sizing).play();

		windowRef.current.animate([
			{ width: `${window.innerWidth}px`, height: `${window.innerHeight}px`, left: 0, top: 0 },
			{ width: initialWidth + "px", height: initialHeight + "px", left: initialX + "px", top: initialY + "px" },
		], {
			duration: 250,
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
			headerRef.current.style.opacity = 1;
			viewRef.current.style.opacity = 1;
			
			new Audio(ding).play();
		}, 1250)
	}, []);

	/**
	 * Déplacer la fenêtre.
	 * 
	 * @param {MouseEvent} e 
	 */
	const touchHandle = (e) => {
		if (canDrag === true) {
			if (e.clientX - relativeMouse.left >= window.innerWidth - windowRef.current.getBoundingClientRect().width) {
				windowRef.current.style.left = window.innerWidth - windowRef.current.getBoundingClientRect().width
			} else if (e.clientX - relativeMouse.left <= 0) {
				windowRef.current.style.left = 0
			} else {
				windowRef.current.style.left = `${e.clientX - relativeMouse.left}px`
			}

			if (e.clientY - relativeMouse.top >= window.innerHeight - windowRef.current.getBoundingClientRect().height) {
				windowRef.current.style.top = window.innerHeight - windowRef.current.getBoundingClientRect().height
			} else if (e.clientY - relativeMouse.top <= 0) {
				windowRef.current.style.top = 0
			} else {
				windowRef.current.style.top = `${e.clientY - relativeMouse.top}px`
			}
		}
	}

	/**
	 * @param {MouseEvent} e 
	 */
	const startDrag = (e) => {
		setDrag(true);
		setRelativeMouse({
			left: e.clientX - windowRef.current.getBoundingClientRect().left,
			top: e.clientY - windowRef.current.getBoundingClientRect().top
		})
	};

	/**
	 * @param {MouseEvent} e 
	 */
	const stopDrag = (e) => {
		setDrag(false);
	};


	const closeApp = () => {
		const duration = 250;

		const [fromX, fromY] = [
			windowRef.current.getBoundingClientRect().left,
			windowRef.current.getBoundingClientRect().top
		];

		new Audio(close_window).play();

		headerRef.current.style.opacity = 0;
		viewRef.current.style.opacity = 0;

		windowRef.current.animate([
			{ left: fromX + "px", top: fromY + "px" },
			{ width: 0, height: 0, left: fromX + initialWidth / 2 + "px", top: fromY + initialHeight / 2 + "px "}
		], {
			duration: duration,
			easing: "linear",
			fill: "forwards"
		});
		
		setTimeout(() => {
			setWindows(windows.filter(window => window.id !== id))
		}, duration);
	}

	return <div className="tz-sh-window"
		style={{ width: initialWidth, height: initialHeight, left: initialX, top: initialY }}
		ref={windowRef}>
		<div ref={headerRef}
			onMouseDown={startDrag}
			onMouseMove={touchHandle}
			onMouseLeave={touchHandle}
			onMouseEnter={touchHandle}
			onMouseUp={stopDrag}
			className="tz-sh-terminal-header">
			<span>{title}</span>
			<span style={{ flex: 1 }}></span>
			<span onClick={() => closeApp(id)}>&#215;</span>
		</div>
		<div ref={viewRef} className="tz-sh-view">
			{ view }
		</div>
	</div>
}
