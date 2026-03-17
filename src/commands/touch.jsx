import { writeFile, fileExists } from "./fileSystem";

export const executeTouch = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>touch: argument manquant</span>;
    }
    
    const filename = args[0];
    
    if (fileExists(filename)) {
        return <span>touch: fichier '{filename}' existe déjà</span>;
    }
    
    writeFile(filename, '');
    return <span>Fichier '{filename}' créé.</span>;
};
