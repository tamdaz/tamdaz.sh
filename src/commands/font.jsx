import applied from './../assets/sounds/applied.wav';
import beep_error from './../assets/sounds/beep_error.wav';

export const changeFont = (fontName, setOutput) => {
    if (typeof fontName === 'string' && fontName.toLowerCase() === 'vecterminus16') {
        new Audio(applied).play();

        document.body.style.fontFamily = '"VecTerminus16", monospace';
        document.body.style.fontSize = '16px';
        setOutput(oldOutput => [...oldOutput, <span>Police appliquée : VecTerminus16 (16px).</span>]);
    } else {
        new Audio(beep_error).play();
        
        const error = <span style={{ color: "#f00" }}>
            Seule la police VecTerminus16 en 16px est autorisée.
        </span>

        setOutput(oldOutput => [...oldOutput, error]);
    }
}

export const displayHelpFont = () => {
    return <>
        <span>&gt;&gt;&gt; AIDE DE LA COMMANDE "font" :</span>
        <span>&gt;&gt;&gt; Configuration verrouillée.</span>
        <span>Valeur autorisée :</span>
        <span>- VecTerminus16</span>
        <span>Taille forcée : 16px partout.</span>
    </>;
}