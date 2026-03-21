import { copyFile, exists, isDirectory } from "./fileSystem";

export const executeCp = (args) => {
    if (args.length < 2) {
        return <span style={{ color: '#f00' }}>cp: arguments manquants
Usage: cp SOURCE DEST</span>;
    }
    
    const source = args[0];
    const dest = args[1];
    
    if (!exists(source)) {
        return <span style={{ color: '#f00' }}>cp: impossible de copier '{source}': Aucun fichier ou dossier de ce type</span>;
    }
    
    if (isDirectory(source)) {
        return <span style={{ color: '#f00' }}>cp: '{source}' est un répertoire (utilisez -r pour les répertoires)</span>;
    }
    
    const success = copyFile(source, dest);
    if (success) {
        return <span>Fichier copié: {source} → {dest}</span>;
    } else {
        return <span style={{ color: '#f00' }}>cp: erreur lors de la copie</span>;
    }
};
