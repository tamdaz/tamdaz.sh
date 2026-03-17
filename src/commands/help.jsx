import { COMMANDS_BY_SECTION } from "./commandCatalog";

const SECTION_LABELS = {
    principal: "Commandes principales",
    essentiel: "Commandes essentielles",
    navigation: "Navigation",
    fichiers: "Gestion de fichiers",
    permissions: "Permissions",
    reseau: "Reseau",
    systeme: "Systeme",
    hash: "Hash",
    jeux: "Jeux",
    apparence: "Apparence"
};

const SECTION_ORDER = [
    "principal",
    "essentiel",
    "navigation",
    "fichiers",
    "permissions",
    "reseau",
    "systeme",
    "hash",
    "jeux",
    "apparence"
];

export const displayHelp = () => {
    return <>
        <span>&gt;&gt;&gt; AIDE COMMANDES</span>
        {SECTION_ORDER.map((section) => {
            const commands = COMMANDS_BY_SECTION[section] || [];
            if (commands.length === 0) {
                return null;
            }

            return <>
                <span key={`title-${section}`}>&gt;&gt; {SECTION_LABELS[section]} :</span>
                {commands.map((command) => (
                    <span key={`${section}-${command.name}`}>
                        {command.name.padEnd(12, " ")} --&gt; {command.summary}
                    </span>
                ))}
            </>;
        })}
        <span>&gt;&gt; Redirections :</span>
        <span>[cmd] &gt; [f]   --&gt; Ecrit la sortie dans un fichier (ecrase).</span>
        <span>[cmd] &gt;&gt; [f]  --&gt; Ajoute la sortie a un fichier.</span>
    </>;
};