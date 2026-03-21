import { COMMAND_NAMES } from "./commandCatalog";
import { resolvePath, listFiles, isExecutable } from "./fileSystem";

export const getCompletions = (inputText) => {
    // Determine the current term to complete
    let currentArg = "";
    let isFirstArg = false;
    let baseText = "";
    
    // Simplification for arguments parsing
    const endsWithSpace = inputText.endsWith(" ");
    const args = inputText.trim() ? inputText.trim().split(/\s+/) : [];
    
    if (inputText.length === 0) {
        currentArg = "";
        isFirstArg = true;
        baseText = "";
    } else if (endsWithSpace) {
        currentArg = "";
        isFirstArg = false; // We completed previous arg
        baseText = inputText;
    } else {
        currentArg = args[args.length - 1] || "";
        isFirstArg = args.length === 1 && !inputText.includes(" ");
        baseText = inputText.substring(0, inputText.length - currentArg.length);
    }

    if (currentArg.startsWith('"') && !currentArg.endsWith('"')) {
        // Strip leading quote for completion, but handle later
        currentArg = currentArg.substring(1);
    }
    
    let matches = [];
    let isFileCompletion = !isFirstArg || currentArg.includes('/') || currentArg === '.' || currentArg === '..';

    if (isFirstArg && !isFileCompletion) {
        // Command completion
        matches = COMMAND_NAMES.filter(cmd => cmd.startsWith(currentArg))
            .map(cmd => ({ text: cmd, type: 'command' }));
    }

    // Whether it's a command, but if it starts with ./ or / etc., it's a file.
    // If command completion returns nothing or it's not the first arg, try file completion.
    if ((isFirstArg && matches.length === 0) || !isFirstArg || isFileCompletion) {
        // Build path for completion
        let dirToSearch = "";
        let prefix = "";
        
        if (currentArg.includes('/')) {
            const lastSlash = currentArg.lastIndexOf('/');
            dirToSearch = currentArg.substring(0, lastSlash) || "/"; // if exactly "/", it stays "/"
            prefix = currentArg.substring(lastSlash + 1);
        } else {
            dirToSearch = ".";
            prefix = currentArg;
        }

        try {
            const resolvedSearchDir = resolvePath(dirToSearch);
            // listFiles expects a path string.
            const files = listFiles(resolvedSearchDir);
            
            // Files might return undefined or throw if not directory
            if (files && Array.isArray(files)) {
                // Filter matches
                const fileMatches = files.filter(f => f.name.startsWith(prefix));
                
                fileMatches.forEach(f => {
                    // For directories add trailing slash manually after completion
                    let suffix = f.isDir ? "/" : " ";
                    let completedLocal = dirToSearch === "." ? f.name : (dirToSearch.endsWith("/") ? `${dirToSearch}${f.name}` : `${dirToSearch}/${f.name}`);
                    
                    const isExec = !f.isDir && isExecutable(f.path);
                    const isSpecialDev = !f.isDir && f.path.startsWith('/dev/');
                    const fileColor = f.isSymlink ? '#5fd7ff' : (f.isDir ? '#3b8eea' : (isSpecialDev ? '#e5e510' : (isExec ? '#63dd58' : '#fff')));

                    matches.push({
                        text: completedLocal,
                        type: f.isDir ? 'dir' : 'file',
                        suffix: suffix,
                        displayName: f.name + (f.isDir ? "/" : ""),
                        color: fileColor
                    });
                });
            }
        } catch (e) {
            // Ignore if path not found
        }
    }

    return { matches, baseText, currentArg };
};
