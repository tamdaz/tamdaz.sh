import { removeDirectory, exists, isDirectory } from "./fileSystem";

export const executeRmdir = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>rmdir: argument manquant
Usage: rmdir DIRECTORY</span>;
    }
    
    const path = args[0];
    
    if (!exists(path)) {
        return <span style={{ color: '#f00' }}>rmdir: impossible de supprimer '{path}': Aucun fichier ou dossier de ce type</span>;
    }
    
    if (!isDirectory(path)) {
        return <span style={{ color: '#f00' }}>rmdir: '{path}': N'est pas un répertoire</span>;
    }
    
    const success = removeDirectory(path);
    if (success) {
        return <span>Répertoire supprimé: {path}</span>;
    } else {
        return <span style={{ color: '#f00' }}>rmdir: échec de la suppression de '{path}': Le répertoire n'est pas vide</span>;
    }
};
