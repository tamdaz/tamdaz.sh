import { readFile, resolvePath } from "./fileSystem";

const CONTINUOUS_DEVICES = new Set(["/dev/zero", "/dev/random"]);

const randomHexBlock = (bytes = 32) => {
    if (window.crypto?.getRandomValues) {
        const array = new Uint8Array(bytes);
        window.crypto.getRandomValues(array);
        return Array.from(array)
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("");
    }

    return Array.from({ length: bytes })
        .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0"))
        .join("");
};

export const isContinuousCatTarget = (path) => CONTINUOUS_DEVICES.has(resolvePath(path));

/**
 * Retourne un bloc de flux pour les pseudo-fichiers infinis de /dev.
 * Le terminal rappelle cette fonction en boucle jusqu'a interruption Ctrl+C.
 */
export const readContinuousCatChunk = (path) => {
    const target = resolvePath(path);
    if (target === "/dev/zero") {
        return "0".repeat(96);
    }

    if (target === "/dev/random") {
        return randomHexBlock(32);
    }

    return "";
};

export const executeCat = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>cat: argument manquant</span>;
    }
    
    const filename = args[0];
    const content = readFile(filename);
    
    if (content === null) {
        return <span style={{ color: '#f00' }}>cat: {filename}: Aucun fichier ou dossier de ce type</span>;
    }
    
    const lines = content.split('\n');
    return <>
        {lines.map((line, index) => (
            <span key={index}>{line}</span>
        ))}
    </>;
};
