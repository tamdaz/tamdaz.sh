import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import Terminal from './apps/Terminal';

import log from './assets/dmesg.txt?raw';

import { loadColors } from "./commands/color";

import startup from "./assets/sounds/startup.wav?rawx";

export const WindowContext = React.createContext(null);

export default function Root() {
	const [windows, setWindows] = React.useState([]);
	/** @type {{ current : HTMLDivElement }} logRef */
	const logRef = React.useRef(null);

	React.useEffect(() => {
		let i = 0;

		new Audio(startup).play();

		for (const message of log.split("\n")) {
			setTimeout(() => {
				logRef.current.innerHTML += message + "<br/>"
				logRef.current.scrollTo(0, "100%");

				logRef.current.scrollTo({
					top: logRef.current.scrollHeight
				})
			}, 16 * i);
			
			i++;
		}

		setTimeout(() => { logRef.current.style.opacity = 0 }, 10000)
	}, []);

	React.useEffect(() => {
		/** @param { KeyboardEvent } e */
		const event = window.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "Enter" && !/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(navigator.userAgent)) {
				setWindows((oldWindows) => {
					if (oldWindows.some(window => window.id === "window-terminal"))
						return oldWindows;

					return [...oldWindows, {
						id: "window-terminal",
						title: "Terminal",
						initialX: window.innerWidth / 2 - (16 * 50 / 2),
						initialY: window.innerHeight / 2 - (16 * 30 / 2),
						initialWidth: 16 * 50,
						initialHeight: 16 * 30,
						view: <Terminal />
					}];
				});

				setTimeout(() => {
					setWindows((oldWindows) => oldWindows.filter(window => window.id !== "window-loading"));
				}, 2000);
			}
		});

		return () => {
			window.removeEventListener("keydown", event);
		}
	}, [windows]);

	React.useEffect(() => {
		loadColors();
		
		// Start loading window.
		setTimeout(() => {
			setWindows((oldWindows) => [...oldWindows, {
				id: "window-loading",
				title: "",
				initialX: window.innerWidth / 2 - (16 * 30 / 2),
				initialY: window.innerHeight / 2 - (16 * 5 / 2),
				initialWidth: 16 * 30,
				initialHeight: 16 * 5,
				view: <Loading />,
				closeable: false
			}])
		}, 5000);
	}, []);

	return <>
		<div className="tz-sh-screen tz-sh-screen-scanline"></div>
		<div className="tz-sh-screen tz-sh-screen-circle-light"></div>
		<div className="tz-sh-screen-circle-light"></div>
		<div style={{ position: "absolute", zIndex: -3 }}>
			<div style={{ height : "100vh", overflowY: "hidden", transition: "250ms" }} ref={logRef}></div>
			<WindowContext.Provider value={{ windows, setWindows }}>
				{
					windows.map((window) => {
						return <Window key={window.id}
							id={window.id}
							title={window.title}
							initialWidth={window.initialWidth}
							initialHeight={window.initialHeight}
							initialX={window.initialX}
							initialY={window.initialY}
							view={window.view}
							closeable={window.closeable}
						/>
					})
				}
			</WindowContext.Provider>
		</div>
    </>
}
