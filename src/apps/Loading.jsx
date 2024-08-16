import React from "react"

import boot from "./../assets/sounds/boot.wav";
import background_music from "./../assets/sounds/background-music.wav";

export default function Loading() {
    /** @type {{ current: HTMLSpanElement }} loadingRef */
    const loadingRef = React.useRef(null);

    React.useState(() => {
        const speed = 30;
        const progressBarWidth = 50;

        setTimeout(() => {
            new Audio(boot).play();

            for (let i = 0; i <= progressBarWidth; i++) {
                setTimeout(() => {
                    loadingRef.current.innerHTML = "[";
                    loadingRef.current.innerHTML += "#".repeat(i);
                    loadingRef.current.innerHTML += "-".repeat(progressBarWidth - i);
                    loadingRef.current.innerHTML += "]";
                }, speed * (i + 1));
            }
        }, 1500);

        setTimeout(() => {
            new Audio(background_music).play();

            loadingRef.current.innerHTML = "[&nbsp;";
            loadingRef.current.innerHTML += "Bienvenue sur mon portfolio version terminal."
            loadingRef.current.innerHTML += "&nbsp;".repeat(progressBarWidth - 46);
            loadingRef.current.innerHTML += "]";
        }, 1500 + speed * progressBarWidth + 100);
        
        setTimeout(() => {
            loadingRef.current.innerHTML = "[&nbsp;";
            loadingRef.current.innerHTML += "Ctrl+Entrée pour ouvrir un terminal."
            loadingRef.current.innerHTML += "&nbsp;".repeat(progressBarWidth - 37);
            loadingRef.current.innerHTML += "]";
        }, 1500 + speed * progressBarWidth + 2000);
    }, []);

    return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <span ref={loadingRef}></span>
    </div>
}