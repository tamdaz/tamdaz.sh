import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import Terminal from './apps/Terminal';

import { loadColors } from "./commands/color";

export const WindowContext = React.createContext(null);

export default function Root() {
	const [windows, setWindows] = React.useState([]);

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
		}, 1500);
	}, []);

	return <>
		<div className="tz-sh-screen-fx"></div>
		<div style={{ position: "absolute", zIndex: -3 }}>
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
