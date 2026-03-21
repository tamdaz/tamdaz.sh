import { setCurrentDir, isDirectory, exists, resolvePath } from "./fileSystem";

export const executeCd = (args) => {
    if (args.length === 0) {
        setCurrentDir('/home/user');
        return null;
    }
    
    const path = args[0];
    const fullPath = resolvePath(path);
    
    // La racine existe toujours
    if (fullPath === '/') {
        setCurrentDir('/');
        return null;
    }
    
    if (!exists(fullPath)) {
        return <span style={{ color: '#f00' }}>cd: {path}: Aucun fichier ou dossier de ce type</span>;
    }
    
    if (!isDirectory(fullPath)) {
        return <span style={{ color: '#f00' }}>cd: {path}: N'est pas un répertoire</span>;
    }
    
    setCurrentDir(fullPath);
    return null;
};
