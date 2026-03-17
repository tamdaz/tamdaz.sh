import { createDirectory, exists } from "./fileSystem";

export const executeMkdir = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>mkdir: argument manquant
Usage: mkdir DIRECTORY</span>;
    }
    
    const path = args[0];
    
    if (exists(path)) {
        return <span style={{ color: '#f00' }}>mkdir: impossible de créer le répertoire '{path}': Le fichier existe</span>;
    }
    
    const success = createDirectory(path);
    if (success) {
        return <span>Répertoire créé: {path}</span>;
    } else {
        return <span style={{ color: '#f00' }}>mkdir: erreur lors de la création du répertoire</span>;
    }
};
