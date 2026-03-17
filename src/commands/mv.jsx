import { moveFile, exists } from "./fileSystem";

export const executeMv = (args) => {
    if (args.length < 2) {
        return <span style={{ color: '#f00' }}>mv: arguments manquants
Usage: mv SOURCE DEST</span>;
    }
    
    const source = args[0];
    const dest = args[1];
    
    if (!exists(source)) {
        return <span style={{ color: '#f00' }}>mv: impossible de déplacer '{source}': Aucun fichier ou dossier de ce type</span>;
    }
    
    const success = moveFile(source, dest);
    if (success) {
        return <span>Déplacé: {source} → {dest}</span>;
    } else {
        return <span style={{ color: '#f00' }}>mv: erreur lors du déplacement</span>;
    }
};
