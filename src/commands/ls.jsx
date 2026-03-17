import { listFiles } from "./fileSystem";

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

const buildColumnMajorOrder = (files, columns) => {
    const rows = Math.ceil(files.length / columns);
    const ordered = [];

    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
            const index = col * rows + row;
            if (index < files.length) {
                ordered.push(files[index]);
            }
        }
    }

    return ordered;
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
            {files.map((file, index) => (
                <span key={index}>
                    {file.permissions} {file.owner.padEnd(8)} {file.group.padEnd(8)} {formatSize(file.size)} {formatDate(file.modified)} <span style={{ color: file.isDir ? '#5fd7ff' : '#fff' }}>{file.name}{file.isDir ? '/' : ''}</span>
                </span>
            ))}
        </>;
    }
    
    const columns = Math.min(9, Math.max(1, Math.floor(window.innerWidth / 180)));
    const displayFiles = buildColumnMajorOrder(files, columns);

    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: '0 16px'
    }}>
        {displayFiles.map((file, index) => (
            <span key={index} style={{ color: file.isDir ? '#5fd7ff' : '#fff' }}>
                {file.name}{file.isDir ? '/' : ''}
            </span>
        ))}
    </div>;
};
