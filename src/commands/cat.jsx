import { readFile, resolvePath, isExecutable, getFileInfo } from "./fileSystem";

const CONTINUOUS_DEVICES = new Set(["/dev/zero", "/dev/random"]);

const randomCharBlock = (length = 64) => {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?-=[];,./éèêëàâäôöùûüîïçñÉÈÊËÀÂÄÔÖÙÛÜÎÏÇÑ';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const isContinuousCatTarget = (path) => CONTINUOUS_DEVICES.has(resolvePath(path));

/**
 * Retourne un bloc de flux pour les pseudo-fichiers infinis de /dev.
 * Le terminal rappelle cette fonction en boucle jusqu'a interruption Ctrl+C.
 */
export const readContinuousCatChunk = (path) => {
    const target = resolvePath(path);
    if (target === "/dev/zero") {
        return "0".repeat(128); // Ou des caractères null ' '
    }

    if (target === "/dev/random") {
        return randomCharBlock(128);
    }

    return "";
};

export const executeCat = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>cat: argument manquant</span>;
    }
    
    const filename = args[0];
    const fullPath = resolvePath(filename);
    const content = readFile(filename);
    
    if (content === null) {
        return <span style={{ color: '#f00' }}>cat: {filename}: Aucun fichier ou dossier de ce type</span>;
    }

    // Empêcher la lecture des fichiers binaires exécutables (programmes compilés)
    const isBinary = fullPath.startsWith('/bin/') || 
                     fullPath.startsWith('/sbin/') ||
                     fullPath.startsWith('/usr/bin/') ||
                     fullPath.startsWith('/usr/sbin/');
    
    if (isBinary && isExecutable(fullPath)) {
        return <span style={{ color: '#f00' }}>cat: {filename}: Ne peut pas lire un fichier exécutable</span>;
    }
    
    const lines = content.split('\n');
    return <>
        {lines.map((line, index) => (
            <span key={index}>{line}</span>
        ))}
    </>;
};
