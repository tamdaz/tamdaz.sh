export const executeFastfetch = () => {
    const uptime = Math.floor(Math.random() * 24) + 1;
    const memory = Math.floor(Math.random() * 4000 + 2000);
    const memoryUsed = Math.floor(memory * (0.3 + Math.random() * 0.4));
    
    return <>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'         ___        '}</span>
            <span>user@tamdaz.sh</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'        (.. |       '}</span>
            <span>───────────────────</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'        (<> |       '}</span>
            <span>OS: tamdaz.sh Linux</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'       / __  \\      '}</span>
            <span>Host: Terminal Simulator</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'      ( /  \\ /|     '}</span>
            <span>Kernel: 6.7.0-zen3</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'     _/\\ __)/_)     '}</span>
            <span>Uptime: {uptime} hours, {Math.floor(Math.random() * 60)} mins</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: '#0f0', whiteSpace: 'pre' }}>{'     \\/-____\\/      '}</span>
            <span>Shell: tamdaz-shell 1.0.0</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>Resolution: {window.innerWidth}x{window.innerHeight}</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>DE: Web Terminal</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>WM: WindowManager.jsx</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>Terminal: Terminal.jsx</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>CPU: JavaScript Engine</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span>Memory: {memoryUsed}MB / {memory}MB</span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span></span>
        </span>
        <span style={{ display: 'flex', gap: '20px' }}>
            <span style={{ whiteSpace: 'pre' }}>{'                    '}</span>
            <span><span style={{background:'#000',color:'#000'}}>  </span><span style={{background:'#f00',color:'#f00'}}>  </span><span style={{background:'#0f0',color:'#0f0'}}>  </span><span style={{background:'#ff0',color:'#ff0'}}>  </span><span style={{background:'#00f',color:'#00f'}}>  </span><span style={{background:'#f0f',color:'#f0f'}}>  </span><span style={{background:'#0ff',color:'#0ff'}}>  </span><span style={{background:'#fff',color:'#fff'}}>  </span></span>
        </span>
    </>;
};
