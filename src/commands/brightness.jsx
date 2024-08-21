import applied from './../assets/sounds/applied.wav';
import beep_error from "./../assets/sounds/beep_error.wav";

export const changeBrightness = (intensity, setOutput) => {
    if (!isNaN(intensity)) {
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
    } else {
        setOutput(oldOutput => [...oldOutput, displayHelpBrightness()]);
    }
}

export const displayHelpBrightness = () => {
    return <>
        <span>&gt;&gt;&gt; AIDE DE LA COMMANDE "brightness" :</span>
        <span>&gt;&gt;&gt; Permet de modifier la luminosité de l'écran.</span>
        <span>Le premier argument doit être compris entre 1.0 et 4.0 (nombre à virgules).</span>
        <span>Plus la valeur est élevée, plus la luminosité est importante.</span>
    </>
}