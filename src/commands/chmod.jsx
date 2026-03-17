import { chmod, exists, resolvePath } from "./fileSystem";

const parsePermissions = (mode) => {
    // Support chmod numérique (ex: 755)
    if (/^\d{3,4}$/.test(mode)) {
        const num = mode.slice(-3);
        const owner = parseInt(num[0]);
        const group = parseInt(num[1]);
        const other = parseInt(num[2]);
        
        const toRwx = (n) => {
            return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
        };
        
        return '-' + toRwx(owner) + toRwx(group) + toRwx(other);
    }
    
    // Support chmod symbolique (ex: u+x, go-w)
    // Pour simplifier, on retourne le mode tel quel s'il ressemble à des permissions
    if (/^[d-][rwx-]{9}$/.test(mode)) {
        return mode;
    }
    
    return null;
};

export const executeChmod = (args) => {
    if (args.length < 2) {
        return <span style={{ color: '#f00' }}>chmod: arguments manquants
Usage: chmod MODE FICHIER
Exemples: chmod 755 fichier.txt
          chmod -rw-r--r-- fichier.txt</span>;
    }
    
    const mode = args[0];
    const path = args[1];
    
    if (!exists(path)) {
        return <span style={{ color: '#f00' }}>chmod: impossible d'accéder à '{path}': Aucun fichier ou dossier de ce type</span>;
    }
    
    const permissions = parsePermissions(mode);
    if (!permissions) {
        return <span style={{ color: '#f00' }}>chmod: mode '{mode}' invalide</span>;
    }
    
    const success = chmod(path, permissions);
    if (success) {
        return <span>Permissions modifiées: {path} → {permissions}</span>;
    } else {
        return <span style={{ color: '#f00' }}>chmod: erreur lors de la modification des permissions</span>;
    }
};
