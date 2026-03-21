import { COMMAND_CATALOG, COMMAND_INDEX } from "./commandCatalog";

/**
 * Genere automatiquement les pages man depuis le catalogue central.
 * Une commande ajoutee au catalogue est donc documentee sans duplication.
 */
export const manPages = Object.fromEntries(
    COMMAND_CATALOG.map((command) => [
        command.name,
        {
            name: command.name,
            synopsis: command.synopsis,
            description: command.summary,
            examples: command.examples
        }
    ])
);

export const executeMan = (args) => {
    if (args.length === 0) {
        return <span style={{ color: "#f00" }}>Quelle page de manuel voulez-vous ?<br/>Usage: man COMMANDE<br/>Essayez: man man</span>;
    }

    const command = args[0].toLowerCase();
    const page = manPages[command];

    if (!page) {
        return <span style={{ color: "#f00" }}>Aucune entree de manuel pour {command}</span>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
            <div>
                <strong>NAME</strong><br/>
                <span style={{ paddingLeft: '16px' }}>{page.name} - {page.description}</span>
            </div>
            <div>
                <strong>SYNOPSIS</strong><br/>
                <span style={{ paddingLeft: '16px' }}>{page.synopsis}</span>
            </div>
            <div>
                <strong>DESCRIPTION</strong><br/>
                <span style={{ paddingLeft: '16px' }}>{page.description}</span>
            </div>
            {page.examples && page.examples.length > 0 && (
                <div>
                    <strong>EXAMPLES</strong><br/>
                    {page.examples.map((ex, idx) => (
                        <span key={idx} style={{ paddingLeft: '16px', display: 'block' }}>- {ex}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
