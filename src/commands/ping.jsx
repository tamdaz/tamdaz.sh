import React, { useState, useEffect } from 'react';

const PingSimulation = ({ host, count, delay, onDone, setStopRef }) => {
    const [responses, setResponses] = useState([]);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let i = 1;
        let isStopped = false;
        
        if (setStopRef) {
            setStopRef({
                stop: () => {
                    isStopped = true;
                    setDone(true);
                }
            });
        }

        const interval = setInterval(() => {
            if (isStopped || i > count) {
                clearInterval(interval);
                if (!isStopped) setDone(true);
                if (onDone) onDone();
                return;
            }
            
            const time = (Math.random() * 50 + 10).toFixed(1);
            const ttl = 64 - Math.floor(Math.random() * 10);
            
            setResponses(prev => [
                ...prev,
                <span key={i}>64 octets de {host}: icmp_seq={i} ttl={ttl} temps={time} ms</span>
            ]);
            
            i++;
        }, delay);

        return () => {
            clearInterval(interval);
        };
    }, [host, count, delay, onDone, setStopRef]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>PING {host} ({host}): 56 octets de données</span>
            {responses}
            {done && (
                <>
                    <span></span>
                    <span>--- {host} statistiques ping ---</span>
                    <span>{responses.length} paquets transmis, {responses.length} reçus, 0% perte de paquets</span>
                </>
            )}
        </div>
    );
};

export const executePing = (args, onDone, setStopRef) => {
    if (args.length === 0) {
        if (onDone) onDone();
        return <span style={{ color: '#f00' }}>ping: destination manquante
Usage: ping [-n délai] [-c count] HOST</span>;
    }
    
    let host = null;
    let delay = 1000;
    let count = 4;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            delay = parseFloat(args[i + 1]) * 1000 || 1000;
            i++;
        } else if (args[i] === '-c' && i + 1 < args.length) {
            count = parseInt(args[i + 1], 10) || 4;
            i++;
        } else {
            host = args[i];
        }
    }

    if (!host) {
        if (onDone) onDone();
        return <span style={{ color: '#f00' }}>ping: destination manquante</span>;
    }
    
    return <PingSimulation host={host} count={count} delay={delay} onDone={onDone} setStopRef={setStopRef} />;
};
