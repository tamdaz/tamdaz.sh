import { deleteFile, fileExists, getCurrentDir, resolvePath } from "./fileSystem";

const DANGEROUS_PATTERN = /\*|\[|\]|\{|\}|\(|\)|\?/;

const targetsRootOrSystem = (rawTarget) => {
    const absolute = resolvePath(rawTarget);

    if (absolute === "/" || absolute === ".") {
        return true;
    }

    if (absolute === "/proc" || absolute === "/dev" || absolute === "/usr" || absolute === "/bin") {
        return true;
    }

    // Si un motif global est lancé depuis la racine, on bloque pour éviter tout contournement.
    return DANGEROUS_PATTERN.test(rawTarget) && getCurrentDir() === "/";
};

export const executeRm = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>rm: argument manquant</span>;
    }
    
    const filename = args[0];

    if (targetsRootOrSystem(filename)) {
        return <span style={{ color: '#f00' }}>rm: suppression refusée pour protéger la racine du système</span>;
    }
    
    if (!fileExists(filename)) {
        return <span style={{ color: '#f00' }}>{`rm: impossible de supprimer '${filename}': Aucun fichier ou dossier de ce type`}</span>;
    }
    
    const success = deleteFile(filename);
    if (success) {
        return <span>{`Fichier '${filename}' supprimé.`}</span>;
    } else {
        return <span style={{ color: '#f00' }}>{`rm: erreur lors de la suppression de '${filename}'`}</span>;
    }
};
