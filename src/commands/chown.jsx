import { chown, exists } from "./fileSystem";

export const executeChown = (args) => {
    if (args.length < 2) {
        return <span style={{ color: '#f00' }}>chown: arguments manquants
Usage: chown [PROPRIÉTAIRE][:GROUPE] FICHIER
Exemples: chown user fichier.txt
          chown user:admin fichier.txt
          chown :admin fichier.txt</span>;
    }
    
    const ownerGroup = args[0];
    const path = args[1];
    
    if (!exists(path)) {
        return <span style={{ color: '#f00' }}>chown: impossible d'accéder à '{path}': Aucun fichier ou dossier de ce type</span>;
    }
    
    let owner = null;
    let group = null;
    
    if (ownerGroup.includes(':')) {
        const parts = ownerGroup.split(':');
        owner = parts[0] || null;
        group = parts[1] || null;
    } else {
        owner = ownerGroup;
    }
    
    const success = chown(path, owner, group);
    if (success) {
        const changes = [];
        
        if (owner)
            changes.push(`propriétaire: ${owner}`);

        if (group)
            changes.push(`groupe: ${group}`);
        
        return <span>Propriété modifiée pour '{path}': {changes.join(', ')}</span>;
    } else {
        return <span style={{ color: '#f00' }}>chown: erreur lors de la modification du propriétaire</span>;
    }
};
