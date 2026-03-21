import { listFiles, isExecutable } from "./fileSystem";

const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, ' ');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${minutes}`;
};

const formatSize = (size) => {
    return size.toString().padStart(8, ' ');
};

export const executeLs = (args) => {
    // Filtrer les options et récupérer le chemin
    const path = args.find(arg => !arg.startsWith('-')) || null;
    const files = listFiles(path);
    const longFormat = args.includes('-l');
    
    if (files.length === 0) {
        return <span style={{ color: '#888' }}>Le répertoire est vide.</span>;
    }
    
    if (longFormat) {
        return <>
            {files.map((file, index) => {
                const isExec = !file.isDir && isExecutable(file.path);
                const isSpecialDev = !file.isDir && file.path.startsWith('/dev/');
                const fileColor = file.isSymlink ? '#5fd7ff' : (file.isDir ? '#3b8eea' : (isSpecialDev ? '#e5e510' : (isExec ? '#63dd58' : '#fff')));
                const displayName = file.isSymlink ? `${file.name} -> ${file.target}` : `${file.name}${file.isDir ? '/' : ''}`;
                return (
                    <span key={index}>
                        {file.permissions} {file.owner.padEnd(8)} {file.group.padEnd(8)} {formatSize(file.size)} {formatDate(file.modified)} <span style={{ color: fileColor }}>{displayName}</span>
                    </span>
                );
            })}
        </>;
    }
    
    // Coreutils style: Adjust column width based on max filename length
    const maxNameLength = files.reduce((max, file) => Math.max(max, file.name.length + (file.isDir ? 1 : 0)), 0);
    // 1ch roughly corresponds to character width. We give horizontal padding of 2ch.
    const columnWidthCh = maxNameLength + 2;

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${columnWidthCh}ch, 1fr))`,
        gap: '0 16px'
    }}>
        {files.map((file, index) => {
            const isExec = !file.isDir && isExecutable(file.path);
            const isSpecialDev = !file.isDir && file.path.startsWith('/dev/');
            const fileColor = file.isSymlink ? '#5fd7ff' : (file.isDir ? '#3b8eea' : (isSpecialDev ? '#e5e510' : (isExec ? '#63dd58' : '#fff')));
            const displayName = `${file.name}${file.isDir ? '/' : ''}`;
            return (
                <span key={index} style={{ color: fileColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                </span>
            );
        })}
    </div>;
};
