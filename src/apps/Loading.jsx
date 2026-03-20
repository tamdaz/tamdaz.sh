import React from "react"

import boot from "./../assets/sounds/boot.wav";
import bgMusic1 from "./../assets/sounds/background-music.wav";
import bgMusic2 from "./../assets/sounds/background-music-2.wav";
import bgMusic3 from "./../assets/sounds/music-background-3.wav";

export default function Loading() {
    /** @type {{ current: HTMLSpanElement }} loadingRef */
    const loadingRef = React.useRef(null);

    React.useEffect(() => {
        const timeouts = [];
        const speed = 30;
        const progressBarWidth = 50;

        // Only as a last resort, fall back to user agent sniffing
        const UA = navigator.userAgent;
        
        if (/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA)) {
            timeouts.push(setTimeout(() => {
                if (loadingRef.current) {
                    loadingRef.current.innerHTML = "[&nbsp;";
                    loadingRef.current.innerHTML += "Ordinateur nécessaire pour accéder à tamdaz.sh"
                    loadingRef.current.innerHTML += "&nbsp;".repeat(progressBarWidth - 47);
                    loadingRef.current.innerHTML += "]";
                }
            }, 1500));
        } else {
            timeouts.push(setTimeout(() => {
                new Audio(boot).play();

                for (let i = 0; i <= progressBarWidth; i++) {
                    timeouts.push(setTimeout(() => {
                        if (loadingRef.current) {
                            loadingRef.current.innerHTML = "[";
                            loadingRef.current.innerHTML += "#".repeat(i);
                            loadingRef.current.innerHTML += "-".repeat(progressBarWidth - i);
                            loadingRef.current.innerHTML += "]";
                        }
                    }, speed * (i + 1)));
                }
            }, 1500));

            timeouts.push(setTimeout(() => {
                if (loadingRef.current) {
                    loadingRef.current.innerHTML = "[&nbsp;";
                    loadingRef.current.innerHTML += "Bienvenue sur \"tamdaz.sh\"."
                    loadingRef.current.innerHTML += "&nbsp;".repeat(progressBarWidth - 27);
                    loadingRef.current.innerHTML += "]";
                }
            }, 1500 + speed * progressBarWidth + 100));

            timeouts.push(setTimeout(() => {
                if (loadingRef.current) {
                    loadingRef.current.innerHTML = "[&nbsp;";
                    loadingRef.current.innerHTML += "Faites Ctrl+Entrée pour ouvrir un terminal."
                    loadingRef.current.innerHTML += "&nbsp;".repeat(progressBarWidth - 44);
                    loadingRef.current.innerHTML += "]";
                }
            }, 1500 + speed * progressBarWidth + 2000));

            timeouts.push(setTimeout(() => {
                const playlist = [bgMusic2, bgMusic3, bgMusic1];
                let currentTrack = 0;
                let music = new Audio(playlist[currentTrack]);
                
                music.addEventListener('ended', function() {
                    currentTrack = (currentTrack + 1) % playlist.length;
                    music.src = playlist[currentTrack];
                    music.play();
                });
                
                music.play().catch(e => console.warn("L'autoplay a été bloqué.", e));
            }, 1500 + speed * progressBarWidth + 5000));
        }

        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <span ref={loadingRef}></span>
    </div>
}