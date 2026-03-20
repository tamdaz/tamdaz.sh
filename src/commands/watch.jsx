import React from "react";

/**
 * Composant Watch qui exécute une commande répétée au sein du terminal,
 * interruptible par Ctrl+C.
 */
function WatchDisplay({ commandToRun, commandArgs, executeCommand, setStopRef, intervalSeconds }) {
    const [output, setOutput] = React.useState(null);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
        const executeAndUpdate = () => {
            let capturedOutput = null;
            const customEmit = (out) => {
                capturedOutput = out;
            };
            
            const result = executeCommand(commandToRun, commandArgs, customEmit);
            
            if (capturedOutput !== null) {
                setOutput(capturedOutput);
            } else if (result !== undefined && result.blocking === undefined) {
                setOutput(result);
            }
        };

        // Exécuter immédiatement
        executeAndUpdate();

        // Puis répéter selon l'intervalle configuré
        intervalRef.current = setInterval(executeAndUpdate, intervalSeconds * 1000);

        setStopRef({
            stop: () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        });

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [commandToRun, commandArgs, executeCommand, setStopRef, intervalSeconds]);

    return (
        <div style={{ marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
            <div style={{ marginBottom: '8px', opacity: 0.8 }}>
                <span>Every {intervalSeconds.toFixed(1)}s: {commandToRun} {commandArgs.join(' ')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {output === null ? (
                    <span style={{ opacity: 0.5 }}>En attente...</span>
                ) : (
                    output
                )}
            </div>
        </div>
    );
}

export const executeWatch = (args, executeCommand, setStopRef) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>watch: veuillez fournir une commande à exécuter</span>;
    }

    let interval = 1.0;
    let commandToRun = null;
    let commandArgs = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            interval = parseFloat(args[i + 1]) || 1.0;
            i++;
        } else if (!commandToRun) {
            commandToRun = args[i];
        } else {
            commandArgs.push(args[i]);
        }
    }

    if (!commandToRun) {
        return <span style={{ color: '#f00' }}>watch: veuillez fournir une commande à exécuter</span>;
    }

    return <WatchDisplay 
        commandToRun={commandToRun} 
        commandArgs={commandArgs} 
        executeCommand={executeCommand}
        setStopRef={setStopRef}
        intervalSeconds={interval}
    />;
};
