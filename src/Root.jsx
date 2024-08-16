import React from "react";

import Window from './Window';
import Loading from './apps/Loading';
import Terminal from './apps/Terminal';

import useTyper from './hooks/useTyper';
import { loadColors } from "./commands/color";

export const WindowContext = React.createContext(null);

export default function Root() {
	const [windows, setWindows] = React.useState([]);
	const value = useTyper("// Cette version est en cours de développement, il n'est pas encore finie.");

	React.useEffect(() => {
		/** @param { KeyboardEvent } e */
		const event = window.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "Enter") {
				setWindows((oldWindows) => [...oldWindows, {
					id: "window-terminal",
					title: "Terminal",
					initialX: 75,
					initialY: 75,
					initialWidth: 16 * 45,
					initialHeight: 16 * 20,
					view: <Terminal />
				}])
			}
		});

		return () => {
			window.removeEventListener("keydown", event);
		}
	}, []);

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
				view: <Loading />
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
						/>
					})
				}
			</WindowContext.Provider>
		</div>
		<div style={{ zIndex: -9, width: "100%", height: "100vh", padding: "12pt", display: "flex", flexDirection: "column", position: "absolute" }}>
			<span>{ value }</span>
			<span>Nombre de fenêtres ouvertes: { windows.length }</span>
		</div>
    </>
}
