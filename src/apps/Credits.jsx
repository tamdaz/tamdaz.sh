import React from "react";

export default function Credits() {
    /** @type {React.CSSProperties} */
    const center = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%"
    };

    return <div style={center}>
        <span>Ce projet a été créé par Tamda Zohir.</span>
        <span>Toutes les contributions sont les bienvenues.</span>
    </div>
}