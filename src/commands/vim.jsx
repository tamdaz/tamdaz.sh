export const executeVim = (args, setWindows) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>vim: argument manquant
Usage: vim FICHIER</span>;
    }
    
    const filename = args[0];
    
    // La fenêtre vim sera créée dans Terminal.jsx
    return { command: 'vim', filename };
};
