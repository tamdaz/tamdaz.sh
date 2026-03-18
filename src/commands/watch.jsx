import React from "react";

/**
 * Composant Watch qui exécute une commande répétée au sein du terminal,
 * interruptible par Ctrl+C.
 */
function WatchDisplay({ commandToRun, commandArgs, executeCommand, setStopRef }) {
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

        // Puis répéter toutes les secondes
        intervalRef.current = setInterval(executeAndUpdate, 1000);

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
    }, [commandToRun, commandArgs, executeCommand, setStopRef]);

    return (
        <div style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '8px', opacity: 0.8 }}>
                <span>Every 1.0s: {commandToRun} {commandArgs.join(' ')}</span>
            </div>
            <div>
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

    const commandToRun = args[0];
    const commandArgs = args.slice(1);

    return <WatchDisplay 
        commandToRun={commandToRun} 
        commandArgs={commandArgs} 
        executeCommand={executeCommand}
        setStopRef={setStopRef}
    />;
};
