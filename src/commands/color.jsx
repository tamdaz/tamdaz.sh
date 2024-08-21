import color_changed from "./../assets/sounds/color_changed.wav";

/**
 * @param {number} id 
 */
export const changeColor = (id, setOutput) => {
    const colors = [
        { color: "#dd5858", bgColor: "#140505" }, // red
        { color: "#dd9b58", bgColor: "#140d05" }, // orange
        { color: "#dddd58", bgColor: "#141405" }, // yellow
        { color: "#63dd58", bgColor: "#071405" }, // green
        { color: "#58dddd", bgColor: "#051414" }, // cyan
        { color: "#589bdd", bgColor: "#050d14" }, // blue
        { color: "#5858dd", bgColor: "#050514" }, // dark blue
        { color: "#9b58dd", bgColor: "#0d0514" }, // purple
        { color: "#dd58dd", bgColor: "#140514" }, // pink
        { color: "#dddddd", bgColor: "#141414" }, // grey
    ];

    if (colors[id] === undefined) {
        setOutput(oldOutput => [...oldOutput, displayHelpColor()]);
    } else {
        document.querySelector(':root').style.setProperty('--terminal-color', colors[id].color);
        document.querySelector(':root').style.setProperty('--terminal-bg-color', colors[id].bgColor);
    
        saveColors(colors[id].color, colors[id].bgColor);
    
        new Audio(color_changed).play();
    }
}

export const displayHelpColor = () => {
    return <>
        <span>&gt;&gt;&gt; AIDE DE LA COMMANDE "color" :</span>
        <span>&gt;&gt;&gt; Permet de changer de couleur grâce au numéro indiqué ci-dessous.</span>
        <span></span>
        <span>0 --&gt; Passer au rouge</span>
        <span>1 --&gt; Passer au orange.</span>
        <span>2 --&gt; Passer au jaune.</span>
        <span>3 --&gt; Passer au vert.</span>
        <span>4 --&gt; Passer au cyan.</span>
        <span>5 --&gt; Passer au bleu.</span>
        <span>6 --&gt; Passer au bleu foncé.</span>
        <span>7 --&gt; Passer au violet.</span>
        <span>8 --&gt; Passer au rose.</span>
        <span>9 --&gt; Passer au gris.</span>
    </>;
}

/**
 * Save selected colors to the local storage.
 * 
 * @param {string} color
 * @param {string} bgColor
 */
const saveColors = (color, bgColor) => {
    localStorage.setItem('colors', JSON.stringify({
        color: color,
        bgColor: bgColor
    }))
}

export const loadColors = () => {
    if (localStorage.getItem('colors')) {
        const colors = JSON.parse(localStorage.getItem('colors'));

        document.querySelector(':root').style.setProperty('--terminal-color', colors.color);
        document.querySelector(':root').style.setProperty('--terminal-bg-color', colors.bgColor);
    }
}