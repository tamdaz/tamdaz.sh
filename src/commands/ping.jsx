export const executePing = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>ping: destination manquante
Usage: ping HOST</span>;
    }
    
    const host = args[0];
    const responses = [];
    
    for (let i = 1; i <= 4; i++) {
        const time = (Math.random() * 50 + 10).toFixed(1);
        const ttl = 64 - Math.floor(Math.random() * 10);
        responses.push(
            <span key={i}>64 octets de {host}: icmp_seq={i} ttl={ttl} temps={time} ms</span>
        );
    }
    
    return <>
        <span>PING {host} ({host}): 56 octets de données</span>
        {responses}
        <span></span>
        <span>--- {host} statistiques ping ---</span>
        <span>4 paquets transmis, 4 reçus, 0% perte de paquets</span>
    </>;
};
