const HelpViewer = () => {
    return (
        <div style={{ padding: '20px', overflowY: 'auto', height: '100%', boxSizing: 'border-box', backgroundColor: 'var(--terminal-bg-color)', color: 'var(--terminal-color)' }}>
            <h1 style={{ fontSize: '24px', borderBottom: '2px solid var(--terminal-color)', paddingBottom: '10px' }}>Bienvenue sur sh.tamdaz.fr</h1>
            
            <p>
                Ce site est une simulation d'un système d'exploitation GNU/Linux fonctionnant directement dans votre navigateur web, construit avec React. 
            </p>
            
            <h2 style={{ fontSize: '18px', marginTop: '20px' }}>Comment ça fonctionne ?</h2>
            <p>
                L'OS virtuel possède son propre système de fichiers (stocké en mémoire locale), son gestionnaire de processus factices, et un environnement de terminaux et de fenêtres superposables.
            </p>
            
            <h2 style={{ fontSize: '18px', marginTop: '20px' }}>Commandes de base</h2>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>ls</strong> : Liste les fichiers et dossiers. Utilisez <code>ls -l</code> pour le format long.</li>
                <li><strong>cd</strong> : Change de répertoire (ex: <code>cd /home/user</code>).</li>
                <li><strong>cat / less / vim</strong> : Lit ou édite des fichiers.</li>
                <li><strong>help</strong> : Ouvre cette fenêtre d'aide.</li>
                <li><strong>procman</strong> : Ouvre le gestionnaire de processus.</li>
                <li><strong>files</strong> : Ouvre le gestionnaire de fichiers.</li>
                <li><strong>2048 / snake / ttt</strong> : Lance un jeu dans une nouvelle fenêtre !</li>
            </ul>

            <h2 style={{ fontSize: '18px', marginTop: '20px' }}>Manipulation des fenêtres</h2>
            <p>
                Vous pouvez redimensionner et déplacer les fenêtres. Pour fermer une fenêtre, cliquez sur la croix (X) en haut à droite. Le terminal principal ne peut pas être fermé.
            </p>
        </div>
    );
};

export default HelpViewer;
