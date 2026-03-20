import { chown, exists } from "./fileSystem";

export const executeChown = (args) => {
    if (args.length < 2) {
        return <span style={{ color: '#f00' }}>chown: arguments manquants
Usage: chown [PROPRIÉTAIRE][:GROUPE] FICHIER [FICHIER...]
Exemples: chown user fichier.txt
          chown user:admin fichier.txt
          chown :admin fichier.txt</span>;
    }
    
    const ownerGroup = args[0];
    const targets = args.slice(1);
    
    let owner = null;
    let group = null;
    
    if (ownerGroup.includes(':')) {
        const parts = ownerGroup.split(':');
        owner = parts[0] || null;
        group = parts[1] || null;
    } else {
        owner = ownerGroup;
    }
    
    return <>
        {targets.map((path, index) => {
            if (!exists(path)) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>chown: impossible d'accéder à '{path}': Aucun fichier ou dossier de ce type</span>;
            }
            
            const success = chown(path, owner, group);
            if (!success) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>chown: erreur lors de la modification du propriétaire pour '{path}'</span>;
            }
            
            return null; // Silent on success
        })}
    </>;
};
