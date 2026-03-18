/**
 * Catalogue unique des commandes shell.
 * Il alimente l'aide, les pages man et la generation de /bin et /usr/bin.
 */
export const COMMAND_CATALOG = [
    { name: "aboutme", section: "principal", summary: "Affiche les informations personnelles.", synopsis: "aboutme", examples: ["aboutme"] },
    { name: "brightness", section: "apparence", summary: "Règle la luminosité de l'écran.", synopsis: "brightness NIVEAU", examples: ["brightness 5"] },
    { name: "cat", section: "fichiers", summary: "Affiche le contenu d'un fichier.", synopsis: "cat FICHIER", examples: ["cat /proc/meminfo"] },
    { name: "cd", section: "navigation", summary: "Change le répertoire courant.", synopsis: "cd REPERTOIRE", examples: ["cd /home/user"] },
    { name: "chmod", section: "permissions", summary: "Modifie les permissions d'un chemin.", synopsis: "chmod MODE CHEMIN", examples: ["chmod 755 script.sh"] },
    { name: "chown", section: "permissions", summary: "Modifie le propriétaire et le groupe.", synopsis: "chown USER[:GROUP] CHEMIN", examples: ["chown user:dev fichier.txt"] },
    { name: "clear", section: "essentiel", summary: "Efface l'écran du terminal.", synopsis: "clear", examples: ["clear"] },
    { name: "color", section: "apparence", summary: "Change le thème de couleur.", synopsis: "color ID", examples: ["color 2"] },
    { name: "cp", section: "fichiers", summary: "Copie un fichier.", synopsis: "cp SOURCE DEST", examples: ["cp a.txt b.txt"] },
    { name: "credits", section: "principal", summary: "Affiche les crédits du projet.", synopsis: "credits", examples: ["credits"] },
    { name: "echo", section: "essentiel", summary: "Affiche une ligne de texte.", synopsis: "echo TEXTE", examples: ["echo test > /dev/null"] },
    { name: "exit", section: "essentiel", summary: "Quitte le shell (non disponible ici).", synopsis: "exit", examples: ["exit"] },
    { name: "fastfetch", section: "systeme", summary: "Affiche les infos système.", synopsis: "fastfetch", examples: ["fastfetch"] },
    { name: "files", section: "systeme", summary: "Ouvre le gestionnaire de fichiers.", synopsis: "files", examples: ["files"] },
    { name: "font", section: "apparence", summary: "Change la police d'écriture.", synopsis: "font NOM", examples: ["font terminus"] },
    { name: "help", section: "essentiel", summary: "Liste les commandes disponibles.", synopsis: "help", examples: ["help"] },
    { name: "history", section: "essentiel", summary: "Affiche l'historique de la session.", synopsis: "history", examples: ["history"] },
    { name: "historyc", section: "essentiel", summary: "Efface l'historique de la session.", synopsis: "historyc", examples: ["historyc"] },
    { name: "ip", section: "reseau", summary: "Affiche les interfaces réseau.", synopsis: "ip", examples: ["ip"] },
    { name: "kill", section: "systeme", summary: "Termine un processus par PID.", synopsis: "kill PID", examples: ["kill 42"] },
    { name: "less", section: "fichiers", summary: "Alias retiré, utiliser cat ou vim.", synopsis: "less", examples: ["less fichier.txt"] },
    { name: "ls", section: "navigation", summary: "Liste les entrées d'un répertoire.", synopsis: "ls [-l] [CHEMIN]", examples: ["ls", "ls -l /proc"] },
    { name: "man", section: "essentiel", summary: "Affiche la page man d'une commande.", synopsis: "man COMMANDE", examples: ["man ls"] },
    { name: "md5sum", section: "hash", summary: "Calcule le hash MD5 d'un texte.", synopsis: "md5sum TEXTE", examples: ["md5sum bonjour"] },
    { name: "mkdir", section: "fichiers", summary: "Crée un répertoire.", synopsis: "mkdir REPERTOIRE", examples: ["mkdir docs"] },
    { name: "more", section: "fichiers", summary: "Alias retiré, utiliser cat ou vim.", synopsis: "more", examples: ["more fichier.txt"] },
    { name: "mv", section: "fichiers", summary: "Déplace ou renomme un fichier.", synopsis: "mv SOURCE DEST", examples: ["mv a.txt archive/a.txt"] },
    { name: "ping", section: "reseau", summary: "Simule un ping vers un hôte.", synopsis: "ping HOTE", examples: ["ping tamdaz.fr"] },
    { name: "portfolio", section: "principal", summary: "Ouvre le portfolio dans un onglet.", synopsis: "portfolio", examples: ["portfolio"] },
    { name: "procman", section: "systeme", summary: "Ouvre le gestionnaire de processus.", synopsis: "procman", examples: ["procman"] },
    { name: "ps", section: "systeme", summary: "Affiche l'état des processus actifs.", synopsis: "ps [aux]", examples: ["ps", "ps aux"] },
    { name: "power4", section: "jeux", summary: "Lance le jeu Puissance 4.", synopsis: "power4", examples: ["power4"] },
    { name: "pwd", section: "navigation", summary: "Affiche le répertoire courant.", synopsis: "pwd", examples: ["pwd"] },
    { name: "rm", section: "fichiers", summary: "Supprime un fichier (protège la racine).", synopsis: "rm FICHIER", examples: ["rm notes.txt"] },
    { name: "rmdir", section: "fichiers", summary: "Supprime un répertoire vide.", synopsis: "rmdir REPERTOIRE", examples: ["rmdir docs"] },
    { name: "rps", section: "jeux", summary: "Lance Pierre-Feuille-Ciseaux.", synopsis: "rps", examples: ["rps"] },
    { name: "sha1sum", section: "hash", summary: "Calcule le hash SHA-1 d'un texte.", synopsis: "sha1sum TEXTE", examples: ["sha1sum bonjour"] },
    { name: "sha256sum", section: "hash", summary: "Calcule le hash SHA-256 d'un texte.", synopsis: "sha256sum TEXTE", examples: ["sha256sum bonjour"] },
    { name: "sha3sum", section: "hash", summary: "Calcule le hash SHA-3 d'un texte.", synopsis: "sha3sum TEXTE", examples: ["sha3sum bonjour"] },
    { name: "sha512sum", section: "hash", summary: "Calcule le hash SHA-512 d'un texte.", synopsis: "sha512sum TEXTE", examples: ["sha512sum bonjour"] },
    { name: "top", section: "systeme", summary: "Affiche une vue dynamique des processus.", synopsis: "top", examples: ["top"] },
    { name: "terminal", section: "systeme", summary: "Ouvre une nouvelle fenêtre de terminal.", synopsis: "terminal", examples: ["terminal"] },
    { name: "touch", section: "fichiers", summary: "Crée un fichier vide.", synopsis: "touch FICHIER", examples: ["touch notes.txt"] },
    { name: "ttt", section: "jeux", summary: "Lance le jeu Tic Tac Toe.", synopsis: "ttt", examples: ["ttt"] },
    { name: "version", section: "essentiel", summary: "Affiche la version de l'OS.", synopsis: "version", examples: ["version"] },
    { name: "vim", section: "fichiers", summary: "Ouvre l'éditeur vim simplifié.", synopsis: "vim FICHIER", examples: ["vim todo.txt"] },
    { name: "watch", section: "essentiel", summary: "Exécute une commande à intervalle régulier.", synopsis: "watch COMMANDE [ARGS...]", examples: ["watch ls -l /home", "watch ps aux"] }
];

export const COMMAND_NAMES = COMMAND_CATALOG.map((command) => command.name);

export const COMMAND_INDEX = Object.fromEntries(
    COMMAND_CATALOG.map((command) => [command.name, command])
);

export const COMMANDS_BY_SECTION = COMMAND_CATALOG.reduce((accumulator, command) => {
    if (!accumulator[command.section]) {
        accumulator[command.section] = [];
    }

    accumulator[command.section].push(command);
    return accumulator;
}, {});
