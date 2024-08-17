export const displayHelp = () => {
    const helpOutput = <>
        <span>&gt;&gt;&gt; AIDE COMMANDES</span>
        <span>&gt;&gt; Commandes principales :</span>
        <span>aboutme      --&gt; Affiche les informations à propos de moi.</span>
        <span>credits      --&gt; Affiche les crédits / mentions légales.</span>
        <span>portfolio    --&gt; Aller sur mon site portfolio.</span>
        <span>&gt;&gt; Commandes essentielles :</span>
        <span>clear        --&gt; Nettoie le terminal.</span>
        <span>historyc     --&gt; Nettoie l'historique des commandes.</span>
        <span>exit         --&gt; Ferme le terminal.</span>
        <span>help         --&gt; Affiche la commande d'aide.</span>
        <span>&gt;&gt; Autres commandes :</span>
        <span>color        --&gt; Change de couleur.</span>
        <span>brightness   --&gt; Modifie la luminosité de l'écran.</span>
    </>

    return helpOutput;
}