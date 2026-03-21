import { removeDirectory, exists, isDirectory } from "./fileSystem";

export const executeRmdir = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>rmdir: argument manquant
Usage: rmdir DIRECTORY [DIRECTORY...]</span>;
    }
    
    return <>
        {args.filter(arg => !arg.startsWith('-')).map((path, index) => {
            if (!exists(path)) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>rmdir: impossible de supprimer '{path}': Aucun fichier ou dossier de ce type</span>;
            }
            
            if (!isDirectory(path)) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>rmdir: '{path}': N'est pas un répertoire</span>;
            }
            
            const success = removeDirectory(path);
            if (!success) {
                return <span key={index} style={{ color: '#f00', display: 'block' }}>rmdir: échec de la suppression de '{path}': Le répertoire n'est pas vide ou autre erreur</span>;
            }
            
            return null;
        })}
    </>;
};
