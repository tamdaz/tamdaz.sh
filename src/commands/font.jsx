import applied from './../assets/sounds/applied.wav';
import beep_error from './../assets/sounds/beep_error.wav';

export const changeFont = (fontName, setOutput) => {
    if (["Spleen", "Tamzen", "Terminus", "Unifont"].includes(fontName)) {
        new Audio(applied).play();

        document.body.style.fontFamily = `${fontName}, monospace`;
    } else {
        new Audio(beep_error).play();
        
        const error = <span style={{ color: "#f00" }}>
            La police que vous avez demandé(e) n'existe pas, veuillez réessayer.
        </span>

        setOutput(oldOutput => [...oldOutput, error]);
    }
}

export const displayHelpFont = () => {
    return <>
        <span>&gt;&gt;&gt; AIDE DE LA COMMANDE "font" :</span>
        <span>&gt;&gt;&gt; Permet changer la police d'écriture.</span>
        <span>Plusieurs valeurs sont possibles pour le 1er argument:.</span>
        <span>- Spleen</span>
        <span>- Tamzen</span>
        <span>- Terminus (par défaut)</span>
        <span>- Unifont</span>
    </>;
}