import React from 'react';
import { getFileInfo, isDirectory, readFile } from './fileSystem';

export const executeDownload = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>download: argument manquant
Usage: download FICHIER [FICHIER...]</span>;
    }

    const output = [];

    args.forEach(arg => {
        const fileInfo = getFileInfo(arg);
        
        if (fileInfo) {
            if (isDirectory(arg)) {
                output.push(<span key={arg} style={{ color: '#f00' }}>download: '{arg}' est un dossier (téléchargement de dossier non supporté sans archive).</span>);
            } else {
                const content = readFile(arg) || "";
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const fileName = arg.split('/').pop() || 'download';
                a.download = fileName;
                
                document.body.appendChild(a);
                a.click();
                
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);

                output.push(<span key={arg}>Téléchargement de '{fileName}' initié...</span>);
            }
        } else {
            output.push(<span key={arg} style={{ color: '#f00' }}>download: impossible d'accéder à '{arg}': Aucun fichier ou dossier de ce type</span>);
        }
    });

    return <div style={{ display: 'flex', flexDirection: 'column' }}>{output}</div>;
};
