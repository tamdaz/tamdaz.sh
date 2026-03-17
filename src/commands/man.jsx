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
        return {
            error: true,
            message: "Quelle page de manuel voulez-vous ?\nUsage: man COMMANDE\nEssayez: man man"
        };
    }

    const command = args[0].toLowerCase();

    if (!COMMAND_INDEX[command]) {
        return { error: true, message: `Aucune entree de manuel pour ${command}` };
    }

    return { command: "man", page: command };
};
