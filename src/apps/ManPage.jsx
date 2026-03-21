import React from "react";
import { manPages } from "../commands/man";

export default function ManPage({ command }) {
    const page = manPages[command];
    
    if (!page) {
        return (
            <div style={{ padding: "16px" }}>
                <span>Aucune entrée de manuel pour {command}</span>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: "16px", 
            overflow: "auto",
            height: "100%",
            whiteSpace: "pre-wrap"
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                {page.name.toUpperCase()}(1)
            </div>
            
            <div style={{ fontWeight: 'bold', marginTop: '12px' }}>NOM</div>
            <div style={{ marginLeft: '24px', marginBottom: '12px' }}>
                {page.name} - {page.description}
            </div>
            
            <div style={{ fontWeight: 'bold', marginTop: '12px' }}>SYNOPSIS</div>
            <div style={{ marginLeft: '24px', marginBottom: '12px' }}>
                {page.synopsis}
            </div>
            
            <div style={{ fontWeight: 'bold', marginTop: '12px' }}>DESCRIPTION</div>
            <div style={{ marginLeft: '24px', marginBottom: '12px' }}>
                {page.description}
            </div>
            
            <div style={{ fontWeight: 'bold', marginTop: '12px' }}>EXEMPLES</div>
            <div style={{ marginLeft: '24px' }}>
                {page.examples.map((ex, i) => (
                    <div key={i}>{ex}</div>
                ))}
            </div>
        </div>
    );
}
