import { writeFile, fileExists } from "./fileSystem";

export const executeTouch = (args) => {
    if (args.length === 0) {
        return <span style={{ color: '#f00' }}>touch: argument manquant</span>;
    }
    
    return <>
        {args.filter(arg => !arg.startsWith('-')).map((filename, index) => {
            if (fileExists(filename)) {
                return null; // like real touch, just updates timestamp usually, we can ignore
            }
            
            writeFile(filename, '');
            return null; // no output for touch on success
        })}
    </>;
};
