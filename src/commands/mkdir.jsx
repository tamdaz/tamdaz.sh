import { createDirectory, exists } from "./fileSystem";

export const executeMkdir = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>mkdir: argument manquant
Usage: mkdir DIRECTORY [DIRECTORY...]</span>;
    }
    
    return <>
        {args.filter(arg => !arg.startsWith('-')).map((path, index) => {
            if (exists(path)) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>mkdir: impossible de créer le répertoire '{path}': Le fichier existe</span>;
            }
            
            const success = createDirectory(path);
            if (!success) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>mkdir: erreur lors de la création du répertoire '{path}'</span>;
            }
            return null; // no output on success usually, but user had output previously, let's stick to standard no output on success
        })}
    </>;
};
