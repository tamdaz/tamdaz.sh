import applied from './../assets/sounds/applied.wav';
import beep_error from "./../assets/sounds/beep_error.wav";

export const changeBrightness = (intensity, setOutput) => {
    if (intensity < 1) {
        new Audio(beep_error).play();
        
        const error = <span style={{ color: "#f00" }}>
            L'intensité lumineuse ne doit pas être inférieure à 1
        </span>

        setOutput(oldOutput => [...oldOutput, error]);
    } else if (intensity > 4) {
        new Audio(beep_error).play();

        const error = <span style={{ color: "#f00" }}>
            L'intensité lumineuse ne doit pas être supérieure à 4
        </span>

        setOutput(oldOutput => [...oldOutput, error]);
    } else {
        new Audio(applied).play();
        document.querySelector(':root').style.filter = `brightness(${intensity}) saturate(${intensity})`;
    }
}

export const displayHelpBrightness = () => {
    const helpOutput = <>
        <span>&gt;&gt;&gt; AIDE DE LA COMMANDE "brightness" :</span>
        <span>&gt;&gt;&gt; Permet de modifier la luminosité de l'écran.</span>
        <span>Plusieurs valeurs sont possibles pour le 1er argument: 1, 2, 3 et 4.</span>
        <span>Plus la valeur est élevée, plus la luminosité est importante.</span>
    </>

    return helpOutput;
}